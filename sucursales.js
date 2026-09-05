/* ==========================================================================
   SUCURSALES.JS — Dónde retirar el pedido.
   ========================================================================== */

(function () {

  var cont = document.getElementById('sucursales');
  if (!cont) return;

  Datos.sucursales().then(function (lista) {
    cont.innerHTML = lista.map(function (s) {
      var mapa = 'https://www.google.com/maps/search/?api=1&query=' +
                 encodeURIComponent(s.direccion + ', ' + CONFIG.empresa.ciudad);
      return '' +
        '<article class="sucursal">' +
          '<div class="sucursal__datos">' +
            '<h3>' + s.nombre + '</h3>' +
            '<div class="dato"><strong>Dirección</strong><span>' + s.direccion + ', ' + CONFIG.empresa.ciudad + '</span></div>' +
            '<div class="dato"><strong>Horarios</strong><span>' + s.horario + '</span></div>' +
            '<div class="dato"><strong>WhatsApp</strong><span>' +
              CONFIG.empresa.whatsapps.map(function (w) {
                return '<a href="https://wa.me/549' + w + '" rel="noopener">' + w + '</a>';
              }).join(' &nbsp; ') +
            '</span></div>' +
            '<p class="sucursal__nota">Retirando acá no hay mínimo de compra.</p>' +
            '<div class="sucursal__acciones">' +
              '<a class="boton boton--azul" href="' + mapa + '" target="_blank" rel="noopener">Cómo llegar</a>' +
              '<a class="boton boton--linea" href="productos.html">Ver productos</a>' +
            '</div>' +
          '</div>' +
          '<iframe class="sucursal__mapa" loading="lazy" title="Mapa de ' + s.nombre + '" ' +
            'src="https://maps.google.com/maps?q=' + encodeURIComponent(s.direccion + ', ' + CONFIG.empresa.ciudad) +
            '&output=embed"></iframe>' +
        '</article>';
    }).join('');
  });

  /* Estado de atención arriba de todo */
  var e = window.estadoAtencion();
  var caja = document.getElementById('estado');
  if (caja) {
    caja.setAttribute('data-abierto', e.abierto ? 'si' : 'no');
    document.getElementById('estadoTexto').textContent = e.texto;
  }

})();
