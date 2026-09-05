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

    /* Cada línea del pedido es un producto EN UNA presentación concreta.
       Coca 1.5L por unidad y Coca 1.5L pack x6 son dos líneas distintas. */
    agregar: function (producto, variante, cantidad) {
      var items = leer();
      var cant = cantidad || 1;
      var clave = producto.slug + '|' + variante.nombre;
      var existente = items.find(function (i) { return i.clave === clave; });

      if (existente) {
        existente.cantidad += cant;
      } else {
        /* Se guarda copia del nombre y del precio: si mañana cambia el
           precio, el pedido ya hecho conserva el que el cliente vio. */
        items.push({
          clave: clave,
          slug: producto.slug,
          nombre: producto.nombre,
          presentacion: variante.nombre,
          precio: variante.contado,
          precioCuenta: variante.cuenta,
          cantidad: cant,
        });
      }
      guardar(items);
    },

    cambiarCantidad: function (clave, cantidad) {
      var items = leer();
      var item = items.find(function (i) { return i.clave === clave; });
      if (!item) return;
      if (cantidad < 1) return window.Carrito.quitar(clave);
      item.cantidad = cantidad;
      guardar(items);
    },

    quitar: function (clave) {
      guardar(leer().filter(function (i) { return i.clave !== clave; }));
    },

    vaciar: function () { guardar([]); },

    /* Cantidad total de unidades, para el contador del header */
    cuenta: function () {
      return leer().reduce(function (t, i) { return t + i.cantidad; }, 0);
    },

    subtotal: function () {
      return leer().reduce(function (t, i) { return t + i.precio * i.cantidad; }, 0);
    },

    /* Cuánto saldría el mismo pedido con cuenta corriente */
    subtotalCuenta: function () {
      return leer().reduce(function (t, i) { return t + (i.precioCuenta || i.precio) * i.cantidad; }, 0);
    },

  };

})();
