import { NodeTypes } from "./ast"

const enum tagType {
  Start,
  End
}

export function baseParse(content) {

  const context = createParserContext(content)

  return createRoot(parseChildren(context, []))
}

function parseInterpolation(context) {

  const openDelimiter = '{{'
  const closeDelimiter = '}}'

  const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)
  advanceBy(context, openDelimiter.length)

  const rawContentLength = closeIndex - closeDelimiter.length

  const rawContent = parseTextData(context, rawContentLength)
  const content = rawContent.trim()

  advanceBy(context, closeDelimiter.length)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_INTERPOLATION,
      content
    }
  }
}

function parseChildren(context, ancestors) {

  const nodes: any = [];

  while(!isEnd(context, ancestors)) {
    let node
    const s = context.source
    console.log('[ s ===== ] >', s)
    if (s.startsWith('{{')) {
      node = parseInterpolation(context)
    } else if (s[0] === '<') {
      if (/[a-z]/i.test(s[1])) {
        node = parseElement(context, ancestors)
      }
    } 
    if (!node) {
      node = parseText(context)
    }

    nodes.push(node)  
  }
  return nodes
}

function isEnd(context, ancestors) {
  // 找到结束标签的时候
  const s = context.source
  if (s.startsWith('</')) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag
      if (startsWithEndTagOpen(s, tag)) {
        return true
      }
    }    
  }
  // 1、当content.source没有值的时候
  return !s
}

function parseText(context) {

  const endTokens = ["<", "{{" ]
  let endIndex = context.source.length
  for (let i = 0; i < endTokens.length; i++) {

    const index = context.source.indexOf(endTokens[i])
    if (index != -1 && endIndex > index) {
      endIndex = index
    }
    
  }
  const content = parseTextData(context, endIndex)
  console.log('[ context.source==========111 ] >', context.source)
  console.log('[ content ===============222]', content)
  return {
    type: NodeTypes.TEXT,
    content 
  }
}

function startsWithEndTagOpen(source, tag) {
  return source.startsWith('</') && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
}

function parseElement(context, ancestors) {

  const element: any = parseTag(context, tagType.Start);
  ancestors.push(element)
  element.children = parseChildren(context, ancestors)
  ancestors.pop()
  console.log('[ context.source ] ============', context.source)
  console.log('[ element.tag ] ============', element.tag)
  if (startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, tagType.End)
  } else {
    throw new Error(`缺少结束标签：${element.tag}`)
  }
  return element
  
}

function parseTag(context, type: tagType) {
  // 1.解析tag
  console.log('[ context.source @@@@@] ', context.source)
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

function parseTextData(context, length) {
  const content = context.source.slice(0, length)
  advanceBy(context, length)
  return content
}