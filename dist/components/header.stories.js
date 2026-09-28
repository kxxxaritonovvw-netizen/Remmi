// Header in the component showcase: its props, variants and playground defaults.
Showcase.register({
  name:'Header',
  description:'Шапка всех табов. Высота 50px, отступы 20px от краёв экрана, заголовок 20px semibold бордовым. Справа необязательное поле aside, например число задач.',
  files:['components/header.js','components/header.css'],
  usage:"const header=Header(document.querySelector('.header'));\nheader.render({title:'Сегодня',aside:'3'});",
  props:[
    {name:'title',type:'string',description:'Заголовок. Длинный обрезается многоточием.',default:'Remmi'},
    {name:'aside',type:'string',description:'Текст справа. Пустая строка скрывает поле.',default:''}
  ],
  // Extra rows for the main component's spec, measured from the rendered instance.
  spec:[
    {label:'Заголовок',value:(root,{hex})=>{const cs=getComputedStyle(root.querySelector('.header__title'));return `${cs.fontSize} · ${cs.fontWeight} · ${hex(cs.color)}`}},
    {label:'Aside',value:(root,{hex})=>{const cs=getComputedStyle(root.querySelector('.header__aside'));return `${cs.fontSize} · ${hex(cs.color)}`}}
  ],
  variants:[
    {name:'Планы',props:{title:'Remmi'}},
    {name:'Календарь',props:{title:'Сегодня',aside:'3'}},
    {name:'Настройки',props:{title:'Настройки'}},
    {name:'Длинный заголовок',props:{title:'Покупки к выходным и подарки на день рождения',aside:'12'}}
  ],
  mount(el,props){
    const root=document.createElement('header');el.append(root);
    const header=Header(root);header.render(props);
    return next=>header.render(next);
  }
});
