import { NodeTypes } from "./ast"

const enum tagType {
  Start,
  End
}

export function baseParse(content) {

  const context = createParserContext(content)

  return createRoot(parseChildren(context))
}

function parseInterpolation(context) {

  const openDelimiter = '{{'
  const closeDelimiter = '}}'

  const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)
  advanceBy(context, openDelimiter.length)

  const rawContentLength = closeIndex - closeDelimiter.length

  const rawContent = context.source.slice(0, rawContentLength)
  const content = rawContent.trim()

  advanceBy(context, rawContentLength + closeDelimiter.length)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_INTERPOLATION,
      content
    }
  }
}

function parseChildren(context) {

  const nodes: any = [];

  let node
  const s = context.source
  if (s.startsWith('{{')) {
    node = parseInterpolation(context)
  } else if (s[0] == '<') {
    if (/[a-z]/i.test(s[1])) {
      console.log('[ parse element ]')
      node = parseElement(context)
    }
  }
  nodes.push(node)
  return nodes
}

function parseElement(context) {

  const element = parseTag(context, tagType.Start);

  parseTag(context, tagType.End)
  console.log('[ context.source ] ============', context.source)
  return element
  
}

function parseTag(context, type: tagType) {
  // 1.解析tag
  const match: any = /^<\/?([a-z]*)/i.exec(context.source)
  console.log('[ match ] >', match)
  const tag = match[1]
  // 2.删除字符
  advanceBy(context, match[0].length)
  advanceBy(context, 1)
  if (type === tagType.End) return
  return {
    type: NodeTypes.ELEMENT,
    tag
  }
}
function createParserContext(content: any) {
  return {
    source: content
  }
}

function createRoot(children) {
  return {
    children
  }
}

function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length)
}

