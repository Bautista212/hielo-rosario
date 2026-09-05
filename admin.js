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
  var ANCHO_MAXIMO = 1800;      /* a lo ancho, en píxeles */
  var CALIDAD = 0.85;

  /* ======================================================================
     PORTADA — flyers del carrusel, destacados y más vendidos
     ====================================================================== */
  function pintarPortada(resaltarUltimo) {
    Promise.all([Datos.portada(), Datos.productos({})]).then(function (r) {
      var port = r[0], todos = r[1];

      function guardar() { return Datos.guardarPortada(port).then(pintarPestanas); }

      vista.innerHTML = '' +
        '<div class="admin__barra"><h2>Flyers de la portada</h2></div>' +
        '<p class="admin__ayuda">Son las imágenes que se van deslizando arriba de todo. ' +
          'Se ven mejor apaisadas, más o menos <strong>1800 × 780 px</strong>. ' +
          'Si son más grandes, las achicamos solas.</p>' +

        '<div class="soltar" id="soltar">' +
          '<input type="file" id="archivos" accept="image/*" multiple class="hidden">' +
          '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v13"/></svg>' +
          '<strong>Arrastrá los flyers acá</strong>' +
          '<span>o tocá para elegirlos. Podés cargar varios de una vez.</span>' +
        '</div>' +
        '<div id="progreso" class="progreso hidden"></div>' +

        (port.banners.length
          ? '<div class="flyers">' + port.banners.map(cajaFlyer).join('') + '</div>'
          : '<p class="admin__ayuda">Todavía no cargaste ninguno. Mientras tanto, en la portada ' +
            'se muestra un cartel provisorio que va a desaparecer solo cuando cargues el primero.</p>') +

        '<div class="admin__barra"><h2>Destacados</h2></div>' +
        '<p class="admin__ayuda">La primera fila de productos de la portada.</p>' +
        selectorProductos('destacados', port.destacados, todos) +

        '<div class="admin__barra"><h2>Los más vendidos</h2></div>' +
        '<p class="admin__ayuda">La segunda fila de productos de la portada.</p>' +
        selectorProductos('masVendidos', port.masVendidos, todos);

      conectarCarga(port, guardar);
      conectarFlyers(port, guardar);
      conectarFilas(port, guardar, todos);

      if (resaltarUltimo) {
        var nuevo = vista.querySelector('.flyer:last-of-type');
        if (nuevo) {
          nuevo.classList.add('flyer--nuevo');
          nuevo.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(function () { nuevo.classList.remove('flyer--nuevo'); }, 2200);
        }
      }
    });
  }

  function cajaFlyer(b, i) {
    return '' +
      '<div class="flyer' + (b.activo === false ? ' flyer--off' : '') + '">' +
        '<img class="flyer__previa" src="' + b.imagen + '" alt="" ' +
          'onerror="this.closest(\'.flyer\').classList.add(\'flyer--sinsubir\')">' +
        '<div class="flyer__falta">Todavía no está subida a GitHub</div>' +
        '<div class="flyer__datos">' +
          '<strong class="flyer__nombre">' + (b.imagen || '').split('/').pop() + '</strong>' +
          (b.peso ? '<span class="flyer__peso">' + b.peso + '</span>' : '') +
          '<label class="flyer__link"><span>Al tocarlo, lleva a (opcional)</span>' +
            '<input type="text" data-link="' + i + '" value="' + (b.link || '').replace(/"/g, '&quot;') + '" ' +
              'placeholder="productos.html?c=hielo"></label>' +
        '</div>' +
        '<div class="flyer__acciones">' +
          '<label class="tabla__check"><input type="checkbox" data-visible="' + i + '"' +
            (b.activo !== false ? ' checked' : '') + '> Visible</label>' +
          '<button class="chip" data-mover="-1" data-i="' + i + '" aria-label="Subir">↑</button>' +
          '<button class="chip" data-mover="1" data-i="' + i + '" aria-label="Bajar">↓</button>' +
          '<button class="chip chip--borrar" data-borrar-flyer="' + i + '">Borrar</button>' +
        '</div>' +
      '</div>';
  }

  /* ---- Cargar imágenes ---------------------------------------------------
     GitHub Pages no puede recibir archivos. Lo que hacemos es achicar la
     imagen acá mismo y descargarla con el nombre correcto; después se sube
     al repositorio como cualquier otro archivo.                            */
  function conectarCarga(port, guardar) {
    var zona = document.getElementById('soltar');
    var input = document.getElementById('archivos');
    var barra = document.getElementById('progreso');

    zona.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () { procesar(input.files); });

    ['dragenter', 'dragover'].forEach(function (e) {
      zona.addEventListener(e, function (ev) {
        ev.preventDefault(); zona.classList.add('soltar--activa');
      });
    });
    ['dragleave', 'drop'].forEach(function (e) {
      zona.addEventListener(e, function (ev) {
        ev.preventDefault(); zona.classList.remove('soltar--activa');
      });
    });
    zona.addEventListener('drop', function (ev) {
      procesar(ev.dataTransfer.files);
    });

    function procesar(archivos) {
      var lista = Array.prototype.slice.call(archivos)
        .filter(function (f) { return f.type.indexOf('image/') === 0; });
      if (!lista.length) return;

      barra.classList.remove('hidden');
      barra.textContent = 'Preparando ' + lista.length + (lista.length === 1 ? ' imagen…' : ' imágenes…');

      var hechas = 0;
      lista.reduce(function (cadena, archivo) {
        return cadena.then(function () {
          return optimizar(archivo).then(function (r) {
            var nombre = nombreLimpio(archivo.name) + '.jpg';
            descargar(r.blob, nombre);
            port.banners.push({
              imagen: 'fotos/' + nombre,
              peso: tamano(archivo.size) + ' → ' + tamano(r.blob.size) + ', ' + r.ancho + '×' + r.alto,
              link: '',
              activo: true,
            });
            hechas++;
            barra.textContent = 'Listas ' + hechas + ' de ' + lista.length + '…';
            /* Un respiro entre descargas: si van todas juntas, el navegador
               bloquea las que siguen. */
            return new Promise(function (ok) { setTimeout(ok, 400); });
          });
        });
      }, Promise.resolve()).then(function () {
        guardar().then(function () { pintarPortada(true); });
      }).catch(function () {
        barra.textContent = 'Hubo un problema con alguna imagen. Probá con JPG o PNG.';
      });
    }
  }

  function descargar(blob, nombre) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nombre;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }

  function tamano(bytes) {
    return bytes > 1024 * 1024
      ? (bytes / 1024 / 1024).toFixed(1) + ' MB'
      : Math.round(bytes / 1024) + ' KB';
  }

  function optimizar(archivo) {
    return new Promise(function (resolve, reject) {
      var lector = new FileReader();
      lector.onload = function () {
        var img = new Image();
        img.onload = function () {
          var ancho = Math.min(img.width, ANCHO_MAXIMO);
          var alto = Math.round(img.height * (ancho / img.width));
          var lienzo = document.createElement('canvas');
          lienzo.width = ancho; lienzo.height = alto;
          lienzo.getContext('2d').drawImage(img, 0, 0, ancho, alto);
          lienzo.toBlob(function (blob) {
            resolve({ blob: blob, ancho: ancho, alto: alto });
          }, 'image/jpeg', CALIDAD);
        };
        img.onerror = reject;
        img.src = lector.result;
      };
      lector.onerror = reject;
      lector.readAsDataURL(archivo);
    });
  }

  function nombreLimpio(nombre) {
    return nombre.replace(/\.[^.]+$/, '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'flyer';
  }

  function conectarFlyers(port, guardar) {
    vista.querySelectorAll('[data-link]').forEach(function (el) {
      el.addEventListener('change', function () {
        port.banners[Number(el.dataset.link)].link = el.value.trim();
        guardar();
      });
    });
    vista.querySelectorAll('[data-visible]').forEach(function (el) {
      el.addEventListener('change', function () {
        port.banners[Number(el.dataset.visible)].activo = el.checked;
        guardar().then(function () { pintarPortada(); });
      });
    });
    vista.querySelectorAll('[data-mover]').forEach(function (b) {
      b.addEventListener('click', function () {
        var i = Number(b.dataset.i), j = i + Number(b.dataset.mover);
        if (j < 0 || j >= port.banners.length) return;
        var t = port.banners[i]; port.banners[i] = port.banners[j]; port.banners[j] = t;
        guardar().then(function () { pintarPortada(); });
      });
    });
    vista.querySelectorAll('[data-borrar-flyer]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (!confirm('¿Sacar este flyer de la portada?')) return;
        port.banners.splice(Number(b.dataset.borrarFlyer), 1);
        guardar().then(function () { pintarPortada(); });
      });
    });
  }

  function conectarFilas(port, guardar, todos) {
    ['destacados', 'masVendidos'].forEach(function (lista) {
      var sel = document.getElementById('add_' + lista);
      if (!sel) return;
      sel.addEventListener('change', function () {
        if (!sel.value) return;
        if (port[lista].indexOf(sel.value) === -1) port[lista].push(sel.value);
        guardar().then(function () { pintarPortada(); });
      });
      vista.querySelectorAll('[data-quitar-' + lista.toLowerCase() + ']').forEach(function (b) {
        b.addEventListener('click', function () {
          port[lista] = port[lista].filter(function (s) { return s !== b.dataset.slug; });
          guardar().then(function () { pintarPortada(); });
        });
      });
    });
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
        return '    { imagen: ' + txt(b.imagen) + ', link: ' + txt(b.link) +
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
