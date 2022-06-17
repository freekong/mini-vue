import { isObject } from "../reactivity/src/shared/index";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  // 调用patch, 为了后面的递归处理
  patch(vnode, container);
}

function patch(vnode, container) {
  debugger
  console.log('%c [ vnode ]-9', 'font-size:13px; background:pink; color:#bf2c9f;', vnode)
  // 判断vnode.type的类型是 component 还是 element
  if (typeof vnode.type === 'string') {
    processElement(vnode, container)
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container);
  }

}

function processElement(vnode: any, container: any) {

  mountElement(vnode, container)
  
}

function mountElement(vnode: any, container: any) {
  const el = document.createElement(vnode.type);

  const { props, children } = vnode

  if (typeof children === 'string') {

    el.textContent = children

  } else if (Array.isArray(children)) {

    mountChildren(vnode, el)

  }

  for (const key in props) {
    const val = props[key];
    el.setAttribute(key, val);
  }

  container.append(el)
}

function mountChildren(vnode: any, container: any) {
  vnode.children.forEach(v => {
    patch(v, container)
  })
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container)
}

function mountComponent(vnode: any, container: any) {
  const instance = createComponentInstance(vnode) // {vnode, type: vnode.type}

  setupComponent(instance)
  
  setupRenderEffect(instance, container)
}


function setupRenderEffect(instance, container) {
  const subTree = instance.render()

  patch(subTree, container)
}


