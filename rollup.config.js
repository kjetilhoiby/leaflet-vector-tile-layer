import buble from "rollup-plugin-buble";
import commonJs from "rollup-plugin-commonjs";
import nodeResolve from "rollup-plugin-node-resolve";
import {uglify} from "rollup-plugin-uglify";

export default {
    external: [
        "leaflet"
    ],
    input: "src/js/VectorTileLayer.js",
    output: {
        file: "dist/VectorTileLayer.js",
        format: "umd",
        globals: {
            "leaflet": "L"
        },
        name: "VectorTileLayer",
        sourcemap: true
    },
    plugins: [
        buble(),
        commonJs(),
        nodeResolve(),
        uglify()
    ]
};
