import { isString } from "../../shared"
import { NodeTypes } from "./ast"
import { CREATE_ELEMENT_VNODE, helperNameMap, TO_DISPLAY_STRING } from "./runtimeHelpers"

export function generate(ast) {

  const context = createCodegenContext()
  const { push } = context

  console.log('[ ast.codegenNode ] >', ast.codegenNode)
  genFunctionPreamble(ast, context)

  const functionName = 'render'
  const args = ["_ctx", "_cache"]
  const signature = args.join(',')

  push(`function ${functionName}(${signature}){`)
  push('return ')
  getNode(ast.codegenNode, context)
  push('}')


  return {
    code: context.code
  }
}

function genFunctionPreamble(ast, context) {
  const { push } = context
  const vueBinging = "Vue"
  const aliasHelper = (s) => `${helperNameMap[s]}: _${helperNameMap[s]}`
  if (ast.helpers.length > 0) {
    push(`const { ${ast.helpers.map(aliasHelper).join(',')} } = ${vueBinging}`)
  }
  push('\n')
  push('return ')
}

function getNode(node: any, context: any) {
  console.log('[ node ] >', node)

  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context)    
      break;
    case NodeTypes.INTERPOLATION:
      genInterPolation(node, context)
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context)
      break;
      case NodeTypes.ELEMENT:
    genElement(node, context)
    break;
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context)
    default:
      break;
  }
}
      
function genCompoundExpression(node: any, context: any) {
  
  const { push } = context
  const { children } = node

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (isString(child)) {
      push(child)
    } else {
      getNode(child, context)      
    }
  }
}

function genElement(node, context) {
  const { push, helper } = context
  const { tag, props, children } = node
  console.log('==============node', node.children)
  push(`${helper(CREATE_ELEMENT_VNODE)}(`)
  genNodeList(genNullableArgs([tag, props, children]), context)
  // getNode(children, context)
  push(')')
}

function genNodeList(nodes, context) {

  const { push } = context

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (isString(node)) {
      push(node)
    } else {
      getNode(node, context)
    }
    if (i < nodes.length - 1) {
      push(', ')
    }
  }
}

function genNullableArgs(args: any[]) {
  let i = args.length

  while(i--) {
    if (args[i] != null) break
  }
  return args.slice(0, i + 1).map(arg => arg || 'null')

}

function genExpression(node: any, context: any) {
  const { push } = context
  push(`${node.content}`)
}

function genInterPolation(node: any, context: any) {
  const { push, helper } = context
  push(`${helper(TO_DISPLAY_STRING)}(`)
  getNode(node.content, context)
  push(')')
}

function genText(node: any, context: any) {
  const { push } = context
  push(`'${node.content}'`)
}

function createCodegenContext() {
  const context = {
    code: '',
    push: (source) => context.code += source,
    helper: (key) => `_${helperNameMap[key]}`
  }
  return context
}

