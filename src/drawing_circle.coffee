import { DrawingUtils } from "./drawing_utils.coffee"
import { Geometry } from "./geometry.coffee"

class DrawingCircle
  constructor: (@options)->
    @rect = DrawingUtils.create_element(@options.parent, 'circle')
    DrawingUtils.style(@options.parent, 'stroke', @options.color)
    DrawingUtils.style(@options.parent, 'fill', @options.color)
    DrawingUtils.style(@rect, 'stroke-width', (@options.size/2)+'px')
    DrawingUtils.style(@rect, 'fill-opacity', 0.2)
    DrawingUtils.style(@rect, 'strokeLinecap', 'round')
  update: (@from, @to)->
    if @big_enough()
      @rect.setAttribute('opacity', 1)
      @rect.setAttribute('cx', @from[0])
      @rect.setAttribute('cy', @from[1])
      @rect.setAttribute('r', Geometry.distance(@from, @to))
    else
      @rect.setAttribute('opacity', 0)
  size: ->
    return 0 unless @from?
    return 0 unless @to?
    Geometry.distance(@from, @to)
  end: (callback)->
    callback()
  big_enough: ->
    @size() > 8
DrawingCircle.type = 'circle'

export { DrawingCircle }
