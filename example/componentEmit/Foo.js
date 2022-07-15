import { h } from "../../lib/mini-vue.esm.js"

export const Foo = {
  setup(props, { emit }) {
    console.log('%c [ props ]-3', 'font-size:13px; background:pink; color:#bf2c9f;', props)
    // readonly
    const emitAdd = () => {
      console.log('emit add')
      emit('add', 1, 2)
      emit('add-foo')
    }
    return {
      emitAdd
    }
  },
  render() {
    const btn = h('button', {
      onClick: this.emitAdd
    }, 'emit add')
    const foo = h('p', {}, 'foo')
    return h('div', {}, [foo, btn])
  },
}