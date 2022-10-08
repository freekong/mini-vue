export function transform(root, options = {}) {
  const context = createTransformContext(root, options);
  // 1.遍历树  深度优先
  traverseNode(root, context);
  createRootCodegen(root)
}

function traverseNode(node, context) {
  console.log(node, "=====>node");
  const nodeTransforms = context.nodeTransforms;
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i];
    transform(node);
  }

  traverseChildren(node, context);
}

function traverseChildren(node: any, context: any) {
  const children = node.children;
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      traverseNode(node, context);
    }
  }
}

function createTransformContext(root: any, options: any) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
  };

  return context;
}

function createRootCodegen(root: any) {
  root.codegenNode = root.children[0]
}

