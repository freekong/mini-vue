import { effect } from "../reactivity/src/reactivity/effect";
import { EMPTY_OBJ } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";
// import { createVNode } from "./vnode";

export function createRenderer(options) {

  const { 
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert
  } = options

  function render(vnode, container) {
    // 调用patch, 为了后面的递归处理
    patch(null, vnode, container, null);
  }
  /**
   * @description: 
   * @param {*} n1 老的虚拟节点
   * @param {*} n2 新的虚拟节点
   * @param {*} container
   * @param {*} parentComponent
   * @return {*}
   */  
  function patch(n1, n2, container, parentComponent) {
    // debugger
    // console.log('%c [ vnode ]-9', 'font-size:13px; background:pink; color:#bf2c9f;', vnode)
    // 判断vnode.type的类型是 component 还是 element
    const { shapeFlag, type } = n2

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break;
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // element
          processElement(n1, n2, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // stateful_component
          processComponent(n1, n2, container, parentComponent);
        }
        break
    }


  }

  function processText(n1, n2: any, container: any) {
    const { children } = n2
    const textNode = (n2.el = document.createTextNode(children))
    container.append(textNode)
  }

  function processFragment(n1, n2: any, container: any, parentComponent: any) {
    mountChildren(n2, container, parentComponent)
  }

  function processElement(n1, n2: any, container: any, parentComponent: any) {
    if (!n1) {

      mountElement(n2, container, parentComponent)

    } else {
      // 更新
      patchElement(n1, n2, container)
    }
    
  }

  function patchElement(n1, n2, container) {
    console.log('[ patchElement ] >')
    console.log('[ n1 ] >', n1)
    console.log('[ n2 ] >', n2)
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ

    const el = (n2.el = n1.el)
    patchProps(el, oldProps, newProps)
  }

  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key]
        const nextProp = newProps[key]
  
        if (prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp)
        }
      }
      
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }

  function mountElement(vnode: any, container: any, parentComponent: any) { 
    const el = (vnode.el = hostCreateElement(vnode.type));

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
      // const isOn = (key: string) => /^on[A-Z]/.test(key);
      // if (isOn(key)) {
      //   const event = key.slice(2).toLowerCase()
      //   el.addEventListener(event, val)
      // } else {
      //   el.setAttribute(key, val);
      // }
      hostPatchProp(el, key, null, val)
    }

    // container.append(el)
    hostInsert(el, container)
  }

  function mountChildren(vnode: any, container: any, parentComponent) {
    vnode.children.forEach(v => {
      patch(null, v, container, parentComponent)
    })
  }

  function processComponent(n1, n2: any, container: any, parentComponent: any) {
    mountComponent(n2, container, parentComponent)
  }

  function mountComponent(initialVnode: any, container: any, parentComponent: any) {
    const instance = createComponentInstance(initialVnode, parentComponent) // {vnode, type: vnode.type}
    console.log('%c [ 实例instance ]-74', 'font-size:13px; background:pink; color:#bf2c9f;', instance)
    
    setupComponent(instance)
    
    setupRenderEffect(instance, initialVnode, container)
  }


  function setupRenderEffect(instance, initialVnode, container) {
    effect(() => {
      // debugger
      if (!instance.isMounted) {
        console.log('[ init ] >')
        const { proxy } = instance;
        const subTree = (instance.subTree = instance.render.call(proxy));
        // console.log('%c [ subTree ]-121', 'font-size:13px; background:pink; color:#bf2c9f;', subTree)
    
        patch(null, subTree, container, instance);
    
        initialVnode.el = subTree.el;

        instance.isMounted = true
      } else {
        console.log('[ update ] >')

        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        const prevSubTree = instance.subTree

        instance.subTree = subTree
    
        patch(prevSubTree, subTree, container, instance);
      }
    })
  }

  return {
    createApp: createAppAPI(render)
  }
}



