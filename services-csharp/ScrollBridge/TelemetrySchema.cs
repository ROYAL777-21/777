// TelemetrySchema.cs — C# mirror of the telemetry schema (v11)
//
// ScrollBridge is the scale-out worker (payments, push). When it acts on
// a user's behalf, the engine's tap stream should hear about it — through
// the SAME schema the web app validates against:
//
//   source of truth:  src/lib/telemetry/schema.ts   (TS)
//   native mirror:    src-tauri/src/telemetry.rs    (Rust)
//   this file:        services-csharp               (C#)
//
// All three pin the same fingerprint (FNV-1a over the canonical form).
// If the TS schema changes, regenerate all mirrors in one commit —
// `dotnet test` fails the pin below, `cargo test` fails its pin, and the
// web runtime comparison catches anything that slipped through.
//
// Privacy & safety rules (mirror docs/TELEMETRY-SCHEMA.md):
//   * payload properties are bounded and validated before emission
//   * user ids only — never emails, never free text
//   * emission is fire-and-forget with a capped retry; the tap client
//     NEVER throws into the payment/push paths

using System.Collections.Concurrent;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace ScrollBridge;

public static class TelemetrySchema
{
    public const int Version = 11;

    /// Pin — must equal telemetryFingerprint() (TS) and telemetry::fingerprint() (Rust).
    public const uint PinnedFingerprint = 3_026_954_531u;

    /// The 60 event types — MUST equal the sorted keys of EVENT_CONTRACTS in TS.
    public static readonly string[] EventTypes =
    [
        "achievement_unlock", "api_error", "app_open", "assistant_action", "assistant_error",
        "assistant_open", "assistant_query", "campaign_banner_cta", "campaign_banner_view",
        "chapter_read", "checkout_view", "chest_open", "client_error", "comment_create",
        "complaint", "course_change", "email_cta", "email_open", "engine_train", "freeze_used",
        "friend_add", "heart_lost", "heart_refill", "hearts_empty", "invite", "keyboard_use",
        "ledger_rebuild", "lesson_complete", "lesson_start", "like", "nba_dismissed", "nba_shown",
        "nba_used", "notification_open", "order_bump_toggle", "paywall_complaint", "paywall_cta",
        "paywall_dismiss", "paywall_invite_shown", "paywall_open", "paywall_view",
        "placement_done", "plan_checkoff", "post_create", "pro_activate", "purchase",
        "quest_complete", "quiz_complete", "session_end_after_mistake", "settings_change",
        "share", "story_complete", "streak_repair", "verse_mark", "view_change",
        "widget_impression", "widget_tap", "winback_accept", "winback_snooze", "winback_view",
    ];

    private static readonly HashSet<string> Known = new(EventTypes, StringComparer.Ordinal);

    // anchored, linear character class — same shape as the TS escape hatch
    private static readonly System.Text.RegularExpressions.Regex Namespaced =
        new("^[a-z0-9_.]{1,64}$", System.Text.RegularExpressions.RegexOptions.Compiled);

    public static bool IsValidEventType(string type) =>
        !string.IsNullOrEmpty(type) && (Known.Contains(type) || Namespaced.IsMatch(type));

    // mirrors isServiceUserId in src/lib/telemetry/serviceLane.ts —
    // the service lane attributes events to exactly this shape
    private static readonly System.Text.RegularExpressions.Regex ServiceUserId =
        new("^[A-Za-z0-9][A-Za-z0-9_:-]{0,63}$", System.Text.RegularExpressions.RegexOptions.Compiled);

    public static bool IsServiceUserId(string? userId) =>
        !string.IsNullOrEmpty(userId) && ServiceUserId.IsMatch(userId);

    public static string CanonicalForm() =>
        $"scroll-telemetry-v{Version}\n{string.Join("\n", EventTypes)}";

    public static uint Fingerprint()
    {
        unchecked
        {
            uint h = 0x811c_9dc5;
            foreach (var b in Encoding.UTF8.GetBytes(CanonicalForm()))
            {
                h ^= b;
                h *= 0x0100_0193;
            }
            return h;
        }
    }

    /// Bounded payload validation for the events ScrollBridge emits.
    public static bool TryBuildPayload(string type, IReadOnlyDictionary<string, object> props, out string json)
    {
        json = "{}";
        if (!IsValidEventType(type) || props.Count > 16) return false;

        var clean = new Dictionary<string, object>(props.Count);
        foreach (var (key, value) in props)
        {
            if (key.Length > 32) return false;
            switch (value)
            {
                case bool b:
                    clean[key] = b;
                    break;
                case int i when i is >= 0 and <= 1_000_000:
                    clean[key] = i;
                    break;
                case long l when l is >= 0 and <= 1_000_000:
                    clean[key] = l;
                    break;
                case string s when s.Length <= 64:
                    clean[key] = s;
                    break;
                default:
                    return false; // reject anything out of contract shape
            }
        }
        try
        {
            json = JsonSerializer.Serialize(clean);
            return json.Length <= 2048;
        }
        catch
        {
            return false;
        }
    }
}

