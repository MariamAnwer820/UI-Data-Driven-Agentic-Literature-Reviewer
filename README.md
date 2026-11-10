# Local UI and backend

This branch keeps the existing UI layout while connecting it to the separate
Python backend's local API. Start the backend from its repository root:

```powershell
uv run uvicorn agentic_literature_reviewer.api.app:app --host 127.0.0.1 --port 8000 --no-access-log
```

From this repository's `static` folder, run `python -m http.server 5173
--bind 127.0.0.1` and open `http://127.0.0.1:5173`. Internet access is needed
for the React CDN referenced by the original page. Select each provider in
Settings to enter its key. Keys remain in memory and are cleared by refresh.

The search setting controls the per-query retrieval limit and the cap on new
papers per search round; selected papers controls the target number analyzed
in depth. Both are subject to relevance screening and available sources.
CSV reviews need a target column and task. External source and sample dataset
controls are previews; use a real CSV file to run a dataset-aware review.

Progress and review decisions come from the API. History and saved paper
selections last for the current browser session and are not private accounts.
The original login screen is only a visual placeholder. A completed report is
subject to scientific review even when structural validation passes.

The API accepts local connections only. It is not ready for a public Vercel
frontend: public access requires real access controls, HTTPS, an appropriate
host for long-running jobs, and durable job/session storage and recovery.
Provider keys must not be put in Git, URLs, browser storage, or logs.

`tests/api-client.html`, `tests/local_backend_fixture.py`, and
`tests/real-http-flow.js` use synthetic data and mocked providers.
