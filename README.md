Leaflet.VectorTileLayer
=======================

This module provides a [Leaflet][L] layer that displays [vector tiles][VT].
It is very similar to [`Leaflet.VectorGrid`][LVG].

In contrast to `VectorGrid`, this class has been designed as much as
possible in terms of Leaflet's public API. This makes it more likely to
continue working with future versions of Leaflet.

The biggest difference to `VectorGrid` is the [styling](#styling).
`VectorTileLayer` also supports two options `min/maxDetailZoom` which are
subtly different from `VectorGrid`'s `min/maxNativeZoom`. Both provide the
possibility to specify a range of zoom levels that offer an optimal
trade-off between detail and size. When using the `native` variants, tiles
above or below the zoom range are scaled, changing the stroke weight. The
`detail` settings offer the same trade-off while still rendering the tiles
at the correct zoom levels, meaning stroke weight is visually consistent
across all zoom levels.


Use
---
Loads vector tiles from a URL template like

    https://{s}.example.com/tiles/{z}/{x}/{y}.pbf

This pacakge can be used as an ES6 module.

```js
import vectorTileLayer from 'leaflet-vector-tile-layer';

const tileLayer = vectorTileLayer(url, options);
```

The AMD build comes with all dependencies included. If imported as an ES6
module, you will need to make the dependencies available to your build
system, for example:

```sh
$ npm install @mapbox/vector-tile pbf
```

See this package's development dependencies for version information.


Styling
-------

The main difference to `VectorGrid` is that `VectorTileLayer` takes a
different approach to styling. Whereas `VectorGrid` requires you to specify
styling for a fixed set of vector tile layer names in advance, this class
allows you to specify a single style for all layers irrespective of their
names. This is particularly useful when specifying a function which is
called with the rendered feature, the layer name and the current zoom
level. This way, clients can react dynamically to layer names or ignore
them altogether.

Another feature not supported by `VectorGrid` is a `setStyle()` call which
allows changing the styling of the entire layer. This can be used to
highlight certain features, for example.

For compatibility, support for the `vectorTileLayerStyles` option and
`set/resetFeatureStyle()` method is also provided.

`VectorTileLayer` supports all options provided by [`GridLayer`][GL].
Additionally, the following options are provided:

```js
const url = 'https://{s}.example.com/tiles/{z}/{x}/{y}.pbf';
const options = {
        // Specify zoom range in which tiles are loaded. Tiles will be
        // rendered from the same data for Zoom levels outside the range.
        minDetailZoom, // default undefined
        maxDetailZoom, // default undefined

        // Styling options for L.Polyline or L.Polygon. If it is a function, it
        // will be passed the vector-tile feature and the layer name as
        // parameters.
        style, // default undefined

        // This works like the same option for `Leaflet.VectorGrid`.
        vectorTileLayerStyle, // default undefined
};

const layer = vectorTileLayer(url, options);
```

The style can be updated at any time using the `setStyle()` method.

```js
layer.setStyle({ weight: 3 });
```

All omitted options will be substituted by the default options for
[`L.Polyline`][PL] or [`L.Polygon`][PG], as appropriate.


Events
------

Events attached to this layer provide access to the vector-tile `feature`
and the `layerName` through their `layer` attribute. For compatibility with
`VectorGrid`, the feature's `properties` are also made directly available.


Installing and building
-----------------------

You can install this package using

```sh
$ npm install leaflet-vector-tile-layer
```

It can be built by

```sh
$ npm run build
```


Limitations
-----------

Currently, only line and polygon features are visualised, but support for
point features is planned in a future release.

At this time, only SVG rendering and vector tiles in [`protobuf`][PBF]
format are supported, but support for other renderers or formats may be
added through options in the future.


[GL]:   http://leafletjs.com/reference-1.0.3.html#gridlayer
[L]:    http://leafletjs.com/
[LVG]:  https://github.com/Leaflet/Leaflet.VectorGrid
[PBF]:  https://developers.google.com/protocol-buffers/
[PG]:   http://leafletjs.com/reference-1.0.3.html#polygon
[PL]:   http://leafletjs.com/reference-1.0.3.html#polyline
[VT]:   https://github.com/mapbox/vector-tile-spec
