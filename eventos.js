/* ==========================================================================
   EVENTOS.JS — Calculadora: cuánto hielo hace falta para un evento.

   CÓMO SE CALCULA
   kilos = personas × horas × factor del tipo de evento, y se suma un 25%
   extra si hace calor. Son valores de referencia de la industria; si en
   Hielo Rosario manejan otros números, se cambian acá abajo y listo.
   ========================================================================== */

(function () {

  /* Kilos por persona por hora, según qué se sirve */
  var FACTORES = [
    { id: 'bebidas', titulo: 'Solo bebidas frías',  detalle: 'Gaseosas y cerveza en conservadora',       factor: 0.35 },
    { id: 'tragos',  titulo: 'Bebidas y tragos',    detalle: 'Hielo en el vaso además de enfriar',       factor: 0.60 },
    { id: 'barra',   titulo: 'Barra de tragos',     detalle: 'Coctelería, mucho hielo en cada trago',    factor: 0.90 },
  ];

  var RECARGO_CALOR = 1.25;   /* 25% más cuando hace mucho calor */

  var estado = { personas: 50, horas: 4, tipo: 'tragos', calor: false };

  var form = document.getElementById('calculadora');
  var res  = document.getElementById('resultado');

  function pintarFormulario() {
    form.innerHTML = '' +
      '<div class="campo">' +
        '<label for="personas">¿Cuántas personas?</label>' +
        '<input id="personas" type="number" min="1" max="2000" value="' + estado.personas + '">' +
      '</div>' +

      '<div class="campo">' +
        '<label for="horas">¿Cuántas horas dura?</label>' +
        '<input id="horas" type="number" min="1" max="24" value="' + estado.horas + '">' +
      '</div>' +

      '<div class="campo">' +
        '<label>¿Qué se sirve?</label>' +
        '<div class="opciones opciones--columna">' +
          FACTORES.map(function (f) {
            return '<button class="opcion' + (estado.tipo === f.id ? ' opcion--activa' : '') + '" data-tipo="' + f.id + '">' +
                     '<span class="opcion__titulo">' + f.titulo + '</span>' +
                     '<span class="opcion__detalle">' + f.detalle + '</span>' +
                   '</button>';
          }).join('') +
        '</div>' +
      '</div>' +

      '<div class="campo">' +
        '<label class="check">' +
          '<input type="checkbox" id="calor"' + (estado.calor ? ' checked' : '') + '>' +
          '<span>Va a hacer mucho calor o el evento es al aire libre</span>' +
        '</label>' +
      '</div>';

    document.getElementById('personas').addEventListener('input', function () {
      estado.personas = Math.max(1, Number(this.value) || 1); calcular();
    });
    document.getElementById('horas').addEventListener('input', function () {
      estado.horas = Math.max(1, Number(this.value) || 1); calcular();
    });
    document.getElementById('calor').addEventListener('change', function () {
      estado.calor = this.checked; calcular();
    });
    form.querySelectorAll('[data-tipo]').forEach(function (b) {
      b.addEventListener('click', function () {
        estado.tipo = b.dataset.tipo;
        pintarFormulario(); calcular();
      });
    });
  }

  function calcular() {
    var f = FACTORES.find(function (x) { return x.id === estado.tipo; });
    var kilos = estado.personas * estado.horas * f.factor;
    if (estado.calor) kilos *= RECARGO_CALOR;

    /* Se redondea para arriba de a 5 kg: nadie compra 23,4 kilos */
    kilos = Math.ceil(kilos / 5) * 5;

    res.innerHTML = '' +
      '<div class="resultado__num num">' + kilos + '<small>kg</small></div>' +
      '<p class="resultado__texto">de hielo para ' + estado.personas + ' personas durante ' +
        estado.horas + (estado.horas === 1 ? ' hora' : ' horas') + '.</p>' +

      '<div class="resultado__tips">' +
        '<p><strong>Es una estimación.</strong> Si dudás, pedí un poco de más: el hielo que sobra ' +
          'se guarda en el freezer, el que falta arruina la reunión.</p>' +
        '<p>Vas a necesitar conservadoras para mantenerlo. Si no tenés, las alquilamos.</p>' +
      '</div>' +

      '<div class="resultado__acciones">' +
        '<a class="boton boton--principal" href="productos.html?c=hielo">Ver hielo</a>' +
        '<a class="boton boton--linea" href="https://wa.me/549' + CONFIG.empresa.whatsapps[0] +
          '?text=' + encodeURIComponent('Hola! Necesito ' + kilos + ' kg de hielo para un evento de ' +
          estado.personas + ' personas. ¿Me pasan precio y disponibilidad?') +
          '" target="_blank" rel="noopener">Consultar por WhatsApp</a>' +
      '</div>';
  }

  pintarFormulario();
  calcular();

})();
