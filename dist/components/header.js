// Header — shared top bar for every tab.
// Usage: const header=Header(document.querySelector('.header')); header.render({caption:'Вторник, 29 сентября',title:'Сегодня',aside:'3'});
function Header(root){
  root.classList.add('header');
  const text=document.createElement('div');text.className='header__text';
  // Second-level heading above the title; hidden while empty.
  const caption=document.createElement('p');caption.className='header__caption';
  const title=document.createElement('h1');title.className='header__title';
  text.append(caption,title);
  const aside=document.createElement('span');aside.className='header__aside';
  root.replaceChildren(text,aside);
  return{
    render({caption:over='',title:main='',aside:extra=''}={}){caption.textContent=over;title.textContent=main;aside.textContent=extra}
  };
}
