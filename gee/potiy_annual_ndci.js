
/************************************************************
 NDCI ANUAL — EMBALSE SUBURBANO POTI’Y, ENCARNACIÓN
 Sentinel-2 Surface Reflectance Harmonized
 Periodo: 2016–2026

 Productos:
 1. NDCI por imagen
 2. Composiciones anuales (mediana)
 3. Estadísticas espaciales por año
 4. Gráfico de media anual
************************************************************/


// ==========================================================
// 1. ÁREA DE ESTUDIO
// ==========================================================

// Asegurate de tener una geometría llamada "geometry"
// dibujada o importada en Google Earth Engine.

Map.centerObject(geometry, 14);

Map.addLayer(
  geometry,
  {color: 'yellow'},
  'Área de estudio',
  true
);


// ==========================================================
// 2. PARÁMETROS
// ==========================================================

var startYear = 2016;
var endYear = 2026;

// Porcentaje máximo de nubosidad de la escena
var cloudThreshold = 15;

// Escala de análisis en metros
var analysisScale = 20;

// Visualización NDCI
var ndciVis = {
  min: -0.5,
  max: 0.5,
  palette: [
    '0000ff',
    '00ffff',
    'ffffff',
    'ffff00',
    'ff0000'
  ]
};


// ==========================================================
// 3. COLECCIÓN SENTINEL-2
// ==========================================================

var sentinelRaw = ee.ImageCollection(
  'COPERNICUS/S2_SR_HARMONIZED'
)
  .filterBounds(geometry)
  .filterDate(
    ee.Date.fromYMD(startYear, 1, 1),
    ee.Date.fromYMD(endYear + 1, 1, 1)
  )
  .filter(
    ee.Filter.lt(
      'CLOUDY_PIXEL_PERCENTAGE',
      cloudThreshold
    )
  );

print('Sentinel-2: imágenes después de filtros iniciales');


// ==========================================================
// 4. MÁSCARA DE NUBES Y CÁLCULO DE ÍNDICES
// ==========================================================

var sentinel = sentinelRaw.map(function(img) {

  // Scene Classification Layer
  var scl = img.select('SCL');

  // Excluir sombras, nubes, cirrus, nieve
  // y píxeles saturados/no clasificados
  var cloudMask = scl.neq(1)
    .and(scl.neq(3))
    .and(scl.neq(8))
    .and(scl.neq(9))
    .and(scl.neq(10))
    .and(scl.neq(11));

  // Seleccionar bandas necesarias y convertir
  // reflectancia escalada a valores decimales
  var bands = img
    .select(['B3', 'B4', 'B5', 'B8'])
    .multiply(0.0001);

  // NDWI: (Green - NIR) / (Green + NIR)
  var ndwi = bands
    .normalizedDifference(['B3', 'B8'])
    .rename('ndwi');

  // Máscara inicial de agua
  var waterMask = ndwi.gt(0);

  // NDCI: (Red Edge - Red) / (Red Edge + Red)
  var ndci = bands
    .normalizedDifference(['B5', 'B4'])
    .rename('ndci');

  // Aplicar máscaras de nubes y agua
  var result = ndci
    .updateMask(cloudMask)
    .updateMask(waterMask);

  return result.copyProperties(
    img,
    ['system:time_start', 'system:index']
  );
});

print('Colección NDCI');


// ==========================================================
// 5. VISUALIZACIÓN DE UNA IMAGEN
// ==========================================================

// Seleccionar una imagen de ejemplo
var example = ee.Image(
  sentinel.sort('system:time_start').first()
);

Map.addLayer(
  example.clip(geometry),
  ndciVis,
  'NDCI - primera imagen disponible',
  false
);


// ==========================================================
// 6. COMPOSICIONES ANUALES Y ESTADÍSTICAS
// ==========================================================

var years = [
  2016, 2017, 2018, 2019, 2020, 2021,
  2022, 2023, 2024, 2025, 2026
];

var statsFeatures = [];

years.forEach(function(year) {

  var start = ee.Date.fromYMD(year, 1, 1);
  var end = start.advance(1, 'year');

  var collection = sentinel.filterDate(start, end);

  var count = collection.size();

  print('Número de imágenes para ' + year);

  // Composición anual mediante mediana temporal
  var annualImage = collection
    .median()
    .rename('ndci');

  // Mostrar capa anual
  Map.addLayer(
    annualImage.clip(geometry),
    ndciVis,
    'NDCI ' + year,
    false
  );

  // Calcular media y mediana espacial
  var stats = annualImage.reduceRegion({
    reducer: ee.Reducer.mean().combine({
      reducer2: ee.Reducer.median(),
      sharedInputs: true
    }),
    geometry: geometry,
    scale: analysisScale,
    maxPixels: 1e8,
    tileScale: 4
  });

  // Crear una fila para la tabla
  var feature = ee.Feature(null, {
    year: year,
    image_count: count,
    ndci_mean: stats.get('ndci_mean'),
    ndci_median: stats.get('ndci_median')
  });

  statsFeatures.push(feature);
});


// ==========================================================
// 7. TABLA DE ESTADÍSTICAS
// ==========================================================

var statsTable = ee.FeatureCollection(statsFeatures);

print('Estadísticas anuales de NDCI');


// ==========================================================
// 8. GRÁFICO DE MEDIA ANUAL
// ==========================================================

var chart = ui.Chart.feature.byFeature({
  features: statsTable,
  xProperty: 'year',
  yProperties: ['ndci_mean']
})
.setChartType('LineChart')
.setOptions({
  title: 'Annual mean NDCI — Poti’y sub-reservoir',
  hAxis: {
    title: 'Year',
    format: '####'
  },
  vAxis: {
    title: 'Mean NDCI'
  },
  lineWidth: 2,
  pointSize: 4,
  legend: {
    position: 'none'
  }
});

print(chart);


// ==========================================================
// 9. EXPORTAR TABLA A GOOGLE DRIVE (OPCIONAL)
// ==========================================================

// Descomentá este bloque si querés exportar la tabla.

/*
Export.table.toDrive({
  collection: statsTable,
  description: 'Potiy_Annual_NDCI_2016_2026',
  fileFormat: 'CSV'
});
*/


// ==========================================================
// 10. EXPORTAR TODAS LAS COMPOSICIONES ANUALES
// ==========================================================

// Se utiliza el array "years" definido en la sección 6.

years.forEach(function(year) {

  var start = ee.Date.fromYMD(year, 1, 1);
  var end = start.advance(1, 'year');

  // Seleccionar imágenes NDCI del año
  var collection = sentinel.filterDate(start, end);

  // Crear composición anual mediante mediana
  var annualImage = collection
    .median()
    .rename('ndci')
    .clip(geometry);

  // Exportar como GeoTIFF
  Export.image.toDrive({
    image: annualImage,
    description: 'Potiy_NDCI_' + year,
    folder: 'GEE_Potiy_NDCI',
    fileNamePrefix: 'Potiy_NDCI_' + year,
    region: geometry,
    scale: 20,
    maxPixels: 1e13,
    fileFormat: 'GeoTIFF'
  });

});
