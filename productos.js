/* ==========================================================================
   PRODUCTOS.JS — El catálogo completo con buscador y filtro por categoría.
   Solo se descarga al entrar a productos.html.
   ========================================================================== */

(function () {

  var estado = { categoria: '', buscar: '' };

  var grilla  = document.getElementById('grilla');
  var chips   = document.getElementById('filtros');
  var buscador= document.getElementById('buscador');
  var cuenta  = document.getElementById('cuentaResultados');
  var titulo  = document.getElementById('tituloCatalogo');

  /* La categoría puede venir en la dirección: productos.html?c=cervezas */
  var params = new URLSearchParams(location.search);
  estado.categoria = params.get('c') || '';

  /* ---- Filtros ----------------------------------------------------------- */
  function pintarFiltros() {
    Datos.categorias().then(function (cats) {
      var todos = '<button class="chip' + (estado.categoria ? '' : ' chip--activo') +
                  '" data-cat="">Todo el catálogo</button>';

      chips.innerHTML = todos + cats.map(function (c) {
        var activo = estado.categoria === c.slug ? ' chip--activo' : '';
        return '<button class="chip' + activo + '" data-cat="' + c.slug + '">' + c.nombre + '</button>';
      }).join('');

      chips.querySelectorAll('.chip').forEach(function (b) {
        b.addEventListener('click', function () {
          estado.categoria = b.dataset.cat;
          /* Deja la dirección lista para compartir o guardar en favoritos */
          history.replaceState(null, '', estado.categoria ? '?c=' + estado.categoria : 'productos.html');
          pintarFiltros();
          pintarGrilla();
        });
      });
    });
  }

  /* ---- Grilla ------------------------------------------------------------ */
  function pintarGrilla() {
    grilla.innerHTML = '<p class="cargando">Buscando…</p>';

    Datos.productos({ categoria: estado.categoria, buscar: estado.buscar }).then(function (lista) {

      /* Título de la sección según lo que se esté mirando */
      if (estado.buscar) {
        titulo.textContent = 'Resultados para "' + estado.buscar + '"';
      } else if (estado.categoria) {
        Datos.categoria(estado.categoria).then(function (c) {
          if (c) titulo.textContent = c.nombre;
        });
      } else {
        titulo.textContent = 'Todo el catálogo';
      }

      cuenta.textContent = lista.length === 1
        ? '1 producto'
        : lista.length + ' productos';

      if (!lista.length) {
        grilla.innerHTML =
          '<div class="aviso">No encontramos nada con eso. Probá con otra palabra, ' +
          'o miralo por categoría acá arriba.</div>';
        return;
      }

      grilla.innerHTML = lista.map(UI.tarjeta).join('');
      UI.conectar(grilla, pintarGrilla);
    });
  }

  /* ---- Buscador ---------------------------------------------------------- */
  var demora;
  buscador.addEventListener('input', function () {
    clearTimeout(demora);
    demora = setTimeout(function () {
      estado.buscar = buscador.value.trim();
      /* Buscar siempre mira TODO el catálogo: si hubiera un filtro de
         categoría puesto, se suelta. Si no, el que busca "fernet" estando
         en Cervezas no encuentra nada y cree que no lo venden. */
      if (estado.buscar && estado.categoria) {
        estado.categoria = '';
        history.replaceState(null, '', 'productos.html');
        pintarFiltros();
      }
      pintarGrilla();
    }, 250);
  });

  pintarFiltros();
  pintarGrilla();

})();
