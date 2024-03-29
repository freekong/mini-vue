
import { isRef, unRef, ref, proxyRefs } from '../src/ref'
import { effect } from '../src/effect'
import { reactive } from '../src/reactive';

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

  it('unRef', () => {
    const a = ref(1);
    const b = 1;
    expect(unRef(a)).toBe(1);
    expect(unRef(b)).toBe(1);
  })

  it('proxyRefs', () => {
    const user = {
      age: ref(12),
      id: 1
    }
    const obj = proxyRefs(user);
    expect(obj.age).toBe(12);
    expect(obj.id).toBe(1);

    obj.age = 15;
    expect(obj.age).toBe(15);
    expect(user.age.value).toBe(15);

    obj.age = ref(18);
    expect(obj.age).toBe(18);
    expect(user.age.value).toBe(18);
  })
})