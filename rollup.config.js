import buble from 'rollup-plugin-buble';
import commonJs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';

export default {
        entry:          'js/VectorTileLayer.js',
        format:         'umd',
        dest:           'dist/VectorTileLayer.js',
        moduleName:     'VectorTileLayer',
        sourceMap:      true,
        external: [
                        'leaflet',
        ],
        globals: {
                'leaflet': 'L',
        },
        plugins: [
                buble(),
                commonJs(),
                nodeResolve(),
                uglify(),
        ],
};
