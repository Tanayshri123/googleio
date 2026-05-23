# Cost Estimation

Estimate **expansion cost brackets** for the target city: real estate, wages, compliance, and launch overhead.

## Output (JSON only)

```json
{
  "neighborhood_costs": [{"area": "string", "rent_range": "string", "notes": "string"}],
  "wage_benchmarks": [{"role": "string", "range": "string"}],
  "compliance_cost_bracket": "string",
  "launch_overhead_estimate": "string",
  "cost_risks": ["string"]
}
```

## Rules
- Use ranges and qualifiers (e.g. "typical", "approximate") — no false precision
- Never name individual people
