/* The local API is deliberately loopback-only. Tokens and keys stay in memory. */
const ReviewAPI = (() => {
  const base = 'http://127.0.0.1:8000';
  async function request(path, options = {}, token) {
    const headers = { ...options.headers };
    if (token) headers.Authorization = 'Bearer ' + token;
    let response;
    try { response = await fetch(base + path, { ...options, headers }); }
    catch (error) {
      if (error.name === 'AbortError') throw error;
      throw new Error('Cannot reach the local backend. Start the API on 127.0.0.1:8000.');
    }
    if (!response.ok) {
      let message = 'Backend request failed (' + response.status + ').';
      try { const body = await response.json(); if (typeof body.detail === 'string') message = body.detail; }
      catch (_) { /* Keep the generic message. */ }
      throw new Error(message);
    }
    return response;
  }
  async function json(path, method, body, token, signal) {
    const response = await request(path, { method, signal,
      ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }, token);
    return response.status === 204 ? null : response.json();
  }
  async function events(id, token, after, onEvent, signal) {
    const response = await request('/api/reviews/' + encodeURIComponent(id) + '/events?after=' + after,
      { signal }, token);
    if (!response.body) throw new Error('This browser does not support streamed responses.');
    const reader = response.body.getReader(), decoder = new TextDecoder();
    let buffer = '';
    const process = line => { if (line.trim()) onEvent(JSON.parse(line)); };
    for (;;) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
      const lines = buffer.split('\n'); buffer = lines.pop(); lines.forEach(process);
      if (done) break;
    }
    process(buffer);
  }
  return {
    session: (credentials, signal) => json('/api/sessions', 'POST', credentials, null, signal),
    upload: async (file, token, signal) => (await request('/api/datasets', {
      method: 'POST', headers: { 'Content-Type': 'text/csv' }, body: file, signal
    }, token)).json(),
    start: (body, token, signal) => json('/api/reviews', 'POST', body, token, signal),
    status: (id, token, signal) => json('/api/reviews/' + encodeURIComponent(id), 'GET', undefined, token, signal),
    action: (id, action, token, signal) => json('/api/reviews/' + encodeURIComponent(id) + '/' + action, 'POST', undefined, token, signal),
    report: (id, token, signal) => json('/api/reviews/' + encodeURIComponent(id) + '/report', 'GET', undefined, token, signal),
    markdown: async (id, token, signal) => (await request('/api/reviews/' + encodeURIComponent(id) + '/report?format=markdown', { signal }, token)).text(),
    close: token => json('/api/session', 'DELETE', undefined, token),
    events
  };
})();
