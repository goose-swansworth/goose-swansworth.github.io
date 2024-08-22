import { defineConfig } from 'vite';

import glslify from 'rollup-plugin-glslify';

export default defineConfig({

plugins: [

glslify()

]

}); 