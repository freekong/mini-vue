
import { mutableHandlers, readonlyHandlers } from './baseHandler'

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

function createActiveObject(obj: any, baseHandler) {
  return new Proxy(obj, baseHandler)
}

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY]
}