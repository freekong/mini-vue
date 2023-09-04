import { ReactiveEffect } from "./effect"

class ComputedRefImpl{
  private _getter: any
  private _dirty: boolean = true
  private _value: any
  private _effect: any
  constructor(getter) {
    this._getter = getter
    // 需要将依赖收集起来，get value的时候返回依赖的值
    // 当依赖的值发生改变的时候，打开_dirty开关，重新执行run(),返回新的值
    this._effect = new ReactiveEffect(this._getter, () => {
      if (!this._dirty) {
        this._dirty = true
      }
    })
  }

  get value() {
    if (this._dirty) {
      this._dirty = false
      this._value = this._effect.run()
    }
    return this._value
  }
}

export function computed(getter) {
  return new ComputedRefImpl(getter)
}