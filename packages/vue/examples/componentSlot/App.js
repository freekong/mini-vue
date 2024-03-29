import { h, createTextVnode } from '../../dist/mini-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
  name: "App",
  render() {
    const app = h('div', {}, "App")
    // const foo = h(Foo, {}, h('p', {}, '123'))
    const foo = h(Foo, {}, {
      header: ({ age }) => [h('p', {}, 'header' + age), createTextVnode('哈哈哈')], 
      footer: () => h('p', {}, 'footer')
    })
    return h(
      "div", 
      {},
      [app, foo]
    )
  },
  setup() {
    return {
      
    }
  }
}