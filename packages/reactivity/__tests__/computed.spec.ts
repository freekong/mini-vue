import { vi } from "vitest"
import { computed } from "../src/computed"
import { reactive } from "../src/reactive"


describe('computed', () => {
  it('happy path', () => {
    const user = reactive({
      age: 1
    })

    // 通过.value获取值
    // user.age改变，age.value 随即改变
    const age = computed(() => {
      return user.age
    })

    expect(age.value).toBe(1)
  })

  it("should compute lazily", () => {

    const value = reactive({
      foo: 1
    })

    const getter = vi.fn(() => {
      return value.foo
    })

    const cValue = computed(getter)

    expect(getter).not.toHaveBeenCalled();

    expect(cValue.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1)

    cValue.value;
    expect(getter).toHaveBeenCalledTimes(1)

    value.foo = 2;
    expect(getter).toHaveBeenCalledTimes(1)

    expect(cValue.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2)

    cValue.value;
    expect(getter).toHaveBeenCalledTimes(2)

  })
})