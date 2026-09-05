/* ==========================================================================
   DATOS.JS — La única puerta de entrada a la información del sitio.

   Ninguna página lee datos por su cuenta: todas le preguntan a este archivo.
   Hoy responde con datos de ejemplo. Cuando conectemos Supabase, se cambia
   SOLO este archivo y el resto del sitio no se entera.

   Todas las funciones devuelven una promesa, igual que lo hará Supabase,
   así el cambio no obliga a reescribir ninguna pantalla.
   ========================================================================== */

(function () {

  /* ====== DATOS DE EJEMPLO ==============================================
     Precios, sucursales y zonas inventados. Se reemplazan por los reales.
     ====================================================================== */

  var CATEGORIAS = [
    { slug: 'bolsas',        nombre: 'Hielo en bolsa',  descripcion: 'Cubos para vasos, tragos y conservadoras.', orden: 1 },
    { slug: 'escamas',       nombre: 'Hielo en escamas', descripcion: 'Para pescaderías, fiambrerías y exhibición.', orden: 2 },
    { slug: 'barras',        nombre: 'Barras de hielo',  descripcion: 'Bloques macizos, larga duración.', orden: 3 },
    { slug: 'hielo-seco',    nombre: 'Hielo seco',       descripcion: 'Transporte de frío y efectos especiales.', orden: 4 },
    { slug: 'conservadoras', nombre: 'Conservadoras',    descripcion: 'Alquiler y venta de conservadoras.', orden: 5 },
  ];

  var PRODUCTOS = [
    { id: 1,  slug: 'bolsa-cubos-3kg',   nombre: 'Bolsa de cubos 3 kg',   categoria: 'bolsas',  precio: 2900,  unidad: 'bolsa', kilos: 3,  destacado: true,  activo: true, etiqueta: '',          descripcion: 'La clásica para el asado o la previa. Cubo chico, enfría rápido.' },
    { id: 2,  slug: 'bolsa-cubos-5kg',   nombre: 'Bolsa de cubos 5 kg',   categoria: 'bolsas',  precio: 4300,  unidad: 'bolsa', kilos: 5,  destacado: true,  activo: true, etiqueta: 'Más pedido', descripcion: 'Rinde para unas 15 personas en una tarde.' },
    { id: 3,  slug: 'bolsa-cubos-10kg',  nombre: 'Bolsa de cubos 10 kg',  categoria: 'bolsas',  precio: 7800,  unidad: 'bolsa', kilos: 10, destacado: true,  activo: true, etiqueta: '',          descripcion: 'Para reuniones grandes y barras de tragos.' },
    { id: 4,  slug: 'bolsa-cubos-25kg',  nombre: 'Bolsa de cubos 25 kg',  categoria: 'bolsas',  precio: 16500, unidad: 'bolsa', kilos: 25, destacado: false, activo: true, etiqueta: 'Mayorista',  descripcion: 'Formato para bares, boliches y eventos.' },
    { id: 5,  slug: 'escamas-10kg',      nombre: 'Hielo en escamas 10 kg',nombreCorto: 'Escamas 10 kg', categoria: 'escamas', precio: 8600, unidad: 'bolsa', kilos: 10, destacado: true, activo: true, etiqueta: '', descripcion: 'Escama fina, ideal para mostrador de pescadería.' },
    { id: 6,  slug: 'escamas-25kg',      nombre: 'Hielo en escamas 25 kg',categoria: 'escamas', precio: 19000, unidad: 'bolsa', kilos: 25, destacado: false, activo: true, etiqueta: '',          descripcion: 'Formato mayorista para uso comercial diario.' },
    { id: 7,  slug: 'barra-10kg',        nombre: 'Barra de hielo 10 kg',  categoria: 'barras',  precio: 7200,  unidad: 'barra', kilos: 10, destacado: false, activo: true, etiqueta: '',          descripcion: 'Bloque macizo. Dura mucho más que el cubo.' },
    { id: 8,  slug: 'barra-25kg',        nombre: 'Barra de hielo 25 kg',  categoria: 'barras',  precio: 15800, unidad: 'barra', kilos: 25, destacado: false, activo: true, etiqueta: '',          descripcion: 'Para cámaras, puestos de feria y ferias itinerantes.' },
    { id: 9,  slug: 'hielo-seco-5kg',    nombre: 'Hielo seco 5 kg',       categoria: 'hielo-seco', precio: 21000, unidad: 'caja', kilos: 5, destacado: true, activo: true, etiqueta: 'Por encargo', descripcion: 'Pellets a -78 °C. Se encarga con 24 hs de anticipación.' },
    { id: 10, slug: 'conservadora-50l',  nombre: 'Conservadora 50 L',     categoria: 'conservadoras', precio: 12000, unidad: 'unidad', kilos: 0, destacado: false, activo: true, etiqueta: 'Alquiler', descripcion: 'Alquiler por día. Se entrega con el pedido de hielo.' },
    { id: 11, slug: 'conservadora-120l', nombre: 'Conservadora 120 L',    categoria: 'conservadoras', precio: 19000, unidad: 'unidad', kilos: 0, destacado: false, activo: true, etiqueta: 'Alquiler', descripcion: 'Para eventos. Entra hasta 60 kg de hielo en bolsa.' },
  ];

  var SUCURSALES = [
    { id: 1, slug: 'centro',      nombre: 'Centro',       direccion: 'Córdoba 1200', barrio: 'Centro',      telefono: '341 000 0001', lat: -32.9468, lng: -60.6393, horario: 'Lunes a sábado de 8 a 20', retiro: true },
    { id: 2, slug: 'pichincha',   nombre: 'Pichincha',    direccion: 'Brown 1800',   barrio: 'Pichincha',   telefono: '341 000 0002', lat: -32.9312, lng: -60.6531, horario: 'Lunes a sábado de 8 a 21', retiro: true },
    { id: 3, slug: 'fisherton',   nombre: 'Fisherton',    direccion: 'Eva Perón 8500', barrio: 'Fisherton', telefono: '341 000 0003', lat: -32.9241, lng: -60.7263, horario: 'Lunes a sábado de 9 a 19', retiro: true },
    { id: 4, slug: 'planta',      nombre: 'Planta (mayorista)', direccion: 'Av. Circunvalación 4200', barrio: 'Empalme', telefono: '341 000 0004', lat: -32.9660, lng: -60.7010, horario: 'Lunes a viernes de 7 a 17', retiro: true },
  ];

  var ZONAS = [
    { id: 1, nombre: 'Zona 1 — Centro y Pichincha',        costo: 2500, minimo: 8000,  demora: 'Mismo día' },
    { id: 2, nombre: 'Zona 2 — Resto de Rosario',           costo: 3800, minimo: 8000,  demora: 'Mismo día' },
    { id: 3, nombre: 'Zona 3 — Funes, Roldán y Granadero Baigorria', costo: 6500, minimo: 15000, demora: '24 hs' },
  ];

  /* Simula la demora de una consulta real para que las pantallas ya estén
     preparadas para mostrar su estado de "cargando". */
  function responder(valor) {
    return new Promise(function (resolve) {
      setTimeout(function () { resolve(JSON.parse(JSON.stringify(valor))); }, 120);
    });
  }

  /* ====== API PÚBLICA ====================================================
     Esto es lo único que usan las páginas. Las firmas no cambian al
     conectar Supabase.
     ====================================================================== */

  window.Datos = {

    categorias: function () {
      return responder(CATEGORIAS.slice().sort(function (a, b) { return a.orden - b.orden; }));
    },

    /* opciones: { categoria, destacados, buscar, limite } */
    productos: function (opciones) {
      var o = opciones || {};
      var lista = PRODUCTOS.filter(function (p) { return p.activo; });

      if (o.categoria)  lista = lista.filter(function (p) { return p.categoria === o.categoria; });
      if (o.destacados) lista = lista.filter(function (p) { return p.destacado; });
      if (o.buscar) {
        var q = o.buscar.toLowerCase();
        lista = lista.filter(function (p) { return p.nombre.toLowerCase().indexOf(q) !== -1; });
      }
      if (o.limite) lista = lista.slice(0, o.limite);

      return responder(lista);
    },

    producto: function (slug) {
      return responder(PRODUCTOS.find(function (p) { return p.slug === slug; }) || null);
    },

    /* Precio "desde" de cada categoría, para mostrar en la home */
    desdePorCategoria: function (slug) {
      var precios = PRODUCTOS
        .filter(function (p) { return p.activo && p.categoria === slug; })
        .map(function (p) { return p.precio; });
      return responder(precios.length ? Math.min.apply(null, precios) : null);
    },

    sucursales: function () { return responder(SUCURSALES); },
    sucursal: function (slug) {
      return responder(SUCURSALES.find(function (s) { return s.slug === slug; }) || null);
    },

    zonas: function () { return responder(ZONAS); },

    /* --- Pedidos ---------------------------------------------------------
       Por ahora se guardan en el navegador. Al conectar Supabase, esto pasa
       a escribir en las tablas 'pedidos' y 'pedido_items'.                */
    crearPedido: function (pedido) {
      var codigo = 'HR-' + String(Date.now()).slice(-6);
      var registro = Object.assign({}, pedido, {
        codigo: codigo,
        estado: 'recibido',
        creado: new Date().toISOString(),
      });
      var todos = JSON.parse(localStorage.getItem('hr_pedidos') || '[]');
      todos.push(registro);
      localStorage.setItem('hr_pedidos', JSON.stringify(todos));
      return responder(registro);
    },

    pedido: function (codigo) {
      var todos = JSON.parse(localStorage.getItem('hr_pedidos') || '[]');
      return responder(todos.find(function (p) { return p.codigo === codigo; }) || null);
    },

    pedidos: function () {
      return responder(JSON.parse(localStorage.getItem('hr_pedidos') || '[]').reverse());
    },

  };

})();
