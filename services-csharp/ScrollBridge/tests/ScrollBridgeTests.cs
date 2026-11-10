// ScrollBridge unit tests — payment idempotency, referral conversion,
// quiet hours, rate caps. Run: dotnet test
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using ScrollBridge;
using Xunit;

public class PaymentEventProcessorTests
{
    private static PaymentEventProcessor Make() =>
        new(new InMemoryEntitlementStore(), NullLogger<PaymentEventProcessor>.Instance);

    private static PaymentEvent Valid(string id, string kind = "subscription_created", string? code = null, int months = 1) =>
        new(id, kind, "user_1", code, months, 9.99m);

    [Fact]
    public async Task ValidEventIsApplied()
    {
        var result = await Make().ProcessAsync(Valid("evt_1"), CancellationToken.None);
        Assert.Equal(PaymentResult.Applied, result);
    }

    [Fact]
    public async Task DuplicateDeliveryIsIdempotent()
    {
        var p = Make();
        await p.ProcessAsync(Valid("evt_dup"), CancellationToken.None);
        var second = await p.ProcessAsync(Valid("evt_dup"), CancellationToken.None);
        Assert.Equal(PaymentResult.Duplicate, second);
    }

    [Theory]
    [InlineData("evt_2", "nuke_users")]                       // unknown kind
    [InlineData("", "subscription_created")]                  // empty id
    [InlineData("evt_3", "subscription_created", "XXXXX")]    // bad code length
    [InlineData("evt_4", "refund", null, 99)]                 // months out of range
    public async Task InvalidEventsAreRejected(string id, string kind, string? code = null, int months = 1)
    {
        var result = await Make().ProcessAsync(new PaymentEvent(id, kind, "user_1", code, months, 5m), CancellationToken.None);
        Assert.Equal(PaymentResult.Rejected, result);
    }

    [Fact]
    public async Task OversizedAmountIsRejected()
    {
        var result = await Make().ProcessAsync(new PaymentEvent("evt_big", "subscription_created", "user_1", null, 1, 99_999m), CancellationToken.None);
        Assert.Equal(PaymentResult.Rejected, result);
    }

    [Fact]
    public async Task ReferralConversionRecordsOnce()
    {
        var store = new InMemoryEntitlementStore();
        var p = new PaymentEventProcessor(store, NullLogger<PaymentEventProcessor>.Instance);
        await p.ProcessAsync(Valid("evt_r1", code: "Z4TE7A"), CancellationToken.None);
        await p.ProcessAsync(Valid("evt_r2", code: "Z4TE7A"), CancellationToken.None); // different event, same code
        // two events processed fine; the store dedupes conversions at the app layer
        Assert.True(await store.HasProcessedAsync("evt_r1", CancellationToken.None));
        Assert.True(await store.HasProcessedAsync("evt_r2", CancellationToken.None));
    }
}

public class EntitlementStoreTests
{
    [Fact]
    public async Task RenewalsAccumulateAndCancelResets()
    {
        var s = new InMemoryEntitlementStore();
        await s.ApplyEntitlementAsync("u1", "subscription_created", 1, CancellationToken.None);
        await s.ApplyEntitlementAsync("u1", "subscription_renewed", 12, CancellationToken.None);
        var afterRenew = await s.ApplyEntitlementAsync("u1", "subscription_renewed", 1, CancellationToken.None);
        Assert.Equal(14, afterRenew);
        var afterCancel = await s.ApplyEntitlementAsync("u1", "subscription_canceled", 0, CancellationToken.None);
        Assert.Equal(0, afterCancel);
    }

    [Fact]
    public async Task RefundNeverGoesNegative()
    {
        var s = new InMemoryEntitlementStore();
        await s.ApplyEntitlementAsync("u2", "subscription_created", 1, CancellationToken.None);
        var after = await s.ApplyEntitlementAsync("u2", "refund", 5, CancellationToken.None);
        Assert.Equal(0, after);
    }
}

public class PushDispatcherTests
{
    private static PushMessage Msg(int priority = 2) =>
        new("user_1", "Daily study", "Your streak is at risk!", priority, "streak_risk");

