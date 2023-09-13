import { h, ref } from '../../dist/mini-vue.esm.js'
import Child from './Child.js'

export const App = {
  name: 'App',
  setup() {
    const msg = ref('123')
    const count = ref(1)

    window.msg = msg

    const changeChildrenProps = () => {
      msg.value = '456'
    }

    const changeCount = () => {
      count.value++
    }

    return {
      msg, count, changeChildrenProps, changeCount
    }
  },
  render() {
    return h("div", {}, [
      h("div", {}, "hello"),
      h("button", { onClick: this.changeChildrenProps }, 'change child props'),
      h(Child, { msg: this.msg }),
      h("button", { onClick: this.changeCount }, "change self count"),
      h("p", {}, "count:" + this.count)
    ])
  }
}