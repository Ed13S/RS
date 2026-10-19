import json, time
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':1280,'height':900}); pg=ctx.new_page()
    pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e))); pg.on('console', lambda m: errs.append('CONSOLE '+m.text) if m.type=='error' and 'fonts' not in m.text else None)
    pg.route('**/fonts.googleapis.com/**', lambda r: r.abort()); pg.route('**/fonts.gstatic.com/**', lambda r: r.abort())
    pg.goto('http://localhost:8765/index.html'); pg.wait_for_selector('#nm'); pg.screenshot(path='/tmp/claude-0/s1-welcome.png')
    pg.fill('#nm','Maya'); pg.click('#nameForm button'); pg.wait_for_selector('.grid'); pg.screenshot(path='/tmp/claude-0/s2-home.png')
    pg.click('[data-open="0"]'); pg.wait_for_selector('#go'); pg.screenshot(path='/tmp/claude-0/s3-gate.png'); pg.click('#go'); pg.wait_for_selector('.q')
    pg.screenshot(path='/tmp/claude-0/s4-module.png')
    qs=pg.evaluate("MQ.Course.buildModule(0).questions.map(q=>({n:q.n,type:q.type,a:q.answer,id:q.id}))")
    # wrong answer on Q1
    q0=qs[0]
    if q0['type']!='mc':
        pg.fill('#q0 input','99999'); pg.press('#q0 input','Enter'); time.sleep(.3)
    # correct first 6
    for q in qs[:6]:
        n=q['n']
        if q['type']=='mc': pg.click(f'#q{n} [data-mc="{q["a"]}"]')
        else:
            pg.fill(f'#q{n} input', q['a']); pg.press(f'#q{n} input','Enter')
        time.sleep(.2)
    time.sleep(1)
    print('tiles open:', pg.evaluate("document.querySelectorAll('.tile.open').length"), 'ok cards:', pg.evaluate("document.querySelectorAll('.q.ok').length"))
    pg.screenshot(path='/tmp/claude-0/s5-progress.png')
    # simulate leaving
    pg.evaluate("Object.defineProperty(document,'hidden',{value:true,configurable:true}); document.dispatchEvent(new Event('visibilitychange'))"); time.sleep(1.2)
    pg.evaluate("Object.defineProperty(document,'hidden',{value:false,configurable:true}); document.dispatchEvent(new Event('visibilitychange'))"); time.sleep(.4)
    print('overlay shown:', pg.evaluate("!!document.querySelector('#overlay .modal')")); pg.screenshot(path='/tmp/claude-0/s6-away.png')
    pg.click('#bk')
    # clue (no key -> fallback)
    pg.click('#q8 .clue'); time.sleep(.5); print('clue text:', pg.inner_text('#q8 .clue:not(button)') if pg.query_selector('#q8 div.clue') else 'none')
    # finish the rest
    for q in qs[6:]:
        n=q['n']
        if q['type']=='mc': pg.click(f'#q{n} [data-mc="{q["a"]}"]')
        else:
            pg.fill(f'#q{n} input', q['a']); pg.press(f'#q{n} input','Enter')
        time.sleep(.12)
    pg.wait_for_selector('#ovmap', timeout=8000); time.sleep(1); pg.screenshot(path='/tmp/claude-0/s7-done.png')
    st=pg.evaluate("JSON.parse(localStorage.getItem('mq_state_v2')).mods[0]"); print('done:',st['done'],'score:',st['score'],'leaves:',st['leaves'])
    evs=pg.evaluate("JSON.parse(localStorage.getItem('mq_events_local')).map(e=>e.type)"); from collections import Counter; print(Counter(evs))
    pg.click('#ovmap'); pg.wait_for_selector('.grid'); pg.screenshot(path='/tmp/claude-0/s8-home2.png')
    # admin
    pg.goto('http://localhost:8765/admin.html'); pg.fill('#pw','change-me'); pg.press('#pw','Enter'); pg.wait_for_selector('.kpis'); pg.click('.mcell[data-m="0"]'); time.sleep(.5); pg.screenshot(path='/tmp/claude-0/s9-admin.png', full_page=True)
    # search admin redirect
    pg.goto('http://localhost:8765/index.html'); pg.wait_for_selector('.grid'); pg.fill('#sin','admin'); pg.press('#sin','Enter'); time.sleep(.5); print('after admin search url:', pg.url)
    # mobile
    m=b.new_context(viewport={'width':390,'height':800}, is_mobile=True, has_touch=True); mp=m.new_page(); mp.route('**/fonts.g*/**', lambda r: r.abort())
    mp.goto('http://localhost:8765/index.html'); mp.fill('#nm','Zoe'); mp.click('#nameForm button'); mp.wait_for_selector('.grid'); mp.click('[data-open="5"]', force=True) if False else None
    mp.click('[data-open="0"]'); mp.click('#go'); mp.wait_for_selector('.q'); mp.screenshot(path='/tmp/claude-0/s10-mobile.png'); 
    print('mobile hscroll:', mp.evaluate("document.documentElement.scrollWidth>innerWidth"))
    b.close()
print('ERRORS:', errs[:10])
