
import { isObject } from '../../../shared'
import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from './baseHandler'

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly'
}

export function reactive(obj) {
  return createActiveObject(obj, mutableHandlers)
}

export function readonly(obj) {
  return createActiveObject(obj, readonlyHandlers)
}

export function shallowReadonly(obj) {
  return createActiveObject(obj, shallowReadonlyHandlers)
}

function createActiveObject(obj: any, baseHandler) {
  if (!isObject(obj)) {
    console.warn(`${ obj }不是一个对象`)
    return obj
  }
  return new Proxy(obj, baseHandler)
}

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY]
}

export function isProxy(value) {
  return isReactive(value) || isReadonly(value)
}