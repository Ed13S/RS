import sys, json, time, subprocess, os
from playwright.sync_api import sync_playwright
srv = subprocess.Popen(['python3','-m','http.server','8765','-d','/home/claude/mathquest'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
errs=[]
try:
  with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium' if os.path.exists('/opt/pw-browsers/chromium') else None, args=['--no-sandbox'])
    ctx = b.new_context(viewport={'width':1280,'height':900}); pg = ctx.new_page()
    pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e))); pg.on('console', lambda m: errs.append('CONSOLE '+m.text) if m.type=='error' and 'fonts.g' not in m.text and 'ERR_' not in m.text else None)
    pg.goto('http://localhost:8765/index.html'); pg.fill('#nameIn','Mia'); pg.click('#startForm button'); pg.wait_for_selector('.wkgrid')
    pg.screenshot(path='/tmp/s_map.png')
    pg.click('.wk[data-w="1"]'); pg.wait_for_selector('#goBtn'); pg.click('#goBtn')
    # solve first 12 correctly using the page's own data, 2 wrong first
    res = pg.evaluate("""() => { const q=[]; document.querySelectorAll('article.q').length; return document.querySelectorAll('article.q').length; }""")
    print('questions on page', res)
    for n in range(1,13):
        info = pg.evaluate("(n)=>{const C=window.MQ.Course.buildModule(1);const q=C.questions[n-1];return {type:q.type,answer:q.answer}}", n)
        card = pg.locator(f'#q-{n}')
        card.scroll_into_view_if_needed()
        if info['type']=='mc':
            if n==2: 
                wrong = pg.evaluate("(n)=>{const q=window.MQ.Course.buildModule(1).questions[n-1];return String((+q.answer+1)%q.choices.length)}", n); card.locator(f'.ch[data-i="{wrong}"]').click()
            card.locator(f'.ch[data-i="{info["answer"]}"]').click()
        else:
            inp = card.locator('input.ans')
            if n==1: inp.fill('99999'); card.locator('.chk').click()
            inp.fill(str(info['answer'])); inp.press('Enter')
        time.sleep(.15)
    pg.screenshot(path='/tmp/s_mod.png')
    print('green cards', pg.locator('.q.ok').count(), 'tiles gone', pg.locator('#tiles i.gone').count(), pg.inner_text('#pcount'))
    # simulate leaving the page
    pg.evaluate("Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))"); time.sleep(.3)
    pg.evaluate("Object.defineProperty(document,'hidden',{value:false,configurable:true});window.dispatchEvent(new Event('focus'))"); time.sleep(.3)
    print('away overlay visible:', pg.locator('#awayOv').is_visible())
    pg.screenshot(path='/tmp/s_away.png'); pg.click('#backBtn')
    # finish the rest
    for n in range(13,31):
        info = pg.evaluate("(n)=>{const q=window.MQ.Course.buildModule(1).questions[n-1];return {type:q.type,answer:q.answer}}", n); card=pg.locator(f'#q-{n}')
        if info['type']=='mc': card.locator(f'.ch[data-i="{info["answer"]}"]').click()
        else: inp=card.locator('input.ans'); inp.fill(str(info['answer'])); inp.press('Enter')
        time.sleep(.05)
    time.sleep(.6); print('done overlay:', pg.locator('#doneOv').count()); pg.screenshot(path='/tmp/s_done.png')
    ev = pg.evaluate("JSON.parse(localStorage.getItem('mq_local_events')||'[]').map(e=>e.type)"); 
    from collections import Counter; print(Counter(ev))
    # admin
    pg.goto('http://localhost:8765/admin.html'); pg.fill('#pw','change-me-123'); pg.click('#go'); time.sleep(.5); pg.screenshot(path='/tmp/s_admin.png')
    pg.click('[data-tab="leaves"]'); time.sleep(.2); print('leaves rows:', pg.locator('tbody tr').count()); pg.screenshot(path='/tmp/s_admin2.png')
    pg.goto('http://localhost:8765/index.html'); pg.wait_for_selector('#startForm')
    b.close()
finally:
  srv.terminate()
print('\n'.join(errs) or 'no console errors')
