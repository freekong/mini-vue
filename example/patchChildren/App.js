import { h } from '../../lib/mini-vue.esm.js'
import ArrayToArray from './ArrayToArray.js'
import ArrayToText from './ArrayToText.js'
import TextToArray from './TextToArray.js'
import TextToText from './TextToText.js'

export const App = {
  name: "App",
  render() {
    return h(
      'div',
      {
        id: 'root',
        tId: 1,
      },
      [
        h('p', {}, "主页"),
        // 老的是Array,新的是Text
        // h(ArrayToText)
        // 老的是text,新的是text
        // h(TextToText)
        // 老的是text,新的是Array
        // h(TextToArray)
        // 老的是Array,新的是Array (复杂)
        h(ArrayToArray)
      ]
    )
  },
  setup() {
    

    return {
      
    }
  }
}