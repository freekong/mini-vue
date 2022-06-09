import { readonly, reactive, isReactive, isReadonly, shallowReadonly, isProxy } from '../reactive'

describe('readonly', () => {
  it('reayonly test', () => {
    const original = {
      foo: 1
    }

    const wrappend = readonly(original)
    expect(original).not.toBe(wrappend)
    expect(wrappend.foo).toBe(1)
    expect(isProxy(wrappend)).toBe(true)

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
      foo: 1,
      user: {
        age: 18
      },
      friends: [
        {
          id: 2
        }
      ]
    }
    const wrappend = readonly(original)
    expect(isReadonly(original)).toBe(false)
    expect(isReadonly(wrappend)).toBe(true)

    expect(isReadonly(wrappend.user)).toBe(true)
    expect(isReadonly(wrappend.friends)).toBe(true)
    expect(isReadonly(wrappend.friends[0])).toBe(true)
  })

  it('shallowReadonly', () => {
    const original = {
      foo: 1,
      user: {
        age: 18
      },
      friends: [
        {
          id: 2
        }
      ]
    }
    const wrappend = shallowReadonly(original)
    expect(isReadonly(original)).toBe(false)
    expect(isReadonly(wrappend)).toBe(true)

    expect(isReadonly(wrappend.user)).toBe(false)
    expect(isReadonly(wrappend.friends)).toBe(false)
    expect(isReadonly(wrappend.friends[0])).toBe(false)
  })
})