/* ==========================================================================
   HOME.JS — La portada: banner deslizable, buscador, categorías,
   destacados y más vendidos.
   ========================================================================== */

(function () {

  /* ======================================================================
     BANNER DESLIZABLE
     ====================================================================== */
  function pintarBanners() {
    var cont = document.getElementById('carrusel');
    if (!cont) return;

    Datos.banners().then(function (lista) {
      if (!lista.length) { cont.closest('.banners').classList.add('hidden'); return; }

      cont.innerHTML =
        '<div class="carrusel__pista" id="pista">' +
          lista.map(function (b) {
            return '' +
              '<a class="banner banner--' + (b.tono || 'azul') + '" href="' + (b.link || 'productos.html') + '">' +
                (b.imagen
                  ? '<img class="banner__foto" src="' + b.imagen + '" alt=""><span class="banner__velo"></span>'
                  : '') +
                '<div class="banner__cuerpo">' +
                  (b.etiqueta ? '<span class="banner__etiqueta">' + b.etiqueta + '</span>' : '') +
                  '<h2 class="banner__titulo">' + b.titulo + '</h2>' +
                  (b.destacado ? '<span class="banner__destacado num">' + b.destacado + '</span>' : '') +
                  (b.bajada ? '<p class="banner__bajada">' + b.bajada + '</p>' : '') +
                  (b.boton ? '<span class="banner__boton">' + b.boton + '</span>' : '') +
                '</div>' +
              '</a>';
          }).join('') +
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
    });
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

  pintarBanners();
  conectarBuscador();
  pintarCategorias();
  pintarFilas();
  pintarEstado();
  pintarEntrega();

})();
