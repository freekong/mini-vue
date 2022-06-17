import { h } from '../../lib/mini-vue.esm.js'

export const App = {
  render() {
    return h(
      "div", 
      {
        id: "root",
        class: ["red", "main"]
      },
      [
        h('h3', { class: "red" }, "hello"),
        h("h3", { class: "yellow" }, "mini-vue")
      ]
    //  "hi, mini-vue"
    )
  },
  setup() {
    return {
      msg: 'ddd'
    }
  }
}