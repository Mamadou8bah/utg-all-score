const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
 const browser = await chromium.launch({channel:'msedge',headless:true});
 try {
 const page = await browser.newPage({viewport:{width:390,height:844},serviceWorkers:'block'});
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 const competition={id:'c',name:'University League',type:'GENERAL',format:'LEAGUE',description:'Official'};
 const match={id:'m',competitionId:'c',competition:competition.name,home:'ICT',away:'Business',status:'FT',homeScore:1,awayScore:0,kickoff:new Date().toISOString(),venue:'UTG',events:[{type:'Goal',player:'Musa',team:'ICT',minute:12,detail:''},{type:'Yellow Card',player:'Musa',team:'ICT',minute:20,detail:''}]};
 await page.route('**/api/**',r=>{const path=new URL(r.request().url()).pathname;let data=[];
 if(path==='/api/competitions')data={competitions:[competition],groups:{},brackets:{},stats:{}};
 if(path==='/api/results')data=[match];
 if(path==='/api/standings')data=[{competitionId:'c',team:'ICT',played:1,win:1,draw:0,loss:0,gf:1,ga:0,gd:1,pts:3}];
 if(path==='/api/teams')data=[{name:'ICT',tone:'Campus team',colors:[],form:[]}];
 if(path==='/api/athletes')data=[{id:'p',name:'Musa',team:'ICT',sport:'Football',role:'Forward',statLine:'1 goal',story:'University forward',image:''}];
 return r.fulfill({json:{data}});});
 const base=process.env.PUBLIC_TEST_URL || 'http://localhost:3400';
 await page.goto(base+'/standings'); await page.getByRole('button',{name:/University League/}).click();
 for(const label of ['Scorers','Cards','Table','Fixtures']) {
 await page.getByRole('button',{name:label,exact:true}).click();
 if(label==='Scorers')await page.getByText('Musa',{exact:true}).waitFor();
 if(label==='Cards')await page.getByText('1 yellow · 0 red',{exact:true}).waitFor();
 if(label==='Table')await page.locator('table').waitFor();
 if(label==='Fixtures')await page.locator('.match-row').waitFor();
 }
 await page.locator('.match-row').click(); await page.waitForFunction(()=>document.querySelectorAll('dialog[open]').length===2); await page.keyboard.press('Escape'); await page.waitForFunction(()=>document.querySelectorAll('dialog[open]').length===1);
 assert.equal(await page.getByRole('dialog').count(),1,'nested match closes back to competition');
 await page.keyboard.press('Escape'); await page.goto(base+'/teams'); await page.getByRole('button',{name:/ICT/}).click();
 await page.getByRole('button',{name:'Overview',exact:true}).click(); await page.locator('.team-form').waitFor();
 assert.equal(await page.locator('.team-form').innerText(),'W','form derives from completed results');
 await page.getByRole('button',{name:'Squad',exact:true}).click(); await page.getByText('Musa',{exact:true}).waitFor();
 for(const width of [320,390,1280]) {await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(await page.locator('.reference-detail__frame').evaluate(e=>e.scrollWidth>e.clientWidth),false);}
 assert.deepEqual(errors,[]);console.log('Competition leaders, cards, table, fixtures, nested dialog, real team form, squad and responsive details passed');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
