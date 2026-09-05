/* ==========================================================================
   HOME.JS — Solo lo que necesita la página de inicio (index.html).
   El navegador no descarga esto en ninguna otra pantalla.
   ========================================================================== */

(function () {

  /* ---- Cartel de "Abierto ahora" ---------------------------------------- */
  function pintarEstado() {
    var e = window.estadoAtencion();
    var caja = document.getElementById('estado');
    var texto = document.getElementById('estadoTexto');
    if (!caja) return;
    caja.setAttribute('data-abierto', e.abierto ? 'si' : 'no');
    texto.textContent = e.texto;
  }

  /* ---- Categorías ------------------------------------------------------- */
  function pintarCategorias() {
    var cont = document.getElementById('categorias');
    if (!cont) return;

    Datos.categorias().then(function (cats) {
      return Promise.all(cats.map(function (c) {
        return Datos.desdePorCategoria(c.slug).then(function (desde) {
          c.desde = desde;
          return c;
        });
      }));
    }).then(function (cats) {
      cont.innerHTML = cats.map(function (c) {
        return '' +
          '<a class="categoria" href="productos.html?c=' + c.slug + '">' +
            '<span class="categoria__nombre">' + c.nombre + '</span>' +
            '<p class="categoria__desc">' + c.descripcion + '</p>' +
            (c.desde ? '<span class="categoria__desde num">Desde ' + precio(c.desde) + '</span>' : '') +
          '</a>';
      }).join('');
    });
  }

  /* ---- Productos destacados --------------------------------------------- */
  function tarjetaProducto(p) {
    return '' +
      '<article class="producto">' +
        '<div class="producto__figura">' +
          (p.etiqueta ? '<span class="producto__etiqueta">' + p.etiqueta + '</span>' : '') +
          (p.kilos
            ? '<span class="producto__kilos num">' + p.kilos + '<small>kg</small></span>'
            : '<span class="producto__kilos num">' + p.unidad + '</span>') +
        '</div>' +
        '<div class="producto__cuerpo">' +
          '<h3 class="producto__nombre">' +
            '<a href="producto.html?p=' + p.slug + '">' + p.nombre + '</a>' +
          '</h3>' +
          '<p class="producto__desc">' + p.descripcion + '</p>' +
          '<div class="producto__pie">' +
            '<span class="producto__precio">' + precio(p.precio) +
              '<small>por ' + p.unidad + '</small>' +
            '</span>' +
            '<button class="boton boton--principal boton--chico" data-agregar="' + p.slug + '">Agregar</button>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function pintarDestacados() {
    var cont = document.getElementById('destacados');
    if (!cont) return;

    Datos.productos({ destacados: true, limite: 4 }).then(function (lista) {
      cont.innerHTML = lista.map(tarjetaProducto).join('');

      cont.querySelectorAll('[data-agregar]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          Datos.producto(btn.dataset.agregar).then(function (p) {
            if (!p) return;
            Carrito.agregar(p, 1);
            /* Confirmación en el mismo botón: el cliente ve qué pasó sin
               que le tape la pantalla nada. */
            var original = btn.textContent;
            btn.textContent = 'Agregado';
            btn.disabled = true;
            setTimeout(function () {
              btn.textContent = original;
              btn.disabled = false;
            }, 1200);
          });
        });
      });
    });
  }

  /* ---- Resúmenes de entrega --------------------------------------------- */
  function pintarEntrega() {
    var sc = document.getElementById('resumenSucursales');
    if (sc) {
      Datos.sucursales().then(function (lista) {
        sc.innerHTML = lista.slice(0, 3).map(function (s) {
          return '<div class="dato"><strong>' + s.nombre + '</strong><span>' + s.direccion + '</span></div>';
        }).join('') +
        (lista.length > 3
          ? '<div class="dato"><span>y ' + (lista.length - 3) + ' sucursal más</span></div>'
          : '');
      });
    }

    var zn = document.getElementById('resumenZonas');
    if (zn) {
      Datos.zonas().then(function (lista) {
        zn.innerHTML = lista.map(function (z) {
          return '<div class="dato"><strong class="num">' + precio(z.costo) + '</strong><span>' + z.nombre + '</span></div>';
        }).join('') +
        '<div class="dato"><span>Pedido mínimo para envío: <strong class="num">' +
          precio(CONFIG.pedido.montoMinimoEnvio) + '</strong></span></div>';
      });
    }
  }

  pintarEstado();
  pintarCategorias();
  pintarDestacados();
  pintarEntrega();

})();
