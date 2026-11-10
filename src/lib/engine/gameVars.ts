/**
 * gameVars.ts — THE GAMIFICATION VARIABLE REGISTRY (544 variables)
 *
 * 18 domains covering every tunable knob of the game layer. Each variable
 * has: id, domain, default value, description, and an optional personalized
 * resolver (per-user, feature/score-aware). resolveGameConfig() layers:
 *
 *   defaults → rule overrides → bandit arms → trained adaptive values
 *
 * Math hardening: every rule computes through num()/clamp guards so no
 * NaN/Infinity can ever enter a config value.
 */

import type { FeatureResult } from "./features"
import type { EngineScores } from "./scores"

export interface GameVar {
  id: string
  domain: string
  desc: string
  def: number | string | boolean
  rule?: (v: Record<string, number>, s: EngineScores) => number | string | boolean
}

function num(x: unknown, dflt = 0): number {
  if (typeof x === "number" && Number.isFinite(x)) return x
  return dflt
}
function cl(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, num(x)))
}
function cl01(x: number): number {
  return cl(x, 0, 1)
}
function rr(v: Record<string, number>, id: string, dflt = 0): number {
  return num(v[id], dflt)
}

// ─────────────────────────────────────────────────────────────
//  the 544 variables
// ─────────────────────────────────────────────────────────────

