import typescript from '@rollup/plugin-typescript'

export default {
  input: './packages/vue/src/index.ts',
  output: [
    { // cjs规范
      format: 'cjs',
      file: 'packages/vue/dist/mini-vue.cjs.js'
    },
    { // esm规范
      format: 'es',
      file: 'packages/vue/dist/mini-vue.esm.js'
    }
  ],
  plugins: [typescript()],
}