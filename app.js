(() => {
  'use strict';

  const data = window.PORTFOLIO || {};
  const imageAssets = Array.isArray(data.images) ? data.images : [];
  const stills = imageAssets.filter((item) => item.type === 'image');
  const videos = Array.isArray(data.videos) ? data.videos : [];
  const motionAssets = [...videos, ...imageAssets.filter((item) => item.type === 'motion')];
  const byId = new Map(stills.map((item) => [item.id, item]));
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const previewStops = new Set();
  const stopAllPreviews = () => previewStops.forEach((stop) => stop());
  const listenToMedia = (query, listener) => {
    if (query.addEventListener) query.addEventListener('change', listener);
    else if (query.addListener) query.addListener(listener);
  };
  listenToMedia(reducedMotion, stopAllPreviews);
  listenToMedia(finePointer, stopAllPreviews);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAllPreviews();
  });
  window.addEventListener('pagehide', stopAllPreviews);

  const projects = [
    {
      id: 'bkt', cover: '078', brand: 'BKT', category: 'product',
      title: 'BKT · 舒适，有形可见', tag: 'PRODUCT VISUAL',
      subtitle: '坐姿椅、腰靠与午睡枕 / 产品渲染与材质表现',
      select: (item) => item.brand === 'BKT'
    },
    {
      id: 'viomi', cover: '050', brand: '云米', category: 'home',
      title: '云米 · 生活的另一种想象', tag: 'HOME APPLIANCES',
      subtitle: '家电产品与生活场景 / 空间、材质与光影',
      select: (item) => item.brand === '云米'
    },
    {
      id: 'chiteng', cover: '015', brand: '驰腾', category: 'product',
      title: '驰腾 · 小产品，大世界', tag: 'PRODUCT VISUAL',
      subtitle: '便携式打印机 / 产品细节与应用场景',
      select: (item) => item.brand === '驰腾'
    },
    {
      id: 'mijia', cover: '001', brand: '晟力', category: 'home',
      title: '厨房 · 日常的秩序', tag: 'KITCHEN VISUAL',
      subtitle: '烟灶产品 / 厨房空间与生活方式表达',
      select: (item) => item.brand === '晟力' && Number(item.id) >= 1 && Number(item.id) <= 5
    },
    {
      id: 'tcl', cover: '006', brand: '晟力', category: 'home',
      title: 'TCL · 理想生活的场景', tag: 'SPATIAL VISUAL',
      subtitle: '冰箱产品 / 建筑场景与产品视觉',
      select: (item) => item.brand === '晟力' && Number(item.id) >= 6 && Number(item.id) <= 9
    },
    {
      id: 'space', cover: '042', brand: '鼎晟', category: 'space',
      title: '空间 · 光的叙事', tag: 'INTERIOR & ARCHITECTURE',
      subtitle: '室内与建筑表现 / 空间氛围与灯光质感',
      select: (item) => item.brand === '鼎晟'
    }
  ];

  const neutralVideoTitles = {
    v01: '产品影像 · 细节观察',
    v02: '产品影像 · 视觉片段',
    v03: '产品视觉研究',
    v06: '粉色格子坐姿椅',
    v07: '琥珀棕 · 材质与动态',
    v05: '飞碟午睡枕'
  };

  function titleFor(item) {
    if (item.type === 'video' && neutralVideoTitles[item.id]) return neutralVideoTitles[item.id];
    const title = String(item.title || '').trim();
    const generic = !title || /^[\d\s_()（）-]+$/.test(title) || /^[a-f\d]{20,}/i.test(title)
      || /^(企业微信截图|画板|jimeng-|合集|最终|新\+落版|KV结尾)/.test(title);
    if (generic) {
      if (item.type === 'video') return `产品影像 · ${item.id.replace(/^v/, '')}`;
      return `${item.brand || '精选'} · 视觉作品 ${item.id}`;
    }
    return title.replace(/_compressed$/i, '').replace(/\s*-\s*副本$/, '').replace(/（预览画质）$/, '');
  }

  function makeImage(item, full = false, alt = '') {
    const image = element('img');
    image.src = full ? item.src : (item.thumb || item.src);
    image.alt = alt || titleFor(item);
    image.decoding = 'async';
    if (!full) image.loading = 'lazy';
    if (Number(item.width) > 0) image.width = item.width;
    if (Number(item.height) > 0) image.height = item.height;
    return image;
  }

  function renderProjects(filter = 'all') {
    const grid = $('#project-grid');
    if (!grid) return;
    const fragment = document.createDocumentFragment();
    projects.filter((project) => filter === 'all' || project.category === filter).forEach((project) => {
      const items = stills.filter(project.select);
      const cover = byId.get(project.cover) || items[0];
      if (!cover || !items.length) return;
      const card = element('button', 'project-card');
      card.type = 'button';
      card.dataset.project = project.id;
      card.setAttribute('aria-label', `${project.title}，查看 ${items.length} 件作品`);
      const visual = element('div', 'project-cover');
      visual.append(makeImage(cover, true, project.title));
      const arrow = element('span', 'project-arrow', '↗');
      arrow.setAttribute('aria-hidden', 'true');
      visual.append(element('small', '', project.tag), arrow);
      const label = element('div', 'project-label');
      label.append(element('h3', '', project.title), element('span', '', `${String(items.length).padStart(2, '0')} VISUALS`));
      card.append(visual, label, element('p', 'project-subtitle', project.subtitle));
      card.addEventListener('click', () => openViewer(items, Math.max(0, items.indexOf(cover)), project.title, card));
      fragment.append(card);
    });
    if (!fragment.childNodes.length) fragment.append(element('p', 'empty', '这一分类的作品正在整理中。'));
    grid.replaceChildren(fragment);
  }

  $$('.filters [data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      $$('.filters [data-filter]').forEach((item) => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      renderProjects(button.dataset.filter);
    });
  });

  let archiveRendered = false;
  function renderArchive() {
    const grid = $('#archive-grid');
    if (!grid) return;
    const brand = $('#brand-filter')?.value || 'all';
    const items = stills.filter((item) => brand === 'all' || item.brand === brand);
    const fragment = document.createDocumentFragment();
    items.forEach((item, index) => {
      const button = element('button', 'archive-item');
      button.type = 'button';
      button.setAttribute('aria-label', `查看 ${titleFor(item)}`);
      button.append(makeImage(item), element('span', '', `${item.brand} / ${titleFor(item)}`));
      button.addEventListener('click', () => openViewer(items, index, brand === 'all' ? '完整作品库' : `${brand} · 作品库`, button));
      fragment.append(button);
    });
    if (!items.length) fragment.append(element('p', 'empty', '暂无这一分组的作品。'));
    grid.replaceChildren(fragment);
    const count = $('#archive-count');
    if (count) count.textContent = `${items.length} 件静态作品`;
    archiveRendered = true;
  }

  function setArchive(open) {
    const panel = $('#archive');
    const button = $('#archive-toggle');
    if (!panel || !button) return;
    panel.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    button.replaceChildren(document.createTextNode(open ? '收起完整作品库 ' : '浏览完整作品库 '), element('span', '', open ? '−' : '↗'));
    if (open && !archiveRendered) renderArchive();
  }
  $('#archive-toggle')?.addEventListener('click', () => setArchive($('#archive')?.hidden));
  $('#brand-filter')?.addEventListener('change', renderArchive);

  function durationLabel(duration) {
    const seconds = Number(duration);
    if (!Number.isFinite(seconds) || seconds <= 0) return '';
    const total = Math.max(1, Math.round(seconds));
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
  }

  function makeMotionCard(item) {
    const button = element('button', 'motion-card');
    button.type = 'button';
    button.setAttribute('aria-label', `查看动态作品：${titleFor(item)}`);
    const cover = element('div', 'motion-cover');
    cover.append(makeImage(item));
    const play = element('span', 'play', '▶');
    play.setAttribute('aria-hidden', 'true');
    cover.append(play);
    const duration = durationLabel(item.duration);
    if (duration) cover.append(element('span', 'duration', duration));
    // This source has no verified brand attribution, so keep its caption neutral.
    const caption = item.id === 'v03' ? 'PRODUCT STUDY / MOTION' : item.type === 'motion' ? 'PRODUCT MOTION / LOOP' : '3D ANIMATION / AI / EDITING';
    button.append(cover, element('h3', '', titleFor(item)), element('p', '', caption));
    let preview = null;
    const stopPreview = () => {
      const oldPreview = preview;
      preview = null;
      button.classList.remove('previewing');
      previewStops.delete(stopPreview);
      if (!oldPreview) return;
      oldPreview.pause();
      oldPreview.removeAttribute('src');
      oldPreview.load();
      oldPreview.remove();
    };
    button.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'touch' || !finePointer.matches || reducedMotion.matches || document.hidden || preview) return;
      const video = element('video', 'motion-preview');
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'none';
      video.tabIndex = -1;
      video.setAttribute('aria-hidden', 'true');
      if (item.thumb) video.poster = item.thumb;
      video.src = item.src;
      preview = video;
      previewStops.add(stopPreview);
      cover.append(video);
      const play = video.play();
      if (play && typeof play.then === 'function') {
        play.then(() => {
          if (preview === video) button.classList.add('previewing');
        }).catch(() => {
          if (preview === video) stopPreview();
        });
      }
    });
    button.addEventListener('pointerleave', stopPreview);
    button.addEventListener('pointercancel', stopPreview);
    button.addEventListener('click', () => {
      stopPreview();
      openViewer(motionAssets, motionAssets.indexOf(item), '动态影像', button);
    });
    return button;
  }

  const featuredIds = ['v06', 'v07', 'v05'];
  const featured = featuredIds.map((id) => motionAssets.find((item) => item.id === id)).filter(Boolean);
  if (!featured.length) featured.push(...motionAssets.slice(0, 3));
  const extraMotions = motionAssets.filter((item) => !featured.includes(item));
  $('#motion-grid')?.replaceChildren(...featured.map(makeMotionCard));
  let motionExtraRendered = false;
  function setMotionExtra(open) {
    const panel = $('#motion-extra');
    const button = $('#motion-toggle');
    if (!panel || !button) return;
    panel.hidden = !open;
    if (!open) stopAllPreviews();
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-controls', 'motion-extra');
    button.replaceChildren(document.createTextNode(open ? '收起更多动态作品 ' : '展开全部动态作品 '), element('span', '', open ? '−' : '＋'));
    if (open && !motionExtraRendered) {
      panel.replaceChildren(...extraMotions.map(makeMotionCard));
      motionExtraRendered = true;
    }
  }
  $('#motion-toggle')?.addEventListener('click', () => setMotionExtra($('#motion-extra')?.hidden));
  if (!extraMotions.length && $('#motion-toggle')) $('#motion-toggle').hidden = true;

  const dialog = $('#viewer');
  const stage = $('#viewer-stage');
  const filmstrip = element('div', 'viewer-filmstrip');
  filmstrip.setAttribute('role', 'group');
  filmstrip.setAttribute('aria-label', '作品缩略图，点击切换');
  stage?.insertAdjacentElement('afterend', filmstrip);
  const viewerMeta = element('p', 'viewer-meta');
  dialog?.querySelector('.viewer-bottom')?.insertAdjacentElement('afterend', viewerMeta);
  let viewerItems = [];
  let viewerIndex = 0;
  let returnFocus = null;

  function buildFilmstrip() {
    const fragment = document.createDocumentFragment();
    viewerItems.forEach((item, index) => {
      const button = element('button', 'viewer-thumb');
      button.type = 'button';
      button.dataset.index = index;
      button.title = `${index + 1} / ${viewerItems.length} · ${titleFor(item)}`;
      button.setAttribute('aria-label', `第 ${index + 1} 件，共 ${viewerItems.length} 件：${titleFor(item)}`);
      const image = makeImage(item, false, '');
      image.alt = '';
      button.append(image, element('span', 'viewer-thumb-index', String(index + 1).padStart(2, '0')));
      button.addEventListener('click', () => {
        viewerIndex = index;
        renderViewer();
      });
      fragment.append(button);
    });
    filmstrip.replaceChildren(fragment);
  }

  function updateFilmstrip() {
    const focusWasInStrip = filmstrip.contains(document.activeElement);
    let activeThumb;
    [...filmstrip.children].forEach((button, index) => {
      const active = index === viewerIndex;
      button.classList.toggle('active', active);
      button.setAttribute('aria-current', String(active));
      button.tabIndex = active ? 0 : -1;
      if (active) activeThumb = button;
    });
    if (!activeThumb) return;
    if (focusWasInStrip) activeThumb.focus({ preventScroll: true });
    // Move only the filmstrip, preserving the image position in the dialog.
    const targetLeft = activeThumb.offsetLeft - filmstrip.offsetLeft - (filmstrip.clientWidth - activeThumb.offsetWidth) / 2;
    filmstrip.scrollTo({ left: Math.max(0, targetLeft), behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  }

  function clearStage() {
    if (!stage) return;
    stage.querySelectorAll('video').forEach((video) => {
      video.pause();
      video.removeAttribute('src');
      video.load();
    });
    stage.replaceChildren();
  }

  function renderViewer() {
    const item = viewerItems[viewerIndex];
    if (!item || !stage) return;
    clearStage();
    const title = titleFor(item);
    $('#viewer-title').textContent = title;
    $('#viewer-counter').textContent = `${String(viewerIndex + 1).padStart(2, '0')} / ${String(viewerItems.length).padStart(2, '0')}`;
    const isMotion = item.type === 'video' || item.type === 'motion';
    const dimensions = Number(item.width) > 0 && Number(item.height) > 0 ? `原始尺寸 ${item.width} × ${item.height}` : '';
    viewerMeta.textContent = [item.id === 'v03' ? '产品视觉研究' : item.brand, isMotion ? '动态影像' : '静态渲染', dimensions, isMotion ? durationLabel(item.duration) : ''].filter(Boolean).join(' / ');
    if (isMotion) {
      const video = element('video');
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.src = item.src;
      if (item.thumb) video.poster = item.thumb;
      video.setAttribute('aria-label', title);
      video.append(document.createTextNode('您的浏览器不支持视频播放。'));
      stage.append(video);
    } else {
      stage.append(makeImage(item, true, title));
    }
    const single = viewerItems.length < 2;
    $('#viewer-prev').disabled = single;
    $('#viewer-next').disabled = single;
    stage.scrollTop = 0;
    stage.scrollLeft = 0;
    updateFilmstrip();
  }

  function openViewer(items, index, project, trigger) {
    if (!dialog || !stage || !items.length) return;
    viewerItems = items;
    viewerIndex = Math.max(0, Math.min(index, items.length - 1));
    returnFocus = trigger || document.activeElement;
    stopAllPreviews();
    $('#viewer-project').textContent = project;
    buildFilmstrip();
    renderViewer();
    document.body.classList.add('modal-open');
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    $('#viewer-close').focus({ preventScroll: true });
    // The dialog must be open before thumbnail dimensions can be measured.
    updateFilmstrip();
  }

  function finishClose() {
    clearStage();
    filmstrip.replaceChildren();
    viewerMeta.textContent = '';
    viewerItems = [];
    document.body.classList.remove('modal-open');
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    returnFocus = null;
  }

  function closeViewer() {
    if (!dialog?.open) return;
    if (typeof dialog.close === 'function') dialog.close();
    else {
      dialog.removeAttribute('open');
      finishClose();
    }
  }

  function stepViewer(direction) {
    if (!viewerItems.length) return;
    viewerIndex = (viewerIndex + direction + viewerItems.length) % viewerItems.length;
    renderViewer();
  }

  $('#viewer-close')?.addEventListener('click', closeViewer);
  $('#viewer-prev')?.addEventListener('click', () => stepViewer(-1));
  $('#viewer-next')?.addEventListener('click', () => stepViewer(1));
  dialog?.addEventListener('close', finishClose);
  dialog?.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeViewer();
  });
  dialog?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeViewer();
    }
    // Preserve native keyboard seeking while a video player has focus.
    if (event.target instanceof HTMLVideoElement || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      stepViewer(event.key === 'ArrowLeft' ? -1 : 1);
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      viewerIndex = event.key === 'Home' ? 0 : viewerItems.length - 1;
      renderViewer();
    }
  });

  let swipeStart = null;
  stage?.addEventListener('touchstart', (event) => {
    if (event.touches.length !== 1 || stage.querySelector('video')) {
      swipeStart = null;
      return;
    }
    const touch = event.touches[0];
    swipeStart = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  }, { passive: true });
  stage?.addEventListener('touchend', (event) => {
    if (!swipeStart || stage.querySelector('video')) return;
    const start = swipeStart;
    swipeStart = null;
    const touch = event.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - start.time < 900) {
      stepViewer(dx < 0 ? 1 : -1);
    }
  }, { passive: true });
  stage?.addEventListener('touchcancel', () => { swipeStart = null; }, { passive: true });

  [
    { button: '#copy-email', value: '372111773@qq.com', label: '邮箱', target: '.contact-bottom a[href^="mailto:"]' },
    { button: '#copy-wechat', value: 'JMNX_XZH', label: '微信号', target: '#wechat-id' }
  ].forEach(({ button, value, label, target }) => {
    $(button)?.addEventListener('click', async () => {
      const status = $('#copy-status');
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(value);
        if (status) status.textContent = `${label}已复制，期待与你联系。`;
      } catch {
        const text = $(target);
        if (text && window.getSelection) {
          const range = document.createRange();
          range.selectNodeContents(text);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }
        if (status) status.textContent = `${label}已选中，请长按或手动复制。`;
      }
    });
  });

  function revealHashTarget() {
    if (location.hash === '#archive' || location.hash === '#archive-grid') setArchive(true);
    if (location.hash === '#motion-extra') setMotionExtra(true);
  }
  window.addEventListener('hashchange', revealHashTarget);
  renderProjects();
  revealHashTarget();
})();
