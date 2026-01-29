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
  const dimTabs = modal ? Array.from(modal.querySelectorAll('[data-dim-tab]')) : [];
  const dimPanels = modal ? Array.from(modal.querySelectorAll('[data-dim-panel]')) : [];
  const metaFields = modal ? {
    part: modal.querySelector('[data-ficha-part]'),
    size: modal.querySelector('[data-ficha-size]'),
    box: modal.querySelector('[data-ficha-box]'),
    weightLbs: modal.querySelector('[data-ficha-weight-lbs]'),
    weightGm: modal.querySelector('[data-ficha-weight-gm]'),
    weightKg: modal.querySelector('[data-ficha-weight-kg]'),
    material: modal.querySelector('[data-ficha-material]'),
    msrp: modal.querySelector('[data-ficha-msrp]'),
    prodCode: modal.querySelector('[data-ficha-prod-code]'),
    color: modal.querySelector('[data-ficha-color]'),
    bsh: modal.querySelector('[data-ficha-bsh]'),
    desc: modal.querySelector('[data-ficha-desc]'),
  } : null;
  const headerImg = modal ? modal.querySelector('.ficha__header-img') : null;

  let currentFicha = null;

  const splitList = (text) => {
    if (!text) return [];
    return text
      .split(/\s*[|;]\s*|\n+/)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const renderDims = (panel, text) => {
    if (!panel) return;
    const items = splitList(text);
    if (!items.length) {
      panel.textContent = 'Sin dimensiones.';
      return;
    }
    panel.innerHTML = `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
  };

  const setActiveTab = (key) => {
    dimTabs.forEach((tab) => {
      tab.classList.toggle('is-active', tab.dataset.dimTab === key);
    });
    dimPanels.forEach((panel) => {
      panel.hidden = panel.dataset.dimPanel !== key;
    });
  };

  const fillMeta = (data) => {
    if (!metaFields) return;
    const setText = (el, value) => {
      if (el) el.textContent = value || '-';
    };
    setText(metaFields.part, data.part);
    setText(metaFields.size, data.size);
    setText(metaFields.box, data.box);
    setText(metaFields.weightLbs, data.weightLbs);
    setText(metaFields.weightGm, data.weightGm);
    setText(metaFields.weightKg, data.weightKg);
    setText(metaFields.material, data.material);
    setText(metaFields.msrp, data.msrp);
    setText(metaFields.prodCode, data.prodCode);
    setText(metaFields.color, data.color);
    setText(metaFields.bsh, data.bsh);
    setText(metaFields.desc, data.desc);
  };

  const openModal = (data) => {
    if (!modal || !modalImg) return;
    currentFicha = data;
    modalImg.src = data.img;
    modalImg.alt = data.alt || 'Ficha tecnica';
    if (headerImg) {
      headerImg.src = data.headerImg || '';
      headerImg.alt = data.headerAlt || 'Encabezado ficha';
      headerImg.style.display = data.headerImg ? 'block' : 'none';
    }
    renderDims(dimPanels.find((panel) => panel.dataset.dimPanel === 'in'), data.dimIn);
    renderDims(dimPanels.find((panel) => panel.dataset.dimPanel === 'mm'), data.dimMm);
    const activeTab = data.dimIn ? 'in' : (data.dimMm ? 'mm' : 'in');
    setActiveTab(activeTab);
    fillMeta(data);
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
    const fichaBtn = event.target.closest('.boton-ficha');
    if (fichaBtn) {
      event.preventDefault();
      const src = (fichaBtn.dataset.fichaImg || fichaBtn.getAttribute('href') || '').trim();
      if (!src || src === '#') return;
      openModal({
        img: src,
        alt: fichaBtn.dataset.fichaAlt,
        headerImg: fichaBtn.dataset.fichaHeaderImg,
        headerAlt: fichaBtn.dataset.fichaHeaderAlt,
        dimIn: fichaBtn.dataset.fichaDimIn,
        dimMm: fichaBtn.dataset.fichaDimMm,
        part: fichaBtn.dataset.fichaPart,
        size: fichaBtn.dataset.fichaSize,
        box: fichaBtn.dataset.fichaBox,
        weightLbs: fichaBtn.dataset.fichaWeightLbs,
        weightGm: fichaBtn.dataset.fichaWeightGm,
        weightKg: fichaBtn.dataset.fichaWeightKg,
        material: fichaBtn.dataset.fichaMaterial,
        msrp: fichaBtn.dataset.fichaMsrp,
        prodCode: fichaBtn.dataset.fichaProdCode,
        color: fichaBtn.dataset.fichaColor,
        bsh: fichaBtn.dataset.fichaBsh,
        desc: fichaBtn.dataset.fichaDesc,
      });
      return;
    }

    const dimTab = event.target.closest('[data-dim-tab]');
    if (dimTab && modal && modal.classList.contains('is-open')) {
      setActiveTab(dimTab.dataset.dimTab);
      return;
    }

    const actionBtn = event.target.closest('[data-ficha-action]');
    if (actionBtn && modal && modal.classList.contains('is-open')) {
      const action = actionBtn.dataset.fichaAction;
      if (action === 'print') {
        window.print();
      }
      if (action === 'email' && currentFicha) {
        const subject = `Ficha tecnica ${currentFicha.part || ''}`.trim();
        const bodyLines = [
          currentFicha.desc ? `Descripcion: ${currentFicha.desc}` : '',
          currentFicha.part ? `Part Number: ${currentFicha.part}` : '',
          currentFicha.size ? `Size: ${currentFicha.size}` : '',
        ].filter(Boolean);
        const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
        window.location.href = mailto;
      }
    }

    if (event.target.closest('[data-close]')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
})();
