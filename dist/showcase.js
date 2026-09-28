// Component showcase: each component registers itself from its *.stories.js file,
// then Showcase.start() draws the list, variants and a live playground.
const Showcase=(()=>{
  const components=[];
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n};
  const widths=[360,402,600];

  function frame(width,label){
    const wrap=el('figure','sc-frame');
    const cap=el('figcaption','sc-frame__label');cap.append(el('span','',label),el('span','sc-frame__size',`${width}px`));
    const screen=el('div','sc-frame__screen');screen.style.width=`${width}px`;
    const body=el('div','sc-frame__body');body.append(screen);
    wrap.append(cap,body);return{wrap,screen,cap};
  }

  function section(c){
    const id=c.name.toLowerCase();
    const s=el('section','sc-component');s.id=id;
    const head=el('header','sc-component__head');
    head.append(el('h2','sc-component__name',c.name),el('p','sc-component__desc',c.description));
    const files=el('p','sc-files');c.files.forEach(f=>files.append(el('code','',f)));head.append(files);
    s.append(head);

    // Props table
    const props=el('div','sc-block');props.append(el('h3','sc-block__title','Свойства'));
    const scroll=el('div','sc-table');const table=el('table');
    const thead=el('tr');['Свойство','Тип','По умолчанию','Описание'].forEach(t=>thead.append(el('th','',t)));table.append(thead);
    c.props.forEach(p=>{const tr=el('tr');const n=el('td');n.append(el('code','',p.name));const d=el('td');d.append(el('code','',JSON.stringify(p.default)));tr.append(n,el('td','sc-type',p.type),d,el('td','',p.description));table.append(tr)});
    scroll.append(table);props.append(scroll);
    const usage=el('pre','sc-code');usage.append(el('code','',c.usage));props.append(usage);
    s.append(props);

    // Main component: default props, measured redlines and spec, like the ◆ master in Figma.
    const main=el('div','sc-block');main.append(el('h3','sc-block__title','Главный компонент'));
    const mf=frame(402,`◆ ${c.name}`);mf.wrap.classList.add('sc-frame--main');c.mount(mf.screen,defaults(c));
    const layout=el('div','sc-main-comp');const holder=el('div','sc-main-comp__frame');holder.append(mf.wrap);
    const specList=el('dl','sc-spec');layout.append(holder,specList);main.append(layout);s.append(main);
    requestAnimationFrame(()=>redline(mf,c,specList));

    // Variants
    const vars=el('div','sc-block');vars.append(el('h3','sc-block__title','Варианты'));
    const grid=el('div','sc-grid');
    c.variants.forEach(v=>{const f=frame(402,v.name);c.mount(f.screen,{...defaults(c),...v.props});grid.append(f.wrap)});
    vars.append(grid);s.append(vars);

    // Playground
    const play=el('div','sc-block');play.append(el('h3','sc-block__title','Песочница'));
    const state={...defaults(c)};let width=402;
    const controls=el('form','sc-controls');controls.onsubmit=e=>e.preventDefault();
    const f=frame(width,'Живой экземпляр');const update=c.mount(f.screen,state);
    c.props.forEach(p=>{
      const label=el('label','sc-field');const inputId=`${id}-${p.name}`;label.htmlFor=inputId;
      label.append(el('span','sc-field__name',p.name));
      const input=el('input');input.id=inputId;input.value=state[p.name];input.autocomplete='off';
      input.oninput=()=>{state[p.name]=input.value;update({...state})};
      label.append(input);controls.append(label);
    });
    const seg=el('div','sc-seg');seg.setAttribute('role','group');seg.setAttribute('aria-label','Ширина экрана');
    widths.forEach(w=>{const b=el('button','',`${w}`);b.type='button';b.setAttribute('aria-pressed',String(w===width));
      b.onclick=()=>{width=w;f.screen.style.width=`${w}px`;f.cap.querySelector('.sc-frame__size').textContent=`${w}px`;seg.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)))};seg.append(b)});
    const segWrap=el('div','sc-field');segWrap.append(el('span','sc-field__name','ширина'),seg);controls.append(segWrap);
    const stage=el('div','sc-stage');stage.append(f.wrap);
    play.append(controls,stage);s.append(play);
    return s;
  }
  const defaults=c=>Object.fromEntries(c.props.map(p=>[p.name,p.default]));
  const hex=color=>{const m=color.match(/\d+(\.\d+)?/g);if(!m)return color;const [r,g,b,a]=m.map(Number);if(a===0)return 'прозрачный';return '#'+[r,g,b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('').toUpperCase()};
  // Draws padding zones and a height ruler over the main instance, and lists measured values.
  function redline(f,c,list){
    const root=f.screen.firstElementChild;if(!root)return;
    const cs=getComputedStyle(root),box=root.getBoundingClientRect(),pl=parseFloat(cs.paddingLeft),pr=parseFloat(cs.paddingRight);
    const overlay=el('div','sc-redline');overlay.style.height=`${box.height}px`;
    for(const [side,w] of [['left',pl],['right',pr]])if(w){const z=el('div',`sc-redline__pad sc-redline__pad--${side}`);z.style.width=`${w}px`;z.append(el('span','',String(Math.round(w))));overlay.append(z)}
    f.screen.style.position='relative';f.screen.append(overlay);
    const ruler=el('div','sc-ruler');ruler.style.height=`${box.height}px`;ruler.append(el('span','',String(Math.round(box.height))));
    f.wrap.querySelector('.sc-frame__body').append(ruler);
    const rows=[['Размер',`${Math.round(box.width)} × ${Math.round(box.height)}`],['Отступы',`${Math.round(pl)} / ${Math.round(pr)}`],['Фон',hex(cs.backgroundColor)],...(c.spec||[]).map(s=>[s.label,s.value(root,{hex})])];
    rows.forEach(([k,v])=>{list.append(el('dt','',k),el('dd','',v))});
  }

  return{
    register(c){components.push(c)},
    start(){
      const root=document.getElementById('showcase');
      const nav=el('nav','sc-nav');nav.setAttribute('aria-label','Компоненты');
      nav.append(el('p','sc-nav__title','Компоненты'));
      const list=el('ul');components.forEach(c=>{const li=el('li');const a=el('a','',c.name);a.href=`#${c.name.toLowerCase()}`;li.append(a);list.append(li)});
      nav.append(list);
      const main=el('main','sc-main');components.forEach(c=>main.append(section(c)));
      root.append(nav,main);
    }
  };
})();
