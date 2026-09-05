/* ==========================================================================
   PRODUCTO.JS — La ficha de un producto.
   Acá se elige la presentación y la cantidad antes de agregarlo al pedido.
   ========================================================================== */

(function () {

  var cont = document.getElementById('ficha');
  var slug = new URLSearchParams(location.search).get('p');

  if (!slug) return mostrarNoEncontrado();

  var elegida = 0;   // índice de la presentación elegida
  var cantidad = 1;
  var producto = null;

  Datos.producto(slug).then(function (p) {
    if (!p) return mostrarNoEncontrado();
    producto = p;
    document.title = p.nombre + ' — Hielo Rosario';
    pintar();
    pintarRelacionados();
  });

  function mostrarNoEncontrado() {
    cont.innerHTML =
      '<div class="aviso aviso--obra">' +
        '<h2>No encontramos ese producto</h2>' +
        '<p>Puede que ya no esté disponible o que el link esté mal.</p>' +
        '<a class="boton boton--azul" href="productos.html">Ver todo el catálogo</a>' +
      '</div>';
  }

  function pintar() {
    var p = producto;
    var v = p.variantes[elegida];
    var enPedido = Carrito.cantidadDe(p.slug, v.nombre);

    var opciones = p.variantes.length > 1
      ? '<div class="presentaciones">' +
          '<h3 class="presentaciones__titulo">Elegí la presentación</h3>' +
          p.variantes.map(function (x, i) {
            return '' +
              '<button class="presentacion' + (i === elegida ? ' presentacion--activa' : '') + '" data-v="' + i + '">' +
                '<span class="presentacion__nombre">' + x.nombre + '</span>' +
                '<span class="presentacion__precio num">' + precio(x.contado) + '</span>' +
              '</button>';
          }).join('') +
        '</div>'
      : '';

    var accion = p.aConsultar
      ? '<div class="aviso">Este producto se cotiza por WhatsApp. ' +
        '<a href="https://wa.me/549' + CONFIG.empresa.whatsapps[0] + '" rel="noopener">Escribinos al ' +
        CONFIG.empresa.whatsapps[0] + '</a>.</div>'
      : '<div class="comprar">' +
          '<div class="contador contador--grande" id="cant">' +
            '<button class="contador__btn" data-paso="-1" aria-label="Restar uno">−</button>' +
            '<span class="contador__n num" id="cantN">' + cantidad + '</span>' +
            '<button class="contador__btn" data-paso="1" aria-label="Sumar uno">+</button>' +
          '</div>' +
          '<button class="boton boton--principal boton--ancho" id="agregar">Agregar al pedido</button>' +
        '</div>' +
        (enPedido > 0
          ? '<p class="ficha__yaesta">Ya tenés ' + enPedido + ' en el pedido. ' +
            '<a href="pedido.html">Ver mi pedido</a></p>'
          : '');

    cont.innerHTML = '' +
      '<nav class="miga"><a href="productos.html">Productos</a> ' +
        '<a href="productos.html?c=' + p.categoria + '" id="migaCat">Categoría</a></nav>' +

      '<div class="ficha">' +
        '<div class="ficha__figura">' +
          (p.imagen
            ? '<img src="' + p.imagen + '" alt="' + p.nombre + '">'
            : '<span class="ficha__formato num">' + p.formato + '</span>') +
        '</div>' +

        '<div class="ficha__datos">' +
          '<h1>' + p.nombre + '</h1>' +
          (p.descripcion ? '<p class="ficha__desc">' + p.descripcion + '</p>' : '') +

          (p.aConsultar ? '' :
            '<div class="ficha__precio">' +
              '<span class="ficha__precio-num num">' + precio(v.contado) + '</span>' +
              '<span class="ficha__precio-nota">' + CONFIG.listas.contado + '</span>' +
              (v.hayDiferencia
                ? '<span class="ficha__precio-cc num">Cuenta corriente: ' + precio(v.cuenta) + '</span>'
                : '') +
            '</div>') +

          opciones +
          accion +

          '<div class="ficha__entrega">' +
            '<p><strong>Retiro:</strong> ' + CONFIG.empresa.direccion + ', sin mínimo de compra.</p>' +
            '<p><strong>Envío:</strong> a domicilio en Rosario. Sin mínimo si el pedido incluye hielo.</p>' +
          '</div>' +
        '</div>' +
      '</div>';

    /* Nombre real de la categoría en la miga de pan */
    Datos.categoria(p.categoria).then(function (c) {
      var el = document.getElementById('migaCat');
      if (el && c) el.textContent = c.nombre;
    });

    conectar();
  }

  function conectar() {
    cont.querySelectorAll('[data-v]').forEach(function (b) {
      b.addEventListener('click', function () {
        elegida = Number(b.dataset.v);
        pintar();
      });
    });

    var caja = document.getElementById('cant');
    if (caja) {
      caja.querySelectorAll('.contador__btn').forEach(function (b) {
        b.addEventListener('click', function () {
          cantidad = Math.max(1, cantidad + Number(b.dataset.paso));
          document.getElementById('cantN').textContent = cantidad;
        });
      });
    }

    var btn = document.getElementById('agregar');
    if (btn) {
      btn.addEventListener('click', function () {
        Carrito.agregar(producto, producto.variantes[elegida], cantidad);
        btn.textContent = 'Agregado al pedido';
        btn.disabled = true;
        setTimeout(function () { cantidad = 1; pintar(); }, 1100);
      });
    }
  }

  /* ---- Otros de la misma categoría --------------------------------------- */
  function pintarRelacionados() {
    var caja = document.getElementById('relacionados');
    var seccion = document.getElementById('seccionRelacionados');
    if (!caja) return;

    Datos.productos({ categoria: producto.categoria }).then(function (lista) {
      var otros = lista.filter(function (p) { return p.slug !== producto.slug; }).slice(0, 4);
      if (!otros.length) { seccion.classList.add('hidden'); return; }
      caja.innerHTML = otros.map(UI.tarjeta).join('');
      UI.conectar(caja, pintarRelacionados);
    });
  }

})();
