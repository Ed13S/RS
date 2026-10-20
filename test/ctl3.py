exec(open('test/ctl.py').read().split("with sync_playwright")[0])
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(has_touch=True,viewport={'width':1100,'height':900}); pg=ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    ctx.route('**/*.firebaseio.com/**',fb); ctx.route('https://ntfy.sh/',ntfy); ctx.route('**/js/config.js*',lambda r:r.fulfill(body=CFGJS,content_type='application/javascript')); ctx.route('**/fonts.*/**',lambda r:r.abort())
    pg.goto('http://localhost:8765/index.html'); pg.fill('#nm','Amy'); pg.click('#nameForm button'); pg.wait_for_selector('[data-open="0"]')
    pg.click('[data-open="0"]'); pg.click('#go'); pg.wait_for_selector('.q input')
    # normal leave
    pg.evaluate("Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))"); pg.wait_for_timeout(600)
    pg.evaluate("Object.defineProperty(document,'hidden',{value:false,configurable:true});document.dispatchEvent(new Event('visibilitychange'))"); pg.wait_for_timeout(600)
    pg.click('#bk') if pg.locator('#bk').count() else None
    print('DB',list(DB.get('mathquest',{}).keys()), [pg.evaluate('MQ.Tracker.queue.length'), pg.evaluate('MQ.Tracker.sid')]); ev=getp('mathquest/events/amy'); leaves=[k for k,v in ev.items() if v['type']=='leave']; rets=[k for k,v in ev.items() if v['type']=='return']; print('leaves',len(leaves),'returns',len(rets),'notes',len(notes))
    # working pad
    pg.locator('.work').first.click(); pg.wait_for_selector('#padcv'); box=pg.locator('#padcv').bounding_box()
    pg.mouse.move(box['x']+50,box['y']+50); pg.mouse.down(); pg.mouse.move(box['x']+200,box['y']+120,steps=8); pg.mouse.up(); pg.click('#ps'); pg.wait_for_timeout(800)
    w=getp('mathquest/work/amy'); print('work saved',list(w.keys()), len(list(w.values())[0]['img'])//1000,'KB')
    # delete the leave via admin
    ad=ctx.new_page(); aerr=[]; ad.on('pageerror',lambda e:aerr.append(str(e))); ad.on('dialog',lambda d:d.accept())
    ad.goto('http://localhost:8765/admin.html'); ad.fill('#pw','x'); ad.press('#pw','Enter'); ad.wait_for_selector('.mgrid')
    ad.click('[data-act=delleave]'); ad.wait_for_timeout(900)
    ev=getp('mathquest/events/amy'); print('after delete leaves',len([1 for v in ev.values() if v['type']=='leave']),'cmd',[c['type'] for c in (getp('mathquest/control/amy/cmds') or {}).values()])
    ad.click('.mcell[data-m="0"]'); ad.wait_for_selector('[data-act=work]'); print('work button in admin: yes')
    # admin account: vip
    ad.click('[data-act=vip]'); ad.wait_for_timeout(800); print('control',getp('mathquest/control/amy'))
    pg.wait_for_timeout(11000)
    pg.evaluate("document.querySelector('.ov') && (document.getElementById('overlay').innerHTML='')")
    n0=len(getp('mathquest/events/amy')); notes.clear()
    pg.evaluate("Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))"); pg.wait_for_timeout(800)
    ev=getp('mathquest/events/amy'); print('silent: new leave events',len([1 for v in ev.values() if v['type']=='leave'])-0,'notes',len(notes),'overlay',pg.locator('.ov').count())
    pg.evaluate("Object.defineProperty(document,'hidden',{value:false,configurable:true});document.dispatchEvent(new Event('visibilitychange'))"); pg.wait_for_timeout(500); print('overlay after return',pg.locator('.ov').count())
    pg.goto('http://localhost:8765/index.html'); pg.wait_for_selector('[data-open="0"]'); print('all unlocked:',pg.locator('[data-open]:not([disabled])').count())
    print('errs',errs,aerr); b.close()
