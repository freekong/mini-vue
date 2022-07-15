import { h } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
  render() {
    return h(
      "div", 
      {},
      [h('div', {}, 'App'), h(Foo, {
        onAdd: (a, b) => {
          console.log('[ onAdd ] >', a, b)
        },
        onAddFoo() {
          console.log('[ addFoo ] >')
        }
      })]
    )
  },
  setup() {
    return {
      
    }
  }
}