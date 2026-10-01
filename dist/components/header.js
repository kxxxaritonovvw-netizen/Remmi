// Header — shared top bar for every tab.
// Usage: const header=Header(document.querySelector('.header')); header.render({caption:'Вторник, 29 сентября',title:'Сегодня',avatar:'https://…/me.jpg',avatarName:'Алекс'});
// Without a photo or name the avatar shows a neutral silhouette; showAvatar:false hides it.
function Header(root){
  root.classList.add('header');
  const text=document.createElement('div');text.className='header__text';
  // Second-level heading above the title; hidden while empty.
  const caption=document.createElement('p');caption.className='header__caption';
  const title=document.createElement('h1');title.className='header__title';
  text.append(caption,title);
  // Round avatar at the far right: a photo, or initials from avatarName when there is no photo (or it fails to load).
  const avatar=document.createElement('span');avatar.className='header__avatar';
  root.replaceChildren(text,avatar);
  const initials=name=>name.trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();
  return{
    render({caption:over='',title:main='',avatar:src='',avatarName:name='',showAvatar=true}={}){
      caption.textContent=over;title.textContent=main;
      const person='<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="12.5" r="5"/><path d="M6 28c.8-6 5-8.5 10-8.5s9.2 2.5 10 8.5z"/></svg>';
      const letters=()=>{if(name.trim())avatar.replaceChildren(initials(name));else avatar.innerHTML=person};
      avatar.hidden=!showAvatar;avatar.setAttribute('role','img');avatar.setAttribute('aria-label',name||'Профиль');
      if(src){const img=document.createElement('img');img.alt='';img.src=src;img.onerror=letters;avatar.replaceChildren(img)}else letters();
    }
  };
}