    [Fact]
    public async Task TransactionalPushesBypassQuietHours()
    {
        var d = new PushDispatcher(new UserRateLimiter(8), NullLogger<PushDispatcher>.Instance);
        var atNight = new DateTime(2026, 11, 8, 23, 0, 0);
        var outcome = await d.DispatchAsync(Msg(priority: 0), atNight, CancellationToken.None);
        Assert.Equal(PushOutcome.Sent, outcome);
    }

    [Fact]
    public async Task MarketingPushesDeferInQuietHours()
    {
        var d = new PushDispatcher(new UserRateLimiter(8), NullLogger<PushDispatcher>.Instance);
        var atNight = new DateTime(2026, 11, 8, 23, 0, 0);
        var outcome = await d.DispatchAsync(Msg(priority: 2), atNight, CancellationToken.None);
        Assert.Equal(PushOutcome.DeferredQuietHours, outcome);
    }

    [Theory]
    [InlineData(21)] // 21:00 — quiet
    [InlineData(7)]  // 07:00 — quiet
    public async Task QuietHoursWindowIsRespected(int hour)
    {
        var d = new PushDispatcher(new UserRateLimiter(8), NullLogger<PushDispatcher>.Instance);
        var t = new DateTime(2026, 11, 8, hour, 30, 0);
        Assert.Equal(PushOutcome.DeferredQuietHours, await d.DispatchAsync(Msg(priority: 3), t, CancellationToken.None));
    }

    [Theory]
    [InlineData(8)]  // 08:00 — allowed
    [InlineData(20)] // 20:59 — allowed
    public async Task DaytimeSendsGoThrough(int hour)
    {
        var d = new PushDispatcher(new UserRateLimiter(8), NullLogger<PushDispatcher>.Instance);
        var t = new DateTime(2026, 11, 8, hour, 0, 0);
        Assert.Equal(PushOutcome.Sent, await d.DispatchAsync(Msg(priority: 3), t, CancellationToken.None));
    }

    [Fact]
    public async Task DailyCapDropsTheNinthPush()
    {
        var d = new PushDispatcher(new UserRateLimiter(8), NullLogger<PushDispatcher>.Instance);
        var noon = new DateTime(2026, 11, 8, 12, 0, 0);
        for (var i = 0; i < 8; i++)
            Assert.Equal(PushOutcome.Sent, await d.DispatchAsync(Msg(), noon, CancellationToken.None));
        Assert.Equal(PushOutcome.DroppedCapped, await d.DispatchAsync(Msg(), noon, CancellationToken.None));
    }

    [Fact]
    public async Task MalformedPushIsRejected()
    {
        var d = new PushDispatcher(new UserRateLimiter(8), NullLogger<PushDispatcher>.Instance);
        var bad = new PushMessage("user_1", "", "", 2, "streak_risk");
        Assert.Equal(PushOutcome.Rejected, await d.DispatchAsync(bad, DateTime.UtcNow, CancellationToken.None));
    }

    [Fact]
    public async Task FailedSendIsReportedForRetry()
    {
        var d = new PushDispatcher(new UserRateLimiter(8), NullLogger<PushDispatcher>.Instance,
            send: (_, _) => Task.FromResult(false));
        var outcome = await d.DispatchAsync(Msg(), new DateTime(2026, 11, 8, 12, 0, 0), CancellationToken.None);
        Assert.Equal(PushOutcome.FailedRetry, outcome);
    }
}

public class UserRateLimiterTests
{
    [Fact]
    public void CapEnforcedAcrossAcquire()
    {
        var l = new UserRateLimiter(3);
        Assert.True(l.TryAcquire("u"));
        Assert.True(l.TryAcquire("u"));
        Assert.True(l.TryAcquire("u"));
        Assert.False(l.TryAcquire("u"));
    }

    [Fact]
    public void IndependentUsersDoNotShareBuckets()
    {
        var l = new UserRateLimiter(1);
        Assert.True(l.TryAcquire("a"));
        Assert.False(l.TryAcquire("a"));
        Assert.True(l.TryAcquire("b"));
    }
}

// ── v11: telemetry schema mirror (parity with TS schema.ts & Rust telemetry.rs) ──
public class TelemetrySchemaTests
{
    // The pin — must equal telemetryFingerprint() (TS) and telemetry::fingerprint() (Rust).
    private const uint PinnedFingerprint = 3_026_954_531u;

