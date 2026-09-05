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
    var items = [
      { id: 'pedidos',  texto: 'Pedidos' },
      { id: 'productos',texto: 'Productos y precios' },
      { id: 'publicar', texto: 'Publicar' + (pendientes ? ' (' + pendientes + ')' : '') },
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
     PUBLICAR — regenera datos.js con los cambios
     ====================================================================== */
  function pintarPublicar() {
    var n = Datos.hayCambiosSinExportar();

    vista.innerHTML = '' +
      '<div class="publicar">' +
        '<h2>Publicar los cambios</h2>' +
        (n
          ? '<p class="publicar__estado publicar__estado--pendiente">' +
              'Tenés ' + n + (n === 1 ? ' producto modificado' : ' productos modificados') +
              ' que todavía solo ves vos.</p>'
          : '<p class="publicar__estado">No hay cambios pendientes. Todo lo que ves es lo que ven los clientes.</p>') +

        '<ol class="publicar__pasos">' +
          '<li>Tocá el botón y se te descarga el archivo <strong>datos.js</strong> con los precios nuevos.</li>' +
          '<li>Entrá al repositorio en GitHub y subilo con <strong>Add file → Upload files</strong>. ' +
              'Reemplaza al que está.</li>' +
          '<li>En un minuto la página se actualiza sola para todo el mundo.</li>' +
        '</ol>' +

        '<button class="boton boton--principal" id="descargar"' + (n ? '' : ' disabled') + '>' +
          'Descargar datos.js</button>' +
        (n ? '<button class="boton boton--linea" id="descartar">Descartar mis cambios</button>' : '') +

        '<p class="publicar__nota">Este paso existe porque todavía no conectamos la base de datos. ' +
          'Cuando la conectemos, los precios se van a actualizar solos y esta pestaña desaparece.</p>' +
      '</div>';

    var d = document.getElementById('descargar');
    if (d) d.addEventListener('click', descargarArchivo);

    var x = document.getElementById('descartar');
    if (x) x.addEventListener('click', function () {
      if (confirm('¿Descartar todos los cambios y volver a los precios publicados?')) {
        Datos.descartarCambios().then(function () { location.reload(); });
      }
    });
  }

  function textoDeLinea(p) {
    function txt(s) { return "'" + String(s).replace(/'/g, "\\'") + "'"; }
    var vars = '[' + p.variantes.map(function (v) {
      return '[' + txt(v[0]) + ',' + v[1] + ',' + v[2] + ']';
    }).join(',') + ']';
    return '  [' + [txt(p.slug), txt(p.nombre), txt(p.categoria), txt(p.formato),
                    vars, txt(p.descripcion), txt(p.imagen)].join(', ') + '],';
  }

  function descargarArchivo() {
    /* Se lee el datos.js que está publicado y se le reemplaza solo el bloque
       de productos. Así el resto del archivo queda intacto. */
    Promise.all([fetch('datos.js').then(function (r) { return r.text(); }), Datos.lineasDelArchivo()])
      .then(function (r) {
        var texto = r[0], productos = r[1];

        var ini = texto.indexOf('var LISTA = [');
        var fin = texto.indexOf('\n  ];', ini);
        if (ini === -1 || fin === -1) {
          alert('No pude leer el archivo datos.js. Avisale a quien armó la página.');
          return;
        }

        var nuevo = texto.slice(0, ini) +
          'var LISTA = [\n\n' +
          productos.map(textoDeLinea).join('\n') +
          '\n' + texto.slice(fin + 1);

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
