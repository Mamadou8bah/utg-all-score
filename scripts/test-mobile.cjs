const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const failures = [];
  const portBase = Number(process.env.TEST_PORT_BASE || 3100);
  const match = { id: 'test-match', competitionId: 'test-league', competition: 'University League', home: 'ICT', away: 'Business', homeScore: 1, awayScore: 0, venue: 'UTG', kickoff: new Date().toISOString(), status: 'LIVE', events: [] };
  const competition = { id: 'test-league', name: 'University League', type: 'GENERAL', description: 'Test', format: 'LEAGUE' };
  try {
    for (const [app, port, paths] of [
      ['frontend', Number(process.env.PUBLIC_TEST_PORT || 3100), ['/', '/live', '/fixtures', '/results', '/standings', '/news', '/more', '/teams', '/athletes', '/events', '/announcements']],
      ['admin-app', portBase + 1, ['/login', '/', '/schools', '/agents', '/teams', '/competitions', '/matches', '/offline']],
      ['agent-app', portBase + 2, ['/login', '/', '/content', '/offline']]
    ]) {
      if (process.env.TEST_APP && process.env.TEST_APP !== app) continue;
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
      await context.addInitScript(() => {
        if (sessionStorage.getItem('testSignedOut') === 'true') return;
        localStorage.setItem('utg_admin_token', 'mock-token');
        localStorage.setItem('utg_agent_token', 'mock-token');
      });
      await context.route('**/api/**', async (route) => {
        const path = new URL(route.request().url()).pathname;
        let data = [];
        if (path === '/api/auth/me') data = { user: { id: 'test-user', name: 'Test User', role: app === 'admin-app' ? 'ADMIN' : 'AGENT', schoolName: 'ICT' } };
        else if (path === '/api/competitions') data = { competitions: [competition], groups: {}, brackets: {}, stats: {} };
        else if (path === '/api/portal/content') data = { news: [], announcements: [] };
        else if (path === '/api/live' || path === '/api/fixtures') data = [match];
        await route.fulfill({ json: { data }, headers: { 'Access-Control-Allow-Origin': '*' } });
      });
      const newPage = async () => {
        const current = await context.newPage();
        current.on('pageerror', (error) => failures.push(`${app} ${new URL(current.url()).pathname} at ${current.viewportSize().width}px: ${error.message}`));
        return current;
      };
      let page = await newPage();
      for (const width of [320, 360, 390, 768, 1280]) {
        await page.setViewportSize({ width, height: 844 });
        for (const path of paths) {
          // Isolate document loads so an aborted hydration from the previous
          // document cannot race the next one. Test SPA navigation below.
          await page.close();
          page = await newPage();
          await page.setViewportSize({ width, height: 844 });
          const response = await page.goto(`http://localhost:${port}${path}`);
          assert.equal(response.status(), 200, `${app} ${path}: HTTP 200`);
          await page.waitForTimeout(750);
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
          assert.equal(overflow, false, `${app} ${path} at ${width}px: no horizontal overflow`);
        }
      }
      await page.setViewportSize({ width: 390, height: 844 });
      if (app === 'frontend') {
        await page.goto(`http://localhost:${port}/live`);
        await page.locator('button').filter({ hasText: 'ICT' }).first().click();
        await page.getByRole('dialog').waitFor();
        assert.equal(await page.evaluate(() => !!document.activeElement?.closest('dialog')), true, 'dialog traps initial focus');
        await page.keyboard.press('Escape');
        await page.getByRole('dialog').waitFor({ state: 'detached' });
        await page.getByRole('link', { name: 'More', exact: true }).last().click();
        await page.waitForURL('**/more');
        for (const [label, path] of [['Live', '/live'], ['Leagues', '/standings'], ['News', '/news'], ['Matches', '/']]) {
          await page.getByRole('link', { name: label, exact: true }).last().click();
          await page.waitForURL(`http://localhost:${port}${path}`);
          await page.waitForTimeout(750);
        }
      } else {
        await page.goto(`http://localhost:${port}/login`);
        assert.ok(await page.locator('input').first().evaluate((input) => parseFloat(getComputedStyle(input).fontSize)) >= 16, `${app}: inputs prevent mobile auto zoom`);
        await context.clearCookies();
        await page.evaluate(() => { localStorage.clear(); sessionStorage.setItem('testSignedOut', 'true'); });
        await page.goto(`http://localhost:${port}/`);
        await page.waitForURL('**/login');
        await page.goto(`http://localhost:${port}/offline`);
        assert.equal(new URL(page.url()).pathname, '/offline', 'offline page is available without a token');
      }
      console.log(`${app}: routes at 320/360/390/768/1280px and mobile interactions passed`);
      await context.close();
    }
    assert.deepEqual(failures, [], 'no browser runtime exceptions');
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
