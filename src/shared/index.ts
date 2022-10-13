
export const extend = Object.assign;

export const EMPTY_OBJ = {}

export const isObject = (val) => {
  return val !== null && typeof val === 'object'
}

export const isString = (val) => {
  return typeof val === 'string'
}

export const hasChange = (value, newValue) => {
  return !Object.is(value, newValue)
}

export const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key)

export const camelize = (str: String) => {
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : ''
  })
}

const capitalize = (str: String) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

 export const toHandlerKey = (str: String) => {
  return str ? 'on' + capitalize(str) : ''
}