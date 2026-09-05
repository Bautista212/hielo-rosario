/* ==========================================================================
   PEDIDO.JS — Revisar el pedido, elegir cómo se recibe y confirmarlo.
   ========================================================================== */

(function () {

  var estado = {
    entrega: 'retiro',        // 'retiro' o 'envio'
    zona: null,
    pago: 'Efectivo',
    datos: { nombre: '', telefono: '', direccion: '', notas: '', cuando: '' },
  };

  var zonas = [];
  var categoriasPorSlug = {};

  var elVacio    = document.getElementById('vacio');
  var elContenido= document.getElementById('contenido');
  var elItems    = document.getElementById('items');
  var elEntrega  = document.getElementById('entrega');
  var elResumen  = document.getElementById('resumen');
  var elForm     = document.getElementById('formulario');

  /* Necesitamos saber qué items son hielo: con hielo no hay mínimo de compra */
  Promise.all([Datos.zonas(), Datos.productos({})]).then(function (r) {
    zonas = r[0];
    estado.zona = zonas[0].id;
    r[1].forEach(function (p) { categoriasPorSlug[p.slug] = p.categoria; });
    pintarTodo();
  });

  function hayHielo() {
    return Carrito.items().some(function (i) { return categoriasPorSlug[i.slug] === 'hielo'; });
  }

  function esCuentaCorriente() { return estado.pago === 'Cuenta corriente'; }

  function subtotal() {
    return esCuentaCorriente() ? Carrito.subtotalCuenta() : Carrito.subtotal();
  }

  function zonaElegida() {
    return zonas.find(function (z) { return z.id === Number(estado.zona); }) || zonas[0];
  }

  function costoEnvio() {
    return estado.entrega === 'envio' ? zonaElegida().costo : 0;
  }

  /* El mínimo solo aplica a envíos que no llevan hielo */
  function faltaParaElMinimo() {
    if (estado.entrega !== 'envio' || hayHielo()) return 0;
    var falta = CONFIG.pedido.montoMinimoEnvio - subtotal();
    return falta > 0 ? falta : 0;
  }

  /* ---- Los productos del pedido ------------------------------------------ */
  function pintarItems() {
    var items = Carrito.items();

    if (!items.length) {
      elVacio.classList.remove('hidden');
      elContenido.classList.add('hidden');
      return;
    }
    elVacio.classList.add('hidden');
    elContenido.classList.remove('hidden');

    elItems.innerHTML = items.map(function (i) {
      var unitario = esCuentaCorriente() ? (i.precioCuenta || i.precio) : i.precio;
      return '' +
        '<div class="linea">' +
          '<div class="linea__datos">' +
            '<a class="linea__nombre" href="producto.html?p=' + i.slug + '">' + i.nombre + '</a>' +
            '<span class="linea__presentacion">' + i.presentacion + ' · ' + precio(unitario) + ' c/u</span>' +
          '</div>' +
          UI.contador(i.clave, i.cantidad) +
          '<span class="linea__total num">' + precio(unitario * i.cantidad) + '</span>' +
          '<button class="linea__quitar" data-quitar="' + i.clave + '" aria-label="Quitar ' + i.nombre + '">' +
            '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
          '</button>' +
        '</div>';
    }).join('');

    UI.conectar(elItems, pintarTodo);
    elItems.querySelectorAll('[data-quitar]').forEach(function (b) {
      b.addEventListener('click', function () {
        Carrito.quitar(b.dataset.quitar);
        pintarTodo();
      });
    });
  }

  /* ---- Retiro o envío ---------------------------------------------------- */
  function pintarEntrega() {
    var opciones = [
      { id: 'retiro', titulo: 'Retiro en el local',  detalle: CONFIG.empresa.direccion + '. Sin mínimo de compra.' },
      { id: 'envio',  titulo: 'Envío a domicilio',   detalle: 'Llegamos a Rosario y alrededores.' },
    ];

    elEntrega.innerHTML = opciones.map(function (o) {
      return '' +
        '<button class="opcion' + (estado.entrega === o.id ? ' opcion--activa' : '') + '" data-entrega="' + o.id + '">' +
          '<span class="opcion__titulo">' + o.titulo + '</span>' +
          '<span class="opcion__detalle">' + o.detalle + '</span>' +
        '</button>';
    }).join('') +

    (estado.entrega === 'envio'
      ? '<div class="zona">' +
          '<label for="zona">Zona de entrega</label>' +
          '<select id="zona">' +
            zonas.map(function (z) {
              return '<option value="' + z.id + '"' + (Number(estado.zona) === z.id ? ' selected' : '') + '>' +
                     z.nombre + ' — ' + precio(z.costo) + ', ' + z.demora.toLowerCase() + '</option>';
            }).join('') +
          '</select>' +
        '</div>'
      : '');

    elEntrega.querySelectorAll('[data-entrega]').forEach(function (b) {
      b.addEventListener('click', function () {
        estado.entrega = b.dataset.entrega;
        pintarEntrega(); pintarFormulario(); pintarResumen();
      });
    });

    var sel = document.getElementById('zona');
    if (sel) sel.addEventListener('change', function () {
      estado.zona = sel.value;
      pintarResumen();
    });
  }

  /* ---- Datos del cliente y forma de pago --------------------------------- */
  function pintarFormulario() {
    var d = estado.datos;

    elForm.innerHTML = '' +
      '<div class="campo">' +
        '<label for="nombre">Tu nombre o el del comercio</label>' +
        '<input id="nombre" type="text" value="' + d.nombre + '" placeholder="Juan Pérez">' +
      '</div>' +
      '<div class="campo">' +
        '<label for="telefono">WhatsApp</label>' +
        '<input id="telefono" type="tel" value="' + d.telefono + '" placeholder="341 555 1234">' +
        '<span class="campo__ayuda">Te escribimos por acá para confirmar el pedido.</span>' +
      '</div>' +
      (estado.entrega === 'envio'
        ? '<div class="campo">' +
            '<label for="direccion">Dirección de entrega</label>' +
            '<input id="direccion" type="text" value="' + d.direccion + '" placeholder="Calle 1234, piso y depto">' +
          '</div>'
        : '') +
      '<div class="campo">' +
        '<label for="cuando">¿Para cuándo lo necesitás?</label>' +
        '<input id="cuando" type="text" value="' + d.cuando + '" placeholder="Hoy a la tarde, mañana temprano...">' +
      '</div>' +

      '<div class="campo">' +
        '<label>Forma de pago</label>' +
        '<div class="pagos">' +
          CONFIG.pedido.mediosDePago.map(function (m) {
            return '<button class="chip' + (estado.pago === m ? ' chip--activo' : '') + '" data-pago="' + m + '">' + m + '</button>';
          }).join('') +
        '</div>' +
        (esCuentaCorriente()
          ? '<span class="campo__ayuda">La cuenta corriente tiene precios financiados, por eso el total sube. ' +
            'Pagando en efectivo, transferencia o débito te sale menos.</span>'
          : '<span class="campo__ayuda">Se abona al retirar o al recibir el pedido.</span>') +
      '</div>' +

      '<div class="campo">' +
        '<label for="notas">Aclaraciones (opcional)</label>' +
        '<textarea id="notas" rows="2" placeholder="Timbre, referencias, algo que tengamos que saber">' + d.notas + '</textarea>' +
      '</div>';

    ['nombre','telefono','direccion','cuando','notas'].forEach(function (k) {
      var el = document.getElementById(k);
      if (el) el.addEventListener('input', function () { estado.datos[k] = el.value; });
    });

    elForm.querySelectorAll('[data-pago]').forEach(function (b) {
      b.addEventListener('click', function () {
        estado.pago = b.dataset.pago;
        /* Cambiar el medio de pago cambia los precios: se repinta todo */
        pintarItems(); pintarFormulario(); pintarResumen();
      });
    });
  }

  /* ---- Resumen y confirmación -------------------------------------------- */
  function pintarResumen() {
    var sub = subtotal();
    var envio = costoEnvio();
    var falta = faltaParaElMinimo();
    var total = sub + envio;

    /* Cuánto se ahorra pagando en el momento */
    var ahorro = Carrito.subtotalCuenta() - Carrito.subtotal();

    elResumen.innerHTML = '' +
      '<h3>Resumen</h3>' +
      '<div class="resumen__linea"><span>Productos</span><strong class="num">' + precio(sub) + '</strong></div>' +
      (estado.entrega === 'envio'
        ? '<div class="resumen__linea"><span>Envío — ' + zonaElegida().nombre.split('—')[0].trim() + '</span>' +
          '<strong class="num">' + precio(envio) + '</strong></div>'
        : '<div class="resumen__linea"><span>Retiro en el local</span><strong>Sin cargo</strong></div>') +
      '<div class="resumen__total"><span>Total</span><strong class="num">' + precio(total) + '</strong></div>' +

      (esCuentaCorriente() && ahorro > 0
        ? '<div class="resumen__aviso">Pagando en efectivo, transferencia o débito ahorrás ' + precio(ahorro) + '.</div>'
        : '') +

      (falta > 0
        ? '<div class="resumen__aviso resumen__aviso--alerta">Para envío a domicilio el mínimo es ' +
          precio(CONFIG.pedido.montoMinimoEnvio) + '. Te faltan ' + precio(falta) + '. ' +
          'Si el pedido incluye hielo, no hay mínimo.</div>'
        : '') +

      '<button class="boton boton--principal boton--ancho" id="confirmar"' + (falta > 0 ? ' disabled' : '') + '>' +
        'Confirmar pedido</button>' +
      '<p class="resumen__nota">No se paga nada ahora. Te escribimos por WhatsApp para confirmar.</p>';

    document.getElementById('confirmar').addEventListener('click', confirmar);
  }

  /* ---- Confirmar --------------------------------------------------------- */
  function confirmar() {
    var d = estado.datos;
    var faltantes = [];
    if (!d.nombre.trim())   faltantes.push('tu nombre');
    if (!d.telefono.trim()) faltantes.push('tu WhatsApp');
    if (estado.entrega === 'envio' && !d.direccion.trim()) faltantes.push('la dirección de entrega');

    if (faltantes.length) {
      alert('Nos falta ' + faltantes.join(', ') + ' para poder tomar el pedido.');
      return;
    }

    var items = Carrito.items().map(function (i) {
      var unitario = esCuentaCorriente() ? (i.precioCuenta || i.precio) : i.precio;
      return {
        slug: i.slug, nombre: i.nombre, presentacion: i.presentacion,
        cantidad: i.cantidad, unitario: unitario, total: unitario * i.cantidad,
      };
    });

    Datos.crearPedido({
      items: items,
      entrega: estado.entrega,
      zona: estado.entrega === 'envio' ? zonaElegida().nombre : null,
      costoEnvio: costoEnvio(),
      subtotal: subtotal(),
      total: subtotal() + costoEnvio(),
      pago: estado.pago,
      cliente: d,
    }).then(function (pedido) {
      Carrito.vaciar();
      location.href = 'pedido-confirmacion.html?c=' + pedido.codigo;
    });
  }

  function pintarTodo() {
    pintarItems();
    if (!Carrito.items().length) return;
    pintarEntrega();
    pintarFormulario();
    pintarResumen();
  }

})();
