// Header in the component showcase: its props, variants and playground defaults.
Showcase.register({
  name:'Header',
  description:'Шапка всех табов. Высота 50px, отступы 20px от краёв экрана, заголовок 20px semibold жёлтым. Над заголовком необязательный второй уровень caption (12px). Справа необязательное поле aside, например число задач.',
  files:['components/header.js','components/header.css'],
  usage:"const header=Header(document.querySelector('.header'));\nheader.render({caption:'Вторник, 29 сентября',title:'Сегодня',aside:'3'});",
  props:[
    {name:'caption',type:'string',description:'Второй уровень над заголовком, 12px. Пустая строка скрывает его.',default:''},
    {name:'title',type:'string',description:'Заголовок. Длинный обрезается многоточием.',default:'Remmi'},
    {name:'aside',type:'string',description:'Текст справа. Пустая строка скрывает поле.',default:''}
  ],
  // The main component shows every level filled in.
  main:{caption:'Вторник, 29 сентября',title:'Сегодня',aside:'3'},
  // Extra rows for the main component's spec, measured from the rendered instance.
  spec:[
    {label:'Caption',value:(root,{hex})=>{const cs=getComputedStyle(root.querySelector('.header__caption'));return `${cs.fontSize} · ${cs.fontWeight} · ${hex(cs.color)}`}},
    {label:'Заголовок',value:(root,{hex})=>{const cs=getComputedStyle(root.querySelector('.header__title'));return `${cs.fontSize} · ${cs.fontWeight} · ${hex(cs.color)}`}},
    {label:'Aside',value:(root,{hex})=>{const cs=getComputedStyle(root.querySelector('.header__aside'));return `${cs.fontSize} · ${hex(cs.color)}`}}
  ],
  variants:[
    {name:'Планы',props:{title:'Remmi'}},
    {name:'Календарь',props:{title:'Сегодня',aside:'3'}},
    {name:'С подзаголовком',props:{caption:'Вторник, 29 сентября',title:'Сегодня',aside:'3'}},
    {name:'Настройки',props:{title:'Настройки'}},
    {name:'Длинный заголовок',props:{title:'Покупки к выходным и подарки на день рождения',aside:'12'}}
  ],
  mount(el,props){
    const root=document.createElement('header');el.append(root);
    const header=Header(root);header.render(props);
    return next=>header.render(next);
  }
});
