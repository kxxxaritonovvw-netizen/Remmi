// Usage: npm run showcase → demo-build/showcase.html (one self-contained page to publish as an artifact).
// Inlines every stylesheet and script dist/showcase.html links, so components render exactly as in the app.
const fs=require('fs'),path=require('path');
const repo=path.join(__dirname,'..','dist'),out=path.join(__dirname,'..','demo-build');
fs.mkdirSync(out,{recursive:true});
const html=fs.readFileSync(`${repo}/showcase.html`,'utf8');
const read=file=>fs.readFileSync(path.join(repo,file),'utf8');
const title=html.match(/<title>[^<]*<\/title>/)[0];
const css=[...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map(m=>read(m[1])).join('\n');
const body=html.slice(html.indexOf('<body>')+6,html.indexOf('</body>'))
  .replace(/<script src="([^"]+)"><\/script>/g,(_,file)=>`<script>\n${read(file)}\n</script>`);
fs.writeFileSync(`${out}/showcase.html`,`${title}\n<meta name="color-scheme" content="light dark">\n<style>\n${css}\n</style>\n${body}`);
