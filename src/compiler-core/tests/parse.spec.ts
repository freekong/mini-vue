import { NodeTypes } from "../src/ast"
import { baseParse } from "../src/parse"

describe('parse', () => {
  describe('interpolation', () => {

    test('simple-interpolation',() => {

      const ast = baseParse("{{ message }}")

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_INTERPOLATION,
          content: 'message'
        }
      })
    })
  })
})