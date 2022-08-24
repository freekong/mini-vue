import { h, ref } from '../../lib/mini-vue.esm.js'

export default {
  name: 'Child',
  setup(props, { emit }) {
    // const { msg } = props
    // return { msg }
  },
  render() {
    return h("div", {}, [
      h("div",{}, 'child-props-msg:' + this.$props.msg )
    ])
  }
}