/* ==========================================================================
   ADMIN.JS — Panel interno: pedidos y precios.

   IMPORTANTE — cómo funciona hoy
   Los cambios de precio se guardan en ESTE navegador. Para que los vea todo
   el mundo hay que ir a la pestaña "Publicar", descargar el datos.js y
   subirlo a GitHub. Cuando conectemos la base de datos esto desaparece:
   los cambios van a ser instantáneos para todos.
   ========================================================================== */

(function () {

  var CLAVE_SESION = 'hr_admin_ok';

  var login   = document.getElementById('login');
  var panel   = document.getElementById('panel');
  var vista   = document.getElementById('vista');
  var pestanas= document.getElementById('pestanas');

  var estado = { pestana: 'pedidos', buscar: '', categoria: '' };

  /* ---- Acceso ------------------------------------------------------------
     Ojo: esto es una traba visual, no seguridad real. Cualquiera que sepa
     mirar el código la saltea. La seguridad de verdad llega con la base de
     datos, cuando cada empleado tenga su usuario y contraseña.            */
  function pintarLogin() {
    login.innerHTML = '' +
      '<div class="login">' +
        '<h1>Panel interno</h1>' +
        '<p>Ingresá la clave para administrar pedidos y precios.</p>' +
        '<div class="campo">' +
          '<label for="clave">Clave</label>' +
          '<input id="clave" type="password" autocomplete="current-password">' +
        '</div>' +
        '<button class="boton boton--principal boton--ancho" id="entrar">Entrar</button>' +
        '<p class="login__error hidden" id="errorLogin">Clave incorrecta.</p>' +
      '</div>';

    function intentar() {
      var v = document.getElementById('clave').value;
      if (v === CONFIG.admin.clave) {
        sessionStorage.setItem(CLAVE_SESION, '1');
        arrancar();
      } else {
        document.getElementById('errorLogin').classList.remove('hidden');
      }
    }
    document.getElementById('entrar').addEventListener('click', intentar);
    document.getElementById('clave').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') intentar();
    });
  }

  function arrancar() {
    login.classList.add('hidden');
    panel.classList.remove('hidden');
    pintarPestanas();
    pintarVista();
  }

  /* ---- Pestañas ----------------------------------------------------------- */
  function pintarPestanas() {
    var pendientes = Datos.hayCambiosSinExportar();
    var marca = (pendientes || Datos.hayPortadaModificada()) ? ' •' : '';
    var items = [
      { id: 'pedidos',  texto: 'Pedidos' },
      { id: 'productos',texto: 'Productos y precios' },
      { id: 'portada',  texto: 'Portada' },
      { id: 'publicar', texto: 'Publicar' + marca },
    ];
    pestanas.innerHTML = items.map(function (i) {
      return '<button class="chip' + (estado.pestana === i.id ? ' chip--activo' : '') +
             '" data-p="' + i.id + '">' + i.texto + '</button>';
    }).join('');

    pestanas.querySelectorAll('[data-p]').forEach(function (b) {
      b.addEventListener('click', function () {
        estado.pestana = b.dataset.p;
        pintarPestanas(); pintarVista();
      });
    });
  }

  function pintarVista() {
    if (estado.pestana === 'pedidos')   return pintarPedidos();
    if (estado.pestana === 'productos') return pintarProductos();
    if (estado.pestana === 'portada')   return pintarPortada();
    return pintarPublicar();
  }

  /* ======================================================================
     PEDIDOS
     ====================================================================== */
  var ESTADOS = ['recibido', 'preparando', 'entregado'];

  function pintarPedidos() {
    Datos.pedidos().then(function (lista) {
      if (!lista.length) {
        vista.innerHTML =
          '<div class="aviso aviso--obra">' +
            '<h2>Todavía no entró ningún pedido</h2>' +
            '<p>Cuando alguien confirme un pedido desde la web, va a aparecer acá.</p>' +
          '</div>';
        return;
      }

      vista.innerHTML =
        '<div class="admin__barra">' +
          '<h2>' + lista.length + (lista.length === 1 ? ' pedido' : ' pedidos') + '</h2>' +
        '</div>' +
        lista.map(tarjetaPedido).join('');

      vista.querySelectorAll('[data-estado]').forEach(function (b) {
        b.addEventListener('click', function () {
          Datos.actualizarPedido(b.dataset.codigo, { estado: b.dataset.estado }).then(pintarPedidos);
        });
      });
      vista.querySelectorAll('[data-borrar]').forEach(function (b) {
        b.addEventListener('click', function () {
          if (confirm('¿Borrar el pedido ' + b.dataset.borrar + '? No se puede deshacer.')) {
            Datos.borrarPedido(b.dataset.borrar).then(pintarPedidos);
          }
        });
      });
    });
  }

  function tarjetaPedido(p) {
    var f = new Date(p.creado);
    var cuando = f.toLocaleDateString('es-AR') + ' ' +
                 f.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    var wa = 'https://wa.me/549' + (p.cliente.telefono || '').replace(/\D/g, '');

    return '' +
      '<article class="pedido-card pedido-card--' + (p.estado || 'recibido') + '">' +
        '<div class="pedido-card__top">' +
          '<div>' +
            '<h3>' + p.codigo + '</h3>' +
            '<span class="pedido-card__fecha">' + cuando + '</span>' +
          '</div>' +
          '<span class="pedido-card__total num">' + precio(p.total) + '</span>' +
        '</div>' +

        '<div class="pedido-card__cliente">' +
          '<p><strong>' + p.cliente.nombre + '</strong> — ' +
            '<a href="' + wa + '" target="_blank" rel="noopener">' + p.cliente.telefono + '</a></p>' +
          '<p>' + (p.entrega === 'envio'
            ? 'Envío a ' + p.cliente.direccion + ' (' + p.zona + ')'
            : 'Retira en el local') + '</p>' +
          '<p>Pago: ' + p.pago + (p.cliente.cuando ? ' — Para: ' + p.cliente.cuando : '') + '</p>' +
          (p.cliente.notas ? '<p class="pedido-card__notas">' + p.cliente.notas + '</p>' : '') +
        '</div>' +

        '<ul class="pedido-card__items">' +
          p.items.map(function (i) {
            return '<li><span>' + i.cantidad + ' × ' + i.nombre + ' (' + i.presentacion + ')</span>' +
                   '<span class="num">' + precio(i.total) + '</span></li>';
          }).join('') +
          (p.costoEnvio ? '<li><span>Envío</span><span class="num">' + precio(p.costoEnvio) + '</span></li>' : '') +
        '</ul>' +

        '<div class="pedido-card__acciones">' +
          ESTADOS.map(function (e) {
            return '<button class="chip' + ((p.estado || 'recibido') === e ? ' chip--activo' : '') +
                   '" data-estado="' + e + '" data-codigo="' + p.codigo + '">' +
                   e.charAt(0).toUpperCase() + e.slice(1) + '</button>';
          }).join('') +
          '<button class="chip chip--borrar" data-borrar="' + p.codigo + '">Borrar</button>' +
        '</div>' +
      '</article>';
  }

  /* ======================================================================
     PRODUCTOS Y PRECIOS
     ====================================================================== */
  function pintarProductos() {
    Promise.all([Datos.productos({}), Datos.todasLasCategorias()]).then(function (r) {
      var todos = r[0], cats = r[1];

      var lista = todos.filter(function (p) {
        var okCat = !estado.categoria || p.categoria === estado.categoria;
        var okTxt = !estado.buscar ||
          p.nombre.toLowerCase().indexOf(estado.buscar.toLowerCase()) !== -1;
        return okCat && okTxt;
      });

      vista.innerHTML = '' +
        '<div class="admin__barra">' +
          '<div class="buscador">' +
            '<input id="buscarProd" type="search" placeholder="Buscar producto" value="' + estado.buscar + '">' +
          '</div>' +
          '<select id="catProd">' +
            '<option value="">Todas las categorías</option>' +
            cats.map(function (c) {
              return '<option value="' + c.slug + '"' + (estado.categoria === c.slug ? ' selected' : '') +
                     '>' + c.nombre + '</option>';
            }).join('') +
          '</select>' +
        '</div>' +

        '<p class="admin__ayuda">Cambiá el precio y tocá fuera del casillero: se guarda solo. ' +
          'Cuando termines, andá a <strong>Publicar</strong> para que lo vean los clientes.</p>' +

        '<div class="tabla">' +
          '<div class="tabla__cabecera">' +
            '<span>Producto</span><span>Presentación</span>' +
            '<span>Contado</span><span>Cta. corriente</span><span>Visible</span>' +
          '</div>' +
          (lista.length
            ? lista.map(filaProducto).join('')
            : '<div class="aviso">No hay productos con ese filtro.</div>') +
        '</div>';

      var bp = document.getElementById('buscarProd');
      bp.addEventListener('input', function () {
        estado.buscar = bp.value;
        clearTimeout(bp._t);
        bp._t = setTimeout(pintarProductos, 300);
      });
      document.getElementById('catProd').addEventListener('change', function () {
        estado.categoria = this.value;
        pintarProductos();
      });

      conectarEdicion(todos);
    });
  }

  function filaProducto(p) {
    return p.variantes.map(function (v, i) {
      return '' +
        '<div class="tabla__fila' + (p.activo ? '' : ' tabla__fila--oculta') + '">' +
          '<span class="tabla__nombre">' + (i === 0 ? p.nombre : '') + '</span>' +
          '<span class="tabla__pres">' + v.nombre + '</span>' +
          '<input class="tabla__input num" type="number" min="0" value="' + v.contado +
            '" data-slug="' + p.slug + '" data-v="' + i + '" data-campo="contado">' +
          '<input class="tabla__input num" type="number" min="0" value="' + v.cuenta +
            '" data-slug="' + p.slug + '" data-v="' + i + '" data-campo="cuenta">' +
          (i === 0
            ? '<label class="tabla__check"><input type="checkbox" data-activo="' + p.slug + '"' +
              (p.activo ? ' checked' : '') + '></label>'
            : '<span></span>') +
        '</div>';
    }).join('');
  }

  function conectarEdicion(todos) {
    vista.querySelectorAll('.tabla__input').forEach(function (input) {
      input.addEventListener('change', function () {
        var p = todos.find(function (x) { return x.slug === input.dataset.slug; });
        if (!p) return;
        var nuevas = p.variantes.map(function (v) { return [v.nombre, v.contado, v.cuenta]; });
        var i = Number(input.dataset.v);
        var valor = Math.max(0, Number(input.value) || 0);
        nuevas[i][input.dataset.campo === 'contado' ? 1 : 2] = valor;

        Datos.guardarProducto(p.slug, { variantes: nuevas }).then(function () {
          input.classList.add('tabla__input--guardado');
          setTimeout(function () { input.classList.remove('tabla__input--guardado'); }, 900);
          pintarPestanas();
        });
      });
    });

    vista.querySelectorAll('[data-activo]').forEach(function (chk) {
      chk.addEventListener('change', function () {
        Datos.guardarProducto(chk.dataset.activo, { activo: chk.checked }).then(function () {
          pintarProductos(); pintarPestanas();
        });
      });
    });
  }


  /* ======================================================================
     PORTADA — banners, destacados y más vendidos
     ====================================================================== */
  var TONOS = [
    { id: 'azul',  nombre: 'Azul' },
    { id: 'rojo',  nombre: 'Rojo' },
    { id: 'hielo', nombre: 'Claro' },
  ];

  function pintarPortada() {
    Promise.all([Datos.portada(), Datos.productos({})]).then(function (r) {
      var port = r[0], todos = r[1];

      function guardar() { return Datos.guardarPortada(port).then(pintarPestanas); }

      vista.innerHTML = '' +
        '<div class="admin__barra"><h2>Carteles de la portada</h2>' +
          '<button class="boton boton--linea boton--chico" id="nuevoBanner">Agregar cartel</button>' +
        '</div>' +
        '<p class="admin__ayuda">Se van deslizando solos arriba de todo. Sirven para promos, ' +
          'novedades o avisos. Podés apagar uno sin borrarlo.</p>' +
        '<div id="listaBanners">' + port.banners.map(cajaBanner).join('') + '</div>' +

        '<div class="admin__barra"><h2>Destacados</h2></div>' +
        '<p class="admin__ayuda">La primera fila de productos de la portada.</p>' +
        selectorProductos('destacados', port.destacados, todos) +

        '<div class="admin__barra"><h2>Los más vendidos</h2></div>' +
        '<p class="admin__ayuda">La segunda fila de productos de la portada.</p>' +
        selectorProductos('masVendidos', port.masVendidos, todos);

      /* --- Banners --- */
      document.getElementById('nuevoBanner').addEventListener('click', function () {
        port.banners.push({ etiqueta: '', titulo: 'Cartel nuevo', bajada: '', destacado: '',
                            boton: 'Ver productos', link: 'productos.html', imagen: '',
                            tono: 'azul', activo: true });
        guardar().then(pintarPortada);
      });

      vista.querySelectorAll('[data-campo-banner]').forEach(function (el) {
        el.addEventListener('change', function () {
          var i = Number(el.dataset.i);
          var campo = el.dataset.campoBanner;
          port.banners[i][campo] = el.type === 'checkbox' ? el.checked : el.value;
          guardar();
        });
      });

      vista.querySelectorAll('[data-borrar-banner]').forEach(function (b) {
        b.addEventListener('click', function () {
          if (!confirm('¿Borrar este cartel?')) return;
          port.banners.splice(Number(b.dataset.borrarBanner), 1);
          guardar().then(pintarPortada);
        });
      });

      vista.querySelectorAll('[data-mover]').forEach(function (b) {
        b.addEventListener('click', function () {
          var i = Number(b.dataset.i), j = i + Number(b.dataset.mover);
          if (j < 0 || j >= port.banners.length) return;
          var tmp = port.banners[i]; port.banners[i] = port.banners[j]; port.banners[j] = tmp;
          guardar().then(pintarPortada);
        });
      });

      /* --- Filas de productos --- */
      ['destacados', 'masVendidos'].forEach(function (lista) {
        var sel = document.getElementById('add_' + lista);
        sel.addEventListener('change', function () {
          if (!sel.value) return;
          if (port[lista].indexOf(sel.value) === -1) port[lista].push(sel.value);
          guardar().then(pintarPortada);
        });
        vista.querySelectorAll('[data-quitar-' + lista.toLowerCase() + ']').forEach(function (b) {
          b.addEventListener('click', function () {
            port[lista] = port[lista].filter(function (s) { return s !== b.dataset.slug; });
            guardar().then(pintarPortada);
          });
        });
      });
    });
  }

  function cajaBanner(b, i) {
    return '' +
      '<div class="banner-edit' + (b.activo === false ? ' banner-edit--off' : '') + '">' +
        '<div class="banner-edit__top">' +
          '<strong>Cartel ' + (i + 1) + '</strong>' +
          '<div class="banner-edit__acciones">' +
            '<label class="tabla__check"><input type="checkbox" data-campo-banner="activo" data-i="' + i + '"' +
              (b.activo !== false ? ' checked' : '') + '> Visible</label>' +
            '<button class="chip" data-mover="-1" data-i="' + i + '" aria-label="Subir">↑</button>' +
            '<button class="chip" data-mover="1" data-i="' + i + '" aria-label="Bajar">↓</button>' +
            '<button class="chip chip--borrar" data-borrar-banner="' + i + '">Borrar</button>' +
          '</div>' +
        '</div>' +
        '<div class="banner-edit__campos">' +
          campo('Etiqueta chica', 'etiqueta', b.etiqueta, i, 'Promo de la semana') +
          campo('Título', 'titulo', b.titulo, i, 'Hielo para hoy') +
          campo('Número o precio grande', 'destacado', b.destacado, i, '25% o $ 3.900') +
          campo('Texto', 'bajada', b.bajada, i, 'Una línea explicando la promo') +
          campo('Texto del botón', 'boton', b.boton, i, 'Ver productos') +
          campo('Adónde lleva', 'link', b.link, i, 'productos.html?c=hielo') +
          campo('Foto (opcional)', 'imagen', b.imagen, i, 'fotos/promo.jpg') +
          '<label class="campo"><span>Color</span>' +
            '<select data-campo-banner="tono" data-i="' + i + '">' +
              TONOS.map(function (t) {
                return '<option value="' + t.id + '"' + (b.tono === t.id ? ' selected' : '') + '>' + t.nombre + '</option>';
              }).join('') +
            '</select>' +
          '</label>' +
        '</div>' +
      '</div>';
  }

  function campo(rotulo, nombre, valor, i, ejemplo) {
    return '<label class="campo"><span>' + rotulo + '</span>' +
           '<input type="text" data-campo-banner="' + nombre + '" data-i="' + i + '" ' +
           'value="' + String(valor || '').replace(/"/g, '&quot;') + '" placeholder="' + ejemplo + '"></label>';
  }

  function selectorProductos(lista, slugs, todos) {
    var elegidos = slugs.map(function (s) {
      return todos.find(function (p) { return p.slug === s; });
    }).filter(Boolean);

    return '' +
      '<div class="fila-edit">' +
        '<div class="fila-edit__elegidos">' +
          (elegidos.length
            ? elegidos.map(function (p) {
                return '<span class="pastilla">' + p.nombre +
                       '<button data-quitar-' + lista.toLowerCase() + ' data-slug="' + p.slug +
                       '" aria-label="Quitar">×</button></span>';
              }).join('')
            : '<span class="fila-edit__vacio">Todavía no elegiste ninguno.</span>') +
        '</div>' +
        '<select id="add_' + lista + '">' +
          '<option value="">Agregar un producto…</option>' +
          todos.filter(function (p) { return slugs.indexOf(p.slug) === -1; })
               .map(function (p) { return '<option value="' + p.slug + '">' + p.nombre + '</option>'; }).join('') +
        '</select>' +
      '</div>';
  }

  /* ======================================================================
     PUBLICAR — regenera datos.js con los cambios
     ====================================================================== */
  function pintarPublicar() {
    var n = Datos.hayCambiosSinExportar();
    var portadaTocada = Datos.hayPortadaModificada();

    vista.innerHTML = '' +
      '<div class="publicar">' +
        '<h2>Publicar los cambios</h2>' +
        ((n || portadaTocada)
          ? '<p class="publicar__estado publicar__estado--pendiente">' +
              [n ? n + (n === 1 ? ' producto modificado' : ' productos modificados') : '',
               portadaTocada ? 'la portada modificada' : ''].filter(Boolean).join(' y ') +
              '. Por ahora eso lo ves solo vos.</p>'
          : '<p class="publicar__estado">No hay cambios pendientes. Todo lo que ves es lo que ven los clientes.</p>') +

        '<ol class="publicar__pasos">' +
          '<li>Tocá el botón y se te descarga el archivo <strong>datos.js</strong> con los precios nuevos.</li>' +
          '<li>Entrá al repositorio en GitHub y subilo con <strong>Add file → Upload files</strong>. ' +
              'Reemplaza al que está.</li>' +
          '<li>En un minuto la página se actualiza sola para todo el mundo.</li>' +
        '</ol>' +

        '<button class="boton boton--principal" id="descargar"' + ((n || portadaTocada) ? '' : ' disabled') + '>' +
          'Descargar datos.js</button>' +
        ((n || portadaTocada) ? '<button class="boton boton--linea" id="descartar">Descartar mis cambios</button>' : '') +

        '<p class="publicar__nota">Este paso existe porque todavía no conectamos la base de datos. ' +
          'Cuando la conectemos, los precios se van a actualizar solos y esta pestaña desaparece.</p>' +
      '</div>';

    var d = document.getElementById('descargar');
    if (d) d.addEventListener('click', descargarArchivo);

    var x = document.getElementById('descartar');
    if (x) x.addEventListener('click', function () {
      if (confirm('¿Descartar todos los cambios y volver a los precios publicados?')) {
        localStorage.removeItem('hr_portada');
        Datos.descartarCambios().then(function () { location.reload(); });
      }
    });
  }

  function textoDeLinea(p) {
    var vars = '[' + p.variantes.map(function (v) {
      return '[' + txt(v[0]) + ',' + v[1] + ',' + v[2] + ']';
    }).join(',') + ']';
    return '  [' + [txt(p.slug), txt(p.nombre), txt(p.categoria), txt(p.formato),
                    vars, txt(p.descripcion), txt(p.imagen)].join(', ') + '],';
  }

  function txt(s) { return "'" + String(s == null ? '' : s).replace(/'/g, "\\'") + "'"; }

  function bloquePortada(port) {
    return '' +
      '  var BANNERS = [\n' +
      port.banners.map(function (b) {
        return '    { etiqueta: ' + txt(b.etiqueta) + ', titulo: ' + txt(b.titulo) +
               ', bajada: ' + txt(b.bajada) + ', destacado: ' + txt(b.destacado) +
               ', boton: ' + txt(b.boton) + ', link: ' + txt(b.link) +
               ', imagen: ' + txt(b.imagen) + ', tono: ' + txt(b.tono || 'azul') +
               ', activo: ' + (b.activo !== false) + ' },';
      }).join('\n') +
      '\n  ];\n\n' +
      '  var DESTACADOS = [' + port.destacados.map(txt).join(', ') + '];\n\n' +
      '  var MAS_VENDIDOS = [' + port.masVendidos.map(txt).join(', ') + '];\n\n';
  }

  function reemplazar(texto, marcaIni, marcaFin, contenido) {
    var a = texto.indexOf(marcaIni);
    var b = texto.indexOf(marcaFin);
    if (a === -1 || b === -1) return null;
    return texto.slice(0, a) + marcaIni + '\n' + contenido + '  ' + texto.slice(b);
  }

  function descargarArchivo() {
    /* Se lee el datos.js publicado y se le reemplazan solo los dos bloques
       editables. El resto del archivo queda intacto. */
    Promise.all([
      fetch('datos.js?v=' + Date.now()).then(function (r) { return r.text(); }),
      Datos.lineasDelArchivo(),
      Datos.portada(),
    ]).then(function (r) {
        var texto = r[0], productos = r[1], port = r[2];

        texto = reemplazar(texto, '/* === INICIO PORTADA === */', '/* === FIN PORTADA === */',
          bloquePortada(port));

        if (texto) {
          texto = reemplazar(texto, '/* === INICIO PRODUCTOS === */', '  ];',
            '  var LISTA = [\n\n' + productos.map(textoDeLinea).join('\n') + '\n');
        }

        if (!texto) {
          alert('No pude leer el archivo datos.js. Avisale a quien armó la página.');
          return;
        }
        var nuevo = texto;

        var a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([nuevo], { type: 'text/javascript' }));
        a.download = 'datos.js';
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch(function () {
        alert('No se pudo generar el archivo. Probá de nuevo con la página abierta desde el sitio publicado.');
      });
  }

  /* ---- Arranque ----------------------------------------------------------- */
  document.getElementById('salir').addEventListener('click', function () {
    sessionStorage.removeItem(CLAVE_SESION);
    location.reload();
  });

  if (sessionStorage.getItem(CLAVE_SESION) === '1') arrancar();
  else pintarLogin();

})();
