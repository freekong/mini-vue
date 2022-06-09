import { hasChange, isObject } from "../shared";
import { trackEffects, triggerEffects, isTracking } from "./effect";
import { reactive } from "./reactive";

class refImpl {
  private _value: any
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