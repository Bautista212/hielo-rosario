/* ==========================================================================
   DATOS.JS — La única puerta de entrada a la información del sitio.

   Ninguna página lee datos por su cuenta: todas le preguntan a este archivo.
   Cuando conectemos Supabase se cambia SOLO este archivo.

   CÓMO SE LEE CADA PRODUCTO
   -------------------------
   ['slug', 'Nombre', 'categoria', 'formato', [ variantes ], 'descripción', 'imagen']

   La imagen es opcional. Cuando tengan fotos, pegá el link (o el nombre del
   archivo si lo subís al repositorio) como último dato del producto:
     ['quilmes-473', 'Quilmes 473 cc', ..., '', 'fotos/quilmes.jpg']
   Mientras no haya foto se muestra el formato grande, que ya se lee bien.

   Y cada variante es:
   ['Nombre de la presentación', precioContado, precioCuentaCorriente]

   precioContado = efectivo, transferencia o débito (el más barato)
   precioCuentaCorriente = con cuenta corriente (más caro, es financiación)
   Si los dos son iguales, la web no muestra la segunda línea.

   PARA CAMBIAR UN PRECIO: buscá el producto y cambiá el número. Nada más.
   ========================================================================== */

(function () {

  var CATEGORIAS = [
    ['hielo',            'Hielo',                       'Cubos, escamas y barras.'],
    ['gaseosas',         'Gaseosas',                    'Coca, Sprite, Fanta y Cunnington.'],
    ['aguas',            'Aguas y sodas',               'Agua, soda y sifones.'],
    ['jugos',            'Jugos',                       'Exprimidos y concentrados.'],
    ['cervezas',         'Cervezas',                    'Por unidad, x6 y x24.'],
    ['vinos',            'Vinos',                       'Botella suelta o caja x6.'],
    ['aperitivos',       'Aperitivos y bebidas blancas','Fernet, Campari, vodka y más.'],
    ['energizantes',     'Energizantes',                'Speed y Monster.'],
    ['combos',           'Combos',                      'Bebida más gaseosa, a precio cerrado.'],
    ['congelados',       'Congelados',                  'Vegetales, frutas y pollo.'],
    ['pizzas-empanadas', 'Pizzas y empanadas',          'Listas para hornear o freír.'],
    ['hamburgueseria',   'Hamburguesería',              'Hamburguesas, pan y papas.'],
    ['copetin',          'Copetín',                     'Papas, palitos, maníes y copos.'],
    ['carbon',           'Carbón',                      'Para el asado.'],
    ['conservadoras',    'Conservadoras y telgopor',    'Tachos y heladeras.'],
    ['aderezos',         'Aderezos',                    'Ketchup y mayonesa.'],
  ];

  /* ======================================================================
     PRODUCTOS
     ====================================================================== */
  /* === INICIO PRODUCTOS === */
  var LISTA = [

  /* ---- HIELO ------------------------------------------------------------
     PENDIENTE: falta la lista de precios del hielo. Estos son de ejemplo.  */
  ['hielo-cubos-3kg',  'Hielo en cubos 3 kg',  'hielo', '3 kg',  [['Bolsa', 0, 0]], 'Precio a confirmar.'],
  ['hielo-cubos-5kg',  'Hielo en cubos 5 kg',  'hielo', '5 kg',  [['Bolsa', 0, 0]], 'Precio a confirmar.'],

  /* ---- GASEOSAS --------------------------------------------------------- */
  ['coca-15',      'Coca Cola / Coca Zero / Sprite 1.5 L', 'gaseosas', '1.5 L',  [['Unidad',4400,4400],['Pack x6',22000,26400]], ''],
  ['coca-500',     'Coca Cola / Zero / Sprite / Fanta 500 ml', 'gaseosas', '500 ml', [['Unidad',1500,1500],['Pack x12',15500,18400]], ''],
  ['coca-lata-220','Coca / Fanta / Sprite / Coca Zero lata 220 cc', 'gaseosas', '220 cc', [['Unidad',1150,1150],['Pack x6',5750,6700]], ''],
  ['coca-lata-354','Coca / Fanta / Sprite / Coca Zero lata 354 cc', 'gaseosas', '354 cc', [['Unidad',1600,1600],['Pack x6',7980,9500]], ''],
  ['cunnington-500','Cunnington Pomelo / Tónica 500 cc', 'gaseosas', '500 cc', [['Unidad',1000,1000],['Pack x9',7000,8400]], ''],
  ['cunnington-15','Cunnington Pomelo / Tónica 1.5 L', 'gaseosas', '1.5 L', [['Unidad',1700,1700],['Pack x6',8100,9500]], ''],

  /* ---- AGUAS Y SODAS ---------------------------------------------------- */
  ['agua-frutafiel-600',  'Agua Frutafiel 600 cc',        'aguas', '600 cc', [['Pack x6',4400,5200]], ''],
  ['agua-frutafiel-1500', 'Agua Frutafiel 1500 cc',       'aguas', '1.5 L',  [['Pack x6',5800,6700]], ''],
  ['soda-frutafiel-2250', 'Soda Frutafiel a rosca 2250 cc','aguas', '2.25 L', [['Pack x6',5500,6300]], ''],
  ['soda-frutafiel-1000', 'Soda Frutafiel 1000 cc',       'aguas', '1 L',    [['Pack x6',5600,6500]], ''],
  ['agua-rumipal-500',    'Agua Rumipal con o sin gas 500 cc', 'aguas', '500 cc', [['Pack x9',4150,4950]], ''],
  ['soda-rumipal-500',    'Soda Rumipal 500 cc',          'aguas', '500 cc', [['Pack x9',4150,4950]], ''],
  ['soda-rumipal-sifon',  'Soda Rumipal sifón 2 L',       'aguas', '2 L',    [['Pack x6',6300,7300]], ''],
  ['agua-rumipal-2l',     'Agua Rumipal 2 L',             'aguas', '2 L',    [['Pack x6',4830,6500]], ''],
  ['agua-rumipal-6l',     'Agua Rumipal 6 L',             'aguas', '6 L',    [['Pack x2',3400,4100]], ''],

  /* ---- JUGOS ------------------------------------------------------------ */
  ['larancia-naranja',   "Jugo L'Arancia Naranja 5 L",            'jugos', '5 L', [['Bidón',9800,11800]], ''],
  ['larancia-limon',     "Jugo L'Arancia Limón con jengibre 5 L", 'jugos', '5 L', [['Bidón',8800,10200]], ''],
  ['larancia-pomelo',    "Jugo L'Arancia Pomelo 5 L",             'jugos', '5 L', [['Bidón',9800,11800]], ''],
  ['solfruta-naranja-1l','Sol & Fruta Naranja / Naranja Fresh 1 L','jugos', '1 L', [['Unidad',2800,2800],['Caja x8',19700,22000]], ''],
  ['solfruta-naranja-250','Sol & Fruta Naranja 250 cc',           'jugos', '250 cc',[['Unidad',900,900],['Caja x18',15200,17000]], ''],
  ['solfruta-naranja-2l','Sol & Fruta Naranja 2 L',               'jugos', '2 L', [['Unidad',5200,5200],['Caja x6',29600,33000]], ''],
  ['solfruta-limon-1l',  'Sol & Fruta Limón / Pomelo 1 L',        'jugos', '1 L', [['Unidad',3000,3000],['Caja x8',21700,23000]], ''],

  /* ---- CERVEZAS --------------------------------------------------------- */
  ['stella-473',   'Stella Artois 473 cc',   'cervezas', '473 cc', [['Unidad',3000,3000],['Pack x6',16000,18500],['Cajón x24',62300,73900]], ''],
  ['quilmes-473',  'Quilmes 473 cc',         'cervezas', '473 cc', [['Unidad',2200,2200],['Pack x6',11700,13400],['Cajón x24',45300,53700]], ''],
  ['imperial-473', 'Imperial Lager 473 cc',  'cervezas', '473 cc', [['Unidad',3000,3000],['Pack x6',14500,16700],['Cajón x24',56300,66800]], ''],
  ['golden-safi',  'Cerveza Golden Safi',    'cervezas', '473cc/1L', [['Consultar',0,0]], 'Disponible en 473 cc y 1 L. Precio a confirmar por WhatsApp.'],

  /* ---- VINOS ------------------------------------------------------------ */
  ['novecento-malbec',   'Novecento Malbec 750 cc',              'vinos', '750 cc', [['Botella',3900,3900],['Caja x6',21500,23500]], ''],
  ['novecento-blancas',  'Novecento Blend de Blancas 750 cc',    'vinos', '750 cc', [['Botella',3900,3900],['Caja x6',21500,23500]], ''],
  ['dante-malbec',       'Dante Malbec 750 cc',                  'vinos', '750 cc', [['Botella',6000,6000],['Caja x6',32500,36000]], ''],
  ['dante-chardo',       'Dante Chardonnay Sauvignon 750 cc',    'vinos', '750 cc', [['Botella',7300,7300],['Caja x6',40500,45000]], ''],
  ['cordero-malbec',     'Cordero con Piel de Lobo Malbec 750 cc','vinos','750 cc', [['Botella',5500,5500],['Caja x6',28000,31000]], ''],
  ['trumpeter-malbec',   'Trumpeter Malbec 750 cc',              'vinos', '750 cc', [['Botella',10500,10500],['Caja x6',54000,59000]], ''],
  ['latitud',            'Latitud 750 cc',                       'vinos', '750 cc', [['Botella',8600,8600],['Caja x6',43900,48500]], ''],
  ['las-perdices',       'Las Perdices Malbec 750 cc',           'vinos', '750 cc', [['Botella',11000,11000],['Caja x6',50500,55500]], ''],
  ['norton-tardia',      'Norton Cosecha Tardía Blanco Dulce 750 cc','vinos','750 cc',[['Botella',4800,4800],['Caja x6',26900,29999]], ''],
  ['benjamin-chardonnay','Benjamín Blanco Chardonnay 750 cc',    'vinos', '750 cc', [['Botella',6300,6300],['Caja x6',31200,34500]], ''],
  ['alma-mora',          'Alma Mora Malbec 750 cc',              'vinos', '750 cc', [['Botella',5700,5700],['Caja x6',29000,32000]], ''],
  ['santa-julia',        'Santa Julia Malbec 750 cc',            'vinos', '750 cc', [['Botella',6500,6500],['Caja x6',32800,36000]], ''],

  /* ---- APERITIVOS Y BEBIDAS BLANCAS ------------------------------------- */
  ['fernet-branca',      'Fernet Branca 750 ml',        'aperitivos', '750 ml', [['Botella',25200,25200],['Caja x12',213900,249500]], ''],
  ['fernet-con-coca',    'Fernet con Coca 1 L',         'aperitivos', '1 L',    [['Unidad',999,999],['Pack x6',5500,5500]], ''],
  ['campari',            'Campari 750 ml',              'aperitivos', '750 ml', [['Botella',12800,12800],['Caja x12',130000,140000]], ''],
  ['cynar',              'Cynar 750 ml',                'aperitivos', '750 ml', [['Botella',11500,11500],['Caja x12',116000,127000]], ''],
  ['cinzano',            'Cinzano 1 L',                 'aperitivos', '1 L',    [['Botella',9800,9800],['Caja x12',101950,108000]], ''],
  ['gancia',             'Gancia Americano 950 ml',     'aperitivos', '950 ml', [['Botella',8800,8800],['Caja x12',88600,95000]], ''],
  ['amargo-obrero',      'Amargo Obrero 950 ml',        'aperitivos', '950 ml', [['Botella',5500,5500],['Caja x12',55200,62000]], ''],
  ['vodka-sky',          'Vodka Sky 750 ml',            'aperitivos', '750 ml', [['Botella',12300,12300],['Caja x12',124600,135000]], ''],
  ['vodka-sky-cosmic',   'Vodka Sky Cosmic 750 ml',     'aperitivos', '750 ml', [['Botella',13700,13700],['Caja x12',138700,152800]], ''],

  /* ---- ENERGIZANTES ----------------------------------------------------- */
  ['speed-250',    'Speed 250 cc',              'energizantes', '250 cc', [['Unidad',2200,2200],['Caja x24',42900,47500]], ''],
  ['speed-473',    'Speed 473 cc',              'energizantes', '473 cc', [['Unidad',3500,3500],['Pack x6',16300,17000],['Caja x24',64000,70000]], ''],
  ['monster-green','Monster Green 473 cc',      'energizantes', '473 cc', [['Unidad',3500,3500],['Pack x6',17000,19000]], ''],
  ['monster-mango','Monster Mango Loco 473 cc', 'energizantes', '473 cc', [['Unidad',3500,3500],['Pack x6',17000,19000]], ''],

  /* ---- COMBOS (mismo precio en las dos listas) --------------------------- */
  ['combo-fernet-1',   'Fernet Branca 750 ml + Coca Cola 1.5 L',      'combos', 'Combo', [['Combo',24900,24900]], ''],
  ['combo-fernet-2',   'Fernet Branca 750 ml + 2 Coca Cola 1.5 L',    'combos', 'Combo', [['Combo',28400,28400]], ''],
  ['combo-campari',    'Campari 750 ml + Jugo de naranja 5 L',        'combos', 'Combo', [['Combo',21500,21500]], ''],
  ['combo-cynar',      'Cynar 950 ml + Cunnington 1.5 L',             'combos', 'Combo', [['Combo',11900,11900]], ''],
  ['combo-gancia',     'Gancia Americano 950 ml + Sprite 1.5 L',      'combos', 'Combo', [['Combo',11600,11600]], ''],
  ['combo-obrero',     'Amargo Obrero 950 ml + 2 Cunnington 1.5 L',   'combos', 'Combo', [['Combo',7600,7600]], ''],
  ['combo-vodka-250',  'Vodka Sky 750 ml + 2 Speed 250 cc',           'combos', 'Combo', [['Combo',14500,14500]], ''],
  ['combo-vodka-473',  'Vodka Sky 750 ml + 2 Speed 473 cc',           'combos', 'Combo', [['Combo',16800,16800]], ''],
  ['combo-cosmic',     'Vodka Sky Cosmic + 2 Sprite 1.5 L',           'combos', 'Combo', [['Combo',18800,18800]], ''],
  ['combo-hamb-12-83', '12 panes + 12 hamburguesas 83 g + 1 aderezo', 'combos', 'x12',   [['Combo',23999,23999]], ''],
  ['combo-hamb-24-83', '24 panes + 24 hamburguesas 83 g + 2 aderezos','combos', 'x24',   [['Combo',46500,46500]], ''],
  ['combo-hamb-60-83', '60 panes + 60 hamburguesas 83 g + 5 aderezos','combos', 'x60',   [['Combo',112999,112999]], ''],
  ['combo-hamb-12-120','12 panes + 12 hamburguesas 120 g + 1 aderezo','combos', 'x12',   [['Combo',30500,30500]], ''],
  ['combo-hamb-24-120','24 panes + 24 hamburguesas 120 g + 2 aderezos','combos','x24',   [['Combo',59999,59999]], ''],
  ['combo-hamb-60-120','60 panes + 60 hamburguesas 120 g + 5 aderezos','combos','x60',   [['Combo',139999,139999]], ''],

  /* ---- CONGELADOS (Vegetales Conosud y Granjis) -------------------------- */
  ['espinaca',       'Espinaca congelada',            'congelados', '1 kg', [['x 1 kg',8500,8500],['Caja x5 kg',35200,42300]], ''],
  ['zucchini',       'Mix tarta zucchini congelado',  'congelados', '1 kg', [['x 1 kg',6300,6300],['Caja x5 kg',26300,31600]], ''],
  ['acelga',         'Acelga congelada',              'congelados', '1 kg', [['x 1 kg',6000,6000],['Caja x5 kg',24900,29800]], ''],
  ['cebolla-cubos',  'Cebolla en cubos congelada',    'congelados', '1 kg', [['x 1 kg',7200,7200],['Caja x5 kg',29800,35800]], ''],
  ['salsa-tomate',   'Mix salsa de tomate congelada', 'congelados', '1 kg', [['x 1 kg',6700,6700],['Caja x5 kg',27700,33200]], ''],
  ['frutillas',      'Frutillas congeladas',          'congelados', '1 kg', [['x 1 kg',8900,8900],['Caja x5 kg',37000,44300]], ''],
  ['chop-suey',      'Mix chop suey congelado',       'congelados', '1 kg', [['x 1 kg',10100,10100],['Caja x5 kg',41900,50300]], ''],
  ['brocoli',        'Brócoli congelado',             'congelados', '1 kg', [['x 1 kg',10200,10200],['Caja x5 kg',42400,50900]], ''],
  ['pimiento-rojo',  'Pimiento rojo congelado',       'congelados', '1 kg', [['x 1 kg',9900,9900],['Caja x5 kg',49300,59200]], ''],
  ['arandanos',      'Arándanos congelados',          'congelados', '1 kg', [['x 1 kg',12500,12500],['Caja x5 kg',51900,62200]], ''],
  ['relleno-espinaca','Mix relleno de espinaca congelado','congelados','1 kg',[['x 1 kg',8400,8400],['Caja x5 kg',34700,41600]], ''],
  ['frutos-rojos',   'Mix frutos rojos congelados',   'congelados', '1 kg', [['x 1 kg',13300,13300],['Caja x5 kg',55200,66300]], ''],
  ['frutas-tropicales','Mix frutas tropicales congeladas','congelados','1 kg',[['x 1 kg',12100,12100],['Caja x5 kg',50300,60400]], ''],
  ['medallones-pollo','Medallones de pollo Granjis',  'congelados', '4 u.', [['x 4 unidades',3500,3500],['x 1 kg',9000,9000],['Caja x5 kg',41900,47000]], ''],
  ['patitas-pollo',  'Patitas de pollo Granjis',      'congelados', '1 kg', [['x 1 kg',9000,9000],['Caja x5 kg',41900,47000]], ''],
  ['nuggets',        'Nuggets de pollo Granjis',      'congelados', '1 kg', [['x 1 kg',13000,13000],['Caja x6 kg',69300,73800]], ''],

  /* ---- PIZZAS Y EMPANADAS ------------------------------------------------ */
  ['emp-annabelle-jyq',   'Empanadas Annabelle jamón y queso x12', 'pizzas-empanadas', 'x12', [['Docena',10200,11800]], 'Para hornear o freír.'],
  ['emp-annabelle-dulce', 'Empanadas Annabelle carne dulce x12',   'pizzas-empanadas', 'x12', [['Docena',10200,11800]], 'Para hornear o freír.'],
  ['emp-annabelle-salada','Empanadas Annabelle carne salada x12',  'pizzas-empanadas', 'x12', [['Docena',10200,11800]], 'Para hornear o freír.'],
  ['emp-annabelle-verdura','Empanadas Annabelle verdura x12',      'pizzas-empanadas', 'x12', [['Docena',10200,11800]], 'Para hornear o freír.'],
  ['emp-gamma-jyq',     'Empanadas Gamma jamón y queso x6',  'pizzas-empanadas', 'x6', [['Media docena',7500,8500]], 'Para hornear o freír.'],
  ['emp-gamma-carne',   'Empanadas Gamma carne suave x6',    'pizzas-empanadas', 'x6', [['Media docena',7500,8500]], 'Para hornear o freír.'],
  ['emp-gamma-choclo',  'Empanadas Gamma choclo x6',         'pizzas-empanadas', 'x6', [['Media docena',7500,8500]], 'Para hornear o freír.'],
  ['emp-gamma-verdura', 'Empanadas Gamma verdura x6',        'pizzas-empanadas', 'x6', [['Media docena',7500,8500]], 'Para hornear o freír.'],
  ['emp-gamma-atun',    'Empanadas Gamma atún x6',           'pizzas-empanadas', 'x6', [['Media docena',7500,8500]], 'Para hornear o freír.'],
  ['emp-gamma-pollo',   'Empanadas Gamma pollo x6',          'pizzas-empanadas', 'x6', [['Media docena',7500,8500]], 'Para hornear o freír.'],
  ['emp-gamma-cebolla', 'Empanadas Gamma cebolla x6',        'pizzas-empanadas', 'x6', [['Media docena',7500,8500]], 'Para hornear o freír.'],
  ['emp-gamma-arabe',   'Empanadas Gamma árabe x6',          'pizzas-empanadas', 'x6', [['Media docena',7500,8500]], 'Para hornear o freír.'],
  ['pizza-muzarella',   'Pizza muzarella',                   'pizzas-empanadas', '8 porc.', [['Unidad',6999,9000]], 'Lista para hornear, 8 porciones.'],
  ['pizza-especial',    'Pizza especial',                    'pizzas-empanadas', '8 porc.', [['Unidad',6999,9000]], 'Lista para hornear, 8 porciones.'],
  ['pizza-fugazza',     'Pizza fugazza',                     'pizzas-empanadas', '8 porc.', [['Unidad',6999,9000]], 'Lista para hornear, 8 porciones.'],
  ['pizza-calabresa',   'Pizza calabresa',                   'pizzas-empanadas', '8 porc.', [['Unidad',6999,9000]], 'Lista para hornear, 8 porciones.'],
  ['pizza-napolitana',  'Pizza napolitana',                  'pizzas-empanadas', '8 porc.', [['Unidad',6999,9000]], 'Lista para hornear, 8 porciones.'],
  ['pizza-muzza-panceta','Pizza muzza con panceta',          'pizzas-empanadas', '8 porc.', [['Unidad',6999,9000]], 'Lista para hornear, 8 porciones.'],
  ['pizza-cheddar',     'Pizza cheddar con panceta',         'pizzas-empanadas', '8 porc.', [['Unidad',6999,9000]], 'Lista para hornear, 8 porciones.'],
  ['pizza-roquefort',   'Pizza roquefort',                   'pizzas-empanadas', '8 porc.', [['Unidad',6999,9000]], 'Lista para hornear, 8 porciones.'],
  ['pizza-verdeo',      'Pizza verdeo y panceta',            'pizzas-empanadas', '8 porc.', [['Unidad',6999,9000]], 'Lista para hornear, 8 porciones.'],
  ['pizza-fugafort',    'Pizza fugafort',                    'pizzas-empanadas', '8 porc.', [['Unidad',6999,9000]], 'Lista para hornear, 8 porciones.'],
  ['pizza-pollo',       'Pizza de pollo',                    'pizzas-empanadas', '8 porc.', [['Unidad',6999,9000]], 'Lista para hornear, 8 porciones.'],
  ['pizza-salchicha',   'Pizza de salchicha',                'pizzas-empanadas', '8 porc.', [['Unidad',6999,9000]], 'Lista para hornear, 8 porciones.'],
  ['pizza-3-quesos',    'Pizza 3 quesos',                    'pizzas-empanadas', '8 porc.', [['Unidad',6999,9000]], 'Lista para hornear, 8 porciones.'],

  /* ---- HAMBURGUESERÍA ---------------------------------------------------- */
  ['hamb-83',       'Hamburguesa La Muñeca 83 g',    'hamburgueseria', '83 g',  [['Paquete x2',2700,2700],['Caja x30',66000,76000]], ''],
  ['hamb-120',      'Hamburguesa La Muñeca 120 g',   'hamburgueseria', '120 g', [['Paquete x2',3600,3600],['Caja x24',78500,89999]], ''],
  ['pan-hamburguesa','Pan de hamburguesas Estrella x4','hamburgueseria','x4',   [['Paquete',2500,3000]], ''],
  ['papas-butler',  'Papas bastón Butler 15 kg',     'hamburgueseria', '2,5 kg',[['Bolsa',10500,10500],['Caja x15 kg',58000,67000]], 'Pre-cocidas, 6 bolsas de 2,5 kg.'],
  ['papas-adoradas','Papas bastón Adoradas 2 kg',    'hamburgueseria', '2 kg',  [['Bolsa',9600,9600],['Caja x14 kg',57999,66700]], 'Pre-cocidas.'],
  ['pebete-jyq',    'Pebetitos jamón y queso x6',    'hamburgueseria', 'x6',    [['Pack',5500,6000]], ''],
  ['pebete-syq',    'Pebetitos salame y queso x6',   'hamburgueseria', 'x6',    [['Pack',5500,6000]], ''],

  /* ---- COPETÍN (Pedrin) -------------------------------------------------- */
  ['manies-saborizados-1k','Maníes saborizados 1 kg', 'copetin', '1 kg',  [['Bolsa',8500,9500]], ''],
  ['manies-saborizados-200','Maní saborizado 200 g',  'copetin', '200 g', [['Bolsa',1700,2000]], ''],
  ['manies-pelados-140',  'Maníes pelados 140 g',     'copetin', '140 g', [['Bolsa',2200,2600]], ''],
  ['manies-pelados-900',  'Maníes pelados 900 g',     'copetin', '900 g', [['Bolsa',11300,12900]], ''],
  ['copos-80',   'Copos 80 g',    'copetin', '80 g',  [['Bolsa',2200,2600]], ''],
  ['copos-180',  'Copos 180 g',   'copetin', '180 g', [['Bolsa',3999,4800]], ''],
  ['copos-550',  'Copos 550 g',   'copetin', '550 g', [['Bolsa',8200,9200]], ''],
  ['palitos-80', 'Palitos 80 g',  'copetin', '80 g',  [['Bolsa',1400,1800]], ''],
  ['palitos-180','Palitos 180 g', 'copetin', '180 g', [['Bolsa',2300,2700]], ''],
  ['palitos-700','Palitos 700 g', 'copetin', '700 g', [['Bolsa',8200,9200]], ''],
  ['papas-70',   'Papas 70 g',    'copetin', '70 g',  [['Bolsa',2200,2600]], ''],
  ['papas-170',  'Papas 170 g',   'copetin', '170 g', [['Bolsa',4500,5300]], ''],
  ['papas-700',  'Papas 700 g',   'copetin', '700 g', [['Bolsa',16300,18500]], ''],
  ['papas-sabor-70','Papas sabor 70 g','copetin','70 g',[['Bolsa',2800,3300]], ''],
  ['chalitas-300','Chalitas 300 g','copetin', '300 g', [['Bolsa',10000,12000]], ''],
  ['surtido-120','Surtido 120 g', 'copetin', '120 g', [['Bolsa',3999,4800]], ''],
  ['conitos-70', 'Conitos 70 g',  'copetin', '70 g',  [['Bolsa',2600,3000]], ''],

  /* ---- CARBÓN ------------------------------------------------------------ */
  ['carbon-changuito','Carbón changuito 4 kg', 'carbon', '4 kg',   [['Bolsa',3900,4500]], ''],
  ['carbon-premium',  'Carbón premium 4 kg',   'carbon', '4 kg',   [['Bolsa',4500,5200]], ''],
  ['carbon-super',    'Carbón premium 3,5 kg', 'carbon', '3,5 kg', [['Bolsa',4100,5100]], ''],

  /* ---- CONSERVADORAS Y TELGOPOR ------------------------------------------ */
  ['heladera-telgopor','Heladera de telgopor L', 'conservadoras', 'L',      [['Unidad',11000,15000]], ''],
  ['medio-tacho',      'Medio tacho',            'conservadoras', '1/2',    [['Unidad',27500,30000]], ''],
  ['tacho-entero',     'Tacho entero',           'conservadoras', 'Entero', [['Unidad',49999,53000]], ''],

  /* ---- ADEREZOS ---------------------------------------------------------- */
  ['ketchup',  'Ketchup 250 g',  'aderezos', '250 g', [['Unidad',2000,2300]], ''],
  ['mayonesa', 'Mayonesa 250 g', 'aderezos', '250 g', [['Unidad',2200,2500]], ''],

  ];

  /* === INICIO PORTADA === */
  /* Todo esto se edita desde el panel interno, en la pestaña "Portada".
     Si preferís tocarlo a mano, también se puede.                          */


  /* Los flyers que se van deslizando arriba de todo.
     Son solo imágenes: el diseño va adentro de la foto.
     Se cargan desde el panel interno, en la pestaña "Portada".            */
  var BANNERS = [
  ];

  /* Los que aparecen en "Destacados" y en "Los más vendidos".
     Son los identificadores (slug) de cada producto.                       */
  var DESTACADOS = ['hielo-cubos-5kg', 'coca-15', 'quilmes-473', 'carbon-changuito'];

  var MAS_VENDIDOS = ['hielo-cubos-3kg', 'fernet-branca', 'stella-473', 'pizza-muzarella',
                      'emp-gamma-carne', 'papas-170'];

  /* === FIN PORTADA === */

  /* ======================================================================
     De acá para abajo no hace falta tocar nada.
     ====================================================================== */

  var CATS = CATEGORIAS.map(function (c, i) {
    return { slug: c[0], nombre: c[1], descripcion: c[2], orden: i + 1 };
  });

  /* Cambios hechos desde el panel de administración. Viven en el navegador
     hasta que se exporta el archivo y se sube a GitHub (o hasta que
     conectemos Supabase, que es cuando esto deja de hacer falta). */
  var CAMBIOS = {};
  try { CAMBIOS = JSON.parse(localStorage.getItem('hr_cambios') || '{}'); } catch (e) {}

  var PRODUCTOS = LISTA.map(function (p, i) {
    var c = CAMBIOS[p[0]] || {};
    var variantes = (c.variantes || p[4]).map(function (v) {
      return { nombre: v[0], contado: v[1], cuenta: v[2], hayDiferencia: v[2] > v[1] };
    });
    var contados = variantes.map(function (v) { return v.contado; }).filter(function (n) { return n > 0; });
    return {
      id: i + 1,
      slug: p[0],
      nombre: p[1],
      categoria: p[2],
      formato: c.formato !== undefined ? c.formato : p[3],
      variantes: variantes,
      descripcion: c.descripcion !== undefined ? c.descripcion : (p[5] || ''),
      imagen: c.imagen !== undefined ? c.imagen : (p[6] || ''),
      desde: contados.length ? Math.min.apply(null, contados) : null,
      aConsultar: contados.length === 0,
      activo: c.activo !== undefined ? c.activo : true,
    };
  });

  function responder(valor) {
    return new Promise(function (resolve) {
      setTimeout(function () { resolve(valor); }, 60);
    });
  }

  function sinAcentos(s) {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /* ====== API PÚBLICA ==================================================== */
  window.Datos = {

    categorias: function () {
      /* Solo devuelve las categorías que tienen al menos un producto */
      return responder(CATS.filter(function (c) {
        return PRODUCTOS.some(function (p) { return p.activo && p.categoria === c.slug; });
      }));
    },

    categoria: function (slug) {
      return responder(CATS.find(function (c) { return c.slug === slug; }) || null);
    },

    /* opciones: { categoria, buscar, limite } */
    productos: function (opciones) {
      var o = opciones || {};
      var lista = PRODUCTOS.filter(function (p) { return p.activo; });

      if (o.categoria) lista = lista.filter(function (p) { return p.categoria === o.categoria; });
      if (o.slugs) {
        lista = o.slugs
          .map(function (sl) { return lista.find(function (p) { return p.slug === sl; }); })
          .filter(Boolean);
      }
      if (o.buscar) {
        var q = sinAcentos(o.buscar);
        lista = lista.filter(function (p) { return sinAcentos(p.nombre).indexOf(q) !== -1; });
      }
      if (o.limite) lista = lista.slice(0, o.limite);

      return responder(lista);
    },

    /* --- Portada --------------------------------------------------------- */
    banners: function () {
      var g = {};
      try { g = JSON.parse(localStorage.getItem('hr_portada') || '{}'); } catch (e) {}
      return responder((g.banners || BANNERS).filter(function (b) { return b.activo !== false; }));
    },

    portada: function () {
      var g = {};
      try { g = JSON.parse(localStorage.getItem('hr_portada') || '{}'); } catch (e) {}
      return responder({
        banners: g.banners || BANNERS,
        destacados: g.destacados || DESTACADOS,
        masVendidos: g.masVendidos || MAS_VENDIDOS,
      });
    },

    guardarPortada: function (datos) {
      /* Las imágenes se guardan enteras dentro del navegador, así se ven
         al instante sin tener que subirlas a ningún lado. El navegador
         tiene un límite de espacio, así que puede fallar. */
      try {
        localStorage.setItem('hr_portada', JSON.stringify(datos));
        return responder(true);
      } catch (e) {
        return responder(false);
      }
    },

    hayPortadaModificada: function () {
      return !!localStorage.getItem('hr_portada');
    },

    producto: function (slug) {
      return responder(PRODUCTOS.find(function (p) { return p.slug === slug; }) || null);
    },

    desdePorCategoria: function (slug) {
      var precios = PRODUCTOS
        .filter(function (p) { return p.activo && p.categoria === slug && p.desde; })
        .map(function (p) { return p.desde; });
      return responder(precios.length ? Math.min.apply(null, precios) : null);
    },

    /* Punto de retiro. Por ahora uno solo. */
    sucursales: function () {
      return responder([{
        id: 1, slug: 'viamonte', nombre: 'Viamonte 3646',
        direccion: CONFIG.empresa.direccion, barrio: 'Rosario',
        telefono: CONFIG.empresa.whatsapps[0],
        horario: 'Lunes a sábados de 7 a 20. Domingos y feriados de 8:30 a 16',
        retiro: true,
      }]);
    },

    zonas: function () {
      return responder([
        { id: 1, nombre: 'Zona 1 — Centro y alrededores', costo: 2500, minimo: 8000, demora: 'Mismo día' },
        { id: 2, nombre: 'Zona 2 — Resto de Rosario',      costo: 3800, minimo: 8000, demora: 'Mismo día' },
      ]);
    },

    /* --- Pedidos (por ahora en el navegador; después van a Supabase) ------ */
    crearPedido: function (pedido) {
      var registro = Object.assign({}, pedido, {
        codigo: 'HR-' + String(Date.now()).slice(-6),
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

    actualizarPedido: function (codigo, cambios) {
      var todos = JSON.parse(localStorage.getItem('hr_pedidos') || '[]');
      var p = todos.find(function (x) { return x.codigo === codigo; });
      if (p) Object.assign(p, cambios);
      localStorage.setItem('hr_pedidos', JSON.stringify(todos));
      return responder(p || null);
    },

    borrarPedido: function (codigo) {
      var todos = JSON.parse(localStorage.getItem('hr_pedidos') || '[]')
        .filter(function (x) { return x.codigo !== codigo; });
      localStorage.setItem('hr_pedidos', JSON.stringify(todos));
      return responder(true);
    },

    /* --- Usado solo por el panel de administración ----------------------- */
    guardarProducto: function (slug, cambios) {
      var todos = {};
      try { todos = JSON.parse(localStorage.getItem('hr_cambios') || '{}'); } catch (e) {}
      todos[slug] = Object.assign({}, todos[slug], cambios);
      localStorage.setItem('hr_cambios', JSON.stringify(todos));
      Object.assign(CAMBIOS, todos);

      var p = PRODUCTOS.find(function (x) { return x.slug === slug; });
      if (p) {
        if (cambios.variantes) {
          p.variantes = cambios.variantes.map(function (v) {
            return { nombre: v[0], contado: v[1], cuenta: v[2], hayDiferencia: v[2] > v[1] };
          });
          var cs = p.variantes.map(function (v) { return v.contado; }).filter(function (n) { return n > 0; });
          p.desde = cs.length ? Math.min.apply(null, cs) : null;
          p.aConsultar = cs.length === 0;
        }
        ['formato', 'descripcion', 'imagen', 'activo'].forEach(function (k) {
          if (cambios[k] !== undefined) p[k] = cambios[k];
        });
      }
      return responder(true);
    },

    hayCambiosSinExportar: function () {
      try { return Object.keys(JSON.parse(localStorage.getItem('hr_cambios') || '{}')).length; }
      catch (e) { return 0; }
    },

    descartarCambios: function () {
      localStorage.removeItem('hr_cambios');
      return responder(true);
    },

    /* Devuelve todos los productos en el formato de línea del archivo,
       para poder regenerar datos.js desde el panel. */
    lineasDelArchivo: function () {
      return responder(LISTA.map(function (p) {
        var c = CAMBIOS[p[0]] || {};
        return {
          slug: p[0], nombre: p[1], categoria: p[2],
          formato: c.formato !== undefined ? c.formato : p[3],
          variantes: c.variantes || p[4],
          descripcion: c.descripcion !== undefined ? c.descripcion : (p[5] || ''),
          imagen: c.imagen !== undefined ? c.imagen : (p[6] || ''),
          activo: c.activo !== undefined ? c.activo : true,
        };
      }));
    },

    todasLasCategorias: function () { return responder(CATS); },

  };

})();
