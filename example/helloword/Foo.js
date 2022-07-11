import { h } from "../../lib/mini-vue.esm.js"

export const Foo = {
  setup(props) {
    console.log('%c [ props ]-3', 'font-size:13px; background:pink; color:#bf2c9f;', props)
    // readonly
    props.count ++;
  },
  render() {
    return h('div', {}, 'foo: ' + this.count)
  },
}