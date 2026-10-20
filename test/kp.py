from playwright.sync_api import sync_playwright
import re
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':820,'height':1180},has_touch=True,user_agent='Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148')
    ctx.route('**/fonts.*/**',lambda r:r.abort()); pg=ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('http://localhost:8765/index.html'); pg.fill('#nm','Zoe'); pg.click('#nameForm button'); pg.click('[data-open="0"]'); pg.click('#go'); pg.wait_for_selector('.q input')
    inp=pg.locator('.q .ans input').first; inp.tap(); pg.wait_for_selector('#kp.on'); print('inputmode',inp.get_attribute('inputmode'))
    ans=pg.evaluate("(()=>{const q=MQ.Course.buildModule(0).questions[0];return MQ.displayAnswer(q)})()"); print('answer',ans)
    for ch in str(ans):
        k='space' if ch==' ' else ch
        pg.locator(f'#kp button[data-k="{ch}"]').first.tap()
    pg.wait_for_timeout(1500); print('good',inp.evaluate("e=>e.classList.contains('good')"),'val',inp.input_value())
    print('overlay',pg.locator('.ov').count(),'errs',errs)
    print(pg.evaluate("(()=>{const r=document.getElementById('kp').getBoundingClientRect();return [r.top,r.bottom,innerHeight,getComputedStyle(document.getElementById('kp')).position]})()"));pg.screenshot(path='/tmp/kp.png'); b.close()
