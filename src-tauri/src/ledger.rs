// ledger.rs — native scoring core (Rust port of the Scribe's Ledger)
//
// The desktop build (Tauri) uses this module to compute churn risk, loyalty
// tier, and XP math NATIVELY — bit-for-bit parity with the TypeScript engine
// (`src/lib/engine/scores.ts`), so the offline app and the server agree.
//
// Why Rust here: the desktop shell already runs Rust; scoring in-process
// removes the JS round-trip, keeps working offline, and gives us a single
// deterministic core we can property-test. The same math backs:
//   - `ledger_score`  Tauri command (called from the webview)
//   - `cargo test`    unit + parity tests below
//
// Parity rules (do not break):
//   * sigmoid clamps at ±35 exactly like the TS `sigmoid`
//   * unknown features read as 0.0, never NaN
//   * churn output is clamped to [0,1]; loyalty to [0,100]
//   * priors are sign-guarded: training may only sharpen, never flip, a prior

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ─────────────────────────────────────────────────────────────
//  churn priors — mirror of CHURN_PRIORS in scores.ts
// ─────────────────────────────────────────────────────────────

pub fn churn_priors() -> HashMap<&'static str, f64> {
    HashMap::from([
        // recency — the strongest single predictor
        ("recency.days_since_lesson", 0.62),
        ("recency.gap_days", 0.30),
        ("recency.hours_since_any", 0.012),
        ("z.inv_recency_days", -0.9),
        // frequency collapse
        ("delta.lessons_7vprev", -0.08),
        ("delta.active_7vprev", -0.05),
        ("delta.regression_flag", 0.55),
        ("delta.engagement_slope", -0.5),
        ("delta.momentum_score", -0.7),
        // consistency
        ("comp.consistency_7d", -0.35),
        ("comp.consistency_30d", -0.55),
        ("comp.routine_score", -0.3),
        ("active.gap_z", 0.18),
        ("active.pre_lapse_drop", 0.22),
        // streak protection
        ("streak.risk_tonight", 0.12),
        ("streak.is_alive", -0.28),
        // mastery & frustration
        ("mastery.sputnik", 0.25),
        ("mastery.review_pressure", 0.04),
        ("well.frustration_signal", 0.3),
        ("well.burnout_risk", 0.4),
        // social glue
        ("social.friends", -0.05),
        ("social.friends_3plus", -0.18),
        ("community.actions_total", -0.01),
        // habit depth
        ("progress.lessons_total", -0.012),
        ("z.log_lessons", -0.22),
        ("meta.confidence", -0.15),
        ("meta.cold_start", 0.2),
        // lifecycle
        ("tenure.sophomore_slump", 0.0),
        ("delta.sophomore_slump", 0.3),
        ("tenure.is_lapsed_30d", 0.8),
        // referral loop — advocates churn far less (added with the program)
        ("referral.joins", -0.06),
        ("referral.is_advocate", -0.15),
    ])
}

pub const CHURN_BIAS: f64 = -1.35; // base-rate prior: most days, most users, are fine

/// Numerically-stable sigmoid with the TS engine's ±35 clamp.
#[inline]
pub fn sigmoid(z: f64) -> f64 {
    let v = if z.is_nan() { 0.0 } else { z };
    if v >= 0.0 {
        1.0 / (1.0 + (-v.min(35.0)).exp())
    } else {
        let e = v.max(-35.0).exp();
        e / (1.0 + e)
    }
}

/// Clamp helper mirroring the TS `clamp01`.
#[inline]
fn clamp01(v: f64) -> f64 {
    if v.is_nan() {
        0.0
    } else {
        v.clamp(0.0, 1.0)
    }
}

/// Logistic model runner — parity of `runModel` in scores.ts.
/// Unknown features read as 0.0; NaN payloads are treated as 0.0.
pub fn run_model(weights: &HashMap<&str, f64>, bias: f64, values: &HashMap<String, f64>) -> f64 {
    let mut z = bias;
    for (id, w) in weights {
        let x = values.get(*id).copied().unwrap_or(0.0);
        let x = if x.is_nan() { 0.0 } else { x };
        z += w * x;
    }
    sigmoid(z)
}

// ─────────────────────────────────────────────────────────────
//  loyalty — RFM + tenure + advocacy → 0..100 → 4 tiers
// ─────────────────────────────────────────────────────────────

pub const LOYALTY_TIERS: [(&str, f64); 4] = [
    ("Parchment", 0.0),
    ("Scroll", 40.0),
    ("Codex", 60.0),
    ("Library", 82.0),
];

pub fn loyalty_tier_name(score: f64) -> &'static str {
    let mut name = "Parchment";
    for (n, at) in LOYALTY_TIERS {
        if score >= at {
            name = n;
        }
    }
    name
}

// ─────────────────────────────────────────────────────────────
//  the scoring surface
// ─────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LedgerInput {
    /// feature values by id (e.g. "recency.days_since_lesson": 2.5)
    pub features: HashMap<String, f64>,
    /// optional learned overrides { id: weight } — must be sign-guarded upstream
    pub learned_weights: Option<HashMap<String, f64>>,
    pub learned_bias: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LedgerScores {
    pub churn_risk: f64,
    pub loyalty: f64,
    pub loyalty_tier: &'static str,
    /// simple engagement blend the desktop UI can show without the server
    pub engagement: f64,
}

