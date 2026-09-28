// TaskItem — one task row: round checkbox, title and an optional meta line (date, time).
// Usage: list.append(TaskItem({title:'Купить хлеб',meta:'10:00–10:30',done:false,onToggle,onOpen}));
function TaskItem({title='',meta='',done=false,onToggle,onOpen}={}){
  const root=document.createElement('div');root.className='task-item'+(done?' task-item--done':'');
  const check=document.createElement('button');check.type='button';check.className='task-item__check';
  check.setAttribute('aria-label',(done?'Вернуть задачу: ':'Завершить задачу: ')+title);check.setAttribute('aria-pressed',String(done));
  check.innerHTML='<span class="task-item__circle"></span>';
  if(onToggle)check.onclick=onToggle;
  const body=document.createElement('button');body.type='button';body.className='task-item__body';
  const name=document.createElement('span');name.className='task-item__title';name.textContent=title;body.append(name);
  if(meta){const line=document.createElement('span');line.className='task-item__meta';line.textContent=meta;body.append(line)}
  if(onOpen)body.onclick=onOpen;
  root.append(check,body);
  return root;
}
