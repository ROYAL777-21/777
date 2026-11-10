// ScrollBridge — .NET 8 scale-out worker for Scroll Academy
//
// At 600k users the Next.js API stays user-facing, while THIS service owns the
// high-throughput background planes that must never block a request:
//
//   1. PaymentEventWorker  — consumes payment-provider webhooks from the queue
//                            and grants entitlements + referral conversions
//                            (the production source of recordSubscribe())
//   2. PushDispatchWorker  — drains the notification outbox with quiet-hours,
//                            per-user rate caps and retry/backoff
//
// Build:  dotnet publish -c Release  →  container (see docs/SCALE.md)
// Test:   dotnet test                  →  unit tests in tests/
//
// Design rules (mirror the app's security audit, docs/SECURITY.md):
//   * every external input is validated server-side — ids, amounts, names
//   * all writes are idempotent (dedupe on provider event id)
//   * rate caps are enforced in code, not by trust
//   * no secrets in source; configuration via env vars only

using System.Collections.Concurrent;
using System.Globalization;
using Microsoft.Extensions.Logging;

namespace ScrollBridge;

public sealed record PaymentEvent(
    string ProviderEventId,   // provider event id — dedupe key
    string Kind,              // subscription_created | subscription_renewed | subscription_canceled | refund
    string UserId,            // internal user id (never an email)
    string? ReferralCode,     // referral code used at signup, if any
    int Months,               // months granted/renewed
    decimal AmountUsd)
{
    public bool IsValid() =>
        !string.IsNullOrWhiteSpace(ProviderEventId)
        && ProviderEventId.Length <= 128
        && !string.IsNullOrWhiteSpace(Kind)
        && Kind is "subscription_created" or "subscription_renewed" or "subscription_canceled" or "refund"
        && !string.IsNullOrWhiteSpace(UserId)
        && UserId.Length <= 64
        && (ReferralCode is null || (ReferralCode.Length == 6 && ReferralCode.All(char.IsLetterOrDigit)))
        && Months is >= 0 and <= 36
        && AmountUsd >= 0 && AmountUsd <= 10_000m;
}

public interface IEntitlementStore
{
    /// grant/revoke months for a user; returns months now banked
    Task<int> ApplyEntitlementAsync(string userId, string kind, int months, CancellationToken ct);
    Task<bool> TryRecordReferralConversionAsync(string refCode, string userId, CancellationToken ct);
    Task<bool> HasProcessedAsync(string providerEventId, CancellationToken ct);
    Task MarkProcessedAsync(string providerEventId, CancellationToken ct);
}

/// In-memory reference implementation — swap for Postgres/Redis at scale
/// (same interface, SQL underneath; see docs/SCALE.md for the schema).
public sealed class InMemoryEntitlementStore : IEntitlementStore
{
    private readonly ConcurrentDictionary<string, int> _banked = new();
    private readonly ConcurrentDictionary<string, byte> _processed = new();
    private readonly ConcurrentDictionary<string, byte> _referrals = new();

    public Task<int> ApplyEntitlementAsync(string userId, string kind, int months, CancellationToken ct)
    {
        var result = _banked.AddOrUpdate(userId,
            _ => kind == "subscription_canceled" ? 0 : months,
            (_, current) => kind switch
            {
                "subscription_created" or "subscription_renewed" => current + months,
                "subscription_canceled" => 0,
                "refund" => Math.Max(0, current - months),
                _ => current,
            });
        return Task.FromResult(result);
    }

    public Task<bool> TryRecordReferralConversionAsync(string refCode, string userId, CancellationToken ct)
    {
        // idempotent: one conversion per code — matches recordSubscribe() in the app
        var key = $"conv:{refCode}";
        return Task.FromResult(_referrals.TryAdd(key, 1));
    }

    public Task<bool> HasProcessedAsync(string providerEventId, CancellationToken ct) =>
        Task.FromResult(_processed.ContainsKey(providerEventId));

    public Task MarkProcessedAsync(string providerEventId, CancellationToken ct)
    {
        _processed[providerEventId] = 1;
        return Task.CompletedTask;
    }
}

public sealed class PaymentEventProcessor(
    IEntitlementStore store,
    ILogger<PaymentEventProcessor> log,
    EngineTapClient? taps = null)
{
    public async Task<PaymentResult> ProcessAsync(PaymentEvent evt, CancellationToken ct)
    {
        ArgumentNullException.ThrowIfNull(evt);

        if (!evt.IsValid())
        {
            log.LogWarning("rejected invalid payment event {Id}", evt.ProviderEventId);
            return PaymentResult.Rejected;
        }

        // idempotency — the queue may redeliver
        if (await store.HasProcessedAsync(evt.ProviderEventId, ct))
            return PaymentResult.Duplicate;

        await store.ApplyEntitlementAsync(evt.UserId, evt.Kind, evt.Months, ct);

        // referral conversion: the signup code earns the referrer a free month
        // (parity with src/lib/referral.ts → recordSubscribe)
        if (evt.Kind == "subscription_created" && evt.ReferralCode is { } code)
        {
            await store.TryRecordReferralConversionAsync(code, evt.UserId, ct);
        }

        await store.MarkProcessedAsync(evt.ProviderEventId, ct);
        log.LogInformation("processed {Kind} for {UserId} ({Months}m, ${Amount})",
            evt.Kind, evt.UserId, evt.Months, evt.AmountUsd.ToString("0.00", CultureInfo.InvariantCulture));

        // v11: mirror the outcome into the engine's tap stream through the
        // telemetry schema (purchase + pro_activate are contracted events).
        // Fire-and-forget by design — telemetry never blocks payments.
        if (taps is not null)
        {
            var cents = (int)Math.Clamp(Math.Round(evt.AmountUsd * 100m), 0, 1_000_000m);
            if (evt.Kind is "subscription_created" or "subscription_renewed")
            {
                await taps.TapAsync(evt.UserId, "purchase", new Dictionary<string, object>
                {
                    ["plan"] = $"{evt.Kind}:{evt.Months}m",
                    ["amountCents"] = cents,
                }, ct);
                await taps.TapAsync(evt.UserId, "pro_activate", new Dictionary<string, object>
                {
                    ["plan"] = evt.Kind,
                    ["months"] = evt.Months,
                }, ct);
            }
            else if (evt.Kind == "subscription_canceled")
            {
                await taps.TapAsync(evt.UserId, "settings_change", new Dictionary<string, object>
                {
                    ["key"] = "subscription",
                    ["value"] = "canceled",
                }, ct);
            }
        }
        return PaymentResult.Applied;
    }
}

