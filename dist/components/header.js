// Header — shared top bar for every tab.
// Usage: const header=Header(document.querySelector('.header')); header.render({caption:'Вторник, 29 сентября',title:'Сегодня'});
function Header(root){
  root.classList.add('header');
  const text=document.createElement('div');text.className='header__text';
  // Caption below the title; hidden while empty.
  const caption=document.createElement('p');caption.className='header__caption';
  const title=document.createElement('h1');title.className='header__title';
  text.append(title,caption);
  root.replaceChildren(text);
  return{
    render({caption:over='',title:main=''}={}){caption.textContent=over;title.textContent=main}
  };
}
