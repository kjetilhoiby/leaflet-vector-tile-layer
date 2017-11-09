import buble from "rollup-plugin-buble";
import commonJs from "rollup-plugin-commonjs";
import nodeResolve from "rollup-plugin-node-resolve";
import uglify from "rollup-plugin-uglify";

export default {
    external: [
        "leaflet"
    ],
    globals: {
        "leaflet": "L"
    },
    input: "src/js/VectorTileLayer.js",
    name: "VectorTileLayer",
    output: {
        file: "dist/VectorTileLayer.js",
        format: "umd"
    },
    plugins: [
        buble(),
        commonJs(),
        nodeResolve(),
        uglify()
    ],
    sourcemap: true
};
