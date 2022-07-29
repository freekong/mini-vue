import { h } from '../../lib/mini-vue.esm.js'

export const App = {
  render() {
    return h(
      "rect", 
      {
        x: this.x,
        y: this.y
      },
    )
  },
  setup() {
    return {
      x: 100,
      y: 100
    }
  }
}