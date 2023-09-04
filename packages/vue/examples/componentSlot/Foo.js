import { h, renderSlots } from "../../dist/mini-vue.esm.js"

export const Foo = {
  setup() {
    return {

    }
  },
  render() {
    const foo = h('p', {}, 'foo')
    console.log('%c [ this.$slots ]-12', 'font-size:13px; background:pink; color:#bf2c9f;', this.$slots)

    // 数组形式额slots renderSlots

    // 指定渲染位置  具名插槽

    // 作用域插槽

    const age = 18
    return h(
      'div', 
      {}, 
      [
        renderSlots(this.$slots, 'header', {age}),
        foo, 
        renderSlots(this.$slots, 'footer')
      ]
    )
  },
}