/// Core score computation — pure, deterministic, no I/O.
pub fn score(input: &LedgerInput) -> LedgerScores {
    // churn: priors merged (not replaced) with learned weights
    let priors = churn_priors();
    let mut weights: HashMap<&str, f64> = priors.clone();
    let mut bias = CHURN_BIAS;
    if let Some(learned) = &input.learned_weights {
        for (id, w) in learned {
            // sign guard: training may only sharpen a prior, never flip it.
            // The TS trainer enforces this during SGD (weights START from the
            // priors and a step that would cross zero has its gradient zeroed),
            // so a legitimately trained weight always carries the prior's sign.
            // At this boundary the payload is untrusted JSON — a wrong-sign (or
            // NaN) weight is REJECTED and the prior STANDS. Clamping to 0 would
            // silently delete the prior and weaken the model: the exact flip
            // the guard exists to prevent.
            if let Some(prior) = priors.get(id.as_str()) {
                let same_side = !w.is_nan()
                    && ((*prior >= 0.0 && *w >= 0.0) || (*prior < 0.0 && *w < 0.0));
                let guarded = if same_side { *w } else { *prior };
                weights.insert(id.as_str(), guarded);
            }
        }
    }
    if let Some(b) = input.learned_bias {
        if b.is_finite() {
            bias = b;
        }
    }

    let churn = clamp01(run_model(&weights, bias, &input.features));

    // loyalty blend: recency(fresh) + frequency + consistency + advocacy
    let f = |id: &str| -> f64 {
        let v = input.features.get(id).copied().unwrap_or(0.0);
        if v.is_nan() { 0.0 } else { v }
    };
    let days_since = f("recency.days_since_lesson");
    let recency_part = (1.0 - clamp01(days_since / 14.0)) * 30.0; // 30 pts
    let consistency = clamp01((f("comp.consistency_30d") + f("comp.routine_score")) / 2.0);
    let frequency = clamp01(f("comp.active_days_30d") / 20.0);
    let advocate = clamp01(f("referral.joins") / 5.0);
    let loyalty = (recency_part
        + frequency * 30.0
        + consistency * 25.0
        + advocate * 15.0)
        .clamp(0.0, 100.0);

    let engagement = clamp01((frequency * 0.5) + (consistency * 0.3) + ((1.0 - clamp01(days_since / 7.0)) * 0.2));

    LedgerScores {
        churn_risk: (churn * 10_000.0).round() / 10_000.0,
        loyalty: (loyalty * 10.0).round() / 10.0,
        loyalty_tier: loyalty_tier_name(loyalty),
        engagement: (engagement * 10_000.0).round() / 10_000.0,
    }
}

// ─────────────────────────────────────────────────────────────
//  XP math — parity with gamification.ts `awardActivityXp`
// ─────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct XpBreakdown {
    pub base: i64,
    pub first_time_bonus: i64,
    pub perfect_bonus: i64,
    pub combo_bonus: i64,
    pub difficulty_bonus: i64,
    pub pro_multiplier: f64,
    pub total: i64,
}

/// XP award math (mirrors the server: base by difficulty, first-time +10,
/// perfect +5, combo tiers, Pro ×2 on weekends).
pub fn lesson_xp(difficulty: u32, first_time: bool, perfect: bool, combo: u32, is_pro_weekend: bool) -> XpBreakdown {
    let base = match difficulty {
        1 => 10,
        2 => 15,
        _ => 20,
    } as i64;
    let first_time_bonus = if first_time { 10 } else { 0 };
    let perfect_bonus = if perfect { 5 } else { 0 };
    let combo_bonus = if combo >= 12 { 5 } else if combo >= 8 { 3 } else if combo >= 5 { 2 } else { 0 };
    let difficulty_bonus = match difficulty {
        3 => 5,
        _ => 0,
    };
    let pro_multiplier = if is_pro_weekend { 2.0 } else { 1.0 };
    let subtotal = base + first_time_bonus + perfect_bonus + combo_bonus + difficulty_bonus;
    let total = ((subtotal as f64) * pro_multiplier).round() as i64;
    XpBreakdown { base, first_time_bonus, perfect_bonus, combo_bonus, difficulty_bonus, pro_multiplier, total }
}

