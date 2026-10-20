from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':820,'height':1180},has_touch=True,user_agent='Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148')
    ctx.route('**/fonts.*/**',lambda r:r.abort()); pg=ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('http://localhost:8765/index.html'); pg.fill('#nm','Zoe'); pg.click('#nameForm button'); pg.click('[data-open="0"]'); pg.click('#go'); pg.wait_for_selector('.q input')
    print('keypad on w/o tapping:',pg.locator('#kp.on').count())
    for n in range(3):
        q=pg.evaluate(f"MQ.displayAnswer(MQ.Course.buildModule(0).questions[{n}])")
        if n==2: pg.locator('.q .ans input').nth(n).tap()
        for ch in str(q): pg.locator(f'#kp button[data-k="{ch}"]').first.tap()
        pg.wait_for_timeout(1200)
    print([i.input_value() for i in pg.locator('.q .ans input').all()[:4]]);print('ok cards',pg.locator('.q.ok, .q.done').count(), pg.locator('input.good').count(), errs)
    b.close()
