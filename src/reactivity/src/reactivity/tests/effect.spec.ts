import { reactive } from '../reactive'
import { effect, stop } from '../effect'

describe('effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 18
    })

    let nextAge;

    effect(() => {
      nextAge = user.age + 1
    })
    expect(nextAge).toBe(19)

    user.age++;
    expect(nextAge).toBe(20)

  })

  it('should return runner when call effect', () => {
    let num = 2;
    let runner = effect(() => {
      num++;
      return 'foo'
    })

    expect(num).toBe(3);
    const r = runner()
    expect(num).toBe(4)
    expect(r).toBe('foo')
  })

  it('scheduler', () => {
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner
    })
    let obj = reactive({
      foo: 1
    })
    let runner = effect(() => {
      dummy = obj.foo
    },
    { scheduler }
    )

    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);

    obj.foo++;
    expect(dummy).toBe(1);

    run()
    expect(dummy).toBe(2)

  })

  it('stop', () => {
    let dummy;
    let obj = reactive({
      foo: 2
    })
    const runner = effect(() => {
      dummy = obj.foo
    })
    obj.foo = 3
    expect(dummy).toBe(3);
    stop(runner);
    // obj.foo = 4;
    // 优化stop，边缘case
    obj.foo++;
    expect(dummy).toBe(3);
    
    runner()
    expect(dummy).toBe(4)
  })

  it('onStop', () => {
    let dummy;
    let onStop = jest.fn();
    const obj = reactive({
      foo: 1
    })
    const runner = effect(() => {
      dummy = obj.foo
    }, { onStop })
    stop(runner);
    expect(onStop).toBeCalledTimes(1)
  })
})