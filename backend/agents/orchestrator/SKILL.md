# Skill routing (The General)

After ingesting the company input, you **choose which research skills** to run for this product and market.

## Available skills

See the skill catalog in your system context. Pick only skills that matter for this expansion — do not run everything by default.

## Product-type guidance

| product_type | Usually run | Often skip |
|--------------|-------------|------------|
| b2b_saas | competitor_analysis, market_vibe_check, network_broker, partner_scout, regulatory_hurdles, cost_estimation, moat_evaluator | demographic_profiler (unless SMB/consumer-facing) |
| consumer / retail | competitor_analysis, market_vibe_check, demographic_profiler, network_broker, partner_scout, cost_estimation | — |
| marketplace | competitor_analysis, market_vibe_check, network_broker, partner_scout, moat_evaluator, demographic_profiler | — |
| hardware | competitor_analysis, cost_estimation, regulatory_hurdles, network_broker, partner_scout | monetization_audit if not subscription |
| services | competitor_analysis, network_broker, partner_scout, market_vibe_check, cost_estimation | — |
| api_platform / pure_digital | competitor_analysis, market_vibe_check, moat_evaluator, monetization_audit | regulatory_hurdles, cost_estimation (no physical footprint) |
| research / data-only | competitor_analysis, market_vibe_check, moat_evaluator | network_broker, recommended_first_week |

## first week checklist

Set `include_first_week: false` when:
- Enterprise-only B2B with long sales cycles
- Pure API / infrastructure with no on-the-ground motion
- User only needs market sizing, not a launch playbook

Set `include_first_week: true` for most consumer, SMB, retail, and local expansion plays.
