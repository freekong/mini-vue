import { createVnodeCall, NodeTypes } from "../ast";

export function transformElement(node, context) {

  if (node.type === NodeTypes.ELEMENT) {
    return () => {
  
      const vnodeTag = `"${node.tag}"`
  
      let vnodeProps;
  
      const children = node.children
      const vnodeChildren = children[0]
  
      node.codegenNode = createVnodeCall(context, vnodeTag, vnodeProps, vnodeChildren)
    }
  }
}