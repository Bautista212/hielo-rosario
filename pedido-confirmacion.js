/* ==========================================================================
   PEDIDO-CONFIRMACION.JS — "Recibimos tu pedido".
   ========================================================================== */

(function () {

  var cont = document.getElementById('confirmacion');
  var codigo = new URLSearchParams(location.search).get('c');

  if (!codigo) return noEncontrado();

  Datos.pedido(codigo).then(function (p) {
    if (!p) return noEncontrado();
    pintar(p);
  });

  function noEncontrado() {
    cont.innerHTML =
      '<div class="aviso aviso--obra">' +
        '<h2>No encontramos ese pedido</h2>' +
        '<p>Puede que el link esté mal o que se haya hecho desde otro dispositivo.</p>' +
        '<a class="boton boton--azul" href="productos.html">Ver productos</a>' +
      '</div>';
  }

  function pintar(p) {
    /* Mensaje de WhatsApp ya armado, listo para enviar */
    var texto = 'Hola! Hice el pedido ' + p.codigo + ' desde la web.\n\n' +
      p.items.map(function (i) {
        return '• ' + i.cantidad + ' x ' + i.nombre + ' (' + i.presentacion + ')';
      }).join('\n') +
      '\n\nTotal: ' + precio(p.total) +
      '\n' + (p.entrega === 'envio' ? 'Envío a: ' + p.cliente.direccion : 'Retiro en el local') +
      '\nPago: ' + p.pago +
      (p.cliente.cuando ? '\nPara: ' + p.cliente.cuando : '') +
      '\nNombre: ' + p.cliente.nombre;

    var wa = 'https://wa.me/549' + CONFIG.empresa.whatsapps[0] + '?text=' + encodeURIComponent(texto);

    cont.innerHTML = '' +
      '<div class="confirmado">' +
        '<div class="confirmado__marca">' +
          '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>' +
        '</div>' +
        '<h1>Recibimos tu pedido</h1>' +
        '<p class="confirmado__codigo">Número <strong>' + p.codigo + '</strong></p>' +
        '<p class="confirmado__bajada">Guardá este número. Te vamos a escribir por WhatsApp para confirmarlo.</p>' +

        '<a class="boton boton--principal boton--ancho" href="' + wa + '" target="_blank" rel="noopener">' +
          'Avisar por WhatsApp</a>' +
        '<p class="confirmado__nota">Mandando el mensaje se agiliza: llega directo al ' +
          CONFIG.empresa.whatsapps[0] + ' con todo el detalle ya cargado.</p>' +

        '<div class="detalle">' +
          '<h2>Detalle</h2>' +
          p.items.map(function (i) {
            return '<div class="detalle__linea">' +
                     '<span>' + i.cantidad + ' × ' + i.nombre + '<small>' + i.presentacion + '</small></span>' +
                     '<strong class="num">' + precio(i.total) + '</strong>' +
                   '</div>';
          }).join('') +
          (p.costoEnvio
            ? '<div class="detalle__linea"><span>Envío</span><strong class="num">' + precio(p.costoEnvio) + '</strong></div>'
            : '') +
          '<div class="detalle__total"><span>Total</span><strong class="num">' + precio(p.total) + '</strong></div>' +

          '<div class="detalle__datos">' +
            '<p><strong>' + (p.entrega === 'envio' ? 'Envío a' : 'Retiro en') + ':</strong> ' +
              (p.entrega === 'envio' ? p.cliente.direccion + ' — ' + p.zona : CONFIG.empresa.direccion) + '</p>' +
            '<p><strong>Pago:</strong> ' + p.pago + '</p>' +
            (p.cliente.cuando ? '<p><strong>Para:</strong> ' + p.cliente.cuando + '</p>' : '') +
            (p.cliente.notas ? '<p><strong>Aclaraciones:</strong> ' + p.cliente.notas + '</p>' : '') +
          '</div>' +
        '</div>' +

        '<a class="boton boton--linea" href="productos.html">Hacer otro pedido</a>' +
      '</div>';
  }

})();
