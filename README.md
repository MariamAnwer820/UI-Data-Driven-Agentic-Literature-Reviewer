# Local coverage-aware review UI

This UI connects to the separate Python backend's local API. It is not yet a
public, multi-user deployment and does not implement user accounts. Provider
keys and the session token live in browser memory and are cleared on refresh.
Backend sessions expire after four hours; refreshing also loses the current review.

1. Start the backend from the backend repository root:

   ```powershell
   uv run uvicorn agentic_literature_reviewer.api.app:app --host 127.0.0.1 --port 8000 --no-access-log
   ```

2. In this repository's `static` directory, run `python -m http.server 5173
   --bind 127.0.0.1`, then open `http://127.0.0.1:5173`. Internet access is
   needed to load the pinned React scripts from the CDN.
3. Open Settings and enter a Gemini key. Add literature-provider keys if you
   have them and select your model and sources. Start a review from New review.
   For a CSV, select the task and provide the target column name.
4. Inspect the streamed progress and family-preparation details. Approve only
   after reviewing them. Pauses may require manual evidence inspection; retrying
   does not automatically resolve a coverage issue. A completed report includes
   limitations, references, and claim-level evidence links.

The backend owns paper limits and relevance screening. The UI does not fabricate
relevance percentages. It does not save provider keys or reports in browser
storage. Avoid closing or refreshing the page during a review. If the initial
review response is interrupted, reconnecting retries the same request ID within
the current session so the backend returns the existing review.

The UI uses `http://127.0.0.1:8000` and the backend allows only local browser
origins. A hosted UI on Vercel cannot use this local setup as a public service.
Public deployment requires a separately hosted backend, real authentication,
access controls, and a production session and job-storage design.

`tests/api-client.html` tests the API client in a browser with mocked responses.
`tests/ui-flow.mock.js` exercises the screens with synthetic responses when
loaded into a local copy of the page before the application scripts. The
`tests/local_backend_fixture.py` and `tests/real-http-flow.js` fixtures exercise
browser-to-API traffic with a synthetic runner. None of these tests calls a
provider.
