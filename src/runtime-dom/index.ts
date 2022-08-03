import { createRenderer } from "../runtime-core";

function createElement(type) {
  return document.createElement(type)
}

function patchProp(el, key, oldVal, newVal) {
  const isOn = (key: string) => /^on[A-Z]/.test(key);
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase()
    el.addEventListener(event, newVal)
  } else {
    if (newVal === undefined || newVal === null) {
      el.removeAttribute(key, newVal);
    } else {
      el.setAttribute(key, newVal);
    }
  }
}

function insert(el, parent) {
  parent.append(el)
}

const renderer:any = createRenderer({
  createElement,
  patchProp,
  insert
})

export function createApp(...arg) {
  return renderer.createApp(...arg)
}

export * from '../runtime-core'