function buildVars(): GameVar[] {
  const out: GameVar[] = []
  const add = (id: string, domain: string, desc: string, def: number | string | boolean, rule?: GameVar["rule"]) => {
    out.push({ id, domain, desc, def, rule })
  }

  // ═══ xp (41) ═══
  {
    const d = "xp"
    add("xp.daily_goal", d, "Daily XP goal", 50, (v, s) => (s.habitStage === "sparking" ? 30 : s.habitStage === "starting" ? 40 : s.habitStage === "identity" ? 60 : 50))
    add("xp.goal_stretch", d, "Goal stretch after 5 consecutive hits (%)", 10)
    add("xp.goal_shrink", d, "Goal shrink after 4 misses (%)", 25)
    add("xp.personal_multiplier", d, "Engine catch-up multiplier 1.0-1.25", 1, (v, s) => cl(1 + cl(Math.log2(1 + Math.min(21, rr(v, "recency.days_since_lesson", 0))) / 8, 0, 0.25) * (0.5 + 0.5 * cl(1 - s.engagement, 0, 1)), 1, 1.25))
    add("xp.lesson_base", d, "Base XP per lesson", 10)
    add("xp.perfect_bonus", d, "Perfect lesson bonus XP", 5)
    add("xp.combo_step", d, "XP per combo step", 1)
    add("xp.combo_cap", d, "Combo bonus cap", 15)
    add("xp.challenge_xp", d, "XP per correct challenge", 2)
    add("xp.story_base", d, "Base XP per story", 20)
    add("xp.story_perfect_bonus", d, "Perfect story bonus", 10)
    add("xp.quiz_base", d, "Base XP per daily quiz", 15)
    add("xp.quiz_perfect_bonus", d, "Perfect quiz bonus", 10)
    add("xp.read_base", d, "XP per Bible chapter", 10)
    add("xp.plan_day_xp", d, "XP per plan check-off", 5)
    add("xp.community_xp", d, "XP per community action", 2)
    add("xp.weekend_double", d, "Weekend double XP for Pro", 2)
    add("xp.level_curve_base", d, "Level curve base step", 100)
    add("xp.level_curve_growth", d, "Level curve growth factor", 1.5)
    add("xp.catchup_max_days", d, "Max lapse days counted for catch-up", 21)
    add("xp.decay_grace_days", d, "Grace days before XP velocity flags", 3)
    add("xp.surge_boost_7d", d, "XP surge boost (experiment arm)", 1.15)
    add("xp.surge_min_streak", d, "Min streak to offer surge", 7)
    add("xp.plateau_buster_bonus", d, "Plateau-buster bonus after 3 flat days", 5)
    add("xp.milestone_bonus_7", d, "Bonus XP at 7-day milestone", 20)
    add("xp.milestone_bonus_30", d, "Bonus XP at 30-day milestone", 50)
    add("xp.milestone_bonus_100", d, "Bonus XP at 100-day milestone", 150)
    add("xp.review_xp_mult", d, "Review XP multiplier", 1.2)
    add("xp.nightowl_bonus_on", d, "Late-night study bonus (discouraged default)", 0)
    add("xp.earlybird_bonus_on", d, "Early-morning study bonus", 0)
    add("xp.accumulating_rounding", d, "Rounding for displayed XP", 0)
    add("xp.show_breakdown", d, "Show XP breakdown on completion", 1)
    add("xp.levelup_notification", d, "Notify on level-up", 1)
    add("xp.daily_cap", d, "Daily XP cap (soft)", 400)
    add("xp.streak_floor_xp", d, "Streak-preserving floor XP", 10)
    add("xp.double_xp_duration_h", d, "Double XP duration (hours)", 12)
    add("xp.weekend_window_start", d, "Weekend double start (Sat hour)", 0)
    add("xp.weekend_window_end", d, "Weekend double end (Sun hour)", 24)
    add("xp.pity_bonus_threshold", d, "Misses before pity bonus", 5)
    add("xp.pity_bonus", d, "Pity bonus after hard streak", 10)
    add("xp.display_anim_ms", d, "XP counter animation (ms)", 600)
  }

  // ═══ streak (28) ═══
  {
    const d = "streak"
    add("streak.grace_hour", d, "Hour after which streak-risk nudges fire", 19)
    add("streak.freeze_price", d, "Gem price of a Streak Freeze", 200)
    add("streak.freeze_max", d, "Max freezes held", 2)
    add("streak.freeze_pro_grant", d, "Freezes granted monthly to Pro", 2)
    add("streak.repair_window_h", d, "Retro-repair window (hours)", 0)
    add("streak.milestones", d, "Milestone set (encoded count)", 7)
    add("streak.milestone_celebrate_confetti", d, "Confetti on milestone", 1)
    add("streak.risk_nudge_hour", d, "Evening save nudge hour", 20)
    add("streak.evening_save_tone", d, "Evening save copy tone", "stewardship", (v, s) => (rr(v, "timing.chronotype", 2) === 3 ? "growth" : "stewardship"))
    add("streak.welcome_back_days", d, "Days of lapse that triggers welcome-back", 3)
    add("streak.weekend_grace", d, "Weekend auto-grace (design: off)", 0)
    add("streak.sunday_grace", d, "Sunday auto-grace (design: off)", 0)
    add("streak.display_countdown", d, "Show day-remaining countdown", 1)
    add("streak.loss_aversion_copy", d, "Loss-framing allowed (integrity: off)", 0)
    add("streak.repair_gem_cost", d, "Gem cost of post-loss repair", 400)
    add("streak.freeze_notification", d, "Notify when a freeze is consumed", 1)
    add("streak.streak_share_card", d, "Offer share card at milestones", 1)
    add("streak.big_milestone_365", d, "Special celebration at 365", 1)
    add("streak.casual_mode", d, "Casual mode (streaks off) available", 0)
    add("streak.repair_pro_per_month", d, "Pro repairs per month", 2)
    add("streak.risk_min_days", d, "Min streak before risk nudges", 2)
    add("streak.dow_reset_hour", d, "Local hour the streak day flips", 0)
    add("streak.milestone_sharing_off", d, "Milestone share toggle default", 1)
    add("streak.longest_badge", d, "Show longest-streak badge", 1)
    add("streak.heatmap_weeks", d, "Weeks of heatmap shown", 12)
    add("streak.freeze_hint_after", d, "Suggest freeze after N saves", 2)
    add("streak.combo_preserve_floor", d, "Combo floor after freeze", 0)
    add("streak.streak_id_campaign", d, "Identity campaign at 30 days (copy only)", 1)
  }

  // ═══ hearts (contained in econ) — econ (44) ═══
  {
    const d = "econ"
    add("econ.hearts_max", d, "Max hearts", 5)
    add("econ.hearts_regen_min", d, "Minutes per heart regen", 10)
    add("econ.hearts_pro_unlimited", d, "Unlimited hearts for Pro", 1)
    add("econ.hearts_refill_price", d, "Gem price of heart refill", 350)
    add("econ.hearts_lost_per_mistake", d, "Hearts lost per lesson failure", 1)
    add("econ.hearts_grace_period_min", d, "Heart-loss grace (minutes)", 0)
    add("econ.gems_welcome", d, "Welcome gem grant", 500)
    add("econ.gems_quest_reward", d, "Gems per quest", 15)
    add("econ.gems_achievement_scale", d, "Achievement gem scale base", 10)
    add("econ.gems_quiz_bonus", d, "Perfect quiz gem bonus", 5)
    add("econ.chest_unlock_threshold", d, "Lessons per chest", 8)
    add("econ.chest_gem_min", d, "Chest gem min", 10)
    add("econ.chest_gem_max", d, "Chest gem max", 40)
    add("econ.chest_xp_chance", d, "Chest contains XP (0/1)", 1)
    add("econ.chest_freeze_chance", d, "Chest contains freeze chance", 0.1)
    add("econ.gem_inflation_guard", d, "Gem faucet cap per week", 300)
    add("econ.sink_rebalance_on", d, "Dynamic sink rebalancing", 1)
    add("econ.gem_rain_event_xp", d, "Gem rain event bonus XP", 0)
    add("econ.gem_rain_min_engagement", d, "Min engagement for gem rain", 0.4)
    add("econ.shop_refresh_ms", d, "Shop refresh (ms)", 0)
    add("econ.double_xp_price", d, "Gem price of double XP", 300)
    add("econ.double_xp_hours", d, "Double XP duration (hours)", 12)
    add("econ.heart_economy_softness", d, "Heart-loss softness 0-1 (difficulty scaler)", 0.3, (v) => cl(1 - cl01(rr(v, "well.frustration_signal", 0)), 0.1, 1))
    add("econ.pity_hearts_after", d, "Zero-hearts events before pity heart", 3)
    add("econ.pity_hearts_grant", d, "Pity hearts granted", 1)
    add("econ.freeze_discount_at", d, "Freeze discount at high streak (0=off)", 0)
    add("econ.gems_streak_interest", d, "Gem interest on streak (design: off)", 0)
    add("econ.scarcity_mechanics", d, "Scarcity mechanics allowed (integrity: off)", 0)
    add("econ.price_rounding", d, "Price rounding (gems)", 50)
    add("econ.currency_name", d, "Currency display name", "Gems")
    add("econ.currency_icon", d, "Currency icon", "💎")
    add("econ.hud_show_hearts", d, "Hearts in HUD", 1)
    add("econ.hud_show_gems", d, "Gems in HUD", 1)
    add("econ.hud_show_streak", d, "Streak in HUD", 1)
    add("econ.refill_hint_after_min", d, "Minutes at 0 hearts before hint", 15)
    add("econ.heart_lost_notification", d, "Notify on heart loss (design: off)", 0)
    add("econ.regen_notification", d, "Notify on hearts full", 0)
    add("econ.chest_animation_ms", d, "Chest opening animation", 900)
    add("econ.gem_rain_min_gems", d, "Gem rain floor", 50)
    add("econ.gem_rain_share", d, "Gem rain share-ability (0/1)", 1)
    add("econ.welcome_chest", d, "Welcome chest for new users", 1)
    add("econ.weekend_gem_bonus", d, "Weekend gem bonus multiplier", 1)
    add("econ.loyalty_tier_gem_bonus", d, "Gem bonus per loyalty tier (%)", 0)
  }

  // ═══ difficulty (37) ═══
  {
    const d = "difficulty"
    add("difficulty.target_accuracy", d, "Target lesson accuracy (%)", 80, (v) => cl(70 + cl(rr(v, "mastery.avg_accuracy_30d", 80), 50, 100) * 0.1, 70, 90))
    add("difficulty.target_success_rate", d, "Target success rate 0-1", 0.8)
    add("difficulty.adaptive_on", d, "Adaptive difficulty on", 1)
    add("difficulty.floor", d, "Difficulty floor", 1)
    add("difficulty.ceiling", d, "Difficulty ceiling", 3)
    add("difficulty.step_up_after", d, "Consecutive successes before step-up", 3)
    add("difficulty.step_down_after", d, "Consecutive failures before step-down", 2)
    add("difficulty.challenge_types_on", d, "All challenge types enabled", 1)
    add("difficulty.timed_at_level", d, "Timed challenges from difficulty", 3)
    add("difficulty.timed_seconds", d, "Timed challenge seconds", 20)
    add("difficulty.timed_seconds_hard", d, "Timed seconds (hard)", 15)
    add("difficulty.type_mix_info", d, "INFO share", 0.15)
    add("difficulty.type_mix_select", d, "SELECT share", 0.25)
    add("difficulty.type_mix_assist", d, "ASSIST share", 0.2)
    add("difficulty.type_mix_match", d, "MATCH share", 0.2)
    add("difficulty.type_mix_arrange", d, "ARRANGE share", 0.1)
    add("difficulty.type_mix_type", d, "TYPE share", 0.1)
    add("difficulty.mixed_session_types", d, "Mix types within a lesson", 1)
    add("difficulty.flow_guard", d, "Flow guard: cap difficulty jump", 1)
    add("difficulty.struggle_slowdown", d, "Slow pacing on struggle", 1)
    add("difficulty.repetition_on_mistake", d, "Re-insert missed challenges", 1)
    add("difficulty.repetition_delay", d, "Challenges before re-insertion", 2)
    add("difficulty.hint_cost", d, "Gem cost of a hint", 50)
    add("difficulty.hint_availability", d, "Hints available", 1)
    add("difficulty.scaffolding_on", d, "Assist scaffolding on", 1)
    add("difficulty.keyboard_tolerance", d, "TYPE answer tolerance", 0.8)
    add("difficulty.practice_weight", d, "Practice weight in review mix", 0.5)
    add("difficulty.review_interval_1", d, "Review interval step 1 (days)", 1)
    add("difficulty.review_interval_2", d, "Review interval step 2 (days)", 3)
    add("difficulty.review_interval_3", d, "Review interval step 3 (days)", 7)
    add("difficulty.review_interval_max", d, "Review interval cap (days)", 30)
    add("difficulty.review_bucket_size", d, "Review queue bucket size", 10)
    add("difficulty.plateau_days", d, "Days of flat progress before novelty", 7)
    add("difficulty.novelty_injection", d, "Inject novel challenge types on plateau", 1)
    add("difficulty.accuracy_band_low", d, "Accuracy band lower trigger", 60)
    add("difficulty.accuracy_band_high", d, "Accuracy band upper trigger", 95)
    add("difficulty.rage_detection_ms", d, "Fast-fail detection (ms)", 3000)
  }

  // ═══ quests (42) ═══
  {
    const d = "quests"
    add("quests.per_day", d, "Daily quests", 3)
    add("quests.review_quest_threshold", d, "Review items before review quest", 8, (v) => cl(Math.round(4 + cl01(rr(v, "mastery.review_pressure", 0)) * 12), 4, 20))
    add("quests.easy_day_mix", d, "Easy-day quest share 0-1", 0.8, (v, s) => (s.burnoutRisk > 0.5 ? 1 : 0.6))
    add("quests.metric_mix_weight_lesson", d, "Lesson-quest weight", 1, (v) => cl(1 + cl01(rr(v, "mastery.review_pressure", 0)) * 0.3, 0.8, 2))
    add("quests.metric_mix_weight_xp", d, "XP-quest weight", 1)
    add("quests.metric_mix_weight_combo", d, "Combo-quest weight", 0.6)
    add("quests.metric_mix_weight_perfect", d, "Perfect-quest weight", 0.8, (v) => cl(0.6 + cl01(rr(v, "mastery.perfect_ratio", 0)) * 0.6, 0.6, 1.4))
    add("quests.metric_mix_weight_correct", d, "Correct-quest weight", 0.9)
    add("quests.metric_mix_weight_chapters", d, "Reading-quest weight", 0.9, (v) => cl(0.7 + cl01(rr(v, "faith.devotion_share", 0)) * 0.8, 0.7, 1.6))
    add("quests.metric_mix_weight_plan_days", d, "Plan-quest weight", 0.8)
    add("quests.metric_mix_weight_daily_quiz", d, "Quiz-quest weight", 1)
    add("quests.gems_reward_min", d, "Quest gem reward min", 10)
    add("quests.gems_reward_max", d, "Quest gem reward max", 25)
    add("quests.auto_claim", d, "Auto-claim rewards", 1)
    add("quests.claim_window_h", d, "Claim window (hours)", 24)
    add("quests.refresh_hour", d, "Daily refresh hour (local)", 0)
    add("quests.weekly_quest_count", d, "Weekly quests", 0)
    add("quests.monthly_quest_count", d, "Monthly quests", 0)
    add("quests.streak_of_quests_on", d, "Quest completion streak tracking", 1)
    add("quests.mix_bandit_on", d, "Bandit selects quest mix", 1)
    add("quests.social_quest_on", d, "Social quests enabled", 1)
    add("quests.social_quest_weight", d, "Social quest weight", 0.5, (v) => (rr(v, "social.friends", 0) === 0 ? 1 : 0.3))
    add("quests.reading_quest_on", d, "Reading quests enabled", 1)
    add("quests.difficulty_scale_on", d, "Quest targets scale with habit", 1)
    add("quests.target_scale_sparking", d, "Target scale at sparking stage", 0.6)
    add("quests.target_scale_starting", d, "Target scale at starting stage", 0.8)
    add("quests.target_scale_establishing", d, "Target scale at establishing", 1)
    add("quests.target_scale_automatic", d, "Target scale at automatic", 1.1)
    add("quests.target_scale_identity", d, "Target scale at identity", 1.25)
    add("quests.hard_mode_on", d, "Hard mode quests", 1)
    add("quests.hard_mode_scale", d, "Hard mode target scale", 1.5)
    add("quests.completion_celebrate_ms", d, "Quest complete celebration (ms)", 700)
    add("quests.completion_toast", d, "Quest complete toast", 1)
    add("quests.boredom_rotation", d, "Rotate quest families when stale", 1)
    add("quests.boredom_after_days", d, "Days before rotation", 5)
    add("quests.carryover_on", d, "Allow quest carryover (design: off)", 0)
    add("quests.pity_quest_on", d, "Pity quest after hard day", 1)
    add("quests.progress_display", d, "Show quest progress bars", 1)
    add("quests.nudge_hour", d, "Quest reminder hour", 18)
    add("quests.milestone_quest_xp", d, "XP for quest milestones", 25)
    add("quests.refresh_countdown", d, "Show refresh countdown", 1)
    add("quests.mix_label", d, "Current quest-mix label", "balanced")
  }

  // ═══ leagues (22) ═══
  {
    const d = "leagues"
    add("leagues.size", d, "League size", 15)
    add("leagues.promotion_slots", d, "Promotion slots", 5)
    add("leagues.demotion_slots", d, "Demotion slots", 5)
    add("leagues.min_weeks", d, "Min weeks before demotion", 1)
    add("leagues.bot_target_base", d, "Bot weekly target base XP", 60)
    add("leagues.bot_target_slope", d, "Bot target slope per tier", 55)
    add("leagues.bot_ramp_shape", d, "Bot ramp shape (1=linear)", 1.12)
    add("leagues.promotion_celebrate", d, "Celebrate promotion", 1)
    add("leagues.demotion_soften", d, "Soften demotion copy", 1)
    add("leagues.fair_play_guard", d, "Bot pacing fairness guard", 1)
    add("leagues.weekend_race_nudge", d, "Weekend race nudge on", 1)
    add("leagues.race_nudge_hour", d, "Race nudge hour (Sat/Sun)", 17)
    add("leagues.zone_view", d, "Show promotion/demotion zones", 1)
    add("leagues.leave_penalty", d, "Leaving league penalty (design: off)", 0)
    add("leagues.promotion_streak_xp", d, "XP bonus for promotion", 50)
    add("leagues.checkin_streak", d, "League check-in streak tracking", 1)
    add("leagues.top3_share", d, "Share card for top-3 finish", 1)
    add("leagues.season_length_w", d, "Season length (weeks)", 12)
    add("leagues.season_reset_xp", d, "Season-reset XP handling", 0)
    add("leagues.private_leagues", d, "Private leagues (design: off)", 0)
    add("leagues.friendly_wagers", d, "Friendly wagers (integrity: off)", 0)
    add("leagues.display_live_rank", d, "Show live rank vs bots", 1)
  }

  // ═══ social (20) ═══
  {
    const d = "social"
    add("social.friend_cap", d, "Friend cap", 30)
    add("social.suggest_threshold_lessons", d, "Lessons before friend suggestions", 5)
    add("social.suggest_threshold_days", d, "Days before friend suggestions", 2)
    add("social.nudge_after_days", d, "Solo days before social nudge", 7)
    add("social.koinonia_quest_on", d, "Community quest on", 1)
    add("social.share_card_on", d, "Share cards on", 1)
    add("social.share_verse_card", d, "Verse share cards", 1)
    add("social.share_streak_card", d, "Streak share cards", 1)
    add("social.share_milestone_card", d, "Milestone share cards", 1)
    add("social.referral_reward_gems", d, "Referral reward (gems)", 100)
    add("social.referral_reward_month", d, "Referral Pro month for both", 1)
    add("social.invite_copy_tone", d, "Invite copy tone", "identity")
    add("social.leaderboard_friends_tab", d, "Friends leaderboard tab", 1)
    add("social.follow_suggestions_on", d, "Friend suggestions on", 1)
    add("social.comment_on", d, "Comments enabled", 1)
    add("social.comment_length_max", d, "Comment length cap", 280)
    add("social.post_length_max", d, "Post length cap", 500)
    add("social.verse_attachment_on", d, "Verse attachments in posts", 1)
    add("social.moderation_filter", d, "Moderation filter on", 1)
    add("social.dupe_post_guard", d, "Duplicate-post guard", 1)
  }

  // ═══ notif (34) ═══
  {
    const d = "notif"
    add("notif.daily_cap", d, "Max notifications per day", 5)
    add("notif.weekly_cap", d, "Max notifications per week", 25)
    add("notif.quiet_start", d, "Quiet hours start", 21)
    add("notif.quiet_end", d, "Quiet hours end", 8)
    add("notif.quiet_bypass_streak", d, "Streak-risk bypasses quiet hours", 1)
    add("notif.cooldown_same_kind_h", d, "Cooldown between same-kind (hours)", 20)
    add("notif.reminder_default_h", d, "Default reminder hour", 19, (v) => { const h = Math.round(rr(v, "timing.best_hour", 19)); return cl(h >= 5 && h <= 21 ? h : 19, 5, 21) })
    add("notif.reminder_align_on", d, "Align reminder to best hour", 1)
    add("notif.streak_risk_on", d, "Streak-risk notifications on", 1)
    add("notif.streak_risk_min_days", d, "Min streak for risk notification", 2)
    add("notif.quest_done_on", d, "Quest completion notifications", 1)
    add("notif.achievement_on", d, "Achievement notifications", 1)
    add("notif.league_on", d, "League notifications", 1)
    add("notif.digest_on", d, "Weekly digest notification", 1)
    add("notif.digest_day", d, "Digest day (bandit)", "monday")
    add("notif.digest_hour", d, "Digest hour", 8)
    add("notif.tone_reengage", d, "Re-engage copy tone (bandit)", "growth")
    add("notif.tone_goal", d, "Goal copy tone", "growth")
    add("notif.tone_streak", d, "Streak copy tone", "stewardship")
    add("notif.tone_celebrate", d, "Celebrate copy tone", "identity")
    add("notif.fatigue_backoff", d, "Fatigue backoff factor 0-1", 0.3, (v) => cl(1 - cl01(rr(v, "notif.open_rate", 1)), 0.1, 0.6))
    add("notif.fatigue_min_rate", d, "Open rate below which we back off", 0.2)
    add("notif.golden_hour_on", d, "Golden-hour delivery on", 1)
    add("notif.golden_hour_window", d, "Golden hour window ±hours", 1)
    add("notif.winback_on", d, "Win-back notifications on", 1)
    add("notif.winback_delay_h", d, "Win-back delay (hours)", 168)
    add("notif.batching_on", d, "Batch minor notifications", 1)
    add("notif.batch_window_min", d, "Batch window (minutes)", 10)
    add("notif.unread_badge_on", d, "Unread badge on", 1)
    add("notif.master_toggle", d, "Master notification toggle", 1)
    add("notif.pro_offer_notif", d, "Pro offer as notification (design: off)", 0)
    add("notif.sound_on", d, "Notification sound default", 1)
    add("notif.haptics_on", d, "Notification haptics default", 1)
  }

  // ═══ email (30) ═══
  {
    const d = "email"
    add("email.opt_in_default", d, "Email opt-in default", 1)
    add("email.welcome_steps", d, "Welcome series steps", 3)
    add("email.welcome_delay_h", d, "Welcome step spacing (hours)", 24)
    add("email.streak_saver_on", d, "Streak-saver email on", 1)
    add("email.reengagement_on", d, "Re-engagement email on", 1)
    add("email.reengagement_trigger_d", d, "Re-engagement trigger (days idle)", 3, (v) => cl(2 + Math.round(cl01(rr(v, "churn_placeholder", 0.5)) * 4), 2, 7))
    add("email.reengagement_escalation_d", d, "Escalation email (days idle)", 7)
    add("email.digest_on", d, "Weekly digest on", 1)
    add("email.digest_day", d, "Digest day (bandit)", "monday")
    add("email.digest_hour", d, "Digest hour", 8)
    add("email.milestone_on", d, "Milestone email on", 1)
    add("email.milestone_set", d, "Milestone email set size", 4)
    add("email.pro_offer_on", d, "Pro offer email on", 1)
    add("email.pro_offer_max", d, "Pro offer emails per month", 1)
    add("email.winback_on", d, "Win-back email on", 1)
    add("email.winback_delay_d", d, "Win-back delay (days)", 3)
    add("email.winback_depth", d, "Win-back discount depth (bandit)", 50)
    add("email.pro_welcome_on", d, "Pro welcome email on", 1)
    add("email.quiet_hours_respect", d, "Respect quiet hours for email", 1)
    add("email.daily_cap", d, "Emails per day cap", 1)
    add("email.weekly_cap", d, "Emails per week cap", 3)
    add("email.unsubscribe_one_tap", d, "One-tap unsubscribe", 1)
    add("email.frequency_ladder", d, "Frequency ladder on", 1)
    add("email.tone", d, "Email copy tone", "stewardship")
    add("email.verse_of_day_on", d, "Verse-of-day email (design: off)", 0)
    add("email.r6_checkin_on", d, "R6 check-in email on", 1)
    add("email.r6_delay_d", d, "R6 check-in delay (days)", 6)
    add("email.d30_story_on", d, "Day-30 story email on", 1)
    add("email.track_opens", d, "Track opens locally", 1)
    add("email.fallback_channel", d, "Fallback channel", "push")
  }

  // ═══ paywall (47) ═══
  {
    const d = "paywall"
    add("paywall.hook_selected", d, "Paywall hook (bandit)", "general")
    add("paywall.anchor_source", d, "Anchor framing (bandit)", "seminary")
    add("paywall.headline_variant", d, "Headline variant (bandit)", "A")
    add("paywall.cta_variant", d, "CTA variant (bandit)", "A")
    add("paywall.highlight_plan", d, "Highlighted plan", "annual", (v, s) => (s.priceSensitivity > 0.6 ? "monthly" : "annual"))
    add("paywall.weekly_cap", d, "Paywall invites per week", 2)
    add("paywall.daily_cap", d, "Paywall invites per day", 1)
    add("paywall.cooldown_days", d, "Cooldown after dismiss (days)", 5, (v, s) => cl(3 + Math.round(s.priceSensitivity * 7), 3, 12))
    add("paywall.trigger_lesson_end", d, "Lesson-end trigger count", 12, (v, s) => cl(Math.round(s.wtp > 0.6 ? 8 : 14), 6, 20))
    add("paywall.min_engagement", d, "Min engagement to invite", 0.2)
    add("paywall.wtp_threshold", d, "WTP fast-path threshold", 0.55)
    add("paywall.urgency_hours", d, "Honest urgency window (hours)", 72, (v, s) => (s.priceSensitivity > 0.6 ? 48 : 72))
    add("paywall.winback_discount", d, "Win-back discount % (bandit)", 50)
    add("paywall.winback_snooze_days", d, "Win-back snooze (days)", 7)
    add("paywall.winback_max_per_month", d, "Win-back offers per month", 1)
    add("paywall.trial_days", d, "Trial length (days)", 0)
    add("paywall.guarantee_days", d, "Grow-or-free guarantee (days)", 30)
    add("paywall.show_guarantee", d, "Show guarantee badge", 1)
    add("paywall.price_monthly", d, "Monthly price", 12.99)
    add("paywall.price_annual", d, "Annual price", 59.99)
    add("paywall.price_lifetime", d, "Lifetime price", 149)
    add("paywall.price_anchor_lifetime", d, "Lifetime anchor display", 299)
    add("paywall.annual_savings_pct", d, "Annual savings display %", 62)
    add("paywall.personalization_spread", d, "Max personalization spread ±%", 15)
    add("paywall.price_fairness_on", d, "Price-fairness guard on", 1)
    add("paywall.suppress_for_pro", d, "Suppress for Pro members", 1)
    add("paywall.suppress_if_opted_out", d, "Suppress if personalized offers off", 1)
    add("paywall.dwell_tracking", d, "Track paywall dwell time", 1)
    add("paywall.downsell_on", d, "Downsell on dismiss", 1)
    add("paywall.downsell_discount", d, "Downsell discount %", 50)
    add("paywall.downsell_max", d, "Downsells per month", 2)
    add("paywall.snooze_label", d, "Snooze option label", "Remind me in 7 days")
    add("paywall.faq_on", d, "Show FAQ accordion", 1)
    add("paywall.social_proof_on", d, "Honest social proof (real counts only)", 1)
    add("paywall.social_proof_count", d, "Founding member count (honest)", 113)
    add("paywall.founding_framing", d, "Founding-cohort framing (honest)", 1)
    add("paywall.refund_one_tap", d, "One-tap refund policy", 1)
    add("paywall.no_dark_patterns", d, "Dark-pattern ban (hard rule)", 1)
    add("paywall.price_display_annual_per_mo", d, "Show annual per-month price", 1)
    add("paywall.cta_copy_variant", d, "CTA copy variant", "A")
    add("paywall.compare_table_on", d, "Plan comparison table", 1)
    add("paywall.bonus_list_on", d, "Show bonuses", 1)
    add("paywall.bonus_count", d, "Number of bonuses", 2)
    add("paywall.exit_intent_on", d, "Exit-intent trigger (local app: on close)", 1)
    add("paywall.exit_intent_delay_ms", d, "Exit-intent dwell requirement (ms)", 8000)
    add("paywall.hearts_hook_threshold", d, "Hearts hook at N hearts lost", 3)
    add("paywall.lesson_end_hook_freq", d, "Lesson-end hook frequency (1/N)", 6)
    add("paywall.show_on_onboarding", d, "Paywall in onboarding", 1)
  }

  // ═══ session (18) ═══
  {
    const d = "session"
    add("session.target_minutes", d, "Target session minutes", 7, (v, s) => (s.habitStage === "sparking" ? 3 : s.habitStage === "starting" ? 5 : s.habitStage === "establishing" ? 7 : 10))
    add("session.max_minutes", d, "Session soft cap (minutes)", 25)
    add("session.break_after", d, "Break nudge after N sessions", 3)
    add("session.end_hook_variant", d, "Session-end hook variant (bandit)", "A")
    add("session.end_hook_on", d, "Session-end hook on", 1)
    add("session.open_nudge_on", d, "Open nudge (NBA) on", 1)
    add("session.open_nba_cap", d, "In-app NBAs per day", 2)
    add("session.nba_fatigue_days", d, "NBA cooldown (days)", 2)
    add("session.quick_mode_on", d, "Quick mode available", 1)
    add("session.quick_lessons", d, "Quick mode lesson count", 1)
    add("session.resume_banner_on", d, "Resume banner on", 1)
    add("session.idle_timeout_min", d, "Idle timeout (minutes)", 15)
    add("session.welcome_back_on", d, "Welcome-back banner for returnees", 1)
    add("session.continue_button_label", d, "Continue label", "Continue")
    add("session.streak_first_display", d, "Streak display first in HUD", 1)
    add("session.animation_speed", d, "Animation speed multiplier", 1)
    add("session.confetti_on_complete", d, "Confetti on lesson complete", 1)
    add("session.haptics_on", d, "Haptics default", 1)
  }

  // ═══ onboarding (16) ═══
  {
    const d = "onboarding"
    add("onboarding.steps", d, "Onboarding steps", 4)
    add("onboarding.course_pick_first", d, "Course picker first", 1)
    add("onboarding.goal_question_on", d, "Ask daily goal", 1)
    add("onboarding.reminder_question_on", d, "Ask reminder time", 1)
    add("onboarding.default_goal", d, "Default suggested goal", 30)
    add("onboarding.goal_options", d, "Goal options count", 3)
    add("onboarding.avatar_step_on", d, "Avatar step on", 1)
    add("onboarding.translations_step_on", d, "Translation picker step", 1)
    add("onboarding.first_lesson_hint", d, "First-lesson guided hint", 1)
    add("onboarding.first_lesson_highlight", d, "Highlight first lesson", 1)
    add("onboarding.placement_offer", d, "Offer placement test", 1)
    add("onboarding.placement_min_lessons", d, "Lessons before placement offer", 5)
    add("onboarding.welcome_chest_on", d, "Welcome chest on", 1)
    add("onboarding.welcome_notification", d, "Welcome notification on", 1)
    add("onboarding.paywall_step", d, "Paywall in onboarding", 1)
    add("onboarding.skip_allowed", d, "Onboarding skippable", 1)
  }

  // ═══ content (51) ═══
  {
    const d = "content"
    add("content.verse_of_day_on", d, "Verse of the day on", 1)
    add("content.verse_of_day_hour", d, "Verse-of-day refresh hour", 0)
    add("content.verse_translation_default", d, "Default translation", "KJV")
    add("content.verse_translation_follow", d, "Verse follows chosen translation", 1)
    add("content.red_letter_on", d, "Words of God/Christ in red", 1)
    add("content.red_letter_toggle_visible", d, "Red-letter toggle visible", 1)
    add("content.red_letter_color", d, "Red-letter color (palette idx)", 0)
    add("content.daily_quiz_on", d, "Daily quiz on", 1)
    add("content.daily_quiz_questions", d, "Daily quiz question count", 5)
    add("content.daily_quiz_xp", d, "Daily quiz XP", 15)
    add("content.daily_quiz_category_mix", d, "Quiz category mix (uniform)", 1)
    add("content.daily_quiz_hard_boost", d, "Hard question XP boost", 1)
    add("content.stories_on", d, "Story mode on", 1)
    add("content.story_endings_on", d, "Story epilogues on", 1)
    add("content.story_checkpoint_on", d, "Story checkpoints on", 1)
    add("content.story_difficulty_scale", d, "Story difficulty scale", 1)
    add("content.audio_lessons_on", d, "Audio lessons available", 1)
    add("content.audio_autoplay_default", d, "Audio autoplay default", 0)
    add("content.letter_keyboard_on", d, "Greek/Hebrew keyboard on", 1)
    add("content.letter_hints_on", d, "Letter hints on", 1)
    add("content.tips_inApp_on", d, "In-app growth tips on", 1)
    add("content.tips_outsideApp_on", d, "Outside-app growth tips on", 1)
    add("content.tips_routine_on", d, "Routine growth tips on", 1)
    add("content.plans_on", d, "Reading plans on", 1)
    add("content.plan_parallel_on", d, "Parallel plans allowed", 1)
    add("content.plan_max_parallel", d, "Max parallel plans", 3)
    add("content.plan_focus_single", d, "Focus single plan (suggest)", 1)
    add("content.course_suggest_on", d, "Course suggestions on", 1)
    add("content.course_suggest_after_completion", d, "Suggest course after completion", 1)
    add("content.course_suggest_after_plateau", d, "Suggest course on plateau", 1)
    add("content.next_unit_unlock_on", d, "Next unit unlocks on completion", 1)
    add("content.unit_summary_on", d, "Unit summary on completion", 1)
    add("content.review_hub_on", d, "Review hub on", 1)
    add("content.review_due_badge_on", d, "Review-due badge on", 1)
    add("content.review_due_threshold", d, "Badge threshold", 10)
    add("content.practice_hub_on", d, "Practice hub on", 1)
    add("content.spaced_repetition_on", d, "Spaced repetition on", 1)
    add("content.srs_interval_scale", d, "SRS interval scale", 1)
    add("content.mastery_map_on", d, "Mastery map on", 1)
    add("content.achievements_on", d, "Achievements on", 1)
    add("content.achievements_tiers_max", d, "Achievement tier cap", 5)
    add("content.achievement_share_on", d, "Achievement share cards", 1)
    add("content.chest_on_unit_complete", d, "Chest on unit completion", 1)
    add("content.devotional_mode_on", d, "Devotional reading mode", 1)
    add("content.reading_stats_on", d, "Reading stats on", 1)
    add("content.verse_marks_on", d, "Verse marks (5 colors)", 1)
    add("content.verse_notes_on", d, "Verse notes on", 1)
    add("content.chapter_summary_on", d, "Chapter summaries on", 1)
    add("content.book_genre_filters_on", d, "Book genre filters on", 1)
    add("content.search_in_reader_on", d, "Reader search on", 1)
    add("content.reader_font_scale", d, "Reader font scale", 1)
  }

  // ═══ learn (24) ═══
  {
    const d = "learn"
    add("learn.path_style", d, "Path visual style", "winding")
    add("learn.path_jump_ahead_on", d, "Jump-ahead allowed", 1)
    add("learn.path_locked_info_on", d, "Show locked lesson info", 1)
    add("learn.crown_test_on", d, "Level-test out of lessons", 0)
    add("learn.practice_from_path_on", d, "Practice button on path", 1)
    add("learn.theory_popovers_on", d, "Theory popovers on", 1)
    add("learn.tooltip_translit_on", d, "Transliteration tooltips on", 1)
    add("learn.feedback_instant_on", d, "Instant answer feedback", 1)
    add("learn.feedback_explain_on", d, "Explanations after answers", 1)
    add("learn.combo_display_on", d, "Combo counter display", 1)
    add("learn.mistake_retry_in_lesson", d, "Retry mistakes within lesson", 1)
    add("learn.lesson_end_stats_on", d, "End-of-lesson stats", 1)
    add("learn.perfect_callout_on", d, "Perfect lesson callout", 1)
    add("learn.speak_exercise_on", d, "Speak exercises on", 1)
    add("learn.type_exercise_on", d, "Type exercises on", 1)
    add("learn.arrange_exercise_on", d, "Arrange exercises on", 1)
    add("learn.match_exercise_on", d, "Match exercises on", 1)
    add("learn.assist_exercise_on", d, "Assist exercises on", 1)
    add("learn.hearts_in_lesson", d, "Hearts during lessons", 1)
    add("learn.skip_cost", d, "Skip cost (gems)", 100)
    add("learn.undo_last_answer", d, "Undo last answer (design: off)", 0)
    add("learn.keyboard_delay_ms", d, "Keyboard open delay", 150)
    add("learn.progress_ring_on", d, "Lesson progress ring", 1)
    add("learn.exit_confirm_on", d, "Exit confirmation", 1)
  }

  // ═══ experiment (18) ═══
  {
    const d = "experiment"
    add("experiment.bandit_on", d, "Thompson sampling on", 1)
    add("experiment.epsilon", d, "Exploration ε", 0.08)
    add("experiment.stale_days", d, "Posterior decay (days)", 90)
    add("experiment.decay_factor", d, "Decay factor", 0.7)
    add("experiment.min_sample_adopt", d, "Min samples to adopt model", 30)
    add("experiment.holdout_frac", d, "Holdout fraction", 0.3)
    add("experiment.train_lookback_days", d, "Training lookback (days)", 45)
    add("experiment.train_label_days", d, "Churn label window (days)", 7)
    add("experiment.sgd_lr", d, "SGD learning rate", 0.05)
    add("experiment.sgd_epochs", d, "SGD epochs", 40)
    add("experiment.sgd_l2", d, "L2 penalty", 0.001)
    add("experiment.weight_clip", d, "Weight clip ±", 8)
    add("experiment.sign_guard_on", d, "Sign guard on (hard rule)", 1)
    add("experiment.auc_guard_on", d, "Holdout-AUC adoption guard", 1)
    add("experiment.drift_check_days", d, "Drift check cadence (days)", 7)
    add("experiment.report_on", d, "Registry report on", 1)
    add("experiment.exposure_logging", d, "Exposure logging on", 1)
    add("experiment.auto_disable_on_complaint", d, "Auto-disable on complaint rate", 1)
  }

  // ═══ tone (26) ═══
  {
    const d = "tone"
    add("tone.default", d, "Default copy tone", "growth")
    add("tone.reengage", d, "Re-engage tone", "growth", (v, s) => (s.segments.includes("burnout_watch") ? "stewardship" : s.habitStage === "identity" ? "identity" : "growth"))
    add("tone.streak", d, "Streak tone", "stewardship")
    add("tone.celebrate", d, "Celebrate tone", "identity")
    add("tone.review", d, "Review tone", "growth")
    add("tone.social", d, "Social tone", "identity")
    add("tone.paywall", d, "Paywall tone", "stewardship")
    add("tone.winback", d, "Win-back tone", "stewardship")
    add("tone.rest", d, "Rest tone", "stewardship")
    add("tone.goal", d, "Goal tone", "growth")
    add("tone.milestone", d, "Milestone tone", "identity")
    add("tone.quiz", d, "Quiz tone", "growth")
    add("tone.daily_digest", d, "Digest tone", "identity")
    add("tone.scripture_framing", d, "Scripture framing allowed", 1)
    add("tone.scripture_max_per_copy", d, "Max scripture quotes per message", 1)
    add("tone.guilt_ban", d, "Guilt framing ban (hard rule)", 1)
    add("tone.fear_ban", d, "Fear framing ban (hard rule)", 1)
    add("tone.false_scarcity_ban", d, "False scarcity ban (hard rule)", 1)
    add("tone.honest_urgency_only", d, "Only honest urgency allowed", 1)
    add("tone.grace_first", d, "Grace-first tone rule", 1)
    add("tone.encourage_effort_not_outcome", d, "Praise effort over outcome", 1)
    add("tone.rest_positive", d, "Rest framed positively", 1)
    add("tone.milestone_humility", d, "Milestones framed with humility", 1)
    add("tone.comparison_ban", d, "Peer-comparison framing ban", 1)
    add("tone.user_name_max_per_msg", d, "Max name usage per message", 1)
    add("tone.emoji_max_per_msg", d, "Max emoji per message", 2)
  }

  // ═══ surface (19) ═══
  {
    const d = "surface"
    add("surface.tabbar_order", d, "Tab bar order", "learn,bible,growth,community")
    add("surface.tabbar_count", d, "Tab bar visible tabs", 5)
    add("surface.sidebar_default_open", d, "Sidebar default open (desktop)", 1)
    add("surface.dark_mode", d, "Dark mode available", 0)
    add("surface.parchment_theme", d, "Parchment theme on", 1)
    add("surface.hud_compact_mobile", d, "Compact HUD on mobile", 1)
    add("surface.bottom_sheet_mobile", d, "Bottom sheets on mobile", 1)
    add("surface.swipe_nav_on", d, "Swipe navigation on", 1)
    add("surface.pull_to_refresh_on", d, "Pull-to-refresh on", 0)
    add("surface.offline_banner_on", d, "Offline banner on", 1)
    add("surface.skeleton_loading_on", d, "Skeleton loaders on", 1)
    add("surface.mascot_on", d, "Mascot on", 1)
    add("surface.mascot_frequency", d, "Mascot appearance frequency", 0.4)
    add("surface.confetti_intensity", d, "Confetti intensity", 70)
    add("surface.sound_effects_on", d, "Sound effects default", 1)
    add("surface.animation_reduced", d, "Reduced-motion respect", 1)
    add("surface.font_scale_range", d, "Font scale range", 1.25)
    add("surface.desktop_layout_min_w", d, "Desktop layout min width", 768)
    add("surface.desktop_native_packaging", d, "Tauri desktop packaging on", 1)
  }

  // ═══ wellbeing (28) ═══
  {
    const d = "wellbeing"
    add("wellbeing.protect_on", d, "Wellbeing protection layer on", 1)
    add("wellbeing.burnout_threshold", d, "Burnout-risk threshold", 0.55)
    add("wellbeing.burnout_nudge_cooldown_d", d, "Burnout nudge cooldown (days)", 3)
    add("wellbeing.max_daily_lessons", d, "Soft daily lesson cap", 12)
    add("wellbeing.max_daily_lessons_hard", d, "Hard daily lesson cap", 0)
    add("wellbeing.session_break_nudge", d, "Session break nudge on", 1)
    add("wellbeing.session_break_after_min", d, "Break after minutes", 40)
    add("wellbeing.late_night_nudge", d, "Late-night wind-down nudge", 1)
    add("wellbeing.late_night_hour", d, "Late-night hour", 23)
    add("wellbeing.sabbath_respect", d, "Sabbath-friendly pacing copy", 1)
    add("wellbeing.sunday_grace_copy", d, "Sunday grace mention", 1)
    add("wellbeing.streak_anxiety_guard", d, "Streak-anxiety guard on", 1)
    add("wellbeing.freeze_auto_suggest", d, "Auto-suggest freeze at risk", 1)
    add("wellbeing.goal_overshoot_guard", d, "Goal overshoot guard", 1)
    add("wellbeing.pace_nudge_on", d, "Pace nudge on", 1)
    add("wellbeing.rest_day_suggest_after_d", d, "Suggest rest after N days", 12)
    add("wellbeing.burnout_priority_over_revenue", d, "Rest outranks extraction (hard rule)", 1)
    add("wellbeing.complaint_autorevert", d, "Auto-revert on complaints", 1)
    add("wellbeing.overuse_detection_on", d, "Overuse detection on", 1)
    add("wellbeing.overuse_event_threshold", d, "Events per day flagged as overuse", 60)
    add("wellbeing.screen_time_disclosure", d, "Screen-time disclosure on", 1)
    add("wellbeing.mindful_copy_on", d, "Mindful completion copy", 1)
    add("wellbeing.night_mode_auto", d, "Auto night tint (reader)", 0)
    add("wellbeing.mediation_copy", d, "Meditation prompt in reader", 0)
    add("wellbeing.prayer_prompt_on", d, "Prayer prompt (Pro feature)", 1)
    add("wellbeing.emotional_check_in", d, "Emotional check-in cadence (days)", 14)
    add("wellbeing.joy_metric_tracking", d, "Track joy signals (design: on)", 1)
    add("wellbeing.family_mode", d, "Family/teen mode (design: off)", 0)
  }

  return out
}

export const GAME_VARS: GameVar[] = buildVars()

/**
 * The subset of vars that carry a personalization rule — the only ones the
 * config resolver needs to visit per snapshot (dozens, not all 544).
 * (type-narrowed so callers can invoke `rule` without a guard)
 */
export const RULED_VARS: (GameVar & { rule: NonNullable<GameVar["rule"]> })[] = GAME_VARS.filter(
  (v): v is GameVar & { rule: NonNullable<GameVar["rule"]> } => typeof v.rule === "function",
)

/** O(1) membership checks for governed variable ids */
export const GAME_VAR_IDS: ReadonlySet<string> = new Set(GAME_VARS.map((v) => v.id))

/** frozen defaults, built once — cloned per call so callers may mutate their copy */
const DEFAULT_CONFIG: Readonly<Record<string, number | string | boolean>> = Object.freeze(
  Object.fromEntries(GAME_VARS.map((v) => [v.id, v.def])),
)

export function defaultGameConfig(): Record<string, number | string | boolean> {
  return { ...DEFAULT_CONFIG }
}

export const GAME_VAR_COUNT = GAME_VARS.length
