import { DrawingUtils } from "./drawing_utils.coffee"
import { Geometry } from "./geometry.coffee"

class DrawingRect
  constructor: (@options)->
    @rect = DrawingUtils.create_element(@options.parent, 'rect')
    DrawingUtils.style(@options.parent, 'stroke', @options.color)
    DrawingUtils.style(@options.parent, 'fill', @options.color)
    DrawingUtils.style(@options.parent, 'stroke-width', (@options.size/2)+'px')
    DrawingUtils.style(@options.parent, 'strokeLinecap', 'round') # stroke-linecap ?
    DrawingUtils.style(@rect, 'fill-opacity', 0.2)
  update: (@from, @to)->
    if @big_enough()
      @rect.setAttribute('opacity', 1)
      @rect.setAttribute('x', Math.min(@from[0], @to[0]))
      @rect.setAttribute('y', Math.min(@from[1], @to[1]))
      @rect.setAttribute('width', Math.abs(@from[0] - @to[0]))
      @rect.setAttribute('height', Math.abs(@from[1] - @to[1]))
    else
      @rect.setAttribute('opacity', 0)
  size: ->
    return 0 unless @from?
    return 0 unless @to?
    Geometry.distance(@from, @to)
  big_enough: ->
    @size() > 8
  end: (callback)->
    callback()
DrawingRect.type = 'rect'

export { DrawingRect }
