
import { isRef, ref } from '../ref'
import { effect } from '../effect'
import { reactive } from '../reactive';

describe('ref', () => {
  it('happy path', () => {
    const a = ref(1);
    expect(a.value).toBe(1)
  })

  it('should be reactive', () => {
    const a = ref(1);
    let dummy;
    let count = 0;
    effect(() => {
      dummy = a.value;
      count++;
    })
    expect(count).toBe(1);
    expect(dummy).toBe(1);
    a.value = 2;
    expect(count).toBe(2);
    expect(dummy).toBe(2);
    a.value = 2;
    expect(count).toBe(2);
    expect(dummy).toBe(2);
  })

  it('should make nested properties reactive', () => {
    const a = ref({
      num: 1
    })
    let dummy;
    effect(() => {
      dummy = a.value.num
    })
    expect(dummy).toBe(1);
    a.value.num = 2;
    expect(dummy).toBe(2);
  })

  it('isRef', () => {
    const a = ref(1);
    const b = 1;
    const user = reactive({
      foo: 1
    })
    expect(isRef(a)).toBe(true)
    expect(isRef(b)).toBe(false)
    expect(isRef(user)).toBe(false)
  })
})