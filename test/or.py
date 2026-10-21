import json
from playwright.sync_api import sync_playwright
seen=[]
def orr(route):
    r=route.request
    if r.method=='OPTIONS': return route.fulfill(status=200,headers={'access-control-allow-origin':'*','access-control-allow-headers':'*'})
    seen.append((r.headers.get('authorization'),json.loads(r.post_data)['model']))
    route.fulfill(status=200,headers={'access-control-allow-origin':'*'},content_type='application/json',body=json.dumps({'choices':[{'message':{'content':'What are the 12 stickers being shared between? 🤔'}}]}))
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(); pg=ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    ctx.route('**/fonts.*/**',lambda r:r.abort()); ctx.route('https://openrouter.ai/**',orr); ctx.route('**/js/config.js*',lambda r:r.fulfill(body="window.MQ_CONFIG={CLUE_API_KEY:'sk-or-v1-test',CLUE_MODEL:'claude-haiku-5-5'};",content_type='application/javascript'))
    pg.goto('http://localhost:8765/index.html'); pg.fill('#nm','Amy'); pg.click('#nameForm button'); pg.click('[data-open="0"]'); pg.click('#go'); pg.wait_for_selector('.q input')
    pg.locator('button.clue').first.click(); pg.wait_for_timeout(1500); print(pg.locator('.pipbox').last.inner_text().replace('\n',' '), seen, errs); b.close()
