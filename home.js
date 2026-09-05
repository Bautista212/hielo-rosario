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

  /* ---- Productos destacados ---------------------------------------------
     La tarjeta muestra el precio de contado grande y, solo si es distinto,
     el de cuenta corriente abajo en chico.                                */
  function tarjetaProducto(p) {
    var v = p.variantes[0];
    var hayVarias = p.variantes.length > 1;

    var bloquePrecio = p.aConsultar
      ? '<span class="producto__precio">A consultar</span>'
      : '<span class="producto__precio' + (hayVarias ? ' producto__precio--desde' : '') + '">' +
          (hayVarias ? 'Desde ' : '') + precio(p.desde) +
          '<small>' + (hayVarias ? p.variantes.length + ' presentaciones' : v.nombre) + '</small>' +
        '</span>';

    return '' +
      '<article class="producto">' +
        '<div class="producto__figura">' +
          '<span class="producto__kilos num">' + p.formato + '</span>' +
        '</div>' +
        '<div class="producto__cuerpo">' +
          '<h3 class="producto__nombre">' +
            '<a href="producto.html?p=' + p.slug + '">' + p.nombre + '</a>' +
          '</h3>' +
          (v.hayDiferencia
            ? '<p class="producto__cc">Cuenta corriente: ' + precio(v.cuenta) + '</p>'
            : '') +
          '<div class="producto__pie">' +
            bloquePrecio +
            (p.aConsultar
              ? '<a class="boton boton--linea boton--chico" href="producto.html?p=' + p.slug + '">Ver</a>'
              : hayVarias
                ? '<a class="boton boton--principal boton--chico" href="producto.html?p=' + p.slug + '">Elegir</a>'
                : '<button class="boton boton--principal boton--chico" data-agregar="' + p.slug + '">Agregar</button>') +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function pintarDestacados() {
    var cont = document.getElementById('destacados');
    if (!cont) return;

    Datos.productos({ destacados: true }).then(function (lista) {
      cont.innerHTML = lista.map(tarjetaProducto).join('');

      cont.querySelectorAll('[data-agregar]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          Datos.producto(btn.dataset.agregar).then(function (p) {
            if (!p) return;
            Carrito.agregar(p, p.variantes[0], 1);
            var original = btn.textContent;
            btn.textContent = 'Agregado';
            btn.disabled = true;
            setTimeout(function () { btn.textContent = original; btn.disabled = false; }, 1200);
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
        sc.innerHTML = lista.map(function (s) {
          return '<div class="dato"><strong>' + s.nombre + '</strong></div>' +
                 '<div class="dato"><span>' + s.horario + '</span></div>';
        }).join('');
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
