// Usage: npm run demo → demo-build/index.html (publish it as an artifact, or open it in a browser).
// Builds the demo as ONE page (no iframe) so artifact comments can anchor to app elements.
// The app renders inside a 402×760 frame; its mobile (≤600px) styles are forced on.
const fs=require('fs'),path=require('path');
const repo=path.join(__dirname,'..','dist'),out=path.join(__dirname,'..','demo-build');
fs.mkdirSync(out,{recursive:true});
const html=fs.readFileSync(`${repo}/index.html`,'utf8');
const css=fs.readFileSync(`${repo}/style.css`,'utf8').replace(/@media\(max-width:600px\)/g,'@media all');
const js=fs.readFileSync(`${repo}/app.js`,'utf8');
const body=html.slice(html.indexOf('<body>')+6,html.indexOf('</body>')).replace(/<script[^>]*src="app.js"[^>]*><\/script>/,'');
if(!body.includes('class="app"'))throw new Error('app markup not found');
const demoCss=`
html,body{height:auto;min-height:100%}
body{display:grid;place-items:center;padding-inline:16px;padding-block:24px;box-sizing:border-box}
.frame{position:relative;width:402px;height:760px;overflow:clip;background:#F4F1F6;box-shadow:0 0 0 1px #CFC8D6,0 20px 50px rgb(52 38 66/.16);zoom:var(--z,1)}
.frame .app{height:100%;max-width:none;margin:0}
.frame dialog{position:absolute;inset:auto 0 0 0;margin:0;z-index:20;max-height:90%}
.frame:after{content:'';position:absolute;inset:0;background:#0005;opacity:0;pointer-events:none;z-index:15;will-change:opacity;transition:opacity .38s cubic-bezier(.3,0,.8,.15)}
html.sheet-open .frame:after{opacity:1;pointer-events:auto;transition:opacity .5s cubic-bezier(.32,.72,0,1)}
.size{margin-top:12px;text-align:center;color:#6F6875;font:12px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-variant-numeric:tabular-nums;letter-spacing:.3px}`;
fs.writeFileSync(`${out}/index.html`,`<title>Remmi демо</title>
<meta name="color-scheme" content="light">
<style>${css}${demoCss}</style>
<div><div class="frame">${body}</div><div class="size">402 × 760</div></div>
<script>
// Inside a page the sheet can't use the top layer: open it in place, within the frame.
HTMLDialogElement.prototype.showModal=HTMLDialogElement.prototype.show;
${js}
function fitFrame(){document.documentElement.style.setProperty('--z',Math.min(1,(innerWidth-32)/402))}
addEventListener('resize',fitFrame);fitFrame();
</script>
`);
