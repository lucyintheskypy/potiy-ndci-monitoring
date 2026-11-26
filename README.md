# potiy-ndci-monitoring
Temporal and spatial analysis of NDCI in the Potiy sub-reservoir, Encarnacion, Paraguay, using Sentinel-2 and Google Earth Engine
# NDCI Monitoring of Poti’y Sub-reservoir, Paraguay

## Overview

This project explores the spatial and temporal variability of the Normalized Difference Chlorophyll Index (NDCI) in the Poti’y sub-reservoir, located in Encarnación, Paraguay.

The analysis uses Sentinel-2 Surface Reflectance imagery and Google Earth Engine to generate annual NDCI composites for the period 2016–2026.

The objective is to explore spectral patterns potentially associated with chlorophyll-related signals in inland waters through remote sensing and geospatial analysis.

## Study Area

Poti’y sub-reservoir, Encarnación, Paraguay.

## Data Sources

- **Satellite imagery:** Sentinel-2 MSI Surface Reflectance Harmonized.
- **Platform:** Google Earth Engine.
- **Study area:** User-defined geometry.

## Methodology

The workflow consists of the following steps:

1. Retrieve Sentinel-2 imagery intersecting the study area.
2. Filter scenes according to acquisition date and cloud coverage.
3. Apply a pixel-level cloud and shadow mask using the Scene Classification Layer (SCL).
4. Calculate the Normalized Difference Water Index (NDWI) to generate an initial water mask.
5. Calculate NDCI using Sentinel-2 bands B5 (Red Edge) and B4 (Red).
6. Generate annual median NDCI composites for 2016–2026.
7. Calculate annual spatial mean and median statistics.
8. Export annual composites as GeoTIFF files for further analysis in GIS software.

### NDCI formula

NDCI = (B5 - B4) / (B5 + B4)

## Repository Structure

- `gee/`: Google Earth Engine scripts.
- `python/`: Python scripts for statistical analysis and visualization.
- `figures/`: Selected figures and visual outputs.
- `outputs/`: Directory for generated data products.

## Requirements

- Google Earth Engine account.
- Google Earth Engine Code Editor.
- Python 3.
- Python libraries: pandas, numpy, matplotlib.
- QGIS (optional, for cartographic visualization).

## Limitations

NDCI is an indirect spectral indicator potentially related to chlorophyll concentration. It does not directly measure algal biomass or confirm algal blooms.

The results may be influenced by water turbidity, aquatic vegetation, water depth, atmospheric conditions, and seasonal variability.

The NDWI threshold is used as an initial water mask and should not be considered a definitive water classification.

Annual composites are generated using the temporal median of available valid observations. The 2026 composite represents an incomplete year.

## Reproducibility

Users should define their own study-area geometry in Google Earth Engine before running the scripts.

## Author

Lucia van der Heijden

## License

MIT License
