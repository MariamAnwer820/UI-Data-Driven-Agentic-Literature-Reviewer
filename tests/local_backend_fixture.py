"""Synthetic backend fixture for a local browser integration test; no provider calls."""

import json
from pathlib import Path
from typing import Any

import uvicorn
from agentic_literature_reviewer.api.app import create_app
from agentic_literature_reviewer.llm.gemini import ReviewPaused


class SyntheticRunner:
    def __init__(self) -> None:
        self.attempts = 0

    def prepare(self, directory: Path, credentials: Any, request: Any, emit: Any, cancel: Any) -> Any:
        assert request.papers_per_search == 20 and request.selected_papers == 3
        assert credentials.gemini_api_key.get_secret_value() == "synthetic-key"
        assert credentials.openalex_api_key.get_secret_value() == "synthetic-openalex"
        assert credentials.semantic_scholar_api_key.get_secret_value() == "synthetic-semantic"
        assert request.target_column == "label" and request.task.value == "classification"
        assert request.dataset_id is not None
        assert (directory.parent / "datasets" / f"{request.dataset_id}.csv").read_bytes().startswith(b"feature,label")
        self.attempts += 1
        if self.attempts == 1:
            emit({"stage": "provider_retry", "status": "retrying", "attempt": 3, "max_attempts": 50})
            raise ReviewPaused("Provider returned HTTP 503")
        emit({"stage": "search", "status": "started"})
        return {"notice": "Inspect synthetic evidence", "unresolved_papers": []}

    def finish(self, directory: Path, credentials: Any, request: Any, emit: Any, cancel: Any) -> Any:
        report = {
            "validated_report": {
                "report_title": "Synthetic report",
                "executive_summary": "Synthetic summary",
                "evidence_scope": {"papers_received": 1, "review_level": "abstract", "limitations": ["Synthetic only"]},
                "method_families": [{"name": "Synthetic family", "description": "Description", "evidence": "Evidence", "supporting_papers": ["P001"]}],
                "family_comparison": "Comparison",
                "important_gaps": ["Synthetic gap"],
                "recommendation": {"status": "insufficient_evidence"},
                "references": [{"paper_id": "P001", "title": "Synthetic source", "year": 2024, "url_or_doi": "https://example.org"}],
                "claim_lineage": {"claims": [{"evidence_ids": ["E001"]}]},
            }
        }
        json_path, md_path = directory / "report.json", directory / "report.md"
        json_path.write_text(json.dumps(report), encoding="utf-8")
        md_path.write_text("# Synthetic report", encoding="utf-8")
        return json_path, md_path, True


if __name__ == "__main__":
    uvicorn.run(create_app(runner=SyntheticRunner()), host="127.0.0.1", port=18080, access_log=False)
