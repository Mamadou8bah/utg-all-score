const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
    const errors = [];
    const requests = [];
    const empty = { teams: [], players: [], competitions: [], matches: [], news: [] };
    const competition = { id: 'league', name: 'ICT League', type: 'GENERAL', format: 'LEAGUE', description: 'University football' };
    const match = { id: 'match', competitionId: 'league', competition: 'ICT League', home: 'ICT', away: 'Business', homeScore: 2, awayScore: 1, venue: 'UTG', kickoff: '2026-10-04T15:00:00Z', status: 'LIVE', events: [] };
    const data = { teams: [{ id: 'team', name: 'ICT', logo: null, school: 'ICT School' }], players: [{ id: 'player', name: 'ICT Player', number: 9, team: 'ICT' }], competitions: [competition], matches: [match], news: [{ id: 'news', title: 'ICT match report', excerpt: 'Match report', category: 'Football', image: '', publishedAt: match.kickoff, body: 'ICT wins at UTG.' }] };
    let failSearch = false;
    await context.route('**/api/**', async (route) => {
      const url = new URL(route.request().url());
      let result = [];
      if (url.pathname === '/api/search') {
        const q = url.searchParams.get('q');
        requests.push(q);
        if (failSearch) return route.fulfill({ status: 503, json: { error: 'Search unavailable' } });
        result = q === 'ICT' ? data : empty;
      } else if (url.pathname === '/api/competitions') result = { competitions: [competition], groups: {}, brackets: {}, stats: {} };
      else if (['/api/live', '/api/fixtures', '/api/results'].includes(url.pathname)) result = [match];
      await route.fulfill({ json: { data: result } });
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`http://localhost:${process.env.PUBLIC_TEST_PORT || 3100}/`);
    await page.getByRole('link', { name: 'Search AllScore', exact: true }).click();
    await page.waitForURL('**/search');
    const input = page.getByRole('searchbox');
    await input.fill('I');
    await page.waitForTimeout(400);
    assert.equal(requests.length, 0, 'one character must not send a search');
    await input.fill('IC');
    await input.fill('ICT');
    await page.getByRole('button', { name: 'ICT ICT School' }).waitFor();
    assert.deepEqual(requests, ['ICT'], 'typing must debounce requests');
    await page.getByRole('button', { name: 'Matches', exact: true }).click();
    await page.getByRole('heading', { name: 'Teams', exact: true }).waitFor({ state: 'detached' });
    await page.getByRole('button', { name: /ICT vs Business/ }).click();
    await page.getByRole('dialog').waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'detached' });
    await page.getByRole('button', { name: 'All', exact: true }).click();
    for (const name of ['ICT ICT School', 'ICT Player', 'ICT League League', 'ICT match report']) {
      await page.getByRole('button', { name: name, exact: name === 'ICT ICT School' || name === 'ICT League League' }).click();
      await page.getByRole('dialog').first().waitFor();
      await page.keyboard.press('Escape');
      await page.getByRole('dialog').waitFor({ state: 'detached' });
    }
    for (const width of [320, 360, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: 844 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `search at ${width}px must fit`);
    }
    await input.fill('missing');
    await page.getByRole('status').filter({ hasText: 'No results' }).waitFor();
    failSearch = true;
    await input.fill('ICT');
    await page.getByRole('alert').filter({ hasText: 'Unable to search' }).waitFor();
    failSearch = false;
    await page.getByRole('button', { name: 'Try again', exact: true }).click();
    await page.getByRole('button', { name: 'ICT ICT School' }).waitFor();
    await page.getByRole('button', { name: 'Clear search' }).click();
    assert.equal(await input.inputValue(), '');
    await page.getByRole('heading', { name: 'Teams', exact: true }).waitFor({ state: 'detached' });
    assert.deepEqual(errors, [], 'search must have no browser exceptions');
    console.log('Search: header navigation, debounce, filters, detail dialogs, responsive layouts, empty results, retry, and clear passed.');
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
