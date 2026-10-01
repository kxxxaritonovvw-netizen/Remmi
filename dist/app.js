const $=id=>document.getElementById(id);
const day=(offset=0)=>{const d=new Date();d.setDate(d.getDate()+offset);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const labels={all:'Планы',today:'Сегодня',settings:'Настройки'};
const navLabels={all:'Планы',today:'Календарь',settings:'Настройки'};
const navIcons={all:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.2"/><circle cx="4.5" cy="12" r="1.2"/><circle cx="4.5" cy="18" r="1.2"/></svg>',today:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="3.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><circle cx="12" cy="15" r="1.4"/></svg>',settings:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><path d="M15 12a3 3 0 1 1-6 0a3 3 0 1 1 6 0z"/></svg>'};
let view='today',showDone=false,editing=null;
const header=Header($('header'));
let tasks=[];
// Tasks and settings persist in this browser's localStorage; storage can be missing or blocked, so every access is guarded.
const STORE='remmi:v1';
function loadState(){try{const data=JSON.parse(localStorage.getItem(STORE)||'null');if(!data)return null;return{tasks:Array.isArray(data.tasks)?data.tasks.filter(t=>t&&typeof t.id==='string'&&typeof t.title==='string'):[],settings:data.settings&&typeof data.settings==='object'?data.settings:{}}}catch{return null}}
function saveState(){try{localStorage.setItem(STORE,JSON.stringify({tasks,settings}))}catch{}}
const saved=loadState();if(saved)tasks=saved.tasks;
const matches=t=>view==='all'||(view==='today'&&t.date&&t.date===day());
function formatDate(d){return new Date(d+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'long',...(d.slice(0,4)!==day().slice(0,4)?{year:'numeric'}:{})})}
function dateName(d){return d===day()?'Сегодня':d===day(1)?'Завтра':formatDate(d)}
const rowCache=new Map();
// context: 'day' inside a single-day section (time only), 'overdue' under Просрочено (no repeated label).
function row(t,context=''){const sig=[t.title,t.done,t.date,t.time,t.duration,day(),context].join('\u0001'),hit=rowCache.get(t.id);if(hit?.sig===sig)return hit.el;const time=t.time?`${t.time}–${clockLabel(timeMinutes(t.time)+taskDuration(t))}`:'';const meta=context==='day'?time:t.date?[(t.date<day()&&context!=='overdue'?'Просрочено · ':'')+dateName(t.date),time].filter(Boolean).join(' · '):context?'':'Без даты';const el=TaskItem({title:t.title,meta,done:t.done,onToggle:()=>{t.done=!t.done;render()},onOpen:()=>openEditor(t)});rowCache.set(t.id,{sig,el});return el}
function addRow(date){const el=document.createElement('button');el.type='button';el.className='task add-task';el.innerHTML='<span class="check" aria-hidden="true"><span class="add-circle"><svg viewBox="0 0 12 12"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></span></span>Добавить задачу';el.onclick=()=>openEditor(null,date);return el}
const navButtons=Object.keys(labels).map(key=>{const b=document.createElement('button');b.innerHTML=navIcons[key];const cap=document.createElement('span');cap.textContent=navLabels[key];b.append(cap);b.dataset.view=key;b.onclick=()=>{composing=null;view=key;render()};$('navigation').append(b);return b});
function render(){saveState();document.querySelector(".app").dataset.view=view;for(const b of navButtons){const on=b.dataset.view===view;b.setAttribute('aria-pressed',String(on));if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')}const active=tasks.filter(t=>matches(t)&&!t.done).sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')||(a.time||'99').localeCompare(b.time||'99'));header.render({title:view==='all'?'Remmi':labels[view],aside:view==='today'?String(active.length):''});$('tasks').replaceChildren();if(view==='settings'){renderSettings()}else if(view==='today'){renderTimeline(active)}else renderPlans(active);const done=tasks.filter(t=>matches(t)&&t.done);$('completedToggle').hidden=!done.length||view==='today';$('completedToggle').textContent=`${showDone?'−':'+'} Завершённые · ${done.length}`;$('completed').replaceChildren(...(showDone&&view!=='today'?done.map(row):[]))}
function renderPlans(active){
  // Timeline of sections like Apple Reminders' Scheduled list: days of the coming week, the rest of the month, months, years.
  const today=day(),iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const cap=text=>text[0].toUpperCase()+text.slice(1),at=(y,m,d)=>new Date(y,m,d,12);
  const sections=[{title:'Просрочено',test:t=>t.date&&t.date<today,hideEmpty:true,context:'overdue'}];
  for(let i=0;i<7;i++){const d=day(i),date=new Date(d+'T12:00:00');sections.push({title:i===0?'Сегодня':i===1?'Завтра':cap(date.toLocaleDateString('ru-RU',{weekday:'long'})),from:d,to:d,add:d,context:'day',today:i===0})}
  const next=new Date(day(7)+'T12:00:00'),year=next.getFullYear();
  for(let m=next.getMonth();m<12;m++){const first=m===next.getMonth()?next:at(year,m,1),month=at(year,m,1).toLocaleDateString('ru-RU',{month:'long'});
    sections.push({title:first.getDate()===1?cap(month):'Остаток '+first.toLocaleDateString('ru-RU',{day:'numeric',month:'long'}).replace(/^\d+\s/,''),from:iso(first),to:iso(at(year,m+1,0)),add:iso(first)})}
  const later=new Set(active.filter(t=>t.date&&+t.date.slice(0,4)>year+1).map(t=>+t.date.slice(0,4)));
  for(const y of [year+1,...[...later].sort()])sections.push({title:String(y),from:`${y}-01-01`,to:`${y}-12-31`,add:`${y}-01-01`});
  sections.push({title:'Без даты',test:t=>!t.date,add:'',context:'none'});
  for(const section of sections){
    const items=active.filter(section.test||(t=>t.date&&t.date>=section.from&&t.date<=section.to));
    if(!items.length&&section.hideEmpty)continue;
    // Tapping a heading opens an inline composer under it (no modal); Просрочено has no date to add to.
    const key=section.add===undefined?null:section.add||'none',open=key!==null&&composing===key;
    const h=document.createElement('h2');h.className='group'+(section.today?' group-today':'');
    const label=document.createElement(key===null?'span':'button');label.className='group-label';label.textContent=section.title;
    if(key!==null){label.type='button';label.setAttribute('aria-expanded',String(open));label.onclick=()=>openComposer(key)}
    h.append(label);$('tasks').append(h);
    if(!items.length&&!open)continue;
    const card=document.createElement('div');card.className='task-group';
    if(open)card.append(composer(section));
    card.append(...items.map(t=>row(t,section.context)));$('tasks').append(card)}
}
let composing=null;
function composer(section){
  const el=document.createElement('form');el.className='task composer';el.dataset.date=section.add;
  el.innerHTML='<span class="check" aria-hidden="true"><span class="circle"></span></span><div class="composer-body"><input class="composer-title" placeholder="Новая задача" maxlength="250" enterkeyhint="done" aria-label="Название задачи"><div class="composer-meta"><input class="composer-date" type="date" aria-label="Дата"><input class="composer-time" type="time" aria-label="Время"></div></div>';
  const date=el.querySelector('.composer-date'),time=el.querySelector('.composer-time');
  if(section.context==='day')date.hidden=true;else date.value=section.add;
  const syncTime=()=>{time.disabled=!(date.hidden||date.value);if(time.disabled)time.value=''};date.oninput=date.onchange=syncTime;syncTime();
  el.onsubmit=event=>{event.preventDefault();commitComposer(true)};
  el.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();closeComposer(false)}});
  return el;
}
function focusComposer(){document.querySelector('.composer-title')?.focus({preventScroll:true})}
function openComposer(key){
  if(composing===key){focusComposer();return}
  // Switching sections closes the old composer instantly; only the new one animates.
  commitComposer(false,true);composing=key;render();
  // Focus in the same tap, so mobile keyboards open.
  focusComposer();dropIn(document.querySelector('.composer'));
}
// The composer drops out from under its heading and folds back under it on close: height runs to/from zero
// (so sections below slide), while the content slides vertically. A card holding only the composer animates
// whole; a composer row inside a card with tasks animates alone.
const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function foldComposer(form,opening,done){
  const card=form.parentElement,target=card.children.length===1?card:form,cs=getComputedStyle(target),h=target.offsetHeight;
  const duration=opening?420:320,easing=opening?'cubic-bezier(.32,.72,0,1)':'cubic-bezier(.4,0,.2,1)';
  const shut={height:'0px'},full={height:`${h}px`};
  for(const k of ['marginTop','marginBottom','paddingTop','paddingBottom','minHeight']){shut[k]='0px';full[k]=cs[k]}
  const hidden={transform:`translateY(${-Math.round(h*.6)}px)`,opacity:0},shown={transform:'none',opacity:1};
  target.style.overflow='hidden';
  const fold=target.animate(opening?[shut,full]:[full,shut],{duration,easing,fill:opening?'none':'forwards'});
  form.animate(opening?[hidden,shown]:[shown,hidden],{duration,easing,fill:opening?'none':'forwards'});
  // Animation events can be skipped in a background tab, so a timer backs up the finish handler.
  let settled=false;const settle=()=>{if(settled)return;settled=true;if(opening)target.style.overflow='';done?.()};
  fold.onfinish=fold.oncancel=settle;setTimeout(settle,duration+80);
}
function dropIn(form){
  if(!form||reducedMotion())return;
  foldComposer(form,true,()=>{if(form.isConnected)form.scrollIntoView({block:'nearest'})});
}
// Close without a new task: fold the composer away, then redraw. With a typed title the task takes its place at once.
function closeComposer(save,instant=false){
  const el=document.querySelector('.composer');composing=null;
  if(!el){render();return}
  if(el.dataset.closing)return;
  if(save&&el.querySelector('.composer-title').value.trim()){addFromComposer(el);render();return}
  if(instant||reducedMotion()){render();return}
  el.dataset.closing='1';el.querySelector('.composer-title').blur();
  foldComposer(el,false,()=>{if(el.isConnected)render()});
}
function addFromComposer(el){
  const title=el.querySelector('.composer-title').value.trim(),date=el.querySelector('.composer-date').hidden?el.dataset.date:el.querySelector('.composer-date').value,time=date?el.querySelector('.composer-time').value:'';
  if(title)tasks.push({id:(crypto.randomUUID?.()||String(Date.now()+Math.random())),done:false,title,date,time,duration:30});
  return title;
}
function commitComposer(keepOpen,instant=false){
  if(!keepOpen){closeComposer(true,instant);return}
  const el=document.querySelector('.composer');if(!el)return;
  if(addFromComposer(el))render();
  focusComposer();
}
// A tap anywhere outside the composer saves what was typed and closes it.
document.addEventListener('pointerdown',event=>{if(composing!==null&&!event.target.closest('.composer,.group-label'))commitComposer(false)},true);
function openEditor(t,preset){editing=t?.id||null;$('editorTitle').textContent=t?'Задача':'Новая задача';$('title').value=t?.title||'';$('date').value=t?.date||(t?'':preset??(view==='today'?day():''));$('time').value=t?.time||'';$('time').disabled=!$('date').value;$('delete').hidden=!t;$('completeEdit').hidden=!t;$('completeEdit').textContent=t?.done?'Вернуть в планы':'Отметить выполненной';$('endTime').value=t?.time?clockLabel(timeMinutes(t.time)+taskDuration(t)):'';syncEndTime();$('editor').showModal();setTimeout(()=>$('title').focus({preventScroll:true}),0)}
$('cancel').onclick=()=>$('editor').close();$('completedToggle').onclick=()=>{showDone=!showDone;render()};$('date').onchange=()=>{$('time').disabled=!$('date').value;if(!$('date').value)$('time').value=''};
document.querySelectorAll('[data-offset]').forEach(b=>b.onclick=()=>{$('date').value=day(Number(b.dataset.offset));$('time').disabled=false});$('clearDate').onclick=()=>{$('date').value='';$('time').value='';$('time').disabled=true};
$('form').onsubmit=e=>{e.preventDefault();syncEndTime();const title=$('title').value.trim();if(!title){$('title').setCustomValidity('Введите название задачи');$('title').reportValidity();return}const data={title,date:$('date').value,time:$('date').value?$('time').value:'',duration:$('date').value&&$('time').value?((timeMinutes($('endTime').value)-timeMinutes($('time').value)+1440)%1440||1440):30};if(editing)Object.assign(tasks.find(t=>t.id===editing),data);else tasks.push({id:(crypto.randomUUID?.()||Array.from(crypto.getRandomValues(new Uint8Array(16)),v=>v.toString(16).padStart(2,"0")).join("")),done:false,...data});$('editor').close();if(!matches({...data}))view='all';render()};$('title').oninput=()=>$('title').setCustomValidity('');$('delete').onclick=()=>{rowCache.delete(editing);tasks=tasks.filter(t=>t.id!==editing);$('editor').close();render()};$('timezone').textContent='Часовой пояс: '+Intl.DateTimeFormat().resolvedOptions().timeZone;
if(document.modelContext?.registerTool){try{document.modelContext.registerTool({name:'open_task_editor',description:'Открыть форму новой задачи в прототипе, без сохранения.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false},execute(input){if(!input||typeof input!=='object'||Object.keys(input).length)throw new Error('Ожидается пустой объект');openEditor();return{opened:true}}})}catch{}}

const timeMinutes=value=>{const [h,m]=value.split(':').map(Number);return h*60+m};
const clockLabel=minutes=>`${String(Math.floor(minutes/60)%24).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;
const taskDuration=t=>t.duration||30;
function renderTimeline(active){
  const untimed=active.filter(t=>!t.time);
  {const section=document.createElement('section');section.className='day-unscheduled';const title=document.createElement('h2');title.textContent='Без времени';const list=document.createElement('div');list.className='task-group';list.append(...untimed.map(row),addRow(day()));section.append(title,list);$('tasks').append(section)}
  const scroll=document.createElement('div');scroll.className='timeline-scroll';scroll.tabIndex=0;scroll.setAttribute('aria-label','Расписание на сегодня, 00:00–24:00');
  const canvas=document.createElement('div');canvas.className='timeline';
  for(let h=0;h<=24;h++){const line=document.createElement('div');line.className='hour-line';line.style.top=`${h*96}px`;if(h===24){line.style.height='0';line.classList.add('last-hour')}const label=document.createElement('span');label.className='hour-label';label.textContent=`${String(h).padStart(2,'0')}:00`;line.append(label);canvas.append(line)}
  const entries=tasks.filter(t=>!t.done&&t.time&&(t.date===day()||(t.date===day(-1)&&timeMinutes(t.time)+taskDuration(t)>1440))).map(t=>{const rawStart=timeMinutes(t.time)+(t.date===day(-1)?-1440:0);return{t,start:Math.max(0,rawStart),end:Math.min(1440,rawStart+taskDuration(t))}}).sort((a,b)=>a.start-b.start||a.end-b.end);
  let cluster=[],clusterEnd=-1;
  function placeCluster(){const laneEnds=[];for(const e of cluster){let lane=laneEnds.findIndex(end=>end<=e.start);if(lane<0)lane=laneEnds.length;laneEnds[lane]=e.end;e.lane=lane}for(const e of cluster){const button=document.createElement('button');button.className='calendar-event'+(e.end-e.start<30?' short':'');button.style.top=`${e.start*1.6}px`;button.style.height=`${Math.max(1,(e.end-e.start)*1.6-2)}px`;button.style.left=`calc(${e.lane/laneEnds.length*100}% + 4px)`;button.style.width=`calc(${100/laneEnds.length}% - 8px)`;const title=document.createElement('strong');title.textContent=e.t.title;const time=document.createElement('small');time.textContent=`${e.t.time}–${clockLabel(timeMinutes(e.t.time)+taskDuration(e.t))}`;button.title=`${e.t.title}, ${time.textContent}`;button.setAttribute('aria-label',button.title);button.append(title,time);for(const edge of ['top','bottom']){const h=document.createElement('span');h.className=`resize-handle ${edge}`;h.setAttribute('aria-hidden','true');button.append(h)}bindCalendarDrag(button,e,scroll,canvas);canvas.append(button)}cluster=[]}
  for(const e of entries){if(cluster.length&&e.start>=clusterEnd){placeCluster();clusterEnd=-1}cluster.push(e);clusterEnd=Math.max(clusterEnd,e.end)}if(cluster.length)placeCluster();
  const now=new Date();const marker=document.createElement('div');marker.className='current-time';marker.style.top=`${(now.getHours()*60+now.getMinutes())*1.6}px`;canvas.append(marker);scroll.append(canvas);$('tasks').append(scroll);bindCalendarCreate(scroll,canvas);

  requestAnimationFrame(()=>{scroll.scrollTop=Math.max(0,((entries[0]?.start??now.getHours()*60)-60)*1.6)});
}
function bindCalendarDrag(button,entry,scroll,canvas){
  const task=entry.t,pixelsPerMinute=1.6;
  let drag=null,suppressClick=false;
  button.onclick=()=>{if(!suppressClick)openEditor(task)};
  button.addEventListener('contextmenu',event=>event.preventDefault());
  button.addEventListener('pointerdown',event=>{
    if(event.button!==0||!event.isPrimary||drag)return;
    const rawStart=timeMinutes(task.time)+(task.date===day(-1)?-1440:0);
    const rawEnd=rawStart+taskDuration(task),mode=event.target.closest('.resize-handle.top')?'top':event.target.closest('.resize-handle.bottom')?'bottom':'move';
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,lastY:event.clientY,scroll:scroll.scrollTop,rawStart,rawEnd,start:rawStart,end:rawEnd,mode,active:false,frame:0};
    suppressClick=false;
    button.setPointerCapture(event.pointerId);
    if(event.pointerType!=='mouse')drag.timer=setTimeout(activate,280);
  });
  function activate(){
    if(!drag||drag.active)return;
    drag.active=true;suppressClick=true;
    clearTimeout(drag.timer);
    const ghost=document.createElement('div');
    ghost.className='calendar-origin';ghost.setAttribute('aria-hidden','true');
    for(const key of ['top','height','left','width'])ghost.style[key]=button.style[key];
    canvas.append(ghost);drag.ghost=ghost;
    button.classList.add('dragging',drag.mode==='move'?'moving':'resizing');scroll.classList.add('is-dragging');
    drag.frame=requestAnimationFrame(tick);
  }
  function update(){
    const delta=(drag.lastY-drag.y+scroll.scrollTop-drag.scroll)/pixelsPerMinute;
    const snap=value=>Math.round(value/5)*5;
    if(drag.mode==='move'){drag.start=Math.max(Math.min(0,drag.rawStart),Math.min(1435,snap(drag.rawStart+delta)));drag.end=drag.start+(drag.rawEnd-drag.rawStart)}
    else if(drag.mode==='top')drag.start=Math.max(Math.min(0,drag.rawStart),Math.min(drag.rawEnd-15,snap(drag.rawStart+delta)));
    else drag.end=Math.min(1440,Math.max(drag.rawStart+15,snap(drag.rawEnd+delta)));
    if(drag.start===drag.shownStart&&drag.end===drag.shownEnd)return;
    drag.shownStart=drag.start;drag.shownEnd=drag.end;
    const visibleStart=Math.max(0,drag.start),visibleEnd=Math.min(1440,drag.end);
    button.style.top=`${visibleStart*pixelsPerMinute}px`;
    button.style.height=`${Math.max(1,(visibleEnd-visibleStart)*pixelsPerMinute-2)}px`;
    button.querySelector('small').textContent=`${clockLabel((drag.start+1440)%1440)}–${clockLabel((drag.end+1440)%1440)}`;
  }
  function tick(){
    if(!drag?.active)return;
    const box=scroll.getBoundingClientRect(),edge=48;
    const speed=drag.lastY<box.top+edge?-Math.min(10,(box.top+edge-drag.lastY)/5):drag.lastY>box.bottom-edge?Math.min(10,(drag.lastY-box.bottom+edge)/5):0;
    scroll.scrollTop+=speed;update();drag.frame=requestAnimationFrame(tick);
  }
  button.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.id)return;
    drag.lastY=event.clientY;
    if(!drag.active&&event.pointerType==='mouse'&&Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>5)activate();
    if(drag.active)event.preventDefault();
  });
  function finish(commit){
    if(!drag)return;
    const state=drag;drag=null;
    clearTimeout(state.timer);cancelAnimationFrame(state.frame);
    state.ghost?.remove();button.classList.remove('dragging','moving','resizing');scroll.classList.remove('is-dragging');
    if(button.hasPointerCapture(state.id))button.releasePointerCapture(state.id);
    if(!state.active)return;
    if(commit){task.date=day(state.start<0?-1:0);task.time=clockLabel((state.start+1440)%1440);task.duration=state.end-state.start}
    const position=scroll.scrollTop;
    render();requestAnimationFrame(()=>{const next=document.querySelector('.timeline-scroll');if(next)next.scrollTop=position});
  }
  button.addEventListener('pointerup',event=>{if(drag?.id===event.pointerId){if(drag.active){drag.lastY=event.clientY;update()}finish(true)}});
  button.addEventListener('pointercancel',()=>finish(false));
  button.addEventListener('lostpointercapture',()=>finish(false));
  button.addEventListener('keydown',event=>{if(event.key==='Escape'&&drag){event.preventDefault();finish(false)}});
}
function bindCalendarCreate(scroll,canvas){
  // Tap an empty slot for a 30-minute event; with a mouse, drag to set its length.
  const pixelsPerMinute=1.6,minuteAt=y=>(y-canvas.getBoundingClientRect().top)/pixelsPerMinute;
  let press=null;
  canvas.addEventListener('pointerdown',event=>{
    if(event.button!==0||!event.isPrimary||event.target.closest('.calendar-event'))return;
    const start=Math.max(0,Math.min(1425,Math.floor(minuteAt(event.clientY)/15)*15));
    press={id:event.pointerId,x:event.clientX,y:event.clientY,start,end:start+30,dragging:false};
  });
  canvas.addEventListener('pointermove',event=>{
    if(!press||event.pointerId!==press.id)return;
    if(!press.dragging&&event.pointerType==='mouse'&&Math.abs(event.clientY-press.y)>5){press.dragging=true;canvas.setPointerCapture(event.pointerId);press.draft=draft(press)}
    if(press.dragging){const end=Math.min(1440,Math.max(press.start+15,Math.ceil(minuteAt(event.clientY)/15)*15));if(end!==press.end){press.end=end;place(press.draft,press)}}
  });
  canvas.addEventListener('pointerup',event=>{
    if(!press||event.pointerId!==press.id)return;
    const state=press;press=null;
    if(!state.dragging&&Math.hypot(event.clientX-state.x,event.clientY-state.y)>8)return;
    const block=state.draft||draft(state);
    openEditor(null,day());$('time').value=clockLabel(state.start);$('time').disabled=false;$('endTime').value=clockLabel(state.end%1440);syncEndTime();
    $('editor').addEventListener('close',()=>block.remove(),{once:true});
  });
  canvas.addEventListener('pointercancel',()=>{press?.draft?.remove();press=null});
  function draft(state){const block=document.createElement('div');block.className='calendar-event calendar-draft';block.setAttribute('aria-hidden','true');block.innerHTML='<strong>Новое событие</strong><small></small>';canvas.append(block);place(block,state);return block}
  function place(block,state){block.style.top=`${state.start*pixelsPerMinute}px`;block.style.height=`${(state.end-state.start)*pixelsPerMinute-2}px`;block.style.left='4px';block.style.width='calc(100% - 8px)';block.querySelector('small').textContent=`${clockLabel(state.start)}–${clockLabel(state.end%1440)}`}
}
const settings={reminders:true,digest:true,...(saved?.settings||{})};
function renderSettings(){
  // Prototype settings: switches work in memory, the rest is informational.
  const group=(title,rows)=>{const h=document.createElement('h2');h.className='group';h.textContent=title;const card=document.createElement('div');card.className='task-group settings-card';card.append(...rows);$('tasks').append(h,card)};
  const toggle=(key,label,hint)=>{const row=document.createElement('label');row.className='setting';row.innerHTML=`<span><span class="setting-name"></span>${hint?'<span class="setting-hint"></span>':''}</span><input type="checkbox" role="switch" class="switch" id="setting-${key}">`;row.querySelector('.setting-name').textContent=label;if(hint)row.querySelector('.setting-hint').textContent=hint;const input=row.querySelector('input');input.checked=settings[key];input.onchange=()=>{settings[key]=input.checked;saveState()};return row};
  const info=(label,value)=>{const row=document.createElement('div');row.className='setting';const name=document.createElement('span');name.className='setting-name';name.textContent=label;const val=document.createElement('span');val.className='setting-value';val.textContent=value;row.append(name,val);return row};
  group('Уведомления',[toggle('reminders','Напоминания','В назначенное время'),toggle('digest','Сводка на день','Каждый день в 10:00')]);
  group('Задачи',[info('Длительность по умолчанию','30 мин'),info('Часовой пояс',Intl.DateTimeFormat().resolvedOptions().timeZone)]);
}
function syncEndTime(){const enabled=Boolean($('date').value&&$('time').value);$('endTime').disabled=!enabled;if(!enabled){$('endTime').value='';$('endNote').textContent='';return}if(!$('endTime').value)$('endTime').value=clockLabel(timeMinutes($('time').value)+30);$('endNote').textContent=timeMinutes($('endTime').value)<=timeMinutes($('time').value)?'Окончание на следующий день':''}

$('time').addEventListener('change',()=>{$('endTime').value='';syncEndTime()});
$('endTime').addEventListener('change',syncEndTime);
$('date').addEventListener('change',syncEndTime);
$('clearDate').addEventListener('click',syncEndTime);
document.querySelectorAll('[data-offset]').forEach(b=>b.addEventListener('click',syncEndTime));
$('completeEdit').onclick=()=>{const t=tasks.find(t=>t.id===editing);if(t)t.done=!t.done;$('editor').close();render()};
render();
(function clock(){const marker=document.querySelector(".current-time");if(marker){const now=new Date();marker.style.top=`${(now.getHours()*60+now.getMinutes())*1.6}px`}setTimeout(clock,60000-Date.now()%60000+20)})();
{// Scroll reveal: blocks near the bottom edge are smaller and lower, and settle into place as they scroll up.
// Reads all positions first and writes afterwards, so a frame costs one layout however many blocks there are.
const main=document.querySelector('main'),motion=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,list=[];
const shifts=new WeakMap();
function reveal(){frame=0;const box=main.getBoundingClientRect(),zone=Math.min(360,box.height*.5);
  // Fade the effect out near the end of the list, so the last blocks can fully settle.
  const settle=Math.min(1,Math.max(0,(main.scrollHeight-main.scrollTop-main.clientHeight)/zone));
  const tops=motion.matches?null:list.map(el=>el.getBoundingClientRect().top-(shifts.get(el)||0));
  list.forEach((el,i)=>{let e=1;if(tops){const p=Math.min(1,Math.max(0,(box.bottom-tops[i])/zone));e=1-(1-p*p*(3-2*p))*settle}
    const shift=(1-e)*40;if(shifts.get(el)===shift)return;shifts.set(el,shift);
    el.style.transform=e<1?`translateY(${shift}px) scale(${.88+.12*e})`:'';el.style.opacity=e<1?.35+.65*e:'';el.style.willChange=e<1?'transform,opacity':''})}
const queue=()=>{if(!frame)frame=requestAnimationFrame(reveal)};
const collect=()=>{list=[...main.querySelectorAll('#tasks>.group,#tasks>.task-group,#completedToggle,#completed>.task-item')];queue()};
main.addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue);motion.addEventListener?.('change',queue);
new MutationObserver(collect).observe(main,{childList:true,subtree:true});collect()}
{const f=document.querySelector('footer'),a=document.querySelector('.app');new ResizeObserver(()=>a.style.setProperty('--footer-h',`${f.offsetHeight-24}px`)).observe(f)}
{// Play the exit animation before a dialog actually closes (Отмена, Готово, Esc).
const motion=matchMedia('(prefers-reduced-motion: reduce)');
for(const dialog of document.querySelectorAll('dialog')){
  const close=HTMLDialogElement.prototype.close,show=HTMLDialogElement.prototype.showModal;
  // The page behind a sheet recedes slightly, like iOS card sheets.
  // Reopening mid-exit first completes the pending close, otherwise the page stays receded.
  dialog.showModal=function(){this.finishClose?.();document.documentElement.classList.add('sheet-open','sheet-busy');this.openedAt=performance.now();return show.call(this)};
  dialog.close=function(value){
    if(!this.open||this.classList.contains('closing'))return;
    if(motion.matches){document.documentElement.classList.remove('sheet-open','sheet-busy');return close.call(this,value)}
    this.classList.add('closing');
    let done=false;const finish=this.finishClose=()=>{if(done)return;done=true;this.finishClose=null;this.classList.remove('closing');document.documentElement.classList.remove('sheet-busy');close.call(this,value)};
    this.addEventListener('animationend',event=>{if(event.target===this)finish()},{once:true});
    document.documentElement.classList.remove('sheet-open');
    setTimeout(finish,450);
  };
  dialog.addEventListener('cancel',event=>{event.preventDefault();dialog.close()});
}
document.addEventListener('keydown',event=>{const open=document.querySelector('dialog[open]');if(event.key==='Escape'&&open){event.preventDefault();open.close()}});
document.addEventListener('click',event=>{
  const open=document.querySelector('dialog[open]');
  if(!open||performance.now()-(open.openedAt||0)<350)return;
  const box=open.getBoundingClientRect();
  const outside=event.target===open?(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom):!open.contains(event.target);
  if(outside){event.preventDefault();event.stopPropagation();open.close()}
},true);
}
