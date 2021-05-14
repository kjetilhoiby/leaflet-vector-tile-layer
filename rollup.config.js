/*
 * Copyright 2017-2018, Joachim Kuebart <joachim.kuebart@gmail.com>
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
    apply, assign, concat, create, external, file, forEach, format, freeze,
    globals, input, lastIndexOf, leaflet, map, name, output, plugins, prototype,
    sourcemap, substring
*/

import buble from "@rollup/plugin-buble";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import {terser} from "rollup-plugin-terser";

let outputs = [
    {
        external: [
            "leaflet"
        ],
        input: "src/js/VectorTileLayer.js",
        output: {
            file: "dist/VectorTileLayer.js",
            name: "VectorTileLayer",
            sourcemap: true
        },
        plugins: [
            commonjs(),
            nodeResolve()
        ]
    }
];

/**
 * Clone an object and add the given properties.
 */
const extend = (object, properties) => Object.assign(
    Object.create(object),
    properties
);

/**
 * Flatten one level of arrays.
 */
const flatten = (arrays) => Array.prototype.concat.apply([], arrays);

/**
 * Add a component to the file name before the extension.
 */
function withTag(filename, tag) {
    const extensionIndex = 1 + filename.lastIndexOf(".");
    return (
        filename.substring(0, extensionIndex) +
        `${tag}.` + filename.substring(extensionIndex)
    );
}

const formats = [

// Create both an ES6 and a universal module.

    (output) => [
        extend(output, {output: extend(output.output, {format: "es"})}),

        extend(
            output,
            {
                output: extend(
                    output.output,
                    {
                        file: withTag(output.output.file, "umd"),
                        format: "umd",
                        globals: {"leaflet": "L"}
                    }
                ),
                plugins: output.plugins.concat([buble()])
            }
        )
    ],

// Generate an unmodified and a minified version.

    (output) => [
        output,

        extend(
            output,
            {
                output: extend(
                    output.output,
                    {file: withTag(output.output.file, "min")}
                ),
                plugins: output.plugins.concat([terser()])
            }
        )
    ]

];

formats.forEach(function (format) {
    outputs = flatten(outputs.map(format));
});

export default Object.freeze(outputs);
