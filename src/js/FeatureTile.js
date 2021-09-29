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
    addFeatureLayer, addVectorTile, appendChild, coords, create, divideBy,
    domElement, eachFeatureLayer, extent, feature, forEach, freeze,
    getFeatureStyle, getTileSize, keys, layers, length, map, push, setAttribute,
    x, y
*/

import featureLayer from "./FeatureLayer.js";
import {SVG} from "leaflet";

export default Object.freeze(function featureTile(coords, layer) {
    const self = {};
    const m_tileSize = layer.getTileSize();
    const m_svg = SVG.create("svg");
    const m_rootGroup = SVG.create("g");
    const m_layers = [];

    m_svg.setAttribute("viewBox", `0 0 ${m_tileSize.x} ${m_tileSize.y}`);
    m_svg.appendChild(m_rootGroup);

    function addFeature(feature, layerName, pxPerExtent) {
        const featureStyle = layer.getFeatureStyle(feature, layerName);
        if (!featureStyle) {
            return;
        }

        const ftrLyr = featureLayer(
            feature,
            layerName,
            m_rootGroup,
            pxPerExtent,
            featureStyle
        );
        m_layers.push(ftrLyr);
        layer.addFeatureLayer(ftrLyr);
    }

    self.addVectorTile = function addVectorTile(vectorTile) {
        Object.keys(vectorTile.layers).forEach(function (layerName) {
            const tileLayer = vectorTile.layers[layerName];
            const pxPerExtent = m_tileSize.divideBy(tileLayer.extent);

            let i = 0;
            while (i !== tileLayer.length) {
                addFeature(tileLayer.feature(i), layerName, pxPerExtent);
                i += 1;
            }
        });

        return self;
    };

    self.eachFeatureLayer = (func) => m_layers.map(func);
    self.domElement = () => m_svg;
    self.coords = () => coords;

    return self;
});
