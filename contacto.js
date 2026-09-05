/* ==========================================================================
   CONTACTO.JS — Los datos de contacto salen de config.js.
   ========================================================================== */

(function () {

  var e = CONFIG.empresa;

  var wa = document.getElementById('whatsapps');
  if (wa) {
    wa.innerHTML = e.whatsapps.map(function (n) {
      return '<a class="boton boton--principal" href="https://wa.me/549' + n +
             '" target="_blank" rel="noopener">WhatsApp ' + n + '</a>';
    }).join('');
  }

  var d = document.getElementById('direccion');
  if (d) d.textContent = e.direccion + ', ' + e.ciudad;

  var t = document.getElementById('telefono');
  if (t) { t.textContent = e.telefono; t.href = 'tel:' + e.telefono.replace(/\s/g, ''); }

  var m = document.getElementById('mail');
  if (m) { m.textContent = e.email; m.href = 'mailto:' + e.email; }

  var mapa = document.getElementById('mapa');
  if (mapa) mapa.src = 'https://maps.google.com/maps?q=' +
    encodeURIComponent(e.direccion + ', ' + e.ciudad) + '&output=embed';

  var est = window.estadoAtencion();
  var caja = document.getElementById('estado');
  if (caja) {
    caja.setAttribute('data-abierto', est.abierto ? 'si' : 'no');
    document.getElementById('estadoTexto').textContent = est.texto;
  }

})();
