/* ==========================================================================
   CARRITO.JS — El pedido en curso.
   Vive en el navegador, así que se mantiene al pasar de una página a otra.
   Cada vez que cambia, avisa al resto del sitio con el evento 'carrito'.
   ========================================================================== */

(function () {

  var CLAVE = 'hr_carrito';

  function leer() {
    try { return JSON.parse(localStorage.getItem(CLAVE) || '[]'); }
    catch (e) { return []; }
  }

  function guardar(items) {
    localStorage.setItem(CLAVE, JSON.stringify(items));
    document.dispatchEvent(new CustomEvent('carrito', { detail: items }));
  }

  window.Carrito = {

    items: leer,

    agregar: function (producto, cantidad) {
      var items = leer();
      var cant = cantidad || 1;
      var existente = items.find(function (i) { return i.id === producto.id; });

      if (existente) {
        existente.cantidad += cant;
      } else {
        /* Se guarda una copia del nombre y del precio: si mañana cambia el
           precio, el pedido ya hecho conserva el que el cliente vio. */
        items.push({
          id: producto.id,
          slug: producto.slug,
          nombre: producto.nombre,
          precio: producto.precio,
          unidad: producto.unidad,
          kilos: producto.kilos || 0,
          cantidad: cant,
        });
      }
      guardar(items);
    },

    cambiarCantidad: function (id, cantidad) {
      var items = leer();
      var item = items.find(function (i) { return i.id === id; });
      if (!item) return;
      item.cantidad = cantidad;
      if (item.cantidad < 1) return window.Carrito.quitar(id);
      guardar(items);
    },

    quitar: function (id) {
      guardar(leer().filter(function (i) { return i.id !== id; }));
    },

    vaciar: function () { guardar([]); },

    /* Cantidad total de unidades, para el contador del header */
    cuenta: function () {
      return leer().reduce(function (t, i) { return t + i.cantidad; }, 0);
    },

    subtotal: function () {
      return leer().reduce(function (t, i) { return t + i.precio * i.cantidad; }, 0);
    },

    kilosTotales: function () {
      return leer().reduce(function (t, i) { return t + (i.kilos || 0) * i.cantidad; }, 0);
    },

  };

})();
