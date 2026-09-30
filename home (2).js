/* ==========================================================================
   HOME.JS — La portada: banner deslizable, buscador, categorías,
   destacados y más vendidos.
   ========================================================================== */

(function () {

  /* ======================================================================
     BANNER DESLIZABLE
     ====================================================================== */
  /* La ilustración de cubos que va al costado del texto. Va en SVG: se ve
     nítida en cualquier pantalla y pesa unos pocos caracteres. */
  function cubos() {
    function cubo(x, y, a) {
      var h = a * 0.55, alto = a * 0.8;
      return '' +
        '<path d="M' + (x-a) + ' ' + y + ' L' + x + ' ' + (y+h) + ' L' + x + ' ' + (y+h+alto) +
              ' L' + (x-a) + ' ' + (y+alto) + 'Z" fill="rgba(255,255,255,.16)"/>' +
        '<path d="M' + x + ' ' + (y+h) + ' L' + (x+a) + ' ' + y + ' L' + (x+a) + ' ' + (y+alto) +
              ' L' + x + ' ' + (y+h+alto) + 'Z" fill="rgba(255,255,255,.08)"/>' +
        '<path d="M' + x + ' ' + (y-h) + ' L' + (x+a) + ' ' + y + ' L' + x + ' ' + (y+h) +
              ' L' + (x-a) + ' ' + y + 'Z" fill="rgba(255,255,255,.26)"/>' +
        '<path d="M' + (x-a) + ' ' + y + ' L' + x + ' ' + (y-h) + ' L' + (x+a) + ' ' + y +
              ' M' + (x-a) + ' ' + y + ' L' + x + ' ' + (y+h) + ' L' + (x+a) + ' ' + y +
              ' M' + (x-a) + ' ' + y + ' L' + (x-a) + ' ' + (y+alto) + ' L' + x + ' ' + (y+h+alto) +
              ' L' + (x+a) + ' ' + (y+alto) + ' L' + (x+a) + ' ' + y +
              ' M' + x + ' ' + (y+h) + ' L' + x + ' ' + (y+h+alto) + '" ' +
              'fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>';
    }
    return '<svg class="banner__cubos" viewBox="0 0 380 320" aria-hidden="true">' +
      cubo(175, 120, 86) + cubo(288, 196, 62) + cubo(82, 214, 54) +
    '</svg>';
  }

  function pintarBanners() {
    var cont = document.getElementById('carrusel');
    if (!cont) return;

    Datos.banners().then(function (lista) {
      if (!lista.length) {
        cont.innerHTML =
          '<div class="banner banner--azul">' +
            '<div class="banner__cuerpo">' +
              '<h2 class="banner__titulo">Hielo, bebidas y congelados</h2>' +
              '<p class="banner__bajada">Retiro en Viamonte 3646 sin mínimo de compra, ' +
                'o envío a domicilio en Rosario.</p>' +
              '<span class="banner__boton">Ver el catálogo</span>' +
            '</div>' + cubos() +
          '</div>';
        return;
      }

      cont.innerHTML =
        '<div class="carrusel__pista" id="pista">' +
          lista.map(dibujarBanner).join('') +
        '</div>' +
        (lista.length > 1
          ? '<button class="carrusel__flecha carrusel__flecha--izq" id="izq" aria-label="Anterior">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>' +
            '<button class="carrusel__flecha carrusel__flecha--der" id="der" aria-label="Siguiente">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>' +
            '<div class="carrusel__puntos" id="puntos">' +
              lista.map(function (_, i) {
                return '<button class="carrusel__punto' + (i === 0 ? ' carrusel__punto--activo' : '') +
                       '" data-i="' + i + '" aria-label="Ver cartel ' + (i + 1) + '"></button>';
              }).join('') +
            '</div>'
          : '');

      if (lista.length > 1) conectarCarrusel(lista.length);

      /* Si alguna lámina se quitó por no encontrar su imagen, se vuelve a
         armar el carrusel con las que quedaron. */
      document.addEventListener('banner-roto', function () {
        clearTimeout(pintarBanners._t);
        pintarBanners._t = setTimeout(function () {
          var quedan = cont.querySelectorAll('.banner').length;
          if (!quedan) { pintarBanners(); return; }
          var puntos = document.getElementById('puntos');
          if (puntos && puntos.children.length !== quedan) {
            puntos.innerHTML = Array.from({ length: quedan }).map(function (_, i) {
              return '<button class="carrusel__punto' + (i === 0 ? ' carrusel__punto--activo' : '') +
                     '" data-i="' + i + '" aria-label="Ver cartel ' + (i + 1) + '"></button>';
            }).join('');
            if (quedan > 1) conectarCarrusel(quedan);
            else puntos.remove();
          }
        }, 60);
      }, { once: false });
    });
  }

  function dibujarBanner(b) {
    var envuelve = function (clases, dentro) {
      return b.link
        ? '<a class="banner ' + clases + '" href="' + b.link + '">' + dentro + '</a>'
        : '<div class="banner ' + clases + '">' + dentro + '</div>';
    };

    /* Cartel hecho con una foto del diseñador */
    if (b.tipo === 'foto' || (!b.tipo && b.imagen)) {
      var fuente = b.datos || b.imagen;   /* b.datos = todavía sin publicar */
      /* Si la imagen no está subida todavía, la lámina se saca sola en vez
         de dejar un recuadro blanco en la portada. */
      return envuelve('banner--foto',
        '<img class="banner__foto" src="' + fuente + '" alt="" loading="lazy" ' +
        'onerror="this.closest(\'.banner\').remove(); document.dispatchEvent(new Event(\'banner-roto\'))">');
    }

    /* Cartel dibujado en la página. El texto va primero para que quede a la
       izquierda; la ilustración, a la derecha. */
    return envuelve('banner--' + (b.tono || 'azul'),
      '<div class="banner__cuerpo">' +
        (b.etiqueta ? '<span class="banner__etiqueta">' + b.etiqueta + '</span>' : '') +
        '<h2 class="banner__titulo">' + (b.titulo || '') + '</h2>' +
        (b.bajada ? '<p class="banner__bajada">' + b.bajada + '</p>' : '') +
        (b.boton ? '<span class="banner__boton">' + b.boton + '</span>' : '') +
      '</div>' +
      cubos());
  }

  function conectarCarrusel(total) {
    var pista = document.getElementById('pista');
    var puntos = document.getElementById('puntos');
    var actual = 0;
    var solo = false;   // si el usuario tocó algo, se corta el automático

    function ir(i) {
      actual = (i + total) % total;
      pista.scrollTo({ left: pista.clientWidth * actual, behavior: 'smooth' });
      marcar();
    }
    function marcar() {
      puntos.querySelectorAll('.carrusel__punto').forEach(function (p, i) {
        p.classList.toggle('carrusel__punto--activo', i === actual);
      });
    }

    document.getElementById('izq').addEventListener('click', function () { solo = true; ir(actual - 1); });
    document.getElementById('der').addEventListener('click', function () { solo = true; ir(actual + 1); });
    puntos.querySelectorAll('[data-i]').forEach(function (b) {
      b.addEventListener('click', function () { solo = true; ir(Number(b.dataset.i)); });
    });

    /* Si el usuario desliza con el dedo, se actualiza el puntito */
    var t;
    pista.addEventListener('scroll', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        actual = Math.round(pista.scrollLeft / pista.clientWidth);
        marcar();
      }, 90);
    }, { passive: true });

    /* Avance automático, salvo que la persona prefiera menos movimiento */
    var quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!quieto) {
      setInterval(function () {
        if (!solo && !document.hidden) ir(actual + 1);
      }, 6000);
      pista.addEventListener('mouseenter', function () { solo = true; });
    }
  }

  /* ======================================================================
     BUSCADOR CON SUGERENCIAS
     ====================================================================== */
  function conectarBuscador() {
    var input = document.getElementById('buscarInicio');
    var caja  = document.getElementById('sugerencias');
    if (!input) return;

    var demora;
    input.addEventListener('input', function () {
      clearTimeout(demora);
      var q = input.value.trim();
      if (q.length < 2) { caja.innerHTML = ''; return; }

      demora = setTimeout(function () {
        Datos.productos({ buscar: q, limite: 6 }).then(function (lista) {
          if (!lista.length) {
            caja.innerHTML = '<p class="sugerencias__vacio">No encontramos nada con eso.</p>';
            return;
          }
          caja.innerHTML = lista.map(function (p) {
            return '<a class="sugerencia" href="producto.html?p=' + p.slug + '">' +
                     '<span class="sugerencia__nombre">' + p.nombre + '</span>' +
                     '<span class="sugerencia__precio">' +
                       (p.aConsultar ? 'A consultar' : precio(p.desde)) +
                     '</span>' +
                   '</a>';
          }).join('');
        });
      }, 220);
    });

    /* Enter lleva al catálogo con la búsqueda ya puesta */
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && input.value.trim()) {
        location.href = 'productos.html?q=' + encodeURIComponent(input.value.trim());
      }
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.buscar-inicio')) caja.innerHTML = '';
    });
  }

  /* ======================================================================
     CATEGORÍAS DESPLEGABLES
     ====================================================================== */
  function pintarCategorias() {
    var panel = document.getElementById('catsPanel');
    var boton = document.getElementById('catsBoton');
    if (!panel) return;

    Datos.categorias().then(function (cats) {
      panel.innerHTML = cats.map(function (c) {
        return '<a class="cat-chip" href="productos.html?c=' + c.slug + '">' +
                 '<strong>' + c.nombre + '</strong><span>' + c.descripcion + '</span>' +
               '</a>';
      }).join('');
    });

    boton.addEventListener('click', function () {
      var abierto = !panel.hidden;
      panel.hidden = abierto;
      boton.textContent = abierto ? 'Ver todas las categorías' : 'Ocultar categorías';
      boton.setAttribute('aria-expanded', abierto ? 'false' : 'true');
    });
  }

  /* ======================================================================
     DESTACADOS Y MÁS VENDIDOS
     ====================================================================== */
  function pintarFilas() {
    Datos.portada().then(function (p) {
      llenar('destacados', p.destacados);
      llenar('masVendidos', p.masVendidos);
    });
  }

  function llenar(id, slugs) {
    var cont = document.getElementById(id);
    if (!cont) return;
    if (!slugs || !slugs.length) {
      cont.closest('section').classList.add('hidden');
      return;
    }
    Datos.productos({ slugs: slugs }).then(function (lista) {
      cont.innerHTML = lista.map(UI.tarjeta).join('');
      UI.conectar(cont, function () { llenar(id, slugs); });
    });
  }

  /* ======================================================================
     ESTADO DE ATENCIÓN Y ENTREGA
     ====================================================================== */
  function pintarEstado() {
    var e = window.estadoAtencion();
    var caja = document.getElementById('estado');
    if (!caja) return;
    caja.setAttribute('data-abierto', e.abierto ? 'si' : 'no');
    document.getElementById('estadoTexto').textContent = e.texto;
  }

  function pintarEntrega() {
    var sc = document.getElementById('resumenSucursales');
    if (sc) Datos.sucursales().then(function (lista) {
      sc.innerHTML = lista.map(function (s) {
        return '<div class="dato"><strong>' + s.nombre + '</strong></div>' +
               '<div class="dato"><span>' + s.horario + '</span></div>';
      }).join('');
    });

    var zn = document.getElementById('resumenZonas');
    if (zn) Datos.zonas().then(function (lista) {
      zn.innerHTML = lista.map(function (z) {
        return '<div class="dato"><strong class="num">' + precio(z.costo) + '</strong><span>' + z.nombre + '</span></div>';
      }).join('') +
      '<div class="dato"><span>Sin mínimo si el pedido incluye hielo</span></div>';
    });
  }

  /* Aviso de pedido en curso */
  function pintarAvisoPedido() {
    var caja = document.getElementById('avisoPedido');
    if (!caja || !window.Carrito) return;
    var n = Carrito.cuenta();
    if (!n) { caja.innerHTML = ''; return; }

    caja.innerHTML =
      '<div class="aviso-pedido">' +
        '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>' +
        '<span>Tenés ' + n + (n === 1 ? ' producto' : ' productos') + ' esperando en tu pedido. ' +
          '<a href="pedido.html">Terminá la compra</a></span>' +
        '<button class="aviso-pedido__x" aria-label="Cerrar">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        '</button>' +
      '</div>';

    caja.querySelector('.aviso-pedido__x').addEventListener('click', function () {
      caja.innerHTML = '';
    });
  }

  pintarBanners();
  pintarAvisoPedido();
  conectarBuscador();
  pintarCategorias();
  pintarFilas();
  pintarEstado();
  pintarEntrega();

})();
