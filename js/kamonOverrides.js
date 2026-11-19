/** 蝦夷諸部族の補助紋。各大名と五稜郭の家紋は assets/kamons.js で定義する。 */
(function () {
  'use strict';

  var EXTRA_KAMONS = `
<mask id="kamon-mask-ov-ainu-pattern" maskUnits="userSpaceOnUse" x="-4" y="-4" width="40" height="40"><circle cx="16" cy="16" r="12.8" stroke-width="0.6" fill="none" stroke="#ffffff"></circle><g stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M 16,6.2 L 16,8.5 M 14.3,7.6 L 16,6.2 L 17.7,7.6" stroke-width="1.4" fill="none" stroke="#ffffff"></path><path d="M 16,8.5 C 13.2,8.5 10.2,10.2 10.2,13.2 C 10.2,15.2 11.8,16.2 13.5,15.5 C 14.5,15.0 14.8,13.8 14.0,13.2 C 13.2,12.6 12.2,13.5 12.5,14.2" fill="none" stroke="#ffffff"></path><path d="M 16,8.5 C 18.8,8.5 21.8,10.2 21.8,13.2 C 21.8,15.2 20.2,16.2 18.5,15.5 C 17.5,15.0 17.2,13.8 18.0,13.2 C 18.8,12.6 19.8,13.5 19.5,14.2" fill="none" stroke="#ffffff"></path><path d="M 16,25.8 L 16,23.5 M 14.3,24.4 L 16,25.8 L 17.7,24.4" stroke-width="1.4" fill="none" stroke="#ffffff"></path><path d="M 16,23.5 C 13.2,23.5 10.2,21.8 10.2,18.8 C 10.2,16.8 11.8,15.8 13.5,16.5 C 14.5,17.0 14.8,18.2 14.0,18.8 C 13.2,19.4 12.2,18.5 12.5,17.8" fill="none" stroke="#ffffff"></path><path d="M 16,23.5 C 18.8,23.5 21.8,21.8 21.8,18.8 C 21.8,16.8 20.2,15.8 18.5,16.5 C 17.5,17.0 17.2,18.2 18.0,18.8 C 18.8,19.4 19.8,18.5 19.5,17.8" fill="none" stroke="#ffffff"></path><path d="M 6.2,16 L 8.5,16 M 7.6,14.3 L 6.2,16 L 7.6,17.7" stroke-width="1.4" fill="none" stroke="#ffffff"></path><path d="M 25.8,16 L 23.5,16 M 24.4,14.3 L 25.8,16 L 24.4,17.7" stroke-width="1.4" fill="none" stroke="#ffffff"></path><path d="M 8.5,16 C 8.5,13.2 10.2,11.2 12.5,11.2" fill="none" stroke="#ffffff"></path><path d="M 8.5,16 C 8.5,18.8 10.2,20.8 12.5,20.8" fill="none" stroke="#ffffff"></path><path d="M 23.5,16 C 23.5,13.2 21.8,11.2 19.5,11.2" fill="none" stroke="#ffffff"></path><path d="M 23.5,16 C 23.5,18.8 21.8,20.8 19.5,20.8" fill="none" stroke="#ffffff"></path></g><polygon points="16,13.5 18.5,16 16,18.5 13.5,16" stroke-width="0.8" fill="#ffffff" stroke="#ffffff"></polygon><circle cx="16" cy="16" r="1.0" fill="#000000"></circle></mask>
<symbol id="kamon-ainu-pattern" viewBox="0 0 32 32"><title>蝦夷諸部族・アイヌ文様</title>
      <circle cx="16" cy="16" r="15" fill="none" stroke="#ffd700" stroke-width="1.5" />
      <g mask="url(#kamon-mask-ov-ainu-pattern)"><circle cx="16" cy="16" r="12.8" stroke-width="0.6" fill="none" stroke="#ffffff"></circle><g stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M 16,6.2 L 16,8.5 M 14.3,7.6 L 16,6.2 L 17.7,7.6" stroke-width="1.4" fill="none" stroke="#ffffff"></path><path d="M 16,8.5 C 13.2,8.5 10.2,10.2 10.2,13.2 C 10.2,15.2 11.8,16.2 13.5,15.5 C 14.5,15.0 14.8,13.8 14.0,13.2 C 13.2,12.6 12.2,13.5 12.5,14.2" fill="none" stroke="#ffffff"></path><path d="M 16,8.5 C 18.8,8.5 21.8,10.2 21.8,13.2 C 21.8,15.2 20.2,16.2 18.5,15.5 C 17.5,15.0 17.2,13.8 18.0,13.2 C 18.8,12.6 19.8,13.5 19.5,14.2" fill="none" stroke="#ffffff"></path><path d="M 16,25.8 L 16,23.5 M 14.3,24.4 L 16,25.8 L 17.7,24.4" stroke-width="1.4" fill="none" stroke="#ffffff"></path><path d="M 16,23.5 C 13.2,23.5 10.2,21.8 10.2,18.8 C 10.2,16.8 11.8,15.8 13.5,16.5 C 14.5,17.0 14.8,18.2 14.0,18.8 C 13.2,19.4 12.2,18.5 12.5,17.8" fill="none" stroke="#ffffff"></path><path d="M 16,23.5 C 18.8,23.5 21.8,21.8 21.8,18.8 C 21.8,16.8 20.2,15.8 18.5,16.5 C 17.5,17.0 17.2,18.2 18.0,18.8 C 18.8,19.4 19.8,18.5 19.5,17.8" fill="none" stroke="#ffffff"></path><path d="M 6.2,16 L 8.5,16 M 7.6,14.3 L 6.2,16 L 7.6,17.7" stroke-width="1.4" fill="none" stroke="#ffffff"></path><path d="M 25.8,16 L 23.5,16 M 24.4,14.3 L 25.8,16 L 24.4,17.7" stroke-width="1.4" fill="none" stroke="#ffffff"></path><path d="M 8.5,16 C 8.5,13.2 10.2,11.2 12.5,11.2" fill="none" stroke="#ffffff"></path><path d="M 8.5,16 C 8.5,18.8 10.2,20.8 12.5,20.8" fill="none" stroke="#ffffff"></path><path d="M 23.5,16 C 23.5,13.2 21.8,11.2 19.5,11.2" fill="none" stroke="#ffffff"></path><path d="M 23.5,16 C 23.5,18.8 21.8,20.8 19.5,20.8" fill="none" stroke="#ffffff"></path></g><polygon points="16,13.5 18.5,16 16,18.5 13.5,16" stroke-width="0.8" fill="#ffffff" stroke="#ffffff"></polygon></g></symbol>
`;

  function addToSource() {
    if (window.KAMONS_SVG_CONTENT && window.KAMONS_SVG_CONTENT.indexOf('id="kamon-ainu-pattern"') === -1) {
      window.KAMONS_SVG_CONTENT = window.KAMONS_SVG_CONTENT.replace('</defs>', EXTRA_KAMONS + '\n</defs>');
    }
  }

  function addToDocument() {
    if (typeof document === 'undefined' || !document.getElementById) return;
    var defs = document.getElementById('mapSvgDefs') || document.querySelector('#kamonsGlobalContainer defs');
    if (!defs || typeof DOMParser === 'undefined') return;
    var parsed = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg"><defs>' + EXTRA_KAMONS + '</defs></svg>', 'image/svg+xml');
    Array.prototype.forEach.call(parsed.querySelectorAll('defs > mask, defs > clipPath, defs > symbol'), function (el) {
      if (!el.id || !document.getElementById(el.id)) defs.appendChild(document.importNode(el, true));
    });
  }

  addToSource();
  addToDocument();
  window.installKamonOverrides = function () {
    addToSource();
    addToDocument();
  };
})();