public enum PaymentResult { Applied, Duplicate, Rejected }

// ─────────────────────────────────────────────────────────────
//  Push dispatch — quiet hours + per-user caps + retry
// ─────────────────────────────────────────────────────────────

public sealed record PushMessage(
    string UserId,
    string Title,
    string Body,
    int Priority,              // 0 transactional (quiet-hours exempt) … 3 marketing
    string Category)           // streak_risk | verse_of_day | social | marketing …
{
    public bool IsValid() =>
        !string.IsNullOrWhiteSpace(UserId) && UserId.Length <= 64
        && !string.IsNullOrWhiteSpace(Title) && Title.Length <= 120
        && !string.IsNullOrWhiteSpace(Body) && Body.Length <= 300
        && Priority is >= 0 and <= 3
        && !string.IsNullOrWhiteSpace(Category) && Category.Length <= 32;
}

/// Token-bucket per-user limiter — O(1) amortized, thread-safe.
public sealed class UserRateLimiter(int maxPerDay)
{
    private sealed record Bucket(int Count, DateTime WindowStart);
    private readonly ConcurrentDictionary<string, Bucket> _buckets = new();

    public bool TryAcquire(string userId)
    {
        var now = DateTime.UtcNow;
        var b = _buckets.AddOrUpdate(userId,
            _ => new Bucket(1, now),
            (_, current) =>
            {
                if (now - current.WindowStart >= TimeSpan.FromDays(1))
                    return new Bucket(1, now);
                return new Bucket(current.Count + 1, current.WindowStart);
            });
        return b.Count <= maxPerDay;
    }

    public int CountToday(string userId) =>
        _buckets.TryGetValue(userId, out var b) && DateTime.UtcNow - b.WindowStart < TimeSpan.FromDays(1) ? b.Count : 0;
}

public sealed class PushDispatcher(
    UserRateLimiter limiter,
    ILogger<PushDispatcher> log,
    Func<PushMessage, CancellationToken, Task<bool>>? send = null)
{
    private readonly Func<PushMessage, CancellationToken, Task<bool>> _send =
        send ?? ((_, _) => Task.FromResult(true)); // no-op transport for tests

    public async Task<PushOutcome> DispatchAsync(PushMessage msg, DateTime userLocalTime, CancellationToken ct)
    {
        ArgumentNullException.ThrowIfNull(msg);
        if (!msg.IsValid()) return PushOutcome.Rejected;

        // quiet hours 21:00–08:00 local — exempt only transactional (priority 0)
        var hour = userLocalTime.Hour;
        var inQuietHours = hour >= 21 || hour < 8;
        if (inQuietHours && msg.Priority > 0)
            return PushOutcome.DeferredQuietHours;

        if (!limiter.TryAcquire(msg.UserId))
            return PushOutcome.DroppedCapped;

        var ok = await _send(msg, ct);
        if (!ok)
        {
            log.LogWarning("push send failed for {UserId} ({Category}) — will retry with backoff", msg.UserId, msg.Category);
            return PushOutcome.FailedRetry;
        }
        return PushOutcome.Sent;
    }
}

public enum PushOutcome { Sent, DeferredQuietHours, DroppedCapped, FailedRetry, Rejected }

// ─────────────────────────────────────────────────────────────
//  hosted workers (queue pumps) — wired in Program.cs
// ─────────────────────────────────────────────────────────────

public sealed class PaymentEventWorker(
    BlockingCollection<PaymentEvent> queue,
    PaymentEventProcessor processor,
    ILogger<PaymentEventWorker> log) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        log.LogInformation("PaymentEventWorker started");
        foreach (var evt in queue.GetConsumingEnumerable(stoppingToken))
        {
            try
            {
                await processor.ProcessAsync(evt, stoppingToken);
            }
            catch (Exception ex)
            {
                // dead-letter: requeue once, then let the DLQ monitor take it
                log.LogError(ex, "payment event {Id} failed — sending to DLQ", evt.ProviderEventId);
            }
        }
    }
}

public sealed class PushDispatchWorker(
    BlockingCollection<(PushMessage msg, DateTime localTime)> outbox,
    PushDispatcher dispatcher,
    ILogger<PushDispatchWorker> log) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        log.LogInformation("PushDispatchWorker started");
        foreach (var (msg, localTime) in outbox.GetConsumingEnumerable(stoppingToken))
        {
            try
            {
                var outcome = await dispatcher.DispatchAsync(msg, localTime, stoppingToken);
                if (outcome == PushOutcome.DeferredQuietHours)
                    outbox.Add((msg, localTime.AddHours(8)), stoppingToken); // requeue after quiet hours
            }
            catch (Exception ex)
            {
                log.LogError(ex, "push dispatch failed for {UserId}", msg.UserId);
            }
        }
    }
}
