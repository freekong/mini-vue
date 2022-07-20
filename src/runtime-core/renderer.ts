import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { Fragment, Text } from "./vnode";
// import { createVNode } from "./vnode";

export function render(vnode, container) {
  // 调用patch, 为了后面的递归处理
  patch(vnode, container, null);
}

function patch(vnode, container, parentComponent) {
  // debugger
  console.log('%c [ vnode ]-9', 'font-size:13px; background:pink; color:#bf2c9f;', vnode)
  // 判断vnode.type的类型是 component 还是 element
  const { shapeFlag, type } = vnode

  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent)
      break;
    case Text:
      processText(vnode, container)
      break
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        // element
        processElement(vnode, container, parentComponent)
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // stateful_component
        processComponent(vnode, container, parentComponent);
      }
      break
  }


}

function processText(vnode: any, container: any) {
  const { children } = vnode
  const textNode = (vnode.el = document.createTextNode(children))
  container.append(textNode)
}

function processFragment(vnode: any, container: any, parentComponent: any) {
  mountChildren(vnode, container, parentComponent)
}

function processElement(vnode: any, container: any, parentComponent: any) {

  mountElement(vnode, container, parentComponent)
  
}

function mountElement(vnode: any, container: any, parentComponent: any) { 
  const el = (vnode.el = document.createElement(vnode.type));

  const { props, children, shapeFlag } = vnode

  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    // text_children

    el.textContent = children

  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    // array_children

    mountChildren(vnode, el, parentComponent)

  }

  for (const key in props) {
    const val = props[key];
    const isOn = (key: string) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event, val)
    } else {
      el.setAttribute(key, val);
    }
  }

  container.append(el)
}

function mountChildren(vnode: any, container: any, parentComponent) {
  vnode.children.forEach(v => {
    patch(v, container, parentComponent)
  })
}

function processComponent(vnode: any, container: any, parentComponent: any) {
  mountComponent(vnode, container, parentComponent)
}

function mountComponent(initialVnode: any, container: any, parentComponent: any) {
  const instance = createComponentInstance(initialVnode, parentComponent) // {vnode, type: vnode.type}
  console.log('%c [ 实例instance ]-74', 'font-size:13px; background:pink; color:#bf2c9f;', instance)
  
  setupComponent(instance)
  
  setupRenderEffect(instance, initialVnode, container)
}


function setupRenderEffect(instance, initialVnode, container) {
  const { proxy } = instance
  const subTree = instance.render.call(proxy)

  patch(subTree, container, instance)

  initialVnode.el = subTree.el 
}


