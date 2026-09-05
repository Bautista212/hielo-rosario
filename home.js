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
  function pintarDestacados() {
    var cont = document.getElementById('destacados');
    if (!cont) return;

    Datos.productos({ destacados: true }).then(function (lista) {
      cont.innerHTML = lista.map(UI.tarjeta).join('');
      UI.conectar(cont, pintarDestacados);
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
