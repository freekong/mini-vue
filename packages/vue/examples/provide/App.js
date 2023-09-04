import { h, provide, inject } from '../../dist/mini-vue.esm.js'

const Provider = {
  name: 'Provide',
  setup() {
    provide('foo', 'fooVal')
    provide('bar', 'barVal')
  },
  render() {
    return h('div', {}, [h('p',{},'Provider'), h(ProviderTwo)])
  }
}

const ProviderTwo = {
  name: 'ProvideTwo',
  setup() {
    provide('foo', 'fooTwo')
    const foo = inject('foo')
    return {
      foo
    }
  },
  render() {
    return h('div', {}, [h('p',{},'ProviderTwo: ' + this.foo), h(Consumer)])
  }
}

const Consumer = {
  name: 'Consumer',
  setup() {
    const foo = inject('foo');
    const bar = inject('bar');
    const bdd = inject('bdd', 'defaultBDD')
    const fn = inject('fn', () => 'resFn')
    return {
      foo,
      bar,
      bdd,
      fn
    }
  },
  render() {
    return h('div', {}, 'Consumer: ' + this.foo + '-' + this.bar + '-' + this.bdd + '-' + this.fn)
  }
}

export const App = {
  name: 'App',
  render() {
    return h(
      "div", 
      {},
      [
        h('p', {}, 'apiInject'), h(Provider)
      ]
    )
  },
  setup() {
    return {
      
    }
  }
}