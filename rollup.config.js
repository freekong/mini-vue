import typescript from '@rollup/plugin-typescript'
import pkg from './package.json'

export default {
  input: './src/index.ts',
  output: [
    { // cjs规范
      format: 'cjs',
      file: pkg.main
    },
    { // esm规范
      format: 'es',
      file: pkg.module
    }
  ],
  plugins: [typescript()],
}