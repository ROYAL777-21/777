// telemetry.rs — native mirror of the telemetry schema (v11)
//
// The TypeScript schema (`src/lib/telemetry/schema.ts`) is the single
// source of truth for what may enter the Scribe's Ledger tap stream.
// This module mirrors its event-type list and fingerprint so the
// desktop shell can VERIFY parity at runtime:
//
//   webview:  fetch("/api/engine/schema") → fingerprint
//   native:   invoke("schema_fingerprint") → fingerprint
//   mismatch → the build predates the server (or vice versa); the app
//              logs it loudly in dev instead of silently drifting.
//
// Parity rules (do not break):
//   * the list below must equal the sorted keys of EVENT_CONTRACTS
//   * the canonical form is `scroll-telemetry-v{VERSION}\n{types joined by \n}`
//   * FNV-1a 32-bit with wrapping arithmetic — identical to the TS
//     fnv1a32 (Math.imul + >>>0) and the C# ScrollBridge mirror
//   * `cargo test` pins the fingerprint constant: 3026954531.
//     If you change the schema in TS, regenerate this list, recompute,
//     and update the pin in TS tests + C# in the same commit.

pub const TELEMETRY_SCHEMA_VERSION: u32 = 11;

/// The 60 event types — MUST match the sorted keys of EVENT_CONTRACTS
/// in src/lib/telemetry/schema.ts exactly.
pub const EVENT_TYPES: &[&str] = &[
    "achievement_unlock",
    "api_error",
    "app_open",
    "assistant_action",
    "assistant_error",
    "assistant_open",
    "assistant_query",
    "campaign_banner_cta",
    "campaign_banner_view",
    "chapter_read",
    "checkout_view",
    "chest_open",
    "client_error",
    "comment_create",
    "complaint",
    "course_change",
    "email_cta",
    "email_open",
    "engine_train",
    "freeze_used",
    "friend_add",
    "heart_lost",
    "heart_refill",
    "hearts_empty",
    "invite",
    "keyboard_use",
    "ledger_rebuild",
    "lesson_complete",
    "lesson_start",
    "like",
    "nba_dismissed",
    "nba_shown",
    "nba_used",
    "notification_open",
    "order_bump_toggle",
    "paywall_complaint",
    "paywall_cta",
    "paywall_dismiss",
    "paywall_invite_shown",
    "paywall_open",
    "paywall_view",
    "placement_done",
    "plan_checkoff",
    "post_create",
    "pro_activate",
    "purchase",
    "quest_complete",
    "quiz_complete",
    "session_end_after_mistake",
    "settings_change",
    "share",
    "story_complete",
    "streak_repair",
    "verse_mark",
    "view_change",
    "widget_impression",
    "widget_tap",
    "winback_accept",
    "winback_snooze",
    "winback_view",
];

/// FNV-1a 32-bit over the canonical form (wrapping, like TS Math.imul).
pub fn fingerprint() -> u32 {
    let mut h: u32 = 0x811c_9dc5;
    for &b in canonical_form().as_bytes() {
        h ^= b as u32;
        h = h.wrapping_mul(0x0100_0193);
    }
    h
}

/// The exact string the TS side hashes (`telemetryCanonicalForm()`).
pub fn canonical_form() -> String {
    format!(
        "scroll-telemetry-v{}\n{}",
        TELEMETRY_SCHEMA_VERSION,
        EVENT_TYPES.join("\n")
    )
}

/// The fingerprint the lib.rs `schema_fingerprint` command serves to the
/// webview (compare against GET /api/engine/schema).
pub fn schema_fingerprint_value() -> u32 {
    fingerprint()
}

#[cfg(test)]
mod tests {
    use super::*;

    /// The pinned fingerprint — must equal telemetryFingerprint() in TS
    /// and TelemetrySchema.Fingerprint() in C# (ScrollBridge).
    const PINNED: u32 = 3_026_954_531;

    #[test]
    fn fingerprint_matches_pin() {
        assert_eq!(fingerprint(), PINNED, "telemetry schema drifted from the pin — regenerate the event list in TS, Rust AND C# together");
    }

    #[test]
    fn event_list_is_sorted_and_bounded() {
        assert_eq!(EVENT_TYPES.len(), 60);
        let mut sorted = EVENT_TYPES.to_vec();
        sorted.sort_unstable();
        assert_eq!(
            &sorted, EVENT_TYPES,
            "the list must be sorted like the TS canonical form"
        );
        for t in EVENT_TYPES {
            assert!(
                t.len() <= 64
                    && t.bytes().all(|b| b.is_ascii_lowercase()
                        || b.is_ascii_digit()
                        || b == b'_'
                        || b == b'.')
            );
        }
    }

    #[test]
    fn fnv_is_deterministic() {
        assert_eq!(fingerprint(), fingerprint());
        assert_ne!(fingerprint(), 0);
    }
}
