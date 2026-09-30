/* ==========================================================================
   LAYOUT.JS — El header y el footer de todo el sitio.
   Se editan ACÁ una sola vez y cambian en todas las páginas.
   ========================================================================== */

(function () {

  var C = window.CONFIG;

  var LINKS = [
    { texto: 'Productos',   url: 'productos.html' },
    { texto: 'Sucursales',  url: 'sucursales.html' },
    { texto: 'Envíos',      url: 'zonas-de-envio.html' },
    { texto: 'Eventos',     url: 'eventos.html' },
    { texto: 'Mayoristas',  url: 'mayoristas.html' },
    { texto: 'Contacto',    url: 'contacto.html' },
  ];

  /* ---- ¿Está abierto ahora? ---------------------------------------------
     Calcula el estado a partir de los horarios de config.js.              */
  function estadoAtencion() {
    var ahora = new Date();
    var hoy = C.horarios[ahora.getDay()];
    var minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();

    function aMinutos(hhmm) {
      var p = hhmm.split(':');
      return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
    }

    if (hoy) {
      var abre = aMinutos(hoy.abre), cierra = aMinutos(hoy.cierra);
      if (minutosAhora >= abre && minutosAhora < cierra) {
        return { abierto: true, texto: 'Abierto ahora, cerramos ' + hoy.cierra };
      }
      if (minutosAhora < abre) {
        return { abierto: false, texto: 'Cerrado, abrimos hoy ' + hoy.abre };
      }
    }
    var dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    for (var i = 1; i <= 7; i++) {
      var d = (ahora.getDay() + i) % 7;
      if (C.horarios[d]) {
        var cuando = (i === 1) ? 'mañana' : 'el ' + dias[d];
        return { abierto: false, texto: 'Cerrado, abrimos ' + cuando + ' ' + C.horarios[d].abre };
      }
    }
    return { abierto: false, texto: 'Cerrado' };
  }

  window.estadoAtencion = estadoAtencion;

  /* ---- Nombre del archivo que se está viendo ---------------------------- */
  function paginaActual() {
    var p = location.pathname.split('/').pop();
    return p === '' ? 'index.html' : p;
  }

  /* ---- HEADER ----------------------------------------------------------- */
  function header() {
    var actual = paginaActual();

    var nav = LINKS.map(function (l) {
      var activo = (actual === l.url);
      return '<a href="' + l.url + '"' + (activo ? ' class="activo" aria-current="page"' : '') + '>' + l.texto + '</a>';
    }).join('');

    return '' +
      '<header class="header">' +
        '<div class="contenedor header__fila">' +
          '<a class="logo" href="index.html">Hielo<span>Rosario</span></a>' +
          '<button class="menu-btn" id="menuBtn" aria-label="Abrir menú" aria-expanded="false">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>' +
          '</button>' +
          '<nav class="nav" id="nav">' + nav + '</nav>' +
          '<a class="pedido-btn" href="pedido.html">' +
            'Mi pedido' +
            '<span class="pedido-btn__cuenta" id="cuentaCarrito" data-vacio="si"></span>' +
          '</a>' +
        '</div>' +
      '</header>';
  }

  /* ---- FOOTER ----------------------------------------------------------- */
  function footer() {
    var e = C.empresa;
    return '' +
      '<footer class="footer">' +
        '<div class="contenedor">' +
          '<div class="footer__grilla">' +
            '<div>' +
              '<div class="footer__logo">Hielo <span>Rosario</span></div>' +
              '<p>' + e.descripcion + '</p>' +
            '</div>' +
            '<div>' +
              '<h4>Comprar</h4>' +
              '<ul>' +
                '<li><a href="productos.html">Todos los productos</a></li>' +
                '<li><a href="eventos.html">Calcular para un evento</a></li>' +
                '<li><a href="mayoristas.html">Precios mayoristas</a></li>' +
                '<li><a href="pedido-seguimiento.html">Seguir mi pedido</a></li>' +
              '</ul>' +
            '</div>' +
            '<div>' +
              '<h4>Entrega</h4>' +
              '<ul>' +
                '<li><a href="sucursales.html">Sucursales</a></li>' +
                '<li><a href="zonas-de-envio.html">Zonas y costos de envío</a></li>' +
                '<li><a href="preguntas-frecuentes.html">Preguntas frecuentes</a></li>' +
              '</ul>' +
            '</div>' +
            '<div>' +
              '<h4>Contacto</h4>' +
              '<ul>' +
                '<li><a href="tel:' + e.telefono.replace(/\s/g, '') + '">' + e.telefono + '</a></li>' +
                '<li><a href="mailto:' + e.email + '">' + e.email + '</a></li>' +
                '<li><a href="https://instagram.com/' + e.instagram + '" rel="noopener">Instagram</a></li>' +
                '<li><a href="nosotros.html">Sobre nosotros</a></li>' +
              '</ul>' +
            '</div>' +
          '</div>' +
          '<div class="footer__legal">' +
            '<span>&copy; ' + new Date().getFullYear() + ' ' + e.nombre + '</span>' +
            '<span>Rosario, Santa Fe, Argentina</span>' +
          '</div>' +
        '</div>' +
      '</footer>';
  }


  /* ======================================================================
     UI — La tarjeta de producto, compartida por la portada, el catálogo y
     los relacionados. Se cambia acá una vez y cambia en todos lados.
     ====================================================================== */
  window.UI = {

    /* La figura: la foto si hay, si no el formato grande */
    figura: function (p) {
      var dentro = p.imagen
        ? '<img src="' + p.imagen + '" alt="' + p.nombre + '" loading="lazy" class="producto__img">'
        : '<span class="producto__kilos num">' + p.formato + '</span>';
      return '<div class="producto__figura">' + dentro + '</div>';
    },

    tarjeta: function (p) {
      var v = p.variantes[0];
      var hayVarias = p.variantes.length > 1;
      var enPedido = window.Carrito ? Carrito.cantidadDe(p.slug, v.nombre) : 0;

      var bloquePrecio = p.aConsultar
        ? '<span class="producto__precio">A consultar</span>'
        : '<span class="producto__precio' + (hayVarias ? ' producto__precio--desde' : '') + '">' +
            (hayVarias ? 'Desde ' : '') + precio(p.desde) +
            '<small>' + (hayVarias ? p.variantes.length + ' presentaciones' : v.nombre) + '</small>' +
          '</span>';

      /* Si ya está en el pedido, el botón se convierte en un contador.
         Así se suman unidades sin salir del catálogo. */
      var accion;
      /* Los botones llevan dos rótulos: el largo para el catálogo y un
         símbolo para cuando la tarjeta va compacta en la portada. */
      if (p.aConsultar) {
        accion = '<a class="boton boton--linea boton--chico" href="producto.html?p=' + p.slug +
                 '" aria-label="Ver ' + p.nombre + '">' +
                 '<span class="boton__texto">Ver</span><span class="boton__mas">›</span></a>';
      } else if (hayVarias) {
        accion = '<a class="boton boton--principal boton--chico" href="producto.html?p=' + p.slug +
                 '" aria-label="Elegir presentación de ' + p.nombre + '">' +
                 '<span class="boton__texto">Elegir</span><span class="boton__mas">›</span></a>';
      } else if (enPedido > 0) {
        accion = UI.contador(p.slug + '|' + v.nombre, enPedido);
      } else {
        /* En la portada el botón es chico y solo dice "+", porque el espacio
           es la mitad. El texto completo se mantiene en el catálogo. */
        accion = '<button class="boton boton--principal boton--chico" data-agregar="' + p.slug +
                 '" aria-label="Agregar ' + p.nombre + '">' +
                 '<span class="boton__texto">Agregar</span><span class="boton__mas">+</span></button>';
      }

      return '' +
        '<article class="producto">' +
          UI.figura(p) +
          '<div class="producto__cuerpo">' +
            '<h3 class="producto__nombre">' +
              '<a href="producto.html?p=' + p.slug + '">' + p.nombre + '</a>' +
            '</h3>' +
            (v.hayDiferencia ? '<p class="producto__cc">Cuenta corriente: ' + precio(v.cuenta) + '</p>' : '') +
            '<div class="producto__pie">' + bloquePrecio + accion + '</div>' +
          '</div>' +
        '</article>';
    },

    /* Contador − 1 + */
    contador: function (clave, cantidad) {
      return '' +
        '<div class="contador" data-clave="' + clave + '">' +
          '<button class="contador__btn" data-paso="-1" aria-label="Quitar uno">−</button>' +
          '<span class="contador__n num">' + cantidad + '</span>' +
          '<button class="contador__btn" data-paso="1" aria-label="Agregar uno">+</button>' +
        '</div>';
    },

    /* Conecta los botones de una grilla ya dibujada.
       alRefrescar se llama cuando hay que volver a pintar las tarjetas. */
    conectar: function (cont, alRefrescar) {
      cont.querySelectorAll('[data-agregar]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          Datos.producto(btn.dataset.agregar).then(function (p) {
            if (!p) return;
            Carrito.agregar(p, p.variantes[0], 1);
            if (alRefrescar) alRefrescar();
          });
        });
      });

      cont.querySelectorAll('.contador').forEach(function (c) {
        c.querySelectorAll('.contador__btn').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var actual = Carrito.cantidadDeClave(c.dataset.clave);
            Carrito.cambiarCantidad(c.dataset.clave, actual + Number(btn.dataset.paso));
            if (alRefrescar) alRefrescar();
          });
        });
      });
    },

  };


  /* ---- BARRA FLOTANTE DE ABAJO (celular) ---------------------------------
     En el teléfono la navegación principal va abajo, al alcance del pulgar,
     y el menú de arriba queda solo para el logo y el pedido.              */
  function barraAbajo() {
    var actual = paginaActual();
    var items = [
      { url: 'index.html', texto: 'Inicio',
        icono: '<path d="M3 9l9-6 9 6v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>' },
      { url: 'productos.html', texto: 'Productos',
        icono: '<path d="M3 3h18v5H3z"/><path d="M5 8v13h14V8"/><path d="M10 12h4"/>' },
      { url: 'pedido.html', texto: 'Mi pedido', cuenta: true,
        icono: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>' },
      { url: 'eventos.html', texto: 'Calcular',
        icono: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h3M13 11h3M8 15h3M13 15h3"/>' },
      { url: '#menu', texto: 'Menú', menu: true,
        icono: '<path d="M3 6h18M3 12h18M3 18h18"/>' },
    ];

    return '<nav class="barra-abajo" aria-label="Navegación">' +
      items.map(function (i) {
        var activo = i.url === actual ? ' class="activo"' : '';
        return '<a href="' + i.url + '"' + activo + (i.menu ? ' id="abrirMenu"' : '') + '>' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
            'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + i.icono + '</svg>' +
          '<span>' + i.texto + '</span>' +
          (i.cuenta ? '<span class="barra-abajo__cuenta" id="cuentaAbajo" data-vacio="si"></span>' : '') +
        '</a>';
      }).join('') +
    '</nav>';
  }

  /* ---- Contador del carrito en el header -------------------------------- */
  function actualizarContador() {
    if (!window.Carrito) return;
    var n = Carrito.cuenta();
    ['cuentaCarrito', 'cuentaAbajo'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.textContent = n > 0 ? n : '';
      el.setAttribute('data-vacio', n > 0 ? 'no' : 'si');
    });
  }

  /* ---- Arranque --------------------------------------------------------- */
  function montar() {
    var h = document.getElementById('header');
    var f = document.getElementById('footer');
    var ba = document.getElementById('barraAbajo');
    if (h) h.innerHTML = header();
    if (f) f.innerHTML = footer();
    /* La barra de abajo se agrega en todas las páginas, aunque el HTML no
       la declare: así no hay que tocar cada archivo. */
    if (!ba) {
      ba = document.createElement('div');
      ba.id = 'barraAbajo';
      document.body.appendChild(ba);
    }
    ba.innerHTML = barraAbajo();

    var btn = document.getElementById('menuBtn');
    var nav = document.getElementById('nav');
    function alternarMenu(e) {
      if (e) e.preventDefault();
      var abierto = nav.classList.toggle('abierto');
      if (btn) btn.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      if (abierto) window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (btn && nav) btn.addEventListener('click', alternarMenu);

    var abrir = document.getElementById('abrirMenu');
    if (abrir && nav) abrir.addEventListener('click', alternarMenu);

    actualizarContador();
    document.addEventListener('carrito', actualizarContador);

    /* El menú se vuelve un poco más sólido apenas se scrollea, para que
       el texto de atrás no compita con el de arriba. */
    var caja = document.getElementById('header');
    if (caja) {
      var marcar = function () {
        caja.classList.toggle('pegado', window.scrollY > 12);
      };
      marcar();
      window.addEventListener('scroll', marcar, { passive: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', montar);
  } else {
    montar();
  }

})();
