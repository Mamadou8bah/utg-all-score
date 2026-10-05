const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
 const browser = await chromium.launch({channel:'msedge',headless:true});
 try {
  const page = await browser.newPage({viewport:{width:390,height:844},serviceWorkers:'block'});
  page.setDefaultNavigationTimeout(60000);
  await page.addInitScript(()=>localStorage.setItem('utg_admin_token','mock'));
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  let match={id:'past',home:'ICT',away:'Business',competition:'Test League',homeScore:0,awayScore:0,status:'UPCOMING',venue:'UTG',kickoff:'2026-09-01T12:00:00Z',agents:[]};
  let fail=true;const updates=[];
  await page.route('**/api/**',route=>{
   const path=new URL(route.request().url()).pathname;
   if(route.request().method()==='PATCH') {
    const body=route.request().postDataJSON();updates.push({path,body});
    if(fail)return route.fulfill({status:500,json:{error:'Could not save result.'}});
    match={...match,...body};return route.fulfill({json:{data:match}});
   }
   return route.fulfill({json:{data:path==='/api/portal/admin/matches'?[match]:[]}});
  });
  const base=process.env.ADMIN_TEST_URL||'http://localhost:3401';
  await page.goto(base+'/matches');await page.locator('.admin-record-link').filter({hasText:'ICT vs Business'}).click();
  await page.getByRole('button',{name:'Enter result',exact:true}).click();
  const modal=page.getByRole('dialog',{name:'Enter match result'});
  await modal.getByRole('button',{name:'Save result',exact:true}).click();assert.equal(updates.length,0);
  await modal.getByLabel('ICT score',{exact:true}).fill('-1');await modal.getByLabel('Business score',{exact:true}).fill('0');
  await modal.getByRole('button',{name:'Save result',exact:true}).click();assert.equal(updates.length,0);
  await modal.getByLabel('ICT score',{exact:true}).fill('2.5');await modal.getByRole('button',{name:'Save result',exact:true}).click();assert.equal(updates.length,0);
  await modal.getByLabel('ICT score',{exact:true}).fill('2');await modal.getByRole('button',{name:'Save result',exact:true}).click();
  await modal.getByRole('status').filter({hasText:'Could not save result.'}).waitFor();assert.equal(await modal.getByLabel('ICT score',{exact:true}).inputValue(),'2');
  fail=false;await modal.getByRole('button',{name:'Save result',exact:true}).click();await modal.waitFor({state:'detached'});
  assert.deepEqual(updates[1],{path:'/api/portal/matches/past',body:{homeScore:2,awayScore:0,status:'FT',timer:'FT'}});
  await page.getByLabel('Final score',{exact:true}).getByText('2 – 0',{exact:true}).waitFor();
  await page.reload();await page.getByRole('button',{name:'Edit result',exact:true}).click();
  assert.equal(await modal.getByLabel('ICT score',{exact:true}).inputValue(),'2');
  await modal.getByLabel('ICT score',{exact:true}).fill('0');await modal.getByRole('button',{name:'Save result',exact:true}).click();await modal.waitFor({state:'detached'});
  await page.getByLabel('Final score',{exact:true}).getByText('0 – 0',{exact:true}).waitFor();
  await page.getByRole('link',{name:/Back to fixtures/}).click();await page.locator('.admin-record-link').filter({hasText:'0 – 0 · Full time'}).waitFor();
  for(const width of [320,390,1280]){await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
  assert.deepEqual(errors,[]);console.log('Past match entry, blank/negative/fraction validation, failure retry, full-time save, zero-score correction, reload and list score passed');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
