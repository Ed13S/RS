import json,re
from playwright.sync_api import sync_playwright
DB={}
def setp(path,val,merge=False):
    parts=[p for p in path.split('/') if p]
    if not parts: return
    d=DB
    for p in parts[:-1]: d=d.setdefault(p,{})
    if val is None: d.pop(parts[-1],None)
    elif merge and isinstance(d.get(parts[-1]),dict): d[parts[-1]].update(val)
    else: d[parts[-1]]=val
def getp(path):
    d=DB
    for p in [p for p in path.split('/') if p]:
        if not isinstance(d,dict) or p not in d: return None
        d=d[p]
    return d
notes=[]
def fb(route):
    r=route.request; path=re.sub(r'^https://[^/]+/','',r.url.split('?')[0]).replace('.json','')
    h={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'}
    if r.method=='OPTIONS': return route.fulfill(status=200,headers=h)
    if r.method in('PUT','PATCH'): setp(path,json.loads(r.post_data),r.method=='PATCH'); route.fulfill(status=200,headers=h,body='{}')
    elif r.method=='DELETE': setp(path,None); route.fulfill(status=200,headers=h,body='null')
    else: route.fulfill(status=200,headers=h,content_type='application/json',body=json.dumps(getp(path)))
def ntfy(route):
    if route.request.method=='OPTIONS': return route.fulfill(status=200,headers={'access-control-allow-origin':'*','access-control-allow-headers':'*'})
    notes.append(json.loads(route.request.post_data)); route.fulfill(status=200,headers={'access-control-allow-origin':'*'},body='{}')
CFGJS="window.MQ_CONFIG={ADMIN_PASSCODE:'x',FIREBASE_DB_URL:'https://t.firebaseio.com',NTFY_TOPIC:'tt',MAX_CLUES:3};"
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(); pg=ctx.new_page()
    for c in(ctx,):
        c.route('**/*.firebaseio.com/**',fb); c.route('https://ntfy.sh/',ntfy); c.route('**/js/config.js*',lambda r:r.fulfill(body=CFGJS,content_type='application/javascript'))
        c.route('**/fonts.*/**',lambda r:r.abort())
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('http://localhost:8765/index.html'); pg.fill('#nm','Amy'); pg.click('#nameForm button'); pg.wait_for_selector('[data-open="0"]')
    assert pg.locator('[data-open="1"]').is_disabled()
    # admin: force-open module 2, complete module 1
    setp('mathquest/control/amy/access/1','open')
    setp('mathquest/control/amy/cmds/1',{'type':'completeMod','mod':0})
    pg.wait_for_function("!document.querySelector('[data-open=\"1\"]').disabled",timeout=15000)
    assert 'Complete' in pg.inner_text('body') or pg.locator('.mod.done').count()==1, 'mod1 not done'
    assert getp('mathquest/control/amy/cmds') in (None,{}), 'cmd not acked'
    print('open+complete OK; progress done:',getp('mathquest/progress/amy/mods/0/done'))
    # force lock module 1? lock module 2
    setp('mathquest/control/amy/access/1','lock')
    pg.wait_for_function("document.querySelector('[data-open=\"1\"]').disabled",timeout=15000); print('lock OK')
    # leave notification
    pg.click('[data-open="2"]') if not pg.locator('[data-open="2"]').is_disabled() else None
    pg.click('[data-open="0"]'); pg.wait_for_timeout(300)
    # reset module 1 via cmd and wipe
    setp('mathquest/control/amy/cmds/2',{'type':'resetMod','mod':0}); pg.wait_for_function("document.querySelectorAll('.mod.done').length==0",timeout=15000); print('reset OK')
    setp('mathquest/control/amy/wipe',123); pg.wait_for_selector('#nameForm',timeout=15000); print('wipe OK')
    print('errors',errs, 'notes',notes)
    b.close()
