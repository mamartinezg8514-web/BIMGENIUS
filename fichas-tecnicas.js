(async () => {
  const includes = Array.from(document.querySelectorAll('[data-include]'));
  await Promise.all(includes.map(async (el) => {
    const src = el.getAttribute('data-include');
    const res = await fetch(src);
    const html = await res.text();
    el.outerHTML = html;
  }));

  const modal = document.getElementById('modal-ficha');
  const modalImg = modal ? modal.querySelector('.modal-ficha__img') : null;

  const openModal = (src, alt) => {
    if (!modal || !modalImg) return;
    modalImg.src = src;
    modalImg.alt = alt || 'Ficha tecnica';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-ficha-open');
  };

  const closeModal = () => {
    if (!modal || !modalImg) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modalImg.src = '';
    document.body.classList.remove('modal-ficha-open');
  };

  document.addEventListener('click', (event) => {
    const fichaBtn = event.target.closest('.boton-ficha[data-ficha-img]');
    if (fichaBtn) {
      event.preventDefault();
      openModal(fichaBtn.dataset.fichaImg, fichaBtn.dataset.fichaAlt);
      return;
    }

    if (event.target.closest('[data-close]')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
})();
