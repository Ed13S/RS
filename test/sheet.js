require('../js/engine.js'); require('../js/pictures.js');
const P = globalThis.MQ.Pictures; let h = '<body style="margin:0;display:grid;grid-template-columns:repeat(6,300px)">';
for (let i = 0; i < 30; i++) { h += `<div style="width:300px;height:250px">${P.scene(i).svg.replace('class="scene"', 'style="width:300px;height:250px"')}</div>`; }
require('fs').writeFileSync('/tmp/claude-0/sheet.html', h);
