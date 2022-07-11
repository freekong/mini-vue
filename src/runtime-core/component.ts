import { publicInstanceProxyHandlers } from "./componentPublicInstance";


export function createComponentInstance(vnode: any) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {}
  }

  return component
}

export function setupComponent(instance: any) {

  // initProps()
  // initSolts()

  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
  const Component = instance.type;

  instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers)

  const { setup } = Component
  if (setup) {
    const setupResoult = setup()

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

