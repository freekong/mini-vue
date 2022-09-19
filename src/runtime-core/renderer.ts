import { effect } from "../reactivity/src/reactivity/effect";
import { EMPTY_OBJ } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { shouldUpdateComponent } from "./componentUpdateUtils";
import { createAppAPI } from "./createApp";
import { queueJobs } from "./scheduler";
import { Fragment, Text } from "./vnode";
// import { createVNode } from "./vnode";

export function createRenderer(options) {

  const { 
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText
  } = options

  function render(vnode, container) {
    // 调用patch, 为了后面的递归处理
    patch(null, vnode, container, null, null);
  }
  /**
   * @description: 
   * @param {*} n1 老的虚拟节点
   * @param {*} n2 新的虚拟节点
   * @param {*} container
   * @param {*} parentComponent
   * @return {*}
   */  
  function patch(n1, n2, container, parentComponent, anchor) {
    // debugger
    // console.log('%c [ vnode ]-9', 'font-size:13px; background:pink; color:#bf2c9f;', vnode)
    // 判断vnode.type的类型是 component 还是 element
    const { shapeFlag, type } = n2

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor)
        break;
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // element
          processElement(n1, n2, container, parentComponent, anchor)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // stateful_component
          processComponent(n1, n2, container, parentComponent, anchor);
        }
        break
    }


  }

  function processText(n1, n2: any, container: any) {
    const { children } = n2
    const textNode = (n2.el = document.createTextNode(children))
    container.append(textNode)
  }

  function processFragment(n1, n2: any, container: any, parentComponent: any, anchor) {
    mountChildren(n2.children, container, parentComponent, anchor)
  }

  function processElement(n1, n2: any, container: any, parentComponent: any, anchor) {
    if (!n1) {

      mountElement(n2, container, parentComponent, anchor)

    } else {
      // 更新
      patchElement(n1, n2, container, parentComponent, anchor)
    }
    
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {
    console.log('[ patchElement ] >')
    console.log('[ n1 ] >', n1)
    console.log('[ n2 ] >', n2)
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ

    const el = (n2.el = n1.el)

    patchChildren(n1, n2, el, parentComponent, anchor)
    patchProps(el, oldProps, newProps)
  }

  function patchChildren(n1: any, n2: any, container: any, parentComponent, anchor) {
    const prevShapeFlag = n1.shapeFlag
    const { shapeFlag } = n2

    const c1 = n1.children
    const c2 = n2.children

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 新的是text
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 老的是children

        // 1.先把老的array清空
        unmountChildren(n1.children)
      }
      if (c1 !== c2) {
        // 2.设置新的text
        hostSetElementText(container, c2)
      }

    } else {
      // 新的是array
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 老的是Text
        // 先清空老的text，再渲染新的array
        hostSetElementText(container, '')
        mountChildren(c2, container, parentComponent, anchor)
      } else {
        // 老的是Array
        patchKeyedChildren(c1, c2, container, parentComponent, anchor)
      }
    }
  }

  /**
   * @description: 比较新老两个虚拟节点是否相同
   * @param {*} n1 老的children内的虚拟节点
   * @param {*} n2 新的children内的虚拟节点
   * @return {*}
   */    
  function isSomeVNodeType(n1, n2) {
    // 根据 type 和 key 来判断
    return n1.type === n2.type && n1.key === n2.key
  }

  /**
   * @description: 对比新老children都为数组
   * @param {*} c1 老的children
   * @param {*} c2 新的children
   * @return {*}
   */  
  function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
    let i = 0;
    const l1 = c1.length;
    const l2 = c2.length;
    let e1 = l1 - 1;
    let e2 = l2 - 1;

    while(i <= e1 && i <= e2) {
      let n1 = c1[i];
      let n2 = c2[i];

      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      i++;
    }

    while(i <= e1 && i <= e2) {
      let n1 = c1[e1]
      let n2 = c2[e2]

      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      e1--;
      e2--;
    }

    if (i > e1) {
      // 新的比老的多 创建
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = e2 + 1 < l2 ? c2[nextPos].el : null
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor)
          i++;
        }
      }
    } else if (i > e2) {
      // 老的比新的多 删除
      while (i <= e1) {
        hostRemove(c1[i].el)
        i++;
      }
    } else {
      // 中间对比
      let s1 = i;
      let s2 = i;

      const toBePatched = e2 - s2 + 1; // 新的diff长度
      let patched = 0

      let moved = false
      let maxNewIndexSoFar = 0
      const keyToNewIndexMap = new Map()
      const newIndexToOldIndexMap = new Array(toBePatched) // 老的child的index对应在新的child的index的映射表
      // 初始化映射表
      for (let i = 0; i < toBePatched; i++) {
        newIndexToOldIndexMap[i] = 0
      }

      for (let i = s2; i<= e2; i++) {
        const nextChild = c2[i]
        keyToNewIndexMap.set(nextChild.key, i)
      }

      let newIndex;

      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i]

        if (patched >= toBePatched) {
          hostRemove(prevChild.el)
          continue;
        }

        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key)
        } else {
          for (let j = s2; j <= e2; j++) {
            const nextChild = c2[j]
            if (isSomeVNodeType(prevChild, nextChild)) {
              newIndex = j
              break
            }
          }
        }

        if (newIndex === undefined) {
          hostRemove(prevChild.el)
        } else {
          // 老的在新的里面一定存在，newIndex为老的在新的里面的索引

          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex
          } else {
            moved = true
          }
          newIndexToOldIndexMap[newIndex - s2] = i + 1

          patch(prevChild, c2[newIndex], container, parentComponent, null)
          patched++;
        }
      }

      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : []
      let j = increasingNewIndexSequence.length - 1;
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2;
        const nextChild = c2[nextIndex]
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, parentComponent, anchor)
        } else if (moved) {
          if (j < 0 || i != increasingNewIndexSequence[j]) {
            console.log('==============>  需要移动')
            hostInsert(nextChild.el, container, anchor)
          } else {
            j--;
          }
        }
      }
      
    }

    console.log('[ i ] >', i)
    console.log('[ e1 ] >', e1)
    console.log('[ e2 ] >', e2)
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el
      hostRemove(el)
    }
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

  function mountElement(vnode: any, container: any, parentComponent: any, anchor) { 
    const el = (vnode.el = hostCreateElement(vnode.type));

    const { props, children, shapeFlag } = vnode

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // text_children

      el.textContent = children

    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // array_children

      mountChildren(children, el, parentComponent, anchor)

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
    hostInsert(el, container, anchor)
  }

  function mountChildren(children: any, container: any, parentComponent, anchor) {
    children.forEach(v => {
      patch(null, v, container, parentComponent, anchor)
    })
  }

  function processComponent(n1, n2: any, container: any, parentComponent: any, anchor) {
    console.log('%c [ n1 ]-346', 'font-size:13px; background:pink; color:#bf2c9f;', n1)
    console.log('%c [ n2 ]-346', 'font-size:13px; background:pink; color:#bf2c9f;', n2)
    if (!n1) {
      mountComponent(n2, container, parentComponent, anchor)
    } else {
      updateComponent(n1, n2)
    }
  }

  function mountComponent(initialVnode: any, container: any, parentComponent: any, anchor) {
    const instance = (initialVnode.component = createComponentInstance(initialVnode, parentComponent)) // {vnode, type: vnode.type}
    console.log('%c [ 实例instance ]-74', 'font-size:13px; background:pink; color:#bf2c9f;', instance)
    
    setupComponent(instance)
    
    setupRenderEffect(instance, initialVnode, container, anchor)
  }

  function updateComponent(n1, n2) {
    const instance = (n2.component = n1.component)
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2
      instance.update()
    } else {
      n1.el = n2.el
      instance.vnode = n2
    }
  }

  function setupRenderEffect(instance, initialVnode, container, anchor) {
    instance.update = effect(() => {
      // debugger
      if (!instance.isMounted) {
        console.log('[ init instance ] >')
        const { proxy } = instance;
        const subTree = (instance.subTree = instance.render.call(proxy));
        // console.log('%c [ subTree ]-121', 'font-size:13px; background:pink; color:#bf2c9f;', subTree)
    
        patch(null, subTree, container, instance, anchor);
    
        initialVnode.el = subTree.el;

        instance.isMounted = true
      } else {
        console.log('[ update instance ] >')

        const {next, vnode, proxy} = instance
        if (next) {
          next.el = vnode.el
          updateComponentPreRender(instance, next)
        }

        const subTree = instance.render.call(proxy);
        const prevSubTree = instance.subTree

        instance.subTree = subTree
    
        patch(prevSubTree, subTree, container, instance, anchor);
      }
    }, {
      scheduler: () => {
        console.log('[ update-scheduler ] >')
        queueJobs(instance.update)
      }
    })
  }

  return {
    createApp: createAppAPI(render)
  }
}

function updateComponentPreRender(instance, nextVnode) {
  instance.vnode = nextVnode
  instance.next = null

  instance.props = nextVnode.props
}

/**
 * @description: 最长递增子序列算法
 * @param {*} arr
 * @return {*}
 */
function getSequence(arr) {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}



