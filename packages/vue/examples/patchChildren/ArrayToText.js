import { h, ref } from '../../dist/mini-vue.esm.js'

const prevChildren = [h('div', {}, 'A'), h('div', {}, 'B')]
const nextChildren = 'newChildren'

export default {
  setup() {
    const isChange = ref(false)
    window.isChange = isChange;

    return {
      isChange
    }
  },
  render() {
    const self = this

    return self.isChange === true
      ? h('div', {}, nextChildren)
      : h('div', {}, prevChildren);
  },
}