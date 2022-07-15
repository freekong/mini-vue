import { createApp } from '../../lib/mini-vue.esm.js'
import { App } from './App.js'
// vue3
const rootContainer = document.querySelector('#app')
console.log('%c [ rootContainer ]-5', 'font-size:13px; background:pink; color:#bf2c9f;', rootContainer)
createApp(App).mount(rootContainer)