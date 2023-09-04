import { hasChange, isObject } from "@djh-mini-vue/shared";
import { trackEffects, triggerEffects, isTracking } from "./effect";
import { reactive } from "./reactive";

class refImpl {
  private _value: any;
  private _rawValue: any;
  public __v_isRef = true;
  public dep;

  constructor(val) {
    this._rawValue = val
    this._value = convert(val);
    this.dep = new Set()
  }
  get value() {
    trackRefValue(this)
    return this._value
  }
  set value(newValue) {
    if (hasChange(newValue, this._rawValue)) {
      this._value = convert(newValue);
      this._rawValue = newValue
      triggerEffects(this.dep)
    }
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep)
  }
}

export function ref(value) {
  return new refImpl(value)
}

export function isRef(ref) {
  return !!ref.__v_isRef
}

export function unRef(ref) {
  return isRef(ref) ? ref.value : ref
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      // 如果是ref -> 返回.value
      // 如果不是ref -> 直接放回本身
      return unRef(Reflect.get(target, key))
    },
    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        // 如果原先的值是ref, 设置的值不是ref。 要将原来的ref.value 设置为 value
        target[key].value = value
        return true
      } else {
        // 其他情况直接替换就ok了
        return Reflect.set(target, key, value)
      }
    }
  })
}