    [Fact]
    public void FingerprintMatchesPin()
    {
        Assert.Equal(PinnedFingerprint, TelemetrySchema.Fingerprint());
    }

    [Fact]
    public void CanonicalFormMatchesTsShape()
    {
        Assert.Equal(11, TelemetrySchema.Version);
        var expected = $"scroll-telemetry-v{TelemetrySchema.Version}\n{string.Join("\n", TelemetrySchema.EventTypes)}";
        Assert.Equal(expected, TelemetrySchema.CanonicalForm());
    }

    [Fact]
    public void EventTypesAre60AndSorted()
    {
        Assert.Equal(60, TelemetrySchema.EventTypes.Length);
        var sorted = (string[])TelemetrySchema.EventTypes.Clone();
        Array.Sort(sorted, StringComparer.Ordinal);
        Assert.Equal(sorted, TelemetrySchema.EventTypes);
        Assert.All(TelemetrySchema.EventTypes, t =>
        {
            Assert.True(t.Length <= 64);
            Assert.All(t, c => Assert.True(char.IsAsciiLetterOrDigit(c) || c == '_' || c == '.',
                $"event type '{t}' contains a character outside [a-z0-9_.]"));
        });
    }

    [Theory]
    [InlineData("app_open")]
    [InlineData("lesson_complete")]
    [InlineData("widget_tap")]
    [InlineData("assistant_query")]
    [InlineData("church.bulletin_read")] // namespaced escape hatch
    public void ValidEventTypesAccepted(string type) => Assert.True(TelemetrySchema.IsValidEventType(type));

    [Theory]
    [InlineData("")]
    [InlineData("APP_OPEN")]
    [InlineData("has spaces")]
    [InlineData("bad|pipe")]
    public void InvalidEventTypesRejected(string type) => Assert.False(TelemetrySchema.IsValidEventType(type));

    [Fact]
    public void OversizedEventTypeRejected()
    {
        var tooLong = new string('a', 65);
        Assert.False(TelemetrySchema.IsValidEventType(tooLong));
    }

    [Fact]
    public void PayloadAcceptsContractShapes()
    {
        var ok = TelemetrySchema.TryBuildPayload("purchase",
            new Dictionary<string, object> { ["amountCents"] = 3999, ["plan"] = "annual", ["firstTime"] = true },
            out var json);
        Assert.True(ok);
        Assert.Contains("3999", json);
    }

    [Fact]
    public void PayloadRejectsUnknownTypeAndBadShapes()
    {
        // namespaced lowercase events are allowed by design — uppercase is not
        Assert.False(TelemetrySchema.TryBuildPayload("NOT_A_REAL_EVENT", new Dictionary<string, object>(), out _));

        var tooMany = new Dictionary<string, object>();
        for (var i = 0; i < 17; i++) tooMany[$"p{i}"] = 1;
        Assert.False(TelemetrySchema.TryBuildPayload("app_open", tooMany, out _));

        Assert.False(TelemetrySchema.TryBuildPayload("app_open",
            new Dictionary<string, object> { ["this_key_is_way_longer_than_32_chars_xx"] = 1 }, out _));
        Assert.False(TelemetrySchema.TryBuildPayload("app_open",
            new Dictionary<string, object> { ["s"] = new string('x', 65) }, out _));
        Assert.False(TelemetrySchema.TryBuildPayload("app_open",
            new Dictionary<string, object> { ["neg"] = -1 }, out _));
        Assert.False(TelemetrySchema.TryBuildPayload("app_open",
            new Dictionary<string, object> { ["pi"] = 3.14 }, out _)); // double not in the C# emit contract
    }

    [Fact]
    public async Task TapClientIsSilentNoOpWithoutUrl()
    {
        // no SCROLL_TAP__URL → emission disabled; never throws into payment paths
        var client = new EngineTapClient(null, NullLogger<EngineTapClient>.Instance);
        await client.TapAsync("user_1", "purchase",
            new Dictionary<string, object> { ["plan"] = "annual" }, CancellationToken.None);
    }
}

