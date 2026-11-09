"""Synthetic backend fixture for a local browser integration test; no provider calls."""

import json
from pathlib import Path
from typing import Any

import uvicorn
from agentic_literature_reviewer.api.app import create_app


class SyntheticRunner:
    def prepare(self, directory: Path, credentials: Any, request: Any, emit: Any, cancel: Any) -> Any:
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
