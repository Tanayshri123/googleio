"""Skill abstract base class and shared input/output types.

A Skill encapsulates one agent: a grounded research call + a structured
output coercion call. Subclasses define:
  - name, display_name, description
  - grounding tool + thinking level
  - output_model (Pydantic schema)
  - build_research_prompt(input)         -> str
  - build_structuring_instructions(input) -> str
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Literal, Type

from pydantic import BaseModel

from backend.gemini_client import GroundingTool, generate_grounded_then_structured


@dataclass
class SkillInput:
    """Uniform input every skill accepts."""
    company_summary: str
    industry: str
    target_city: str
    target_coords: tuple[float, float] | None = None
    deep_search: bool = False  # reserved; not implemented in this scope
    extra_context: str | None = None


@dataclass
class SkillResult:
    """Wraps the parsed output with provenance for the UI."""
    skill_name: str
    output: BaseModel
    citations: list[dict[str, Any]] = field(default_factory=list)
    error: str | None = None


class Skill(ABC):
    """Abstract base class for all skills."""

    name: str
    display_name: str
    description: str
    grounding: GroundingTool
    default_thinking: Literal["low", "medium", "high"] = "medium"
    output_model: Type[BaseModel]

    @abstractmethod
    def build_research_prompt(self, inp: SkillInput) -> str:
        """Prompt for the grounded research pass."""
        ...

    @abstractmethod
    def build_structuring_instructions(self, inp: SkillInput) -> str:
        """Instructions for converting raw research text into the output schema."""
        ...

    async def run(self, inp: SkillInput) -> SkillResult:
        """Default two-step flow. Subclasses can override for special cases."""
        try:
            parsed, citations = await generate_grounded_then_structured(
                research_prompt=self.build_research_prompt(inp),
                structuring_instructions=self.build_structuring_instructions(inp),
                schema=self.output_model,
                grounding=self.grounding,
                thinking=self.default_thinking,
            )
            return SkillResult(skill_name=self.name, output=parsed, citations=citations)
        except Exception as e:
            # Return an empty instance of the output_model so the orchestrator
            # can still compose a partial BattlePlan even if one skill fails.
            empty = self.output_model.model_construct()
            return SkillResult(skill_name=self.name, output=empty, error=str(e))

    def describe(self) -> dict[str, Any]:
        """Used by GET /api/skills."""
        return {
            "name": self.name,
            "display_name": self.display_name,
            "description": self.description,
            "grounding": self.grounding,
            "default_thinking": self.default_thinking,
            "output_schema": self.output_model.model_json_schema(),
        }
