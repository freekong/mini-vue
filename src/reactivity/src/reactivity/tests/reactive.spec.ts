import { reactive } from '../reactive'

describe('reactive', () => {
  it('happy path', () => {
    const original = {
      a: 1
    }
    const current = reactive(original)
    expect(original).not.toBe(current)
    expect(current.a).toBe(1)
  })
})