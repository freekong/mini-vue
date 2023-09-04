import { h, getCurrentInstance } from "../../dist/mini-vue.esm.js"

export const Foo = {
  name: "Foo",
  setup() {
    const instance = getCurrentInstance()
    console.log('[ Foo ] >', instance)
  },
  render() {
    return h('div', {}, 'Foo')
  },
}