// ─────────────────────────────────────────────────────────────
//  tests — parity + property checks (`cargo test`)
// ─────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn feats(pairs: &[(&str, f64)]) -> HashMap<String, f64> {
        pairs.iter().map(|(k, v)| (k.to_string(), *v)).collect()
    }

    #[test]
    fn sigmoid_is_stable_and_clamped() {
        assert!((sigmoid(0.0) - 0.5).abs() < 1e-12);
        assert!((sigmoid(35.0) - 1.0).abs() < 1e-15 || sigmoid(35.0) <= 1.0);
        assert!(sigmoid(1000.0) <= 1.0 && sigmoid(1000.0) > 0.999);
        assert!(sigmoid(-1000.0) >= 0.0 && sigmoid(-1000.0) < 0.001);
        assert_eq!(sigmoid(f64::NAN), 0.5); // NaN treated as 0 → 0.5
    }

    #[test]
    fn churn_risk_rises_with_recency() {
        let fresh = score(&LedgerInput { features: feats(&[("recency.days_since_lesson", 0.0), ("streak.is_alive", 1.0)]), learned_weights: None, learned_bias: None });
        let stale = score(&LedgerInput { features: feats(&[("recency.days_since_lesson", 9.0), ("streak.is_alive", 0.0)]), learned_weights: None, learned_bias: None });
        assert!(stale.churn_risk > fresh.churn_risk, "stale {} should exceed fresh {}", stale.churn_risk, fresh.churn_risk);
    }

    #[test]
    fn advocates_score_lower_churn() {
        let plain = score(&LedgerInput { features: feats(&[("recency.days_since_lesson", 3.0)]), learned_weights: None, learned_bias: None });
        let advocate = score(&LedgerInput { features: feats(&[("recency.days_since_lesson", 3.0), ("referral.joins", 5.0), ("referral.is_advocate", 1.0)]), learned_weights: None, learned_bias: None });
        assert!(advocate.churn_risk <= plain.churn_risk);
    }

    #[test]
    fn sign_guard_blocks_flipped_priors() {
        // a malicious/buggy learned weight tries to make recency REDUCE churn
        let mut learned = HashMap::new();
        learned.insert("recency.days_since_lesson".to_string(), -5.0);
        let guarded = score(&LedgerInput { features: feats(&[("recency.days_since_lesson", 8.0)]), learned_weights: Some(learned), learned_bias: None });
        let base = score(&LedgerInput { features: feats(&[("recency.days_since_lesson", 8.0)]), learned_weights: None, learned_bias: None });
        assert!(guarded.churn_risk >= base.churn_risk, "sign guard must prevent flipping the prior direction");
        // a REJECTED flip leaves the prior standing — exactly the base score
        assert_eq!(guarded.churn_risk, base.churn_risk, "wrong-sign override must be dropped, not clamped to 0 (which deletes the prior)");
    }

    #[test]
    fn sign_guard_accepts_same_sign_sharpening() {
        // a legitimately trained weight carries the prior's sign and passes through
        let mut sharpen = HashMap::new();
        sharpen.insert("recency.days_since_lesson".to_string(), 1.5); // prior +0.62, same side
        let sharpened = score(&LedgerInput { features: feats(&[("recency.days_since_lesson", 8.0)]), learned_weights: Some(sharpen), learned_bias: None });
        let base = score(&LedgerInput { features: feats(&[("recency.days_since_lesson", 8.0)]), learned_weights: None, learned_bias: None });
        assert!(sharpened.churn_risk > base.churn_risk, "same-sign learned weight must be honored (training sharpens priors)");
        // NaN payload → prior stands, never NaN out
        let mut nan_w = HashMap::new();
        nan_w.insert("recency.days_since_lesson".to_string(), f64::NAN);
        let na = score(&LedgerInput { features: feats(&[("recency.days_since_lesson", 8.0)]), learned_weights: Some(nan_w), learned_bias: None });
        assert_eq!(na.churn_risk, base.churn_risk, "NaN learned weight must fall back to the prior");
    }

    #[test]
    fn loyalty_tiers_line_up() {
        assert_eq!(loyalty_tier_name(0.0), "Parchment");
        assert_eq!(loyalty_tier_name(39.9), "Parchment");
        assert_eq!(loyalty_tier_name(40.0), "Scroll");
        assert_eq!(loyalty_tier_name(61.0), "Codex");
        assert_eq!(loyalty_tier_name(95.0), "Library");
    }

    #[test]
    fn loyalty_is_bounded_0_100() {
        let s = score(&LedgerInput { features: feats(&[("comp.active_days_30d", 999.0), ("comp.consistency_30d", 999.0), ("referral.joins", 999.0)]), learned_weights: None, learned_bias: None });
        assert!((0.0..=100.0).contains(&s.loyalty));
    }

    #[test]
    fn xp_math_matches_server_rules() {
        // Foundations first-time perfect, no combo, weekday → 10+10+5 = 25
        let a = lesson_xp(1, true, true, 0, false);
        assert_eq!(a.total, 25);
        // Advanced first-time perfect combo-12 weekday → 20+10+5+5+5 = 45
        let b = lesson_xp(3, true, true, 12, false);
        assert_eq!(b.total, 45);
        // same on a Pro weekend → ×2 = 90
        let c = lesson_xp(3, true, true, 12, true);
        assert_eq!(c.total, 90);
        // repeat (not first-time), imperfect, no combo → base only
        let d = lesson_xp(2, false, false, 0, false);
        assert_eq!(d.total, 15);
    }

    #[test]
    fn unknown_features_never_panic() {
        let s = score(&LedgerInput { features: HashMap::new(), learned_weights: None, learned_bias: None });
        assert!((0.0..=1.0).contains(&s.churn_risk));
        assert!(s.engagement.is_finite());
    }
}
