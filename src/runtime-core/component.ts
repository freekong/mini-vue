import { shallowReadonly } from "../reactivity/src/reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { publicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSolts } from "./componentSlots";


export function createComponentInstance(vnode: any) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    slots: {},
    emit: () => {}
  }

  component.emit = emit.bind(null, component) as any

  return component
}

export function setupComponent(instance: any) {

  initProps(instance, instance.vnode.props)
  initSolts(instance, instance.vnode.children)

  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
  const Component = instance.type;

  instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers)

  const { setup } = Component
  if (setup) {

    setCurrentInstance(instance)

    const setupResoult = setup(shallowReadonly(instance.props), {
      emit: instance.emit
    })

    setCurrentInstance(null)

    handleSetupResoult(instance, setupResoult);
  }

}

function handleSetupResoult(instance: any, setupResoult: any) {
  // function
  // object
  if (typeof setupResoult === 'object') {
    instance.setupState = setupResoult
  }

  finishComponentSetup(instance)

}

function finishComponentSetup(instance: any) {
  const Component = instance.type;

  if (Component.render) {
    instance.render = Component.render
  }
}

let currentInstance = null

export function getCurrentInstance() {
  return currentInstance
}

function setCurrentInstance(instance) {
  currentInstance = instance
}