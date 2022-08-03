import { h, ref } from '../../lib/mini-vue.esm.js'

export const App = {
  name: "App",
  render() {
    return h(
      'div',
      {
        id: 'root',
        ...this.props
      },
      [
        h('p', {}, 'count'+ this.count),
        h('button', {
          onClick: this.add
        }, '点击'),
        h('button', {
          onClick: this.onChangePropsDemo1
        }, '值改变了 - 修改'),
        h('button', {
          onClick: this.onChangePropsDemo2
        }, '值变为undefind - 删除'),
        h('button', {
          onClick: this.onChangePropsDemo3
        }, '新的值里没有key了 - 删除')
      ]
    )
  },
  setup() {
    let count = ref(0)
    const add = () => {
      count.value++
    }

    const props = ref({
      foo: 'foo',
      bar: 'bar'
    })

    const onChangePropsDemo1 = () => {
      props.value.foo = 'new-foo'
    }

    const onChangePropsDemo2 = () => {
      props.value.foo = undefined
    }

    const onChangePropsDemo3 = () => {
      props.value = {
        foo: 'foo'
      }
    }

    return {
      count,
      add,
      props,
      onChangePropsDemo1,
      onChangePropsDemo2,
      onChangePropsDemo3
    }
  }
}