// mini-vue 出口


export * from '@djh-mini-vue/runtime-dom'

import { baseCompile } from '@djh-mini-vue/compiler-core'
import * as runtimeDom from '@djh-mini-vue/runtime-dom'
import { registerRuntimeCompiler } from '@djh-mini-vue/runtime-dom'

function compilerToFunction(template) {
  const { code } = baseCompile(template)
  const render = new Function("Vue", code)(runtimeDom)

  return render
}

registerRuntimeCompiler(compilerToFunction)