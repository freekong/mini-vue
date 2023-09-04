import { reactive, isReactive, isProxy } from '../src/reactive'

describe('reactive', () => {
  it('happy path', () => {
    const original = {
      a: 1
    }
    const current = reactive(original)
    expect(original).not.toBe(current)
    expect(current.a).toBe(1)

    expect(isProxy(current)).toBe(true)
  })

  it('nested reactive', () => {
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
    const observed = reactive(original)
    expect(isReactive(observed.user)).toBe(true)
    expect(isReactive(observed.friends)).toBe(true)
    expect(isReactive(observed.friends[0])).toBe(true)
  })
})