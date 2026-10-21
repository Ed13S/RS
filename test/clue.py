from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':1000,'height':900}); pg=ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    ctx.route('**/fonts.*/**',lambda r:r.abort()); ctx.route('**/js/config.js*',lambda r:r.fulfill(body="window.MQ_CONFIG={CLUES_PER_DAY:6};",content_type='application/javascript'))
    pg.goto('http://localhost:8765/index.html'); pg.fill('#nm','Amy'); pg.click('#nameForm button'); pg.click('[data-open="0"]'); pg.click('#go'); pg.wait_for_selector('.q input')
    btn=pg.locator('button.clue').first
    for i in range(5):
        btn.click(); pg.wait_for_timeout(400); print(i+1, pg.locator('.q').first.locator('.pipbox').last.inner_text().replace('\n',' ')[:150])
    print('label',btn.inner_text())
    pg.locator('.q').nth(1).locator('button.clue').click(); pg.wait_for_timeout(300); pg.locator('.q').nth(2).locator('button.clue').click(); pg.wait_for_timeout(300); print('left',btn.inner_text())
    pg.locator('.q').nth(3).locator('button.clue').click(); pg.wait_for_timeout(300); print('toast', pg.locator('.toast').last.inner_text())
    pg.evaluate("localStorage.setItem('mq_clues_day',JSON.stringify({d:'Mon Jan 01 2001',n:99}))"); pg.reload(); pg.wait_for_selector('[data-open="0"]'); pg.click('[data-open="0"]'); pg.click('#go'); pg.wait_for_selector('.q input'); print('after new day:',pg.locator('button.clue').first.inner_text(), errs); b.close()
