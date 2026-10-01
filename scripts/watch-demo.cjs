const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
let timer;
function build(){
  try{
    execFileSync(process.execPath,[path.join(__dirname,'build-demo.cjs')]);
    fs.copyFileSync(path.join(root,'demo-build/index.html'),path.join(root,'dist/demo.html'));
    console.log('Demo updated');
  }catch(error){console.error(error.message)}
}
build();
function changed(_,file){
  if(!file||String(file).replaceAll('\\','/')==='demo.html')return;
  clearTimeout(timer);timer=setTimeout(build,200);
}
fs.watch(path.join(root,'dist'),{recursive:true},changed);
fs.watch(path.join(__dirname,'build-demo.cjs'),()=>changed(null,'build-demo.cjs'));
