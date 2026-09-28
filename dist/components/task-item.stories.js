// TaskItem in the component showcase. Rows sit in a white card with the app's 20px side padding, as in the lists.
(()=>{
  const card=el=>{const c=document.createElement('div');c.style.cssText='margin:12px 20px;padding:2px;background:#fff;border-radius:24px';el.append(c);return c};
  Showcase.register({
    name:'TaskItem',
    description:'Строка задачи: круглый чекбокс, название и необязательная строка с датой или временем. Скругление 22px, при наведении подкрашивается. Несколько строк в карточке разделены линией с отступами 14px.',
    files:['components/task-item.js','components/task-item.css'],
    usage:"list.append(TaskItem({\n  title:'Позвонить в банк',meta:'10:00–10:30',done:false,\n  onToggle:()=>{/* отметить */},onOpen:()=>{/* открыть */}\n}));",
    props:[
      {name:'title',type:'string',description:'Название задачи. Длинное переносится.',default:'Купить хлеб'},
      {name:'meta',type:'string',description:'Строка под названием: дата, время, «Просрочено». Пустая скрывает её.',default:''},
      {name:'done',type:'boolean',description:'Выполнена: закрашенный чекбокс, зачёркнутое название.',default:false},
      {name:'onToggle',type:'function',description:'Нажатие на чекбокс.',default:null,control:false},
      {name:'onOpen',type:'function',description:'Нажатие на строку.',default:null,control:false}
    ],
    main:{title:'Позвонить в банк',meta:'10:00–10:30'},
    spec:[
      {label:'Название',value:(root,{hex})=>{const cs=getComputedStyle(root.querySelector('.task-item__title'));return `${cs.fontSize} · ${cs.fontWeight} · ${hex(cs.color)}`}},
      {label:'Мета',value:(root,{hex})=>{const m=root.querySelector('.task-item__meta');if(!m)return '—';const cs=getComputedStyle(m);return `${cs.fontSize} · ${hex(cs.color)}`}},
      {label:'Чекбокс',value:root=>{const cs=getComputedStyle(root.querySelector('.task-item__circle'));return `${cs.width} · обводка ${cs.borderTopWidth}`}},
      {label:'Скругление',value:root=>getComputedStyle(root).borderTopLeftRadius},
      {label:'Мин. высота',value:root=>getComputedStyle(root).minHeight}
    ],
    variants:[
      {name:'Без даты',props:{title:'Купить хлеб'}},
      {name:'Со временем',props:{title:'Позвонить в банк',meta:'10:00–10:30'}},
      {name:'С датой',props:{title:'Отпуск',meta:'8 ноября'}},
      {name:'Просроченная',props:{title:'Оплатить интернет',meta:'Просрочено · 27 сентября'}},
      {name:'Выполненная',props:{title:'Вынести мусор',meta:'09:00–09:30',done:true}},
      {name:'Длинное название',props:{title:'Записаться к стоматологу на осмотр и заодно спросить про отбеливание',meta:'Завтра · 18:00–18:30'}},
      {name:'Несколько в карточке',props:{items:[{title:'Позвонить в банк',meta:'10:00–10:30'},{title:'Купить хлеб'},{title:'Вынести мусор',done:true}]}}
    ],
    mount(el,props){
      const host=card(el);
      const draw=next=>{
        const items=next.items||[next];
        host.replaceChildren(...items.map((p,i)=>{const row=TaskItem({...p,onToggle:()=>{p.done=!p.done;draw(next)}});if(!next.items&&i===0)row.dataset.scRoot='';return row}));
      };
      draw(props);return draw;
    }
  });
})();
