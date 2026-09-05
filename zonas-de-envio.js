/* ==========================================================================
   ZONAS-DE-ENVIO.JS — Hasta dónde llegamos y cuánto sale.
   Las zonas salen de datos.js, así que se cambian en un solo lugar.
   ========================================================================== */

(function () {

  var cont = document.getElementById('zonas');
  if (!cont) return;

  Datos.zonas().then(function (zonas) {
    cont.innerHTML = zonas.map(function (z) {
      var partes = z.nombre.split('—');
      return '' +
        '<article class="zona-card">' +
          '<h3>' + partes[0].trim() + '</h3>' +
          '<p class="zona-card__lugares">' + (partes[1] || '').trim() + '</p>' +
          '<div class="zona-card__costo num">' + precio(z.costo) + '</div>' +
          '<span class="zona-card__demora">' + z.demora + '</span>' +
        '</article>';
    }).join('');
  });

  var min = document.getElementById('minimo');
  if (min) min.textContent = precio(CONFIG.pedido.montoMinimoEnvio);

  var dir = document.getElementById('direccionLocal');
  if (dir) dir.textContent = CONFIG.empresa.direccion;

})();
