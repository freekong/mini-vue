import { h, ref, getCurrentInstance, nextTick } from '../../dist/mini-vue.esm.js'

export const App = {
  name: "App",
  render() {
    const button = h('button', { onClick: this.onClick }, 'click')
    const p = h('p', {}, 'count:' + this.count)
    return h(
      'div',
      {},
      [button, p]
    )
  },
  setup() {
    const count = ref(1)

    const instance = getCurrentInstance()
    const onClick = () => {
      for (let i = 0; i < 100; i++) {
        console.log('[ update ] >', i)
        count.value = i
      }
      console.log('[ instance ] >', instance)
      nextTick(() => {
        console.log('[ instance ] >', instance)
      })
    }
    return {
     count,
     onClick 
    }
  }
}