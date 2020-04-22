import { DrawingUtils } from "./drawing_utils.coffee"
import { Geometry } from "./geometry.coffee"

class DrawingLine
  constructor: (@options)->
    @path = DrawingUtils.create_element(@options.parent, 'path')
    DrawingUtils.style(@options.parent, 'stroke', @options.color)
    DrawingUtils.style(@options.parent, 'stroke-width', @options.size+'px')
    DrawingUtils.style(@path, 'strokeLinecap', 'round')
  update: (@from, @to)->
    @path.setAttribute('d', "M#{@from[0]},#{@from[1]} L#{@to[0]},#{@to[1]}")
  size: ->
    return 0 unless @from?
    return 0 unless @to?
    Geometry.distance(@from, @to)
  big_enough: ->
    @size() > 8
  end: (callback)->
    callback()
DrawingLine.type = 'line'

export { DrawingLine }
