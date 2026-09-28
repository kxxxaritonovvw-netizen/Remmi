// Header — shared top bar for every tab.
// Usage: const header=Header(document.querySelector('.header')); header.render({title:'Remmi',aside:'3'});
function Header(root){
  root.classList.add('header');
  const title=document.createElement('h1');title.className='header__title';
  const aside=document.createElement('span');aside.className='header__aside';
  root.replaceChildren(title,aside);
  return{
    render({title:text='',aside:extra=''}={}){title.textContent=text;aside.textContent=extra}
  };
}
