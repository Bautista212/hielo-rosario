/* ==========================================================================
   CONFIG.JS — Todo lo que se cambia seguido, en un solo lugar.
   ========================================================================== */

window.CONFIG = {

  /* ---- EMPRESA ---------------------------------------------------------- */
  empresa: {
    nombre: 'Hielo Rosario',
    descripcion: 'Hielo, bebidas y congelados en Rosario. Retiro en Viamonte 3646 o envío a domicilio.',
    direccion: 'Viamonte 3646',
    ciudad: 'Rosario, Santa Fe',
    telefono: '341 433 3688',
    /* Atienden SOLO por WhatsApp. El primero es el que usan los botones. */
    whatsapps: ['3416754285', '3412514246'],
    email: 'pedidos@hielorosario.com.ar',
    instagram: 'hielorosario',
  },

  /* ---- HORARIOS DE ATENCIÓN ---------------------------------------------
     Lunes a sábados de 7 a 20. Domingos y feriados de 8:30 a 16.
     0 = domingo, 1 = lunes ... 6 = sábado. null = cerrado.                  */
  horarios: {
    0: { abre: '08:30', cierra: '16:00' },
    1: { abre: '07:00', cierra: '20:00' },
    2: { abre: '07:00', cierra: '20:00' },
    3: { abre: '07:00', cierra: '20:00' },
    4: { abre: '07:00', cierra: '20:00' },
    5: { abre: '07:00', cierra: '20:00' },
    6: { abre: '07:00', cierra: '20:00' },
  },

  /* ---- REGLAS DEL PEDIDO ------------------------------------------------
     Sin mínimo retirando en el local o con compra de hielo.                 */
  pedido: {
    montoMinimoEnvio: 8000,
    mediosDePago: ['Efectivo', 'Transferencia', 'Débito', 'Cuenta corriente'],
  },

  /* ---- LAS DOS LISTAS DE PRECIOS ----------------------------------------
     La cuenta corriente es MÁS CARA: es financiación.
     El precio principal que ve el cliente es el de contado.                 */
  listas: {
    contado: 'Efectivo, transferencia o débito',
    cuenta: 'Cuenta corriente',
  },

  /* ---- PANEL INTERNO ----------------------------------------------------
     Cambiá esta clave por la que quieran usar en Hielo Rosario.
     AVISO: es una traba visual, no seguridad de verdad. Alguien que sepa
     mirar el código de la página la puede ver. Sirve para que no entre
     cualquiera de casualidad. La seguridad real llega con Supabase, cuando
     cada empleado tenga usuario y contraseña propios.                      */
  admin: {
    clave: 'hielo2026',
  },

  /* ---- SUPABASE — se completa al final ---------------------------------- */
  supabase: { url: '', anonKey: '' },

};

/* Formatea precios en pesos: 12500 -> "$ 12.500" */
window.precio = function (n) {
  return '$ ' + Number(n).toLocaleString('es-AR');
};
