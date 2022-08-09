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

function insert(child, parent, anchor) {
  // parent.append(el)
  parent.insertBefore(child, anchor || null)
}

function remove(child) {
  const parent = child.parentNode
  if (parent) {
    parent.removeChild(child)
  }
}

function setElementText(el, text) {
  el.textContent = text
}

const renderer:any = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
  setElementText
})

export function createApp(...arg) {
  return renderer.createApp(...arg)
}

export * from '../runtime-core'