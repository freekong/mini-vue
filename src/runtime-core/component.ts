import { shallowReadonly } from "../reactivity/src/reactivity/reactive";
import { initProps } from "./componentProps";
import { publicInstanceProxyHandlers } from "./componentPublicInstance";


export function createComponentInstance(vnode: any) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {}
  }

  return component
}

export function setupComponent(instance: any) {

  initProps(instance, instance.vnode.props)
  // initSolts()

  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
  const Component = instance.type;

  instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers)

  const { setup } = Component
  if (setup) {
    const setupResoult = setup(shallowReadonly(instance.props))

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

