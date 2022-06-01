import { readonly, reactive, isReactive, isReadonly } from '../reactive'

describe('readonly', () => {
  it('reayonly test', () => {
    const original = {
      foo: 1
    }

    const wrappend = readonly(original)
    expect(original).not.toBe(wrappend)
    expect(wrappend.foo).toBe(1)
  })

  it('warn when call set', () => {
    console.warn = jest.fn()
    const original = readonly({
      foo: 1
    })
    original.foo = 3
    expect(console.warn).toBeCalled()
  })

  it('isReactive', () => {
    const original = {
      foo: 1
    }
    const observed = reactive(original)
    expect(isReactive(original)).toBe(false)
    expect(isReactive(observed)).toBe(true)
  })

  it('isReadonly', () => {
    const original = {
      foo: 1
    }
    const wrappend = readonly(original)
    expect(isReadonly(original)).toBe(false)
    expect(isReadonly(wrappend)).toBe(true)
  })
})