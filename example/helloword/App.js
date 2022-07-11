import { h } from '../../lib/mini-vue.esm.js'

window.self = null
export const App = {
  render() {
    window.self = this
    return h(
      "div", 
      {
        id: "root",
        class: ["red", "main"]
      },
      [
        h('h3', { class: "red" }, "hello"),
        h("h3", { class: "yellow" }, "mini-vue" + this.msg)
      ]
    //  "hi, mini-vue" + this.msg
    )
  },
  setup() {
    return {
      msg: 'dddjjj'
    }
  }
}