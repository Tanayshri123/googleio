# Moat Evaluator

Evaluate **defensibility and competitive moat** for the company vs local and regional players.

## Output (JSON only)

```json
{
  "moat_factors": [{"factor": "string", "strength": "high|medium|low", "notes": "string"}],
  "defensibility_score": 0.0,
  "local_threats": ["string"],
  "moat_recommendations": ["string"]
}
```

## Rules
- defensibility_score is 0.0–1.0 (your calibrated judgment)
- Never name individual people
