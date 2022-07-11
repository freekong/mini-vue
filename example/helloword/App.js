import { h } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'

window.self = null
export const App = {
  render() {
    window.self = this
    return h(
      "div", 
      {
        id: "root",
        class: ["red", "main"],
        onClick: (e) => {
          console.log(e, 'click')
        },
        onMousedown: () => {
          console.log('mousedown')
        }
      },
      [
        h('div', {}, 'mini-vue' + this.msg),
        h(Foo, {
          count: 1
        })
      ]
      // [
      //   h('h3', { class: "red" }, "hello"),
      //   h("h3", { class: "yellow" }, "mini-vue" + this.msg)
      // ]
    //  "hi, mini-vue" + this.msg
    )
  },
  setup() {
    return {
      msg: 'dddjjj'
    }
  }
}