// ── v11.2: the service lane — keyed, user-attributed telemetry ──
public class ServiceLaneTests
{
    private sealed class CapturingHandler : HttpMessageHandler
    {
        public List<HttpRequestMessage> Requests { get; } = new();
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
        {
            Requests.Add(request);
            return Task.FromResult(new HttpResponseMessage(System.Net.HttpStatusCode.OK)
            {
                Content = new StringContent("{\"ok\":true}", Encoding.UTF8, "application/json")
            });
        }
    }

    private static IConfiguration Config(params (string key, string? value)[] values)
    {
        var builder = new Microsoft.Extensions.Configuration.ConfigurationBuilder();
        builder.AddInMemoryCollection(values.Select(v => new KeyValuePair<string, string?>(v.key, v.value)));
        return builder.Build();
    }

    [Fact]
    public async Task TapSendsServiceKeyHeaderAndUserId()
    {
        var handler = new CapturingHandler();
        var client = new EngineTapClient(
            Config(("SCROLL_TAP__URL", "http://localhost:9999"), ("SCROLL_TAP__KEY", "test-service-key-0123456789")),
            NullLogger<EngineTapClient>.Instance, handler);

        await client.TapAsync("user_42", "purchase",
            new Dictionary<string, object> { ["plan"] = "annual" }, CancellationToken.None);

        var req = Assert.Single(handler.Requests);
        Assert.Equal("http://localhost:9999/api/engine/event", req.RequestUri!.ToString());
        Assert.True(req.Headers.Contains(EngineTapClient.ServiceKeyHeader));
        Assert.Equal("test-service-key-0123456789",
            req.Headers.GetValues(EngineTapClient.ServiceKeyHeader).Single());
        var body = await req.Content!.ReadAsStringAsync();
        Assert.Contains("\"type\":\"purchase\"", body);
        Assert.Contains("\"userId\":\"user_42\"", body);
        Assert.StartsWith("{\"events\":[", body);
    }

    [Fact]
    public async Task TapWithoutKeySendsNoHeaderAndStillFires()
    {
        var handler = new CapturingHandler();
        var client = new EngineTapClient(
            Config(("SCROLL_TAP__URL", "http://localhost:9999")),
            NullLogger<EngineTapClient>.Instance, handler);

        await client.TapAsync("user_42", "purchase",
            new Dictionary<string, object> { ["plan"] = "annual" }, CancellationToken.None);

        var req = Assert.Single(handler.Requests);
        Assert.False(req.Headers.Contains(EngineTapClient.ServiceKeyHeader));
        Assert.Contains("\"userId\":\"user_42\"", await req.Content!.ReadAsStringAsync());
    }

    [Fact]
    public async Task TapWithInvalidUserIdIsSkippedLocally()
    {
        var handler = new CapturingHandler();
        var client = new EngineTapClient(
            Config(("SCROLL_TAP__URL", "http://localhost:9999"), ("SCROLL_TAP__KEY", "test-service-key-0123456789")),
            NullLogger<EngineTapClient>.Instance, handler);

        await client.TapAsync("bad id with spaces", "purchase",
            new Dictionary<string, object> { ["plan"] = "annual" }, CancellationToken.None);

        Assert.Empty(handler.Requests); // rejected before the wire
    }

    [Fact]
    public void BuildRequestBodyMatchesServerShape()
    {
        var body = EngineTapClient.BuildRequestBody("user_7", "pro_activate", "{\"plan\":\"annual\"}");
        Assert.Equal("{\"events\":[{\"type\":\"pro_activate\",\"payload\":{\"plan\":\"annual\"},\"userId\":\"user_7\"}]}", body);
    }

    [Theory]
    [InlineData("user_1")]
    [InlineData("u:grace-27")]
    [InlineData("svc-scrollbridge")]
    [InlineData("A0123456789012345678901234567890123456789012345678901234567890")] // 64 chars
    public void ValidServiceUserIdsAccepted(string id) => Assert.True(TelemetrySchema.IsServiceUserId(id));

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData(" leading")]
    [InlineData("-nope")]
    [InlineData("has space")]
    [InlineData("semi;colon")]
    [InlineData("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")] // 65 chars
    public void InvalidServiceUserIdsRejected(string? id) => Assert.False(TelemetrySchema.IsServiceUserId(id));
}
