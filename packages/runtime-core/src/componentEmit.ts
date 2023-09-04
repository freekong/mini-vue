import { camelize, toHandlerKey } from "@djh-mini-vue/shared"

export function emit(instance, event, ...args) {
  console.log('%c [ event ]-2', 'font-size:13px; background:pink; color:#bf2c9f;', event)

  // instance.props -> event
  const { props } = instance

  const handlerName = toHandlerKey(camelize(event))

  const handler = props[handlerName]
  handler && handler(...args)
}