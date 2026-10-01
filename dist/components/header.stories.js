// Header in the component showcase: its props, variants and playground defaults.
// Stand-in photo for the showcase: a tiny inline SVG, so nothing is fetched.
const photo='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#C9B8D6"/><circle cx="16" cy="13" r="6" fill="#fff"/><path d="M4 32c1-8 7-11 12-11s11 3 12 11z" fill="#fff"/></svg>');
Showcase.register({
  name:'Header',
  description:'Шапка всех табов. Высота 50px, отступы 20px от краёв экрана, заголовок 20px semibold чёрным. Над заголовком необязательный второй уровень caption (12px). Справа круглая аватарка 32px (включена по умолчанию): фото, инициалы или силуэт.',
  files:['components/header.js','components/header.css'],
  usage:"const header=Header(document.querySelector('.header'));\nheader.render({caption:'Вторник, 29 сентября',title:'Сегодня',\n  avatar:'https://…/me.jpg',avatarName:'Алекс'});",
  props:[
    {name:'caption',type:'string',description:'Второй уровень над заголовком, 12px. Пустая строка скрывает его.',default:''},
    {name:'title',type:'string',description:'Заголовок. Длинный обрезается многоточием.',default:'Remmi'},
    {name:'avatar',type:'string',description:'Адрес фото для аватарки. Если не загрузилось, показываются инициалы.',default:''},
    {name:'showAvatar',type:'boolean',description:'Показывать аватарку. По умолчанию включена.',default:true},
    {name:'avatarName',type:'string',description:'Имя для инициалов и подписи. Без фото и без имени показан нейтральный силуэт.',default:''}
  ],
  // The main component shows every level filled in.
  main:{caption:'Вторник, 29 сентября',title:'Сегодня',avatarName:'Алекс Харитонов'},
  // Extra rows for the main component's spec, measured from the rendered instance.
  spec:[
    {label:'Caption',value:(root,{hex})=>{const cs=getComputedStyle(root.querySelector('.header__caption'));return `${cs.fontSize} · ${cs.fontWeight} · ${hex(cs.color)}`}},
    {label:'Заголовок',value:(root,{hex})=>{const cs=getComputedStyle(root.querySelector('.header__title'));return `${cs.fontSize} · ${cs.fontWeight} · ${hex(cs.color)}`}},
    {label:'Аватарка',value:(root,{hex})=>{const a=root.querySelector('.header__avatar');if(a.hidden)return '—';const cs=getComputedStyle(a);return `${cs.width} · круг · ${hex(cs.backgroundColor)}`}}
  ],
  variants:[
    {name:'Планы',props:{title:'Remmi'}},
    {name:'Без аватарки',props:{title:'Remmi',showAvatar:false}},
    {name:'Календарь',props:{title:'Сегодня'}},
    {name:'С подзаголовком',props:{caption:'Вторник, 29 сентября',title:'Сегодня'}},
    {name:'Настройки',props:{title:'Настройки'}},
    {name:'С инициалами',props:{title:'Remmi',avatarName:'Алекс Харитонов'}},
    {name:'С фото',props:{title:'Remmi',avatar:photo}},
    {name:'Длинный заголовок',props:{title:'Покупки к выходным и подарки на день рождения',avatarName:'Алекс'}}
  ],
  mount(el,props){
    const root=document.createElement('header');el.append(root);
    const header=Header(root);header.render(props);
    return next=>header.render(next);
  }
});
