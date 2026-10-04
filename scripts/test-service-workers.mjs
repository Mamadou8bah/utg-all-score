import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

for (const app of ['frontend', 'admin-app', 'agent-app']) {
  const handlers = {};
  const entries = new Map();
  let network = async () => new Response('fresh');
  const key = (request) => typeof request === 'string' ? request : new URL(request.url).pathname + new URL(request.url).search;
  const cache = {
    match: async (request) => entries.get(key(request))?.clone(),
    put: async (request, response) => entries.set(key(request), response.clone())
  };
  vm.runInNewContext(await readFile(`${app}/public/sw.js`, 'utf8'), {
    self: { location: { origin: 'https://app.test' }, addEventListener: (name, handler) => { handlers[name] = handler; } },
    caches: { open: async () => cache },
    fetch: (...args) => network(...args), URL, URLSearchParams, Response
  });
  const request = (path, mode = 'cors', headers = {}) => ({ url: `https://app.test${path}`, method: 'GET', mode, headers: new Headers(headers) });
  const dispatch = (req) => {
    let response;
    handlers.fetch({ request: req, respondWith: (promise) => { response = promise; } });
    return response;
  };
  assert.equal(dispatch(request('/api/auth/me')), undefined, `${app}: private API bypasses cache`);
  assert.equal(dispatch(request('/api/live', 'cors', { authorization: 'Bearer private' })), undefined);
  assert.equal(dispatch(request('/live?_rsc=123')), undefined, `${app}: RSC request bypasses HTML cache`);
  network = async () => { throw new Error('offline'); };
  let response = await dispatch(request('/login', 'navigate'));
  assert.equal(response.status, 503, `${app}: offline navigation always returns a Response`);
  entries.set('/offline', new Response('<h1>Offline</h1>', { headers: { 'Content-Type': 'text/html' } }));
  response = await dispatch(request('/login', 'navigate'));
  assert.match(await response.text(), /Offline/);
  response = await dispatch(request('/_next/static/missing.js'));
  assert.equal(response.type, 'error', `${app}: asset failure never returns HTML`);
  const put = cache.put;
  cache.put = async () => { throw new Error('cache quota exceeded'); };
  network = async () => new Response('usable asset');
  response = await dispatch(request('/_next/static/new.js'));
  assert.equal(await response.text(), 'usable asset', `${app}: cache quota failure preserves the network response`);
  cache.put = put;
  network = async () => { throw new Error('offline'); };
  if (app === 'frontend') {
    response = await dispatch(request('/api/live'));
    assert.equal(response.status, 503);
    assert.equal((await response.json()).error, 'Offline and no cached data available.');
    network = async () => new Response('{"data":[1]}', { headers: { 'Content-Type': 'application/json' } });
    await dispatch(request('/api/live'));
    network = async () => new Response('server error', { status: 500 });
    const failedRefresh = await dispatch(request('/api/live'));
    assert.ok([200, 500].includes(failedRefresh.status), 'failed refresh returns cached data or the server error');
    network = async () => { throw new Error('offline'); };
    assert.deepEqual(await (await dispatch(request('/api/live'))).json(), { data: [1] }, 'failed response never replaces cached data');
  } else {
    network = async () => new Response('private page');
    await dispatch(request('/', 'navigate'));
    assert.equal(entries.has('/'), false, `${app}: authenticated page is never cached`);
  }
  console.log(`${app}: offline and privacy regression checks passed`);
}
