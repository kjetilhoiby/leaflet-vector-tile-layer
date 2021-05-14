/*
 * Copyright 2017, Joachim Kuebart <joachim.kuebart@gmail.com>
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *   1. Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the
 *      distribution.
 *
 *   3. Neither the name of the copyright holder nor the names of its
 *      contributors may be used to endorse or promote products derived
 *      from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

/*property
    _tileZoom, abs, addEventParent, addFeatureLayer, addTo, addVectorTile,
    arrayBuffer, call, coords, createTile, divideBy, domElement,
    eachFeatureLayer, extend, feature, forEach, freeze, getFeatureId,
    getFeatureStyle, getPrototypeOf, getTileSize, getTileUrl, getZoom,
    getZoomScale, isArray, join, keys, layerName, length, maxDetailZoom,
    maxZoom, minDetailZoom, minZoom, off, ok, on, onAdd, onRemove, properties,
    removeEventParent, removeFeatureLayer, removeFrom, resetFeatureStyle, round,
    s, setFeatureStyle, setStyle, split, status, statusText, style, subdomains,
    template, then, vectorTileLayerStyles, x, y, z, zoomOffset, zoomReverse
*/

import featureTile from "./FeatureTile.js";
import fetch from "./fetch.js";
import {GridLayer, Util} from "leaflet";
import Pbf from "pbf";
import {VectorTile} from "@mapbox/vector-tile";

function err(...args) {
    return new Error(args.join(": "));
}

function load(url) {
    return fetch(url).then(function (response) {
        if (response.ok) {
            return response.arrayBuffer();
        }
        if (404 !== response.status) {
            throw err(url, response.status, response.statusText);
        }
    });
}

function tileId(coords) {
    return `${coords.x}|${coords.y}|${coords.z}`;
}

const defaultOptions = {
    minZoom: 0,
    maxZoom: 18,
    maxDetailZoom: undefined,
    minDetailZoom: undefined,
    subdomains: "abc",
    zoomOffset: 0,
    zoomReverse: false
};

export default Object.freeze(function vectorTileLayer(url, options) {
    const self = new GridLayer(options);
    const m_super = Object.getPrototypeOf(self);
    const m_featureStyle = {};

    function legacyStyle(feature, layerName, zoom) {
        const {getFeatureId, vectorTileLayerStyles} = options;

        let layerStyle = vectorTileLayerStyles[layerName];
        if (getFeatureId) {
            const fId = getFeatureId(feature);
            if (m_featureStyle[fId]) {
                layerStyle = m_featureStyle[fId];
            }
        }

        if ("function" === typeof layerStyle) {
            layerStyle = layerStyle(feature.properties, zoom);
        }

        if (Array.isArray(layerStyle)) {
            if (!layerStyle.length) {
                return;
            }
            layerStyle = layerStyle[0];
        }

        return layerStyle;
    }

    options = Util.extend({}, defaultOptions, options);

    if ("string" === typeof options.subdomains) {
        options.subdomains = options.subdomains.split("");
    }

    // Compatibility with Leaflet.VectorGrid
    if (options.vectorTileLayerStyles) {
        options.style = legacyStyle;
    }

    const m_featureTiles = {};
    self.on("tileunload", function (evt) {
        const id = tileId(evt.coords);
        const tile = m_featureTiles[id];

        if (!tile) {
            return;
        }
        tile.eachFeatureLayer(
            (featureLayer) => self.removeFeatureLayer(featureLayer)
        );
        delete m_featureTiles[id];
    });

    let m_map;
    let m_zoom;
    function updateZoom() {
        m_zoom = m_map.getZoom();
    }

    self.onAdd = function onAdd(map, ...rest) {
        m_map = map;
        m_map.on("zoomend", updateZoom);
        updateZoom();
        return m_super.onAdd.call(self, map, ...rest);
    };

    self.onRemove = function onRemove(...args) {
        m_map.off("zoomend", updateZoom);
        m_map = undefined;
        return m_super.onRemove.call(self, ...args);
    };

    self.createTile = function createTile(coords, done) {
        const id = tileId(coords);
        const tile = featureTile(coords, self);

        m_featureTiles[id] = tile;
        load(self.getTileUrl(coords)).then(function (buffer) {
            tile.addVectorTile(new VectorTile(new Pbf(buffer)));
            done(null, tile);
        }, function (exc) {
            done(exc, tile);
        });

        return tile.domElement();
    };

    function getSubdomain(tilePoint) {
        const index = (
            Math.abs(tilePoint.x + tilePoint.y) %
            options.subdomains.length
        );
        return options.subdomains[index];
    }

    function clampZoom(zoom) {
        const {minDetailZoom, maxDetailZoom} = options;

        if (undefined !== minDetailZoom && zoom < minDetailZoom) {
            return minDetailZoom;
        }

        if (undefined !== maxDetailZoom && maxDetailZoom < zoom) {
            return maxDetailZoom;
        }

        return zoom;
    }

    function getZoomForUrl(zoom) {
        const {maxZoom, zoomReverse, zoomOffset} = options;

        if (zoomReverse) {
            zoom = maxZoom - zoom;
        }

        return clampZoom(zoom + zoomOffset);
    }

    self.getTileUrl = function getTileUrl(coords) {
        const data = {
            s: getSubdomain(coords),
            x: coords.x,
            y: coords.y,
            z: getZoomForUrl(coords.z)
        };
        return Util.template(
            url,
            Util.extend(data, options)
        );
    };

    function eachFeatureLayer(func) {
        Object.keys(m_featureTiles).forEach(
            (tileId) => m_featureTiles[tileId].eachFeatureLayer(func)
        );
    }

    self.setStyle = function setStyle(style) {
        options.style = style;

        eachFeatureLayer(function (featureLayer) {
            const {feature, layerName} = featureLayer;
            const featureStyle = self.getFeatureStyle(feature, layerName);

            featureLayer.setStyle(featureStyle);
        });

        return self;
    };

    // Compatibilty with Leaflet.VectorGrid
    self.setFeatureStyle = function setFeatureStyle(id, style) {
        m_featureStyle[id] = style;
        self.setStyle(options.style);

        return self;
    };

    // Compatibilty with Leaflet.VectorGrid
    self.resetFeatureStyle = function resetFeatureStyle(id) {
        delete m_featureStyle[id];
        self.setStyle(options.style);

        return self;
    };

    self.getTileSize = function getTileSize() {
        const tileSize = m_super.getTileSize.call(self);
        const zoom = self._tileZoom;

        return tileSize.divideBy(
            m_map.getZoomScale(clampZoom(zoom), zoom)
        ).round();
    };

    self.getFeatureStyle = function getFeatureStyle(feature, layerName) {
        const style = options.style;

        return (
            "function" === typeof style
            ? style(feature, layerName, m_zoom)
            : style
        );
    };

    self.addFeatureLayer = function addFeatureLayer(featureLayer) {
        featureLayer.addTo(m_map);
        featureLayer.addEventParent(self);

        return self;
    };

    self.removeFeatureLayer = function removeFeatureLayer(featureLayer) {
        featureLayer.removeEventParent(self);
        featureLayer.removeFrom(m_map);

        return self;
    };

    return self;
});