/// <summary>
/// Fire-and-forget tap emission into the app's engine ingest
/// (POST {SCROLL_TAP__URL}/api/engine/event). No-op when the URL is
/// unset (tests, local runs). Never throws into caller paths.
///
/// The service lane (v11.2): set SCROLL_TAP__KEY to the shared secret
/// (ENGINE_SERVICE_KEY on the web side) and every tap carries
///   · header  X-Scroll-Service-Key
///   · body    { "events": [{ type, payload, userId }] }
/// attributed to the exact user the worker acted for — no session,
/// no defaults. Without a key the server refuses the lane (401).
/// </summary>
public sealed class EngineTapClient
{
    public const string ServiceKeyHeader = "X-Scroll-Service-Key";

    private readonly HttpClient _http;
    private readonly string? _baseUrl;
    private readonly string? _serviceKey;
    private readonly ILogger<EngineTapClient> _log;
    private readonly ConcurrentQueue<string> _retry = new(); // full request bodies
    private bool _warnedNoKey;

    public EngineTapClient(IConfiguration? config, ILogger<EngineTapClient> log, HttpMessageHandler? handler = null)
    {
        _log = log;
        var url = config?["SCROLL_TAP__URL"];
        _baseUrl = string.IsNullOrWhiteSpace(url) ? null : url.TrimEnd('/');
        _serviceKey = config?["SCROLL_TAP__KEY"];
        _http = handler is not null
            ? new HttpClient(handler) { BaseAddress = _baseUrl is null ? null : new Uri(_baseUrl), Timeout = TimeSpan.FromSeconds(4) }
            : _baseUrl is null
                ? new HttpClient()
                : new HttpClient { BaseAddress = new Uri(_baseUrl), Timeout = TimeSpan.FromSeconds(4) };

        if (TelemetrySchema.Fingerprint() != TelemetrySchema.PinnedFingerprint)
            throw new InvalidOperationException(
                "ScrollBridge telemetry schema fingerprint does not match the pin — regenerate TS/Rust/C# mirrors together.");

        // the service-lane key rides on every request this client makes —
        // set once here (the client is dedicated to the tap endpoint)
        if (!string.IsNullOrWhiteSpace(_serviceKey) && _baseUrl is not null)
            _http.DefaultRequestHeaders.Add(ServiceKeyHeader, _serviceKey);
    }

    /// Builds the exact JSON body the service lane expects (unit-tested).
    public static string BuildRequestBody(string userId, string type, string payloadJson) =>
        $"{{\"events\":[{{\"type\":\"{type}\",\"payload\":{payloadJson},\"userId\":\"{userId}\"}}]}}";

    public async Task TapAsync(string userId, string type, IReadOnlyDictionary<string, object> props, CancellationToken ct = default)
    {
        if (_baseUrl is null) return; // emission disabled (tests / offline)
        if (!TelemetrySchema.TryBuildPayload(type, props, out var payload)) return;

        if (string.IsNullOrWhiteSpace(_serviceKey) && !_warnedNoKey)
        {
            _warnedNoKey = true;
            _log.LogWarning("SCROLL_TAP__KEY is not set — the engine's service lane will refuse these taps (401). Set it to the web app's ENGINE_SERVICE_KEY.");
        }

        // `type` is schema-validated ([a-z0-9_.]), `payload` is valid JSON and
        // `userId` is validated below — all safe to embed verbatim; the app's
        // ingest re-validates anyway.
        if (!TelemetrySchema.IsServiceUserId(userId))
        {
            _log.LogWarning("engine tap {Type} skipped — invalid userId '{UserId}'", type, userId);
            return;
        }
        var body = BuildRequestBody(userId, type, payload);
        var content = new StringContent(body, Encoding.UTF8, "application/json");

        try
        {
            var res = await _http.PostAsync("/api/engine/event", content, ct);
            if (!res.IsSuccessStatusCode)
                _log.LogWarning("engine tap {Type} returned {Status}", type, (int)res.StatusCode);
        }
        catch (Exception ex)
        {
            // capped retry: one pass of the backlog per call, never grows unbounded
            _log.LogWarning(ex, "engine tap {Type} failed — retained for one retry pass", type);
            _retry.Enqueue(body);
            while (_retry.TryDequeue(out var pending))
            {
                try
                {
                    await _http.PostAsync("/api/engine/event", new StringContent(pending, Encoding.UTF8, "application/json"), ct);
                }
                catch
                {
                    _retry.Enqueue(pending); // put it back; next call tries again
                    break;
                }
            }
        }
    }
}
