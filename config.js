/* ==========================================================================
   CONFIG.JS — Todo lo que se cambia seguido, en un solo lugar.
   Si hay que tocar un teléfono, un horario o un mínimo de envío,
   se toca ACÁ y se actualiza en todas las páginas.
   ========================================================================== */

window.CONFIG = {

  /* ---- EMPRESA ---------------------------------------------------------- */
  empresa: {
    nombre: 'Hielo Rosario',
    descripcion: 'Fábrica y distribución de hielo en Rosario y alrededores.',
    telefono: '+54 341 000 0000',
    whatsapp: '5493410000000',
    email: 'pedidos@hielorosario.com.ar',
    instagram: 'hielorosario',
  },

  /* ---- HORARIOS DE ATENCIÓN ---------------------------------------------
     Con esto la página calcula sola el cartel de "Abierto ahora".
     0 = domingo, 1 = lunes ... 6 = sábado. null = cerrado.                  */
  horarios: {
    0: null,
    1: { abre: '08:00', cierra: '20:00' },
    2: { abre: '08:00', cierra: '20:00' },
    3: { abre: '08:00', cierra: '20:00' },
    4: { abre: '08:00', cierra: '20:00' },
    5: { abre: '08:00', cierra: '21:00' },
    6: { abre: '08:00', cierra: '21:00' },
  },

  /* ---- REGLAS DEL PEDIDO ------------------------------------------------ */
  pedido: {
    montoMinimoEnvio: 8000,       // mínimo para envío a domicilio
    mediosDePago: ['Efectivo', 'Transferencia'],
  },

  /* ---- SUPABASE ---------------------------------------------------------
     Se completa al final. Mientras estén vacíos, el sitio usa los datos
     de ejemplo de datos.js sin romperse.                                    */
  supabase: {
    url: '',
    anonKey: '',
  },

};

/* Formatea precios en pesos: 12500 -> "$ 12.500" */
window.precio = function (n) {
  return '$ ' + Number(n).toLocaleString('es-AR');
};
