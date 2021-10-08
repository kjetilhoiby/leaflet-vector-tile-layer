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
    _map, addClass, addInteractiveTarget, addTo, appendChild, className, color,
    create, dashArray, dashOffset, feature, fill, fillColor, fillOpacity,
    fillRule, freeze, interactive, layerName, lineCap, lineJoin, loadGeometry,
    map, opacity, options, pointsToPath, properties, prototype, removeAttribute,
    removeClass, removeFrom, removeInteractiveTarget, scaleBy, setAttribute,
    setStyle, stroke, type, types, weight
*/

import {
    DomUtil,
    extend,
    Layer,
    LatLng,
    LatLngBounds,
    Path,
    point,
    Polygon,
    SVG,
} from "leaflet";
import {VectorTileFeature} from "@mapbox/vector-tile";

function featureLayer(feature, layerName, rootGroup, pxPerExtent, options) {
    const self = new Layer(options);
    const m_path = SVG.create("path");
    const m_type = VectorTileFeature.types[feature.type];

    options = extend({}, options);

    self.feature = feature;
    self.layerName = layerName;

    // Compatibility with Leaflet.VectorGrid
    self.properties = feature.properties;

    /*
     * FeatureLayers only serve as event targets and are never actually
     * "added" to the map, so we override the base class's addTo.
     */
    self.addTo = function addTo(map) {
        // Required by addInteractiveTarget.
        self._map = map;
        self.addInteractiveTarget(m_path);
    };

    self.removeFrom = function removeFrom() {
        self.removeInteractiveTarget(m_path);
        delete self._map;
    };

    self.setStyle = function setStyle(options) {
        const path = m_path;

        options = extend(
            {},
            (
                "Polygon" === m_type
                ? Polygon.prototype.options
                : Path.prototype.options
            ),
            options
        );

        if (options.stroke) {
            path.setAttribute("stroke", options.color);
            path.setAttribute("stroke-opacity", options.opacity);
            path.setAttribute("stroke-width", options.weight);
            path.setAttribute("stroke-linecap", options.lineCap);
            path.setAttribute("stroke-linejoin", options.lineJoin);

            if (options.dashArray) {
                path.setAttribute("stroke-dasharray", options.dashArray);
            } else {
                path.removeAttribute("stroke-dasharray");
            }

            if (options.dashOffset) {
                path.setAttribute("stroke-dashoffset", options.dashOffset);
            } else {
                path.removeAttribute("stroke-dashoffset");
            }
        } else {
            path.setAttribute("stroke", "none");
        }

        if (options.fill) {
            path.setAttribute("fill", options.fillColor || options.color);
            path.setAttribute("fill-opacity", options.fillOpacity);
            path.setAttribute("fill-rule", options.fillRule || "evenodd");
        } else {
            path.setAttribute("fill", "none");
        }

        if (options.interactive) {
            /*
             * Leaflet's "interactive" class only applies to
             * renderers that are immediate descendants of a
             * pane.
             */
            path.setAttribute("pointer-events", "auto");
            DomUtil.addClass(path, "leaflet-interactive");
        } else {
            DomUtil.removeClass(path, "leaflet-interactive");
            path.removeAttribute("pointer-events");
        }

        return path;
    };

    self.getBounds = function getBounds(coords) {
        const {x, y, z} = coords;
        const size = self.feature.extent * Math.pow(2, z);
        const x0 = self.feature.extent * x;
        const y0 = self.feature.extent * y;
        const [x1, y1, x2, y2] = self.feature.bbox();
        const bounds = new LatLngBounds(
            new LatLng(
                360 / Math.PI * Math.atan(Math.exp( (180 - (y1 + y0) * 360 / size) * Math.PI / 180)) - 90,
                (x1 + x0) * 360 / size - 180
            ),
            new LatLng(
                360 / Math.PI * Math.atan(Math.exp( (180 - (y2 + y0) * 360 / size) * Math.PI / 180)) - 90,
                (x2 + x0) * 360 / size - 180
            )
        );
        return bounds;
    };

    switch (m_type) {
    case "Point":
        break;
    case "LineString":
    case "Polygon":
        m_path.setAttribute(
            "d",
            SVG.pointsToPath(
                feature.loadGeometry().map(
                    (ring) => ring.map((p) => point(p).scaleBy(pxPerExtent))
                ),
                "Polygon" === m_type
            )
        );

        if (options.className) {
            DomUtil.addClass(m_path, options.className);
        }
        self.setStyle(options);

        rootGroup.appendChild(m_path);
        break;
    }

    return self;
}

export default Object.freeze(featureLayer);
