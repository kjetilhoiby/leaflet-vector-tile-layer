Leaflet.VectorTileLayer
=======================

This module provides a [Leaflet][L] layer that displays [vector tiles][VT].
It is very similar to [`Leaflet.VectorGrid`][LVG].

Use
---
Loads vector tiles from a URL template like

        https://{s}.example.com/tiles/{z}/{x}/{y}.pbf

```js
import vectorTileLayer from 'leaflet-vector-tile-layer';

const tileLayer = vectorTileLayer(url, options);
```


Styling
-------

The main difference to `VectorGrid` is that `VectorTileLayer` takes a
different approach to styling. Whereas `VectorGrid` requires you to specify
styling for a fixed set of vector tile layer names in advance, this class
allows you to specify a single style for all layers irrespective of their
names. This is particularly useful when specifying a function which is
called with the rendered feature and the layer name. This way, clients can
react dynamically to layer names or ignore them altogether.

Another feature not supported by `VectorGrid` is a `setStyle()` call which
allows changing the styling of the entire layer. This can be used to
highlight certain features, for example.

For compatibility, support for the `vectorTileLayerStiles` option and
`set/resetFeatureStyle()` method is also provided.

At this time, only vector tiles in [`protobuf`][PBF] format are supported,
but support for other formats may be added through options in the future.


[L]:    http://leafletjs.com/
[LVG]:  https://github.com/Leaflet/Leaflet.VectorGrid
[PBF]:  https://developers.google.com/protocol-buffers/
[VT]:   https://github.com/mapbox/vector-tile-spec
