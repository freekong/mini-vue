import { isObject } from "../reactivity/src/shared/index";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createVNode } from "./vnode";

export function render(vnode, container) {
  // 调用patch, 为了后面的递归处理
  patch(vnode, container);
}

function patch(vnode, container) {
  // debugger
  console.log('%c [ vnode ]-9', 'font-size:13px; background:pink; color:#bf2c9f;', vnode)
  // 判断vnode.type的类型是 component 还是 element
  const { shapeFlag } = vnode
  if (shapeFlag & ShapeFlags.ELEMENT) {
    // element
    processElement(vnode, container)
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    // stateful_component
    processComponent(vnode, container);
  }

}

function processElement(vnode: any, container: any) {

  mountElement(vnode, container)
  
}

function mountElement(vnode: any, container: any) { 
  const el = vnode.el = document.createElement(vnode.type);

  const { props, children, shapeFlag } = vnode

  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    // text_children

    el.textContent = children

  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    // array_children

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

function mountComponent(initialVnode: any, container: any) {
  const instance = createComponentInstance(initialVnode) // {vnode, type: vnode.type}
  
  setupComponent(instance)
  
  setupRenderEffect(instance, initialVnode, container)
}


function setupRenderEffect(instance, initialVnode, container) {
  const { proxy } = instance
  const subTree = instance.render.call(proxy)

  patch(subTree, container)

  initialVnode.el = subTree.el 
}


