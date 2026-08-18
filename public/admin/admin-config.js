/* ============================================================
   PROevent — Personalización soportada de Decap CMS.

   Usa APIs oficiales de Decap (docs: decapcms.org/docs/customization):
     - CMS.registerPreviewStyle(css, { raw: true })
     - CMS.registerPreviewTemplate(name, componente)
   Globals expuestos por el bundle decap-cms.js: window.CMS, window.h,
   window.createClass.

   NO toca el backend (DecapBridge/PKCE) ni el editorial workflow:
   solo mejora las vistas previas y su tipografía/colores.
   ============================================================ */
(function () {
  if (!window.CMS) {
    console.error('[PROevent] Decap CMS no está disponible.');
    return;
  }

  var CMS = window.CMS;
  var h = window.h;
  var createClass = window.createClass;

  /* ---- 1) Estilos del panel de vista previa (iframe del editor) ---- */
  var PREVIEW_CSS = [
    "@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Sora:wght@400;500;600;700&display=swap');",
    'body{margin:0;background:#0a0a0d;color:#ececf0;font-family:"Sora",system-ui,sans-serif;line-height:1.6;padding:28px}',
    '.pv-wrap{max-width:720px;margin:0 auto}',
    '.pv-eyebrow{display:inline-flex;align-items:center;gap:8px;color:#ff6a00;font-family:"Barlow Condensed",sans-serif;font-weight:600;letter-spacing:3px;text-transform:uppercase;font-size:14px;margin-bottom:8px}',
    '.pv-title{font-family:"Barlow Condensed",sans-serif;font-weight:700;text-transform:uppercase;font-size:40px;line-height:1;letter-spacing:-.5px;margin:0 0 6px}',
    '.pv-count{color:#9a9aa6;font-size:14px;margin-bottom:22px}',
    '.pv-section-label{color:#ff6a00;font-family:"Barlow Condensed",sans-serif;font-weight:600;letter-spacing:2px;text-transform:uppercase;font-size:13px;margin:26px 0 12px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,.08)}',
    '.pv-cover{width:260px;max-width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:14px;border:1px solid rgba(255,255,255,.08);display:block}',
    '.pv-empty{display:flex;align-items:center;justify-content:center;background:#1a1a22;color:#9a9aa6;font-size:14px}',
    '.pv-gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px}',
    '.pv-thumb{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:10px;border:1px solid rgba(255,255,255,.08)}',
    '.pv-row{font-size:15px;margin-bottom:8px;color:#d6d6de}',
    '.pv-row b{color:#fff}',
    '.pv-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:6px}',
    '.pv-stat{background:#121218;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:20px;text-align:center}',
    '.pv-stat-num{font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:44px;color:#ff6a00;line-height:1}',
    '.pv-stat-lbl{color:#9a9aa6;font-size:13px;letter-spacing:1px;text-transform:uppercase;margin-top:6px}',
  ].join('\n');

  CMS.registerPreviewStyle(PREVIEW_CSS, { raw: true });

  /* ---- helper: resolver URL de imagen (soporta assets ya publicados) ---- */
  function assetUrl(getAsset, path) {
    if (!path) return '';
    try {
      var a = getAsset(path);
      return a ? a.toString() : path;
    } catch (e) {
      return path;
    }
  }

  /* ---- 2) Preview de una categoría del portfolio ---- */
  var PortfolioPreview = createClass({
    render: function () {
      var props = this.props;
      var data = props.entry.get('data');
      var getAsset = props.getAsset;

      var title = data.get('title') || '';
      var label = data.get('label') || '';
      var cover = data.get('cover');
      var galleryImm = data.get('gallery');
      var gallery = galleryImm && galleryImm.toArray ? galleryImm.toArray() : [];

      var coverEl = cover
        ? h('img', { className: 'pv-cover', src: assetUrl(getAsset, cover), alt: label })
        : h('div', { className: 'pv-cover pv-empty' }, 'Sin portada');

      var thumbs = gallery.map(function (src, i) {
        return h('img', {
          key: i,
          className: 'pv-thumb',
          src: assetUrl(getAsset, src),
          alt: label + ' ' + (i + 1),
        });
      });

      return h('div', { className: 'pv-wrap' }, [
        h('div', { className: 'pv-eyebrow', key: 'eb' }, label || 'Categoría'),
        h('h1', { className: 'pv-title', key: 't' }, title),
        h(
          'div',
          { className: 'pv-count', key: 'c' },
          gallery.length + ' foto' + (gallery.length === 1 ? '' : 's') + ' en la galería',
        ),
        h('div', { className: 'pv-section-label', key: 'pl' }, 'Portada'),
        coverEl,
        h('div', { className: 'pv-section-label', key: 'gl' }, 'Galería'),
        gallery.length
          ? h('div', { className: 'pv-gallery', key: 'g' }, thumbs)
          : h('div', { className: 'pv-count', key: 'g0' }, 'Todavía no hay fotos en la galería.'),
      ]);
    },
  });

  /* ---- 3) Preview simple de la configuración del sitio ---- */
  var ConfigPreview = createClass({
    render: function () {
      var data = this.props.entry.get('data');
      var whatsapp = data.get('whatsapp') || '';
      var phone = data.get('phoneDisplay') || '';
      var email = data.get('email') || '';
      var statsImm = data.get('stats');
      var stats = statsImm && statsImm.toArray ? statsImm.toArray() : [];

      var statEls = stats.map(function (s, i) {
        var num = s && s.get ? s.get('num') : '';
        var lbl = s && s.get ? s.get('label') : '';
        return h('div', { className: 'pv-stat', key: i }, [
          h('div', { className: 'pv-stat-num', key: 'n' }, num),
          h('div', { className: 'pv-stat-lbl', key: 'l' }, lbl),
        ]);
      });

      return h('div', { className: 'pv-wrap' }, [
        h('h1', { className: 'pv-title', key: 't' }, 'Configuración del sitio'),
        h('div', { className: 'pv-row', key: 'w' }, ['WhatsApp: ', h('b', { key: 'b' }, whatsapp)]),
        h('div', { className: 'pv-row', key: 'p' }, ['Teléfono: ', h('b', { key: 'b' }, phone)]),
        h('div', { className: 'pv-row', key: 'e' }, ['Email: ', h('b', { key: 'b' }, email)]),
        h('div', { className: 'pv-section-label', key: 'sl' }, 'Estadísticas'),
        h('div', { className: 'pv-stats', key: 's' }, statEls),
      ]);
    },
  });

  CMS.registerPreviewTemplate('portfolio', PortfolioPreview);
  // Colección de archivos: Decap la referencia por el nombre del archivo ("site").
  // Registramos también "config" por compatibilidad entre versiones.
  CMS.registerPreviewTemplate('site', ConfigPreview);
  CMS.registerPreviewTemplate('config', ConfigPreview);
})();
