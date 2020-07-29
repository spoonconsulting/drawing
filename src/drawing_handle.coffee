import { Referentiel } from "referentiel"
import { DrawingUtils } from "./drawing_utils.coffee"
import { DrawingDrag } from "./drawing_drag.coffee"

class DrawingHandle
  constructor: (@svg, @position, @options = {})->
    @destroyed = false
    referentiel = new Referentiel(@svg)
    size = DrawingUtils.size(@svg) * 0.03
    if @options.element?
      @element = @options.element()
    else
      @element = DrawingUtils.create_element(@svg, 'g')
      DrawingUtils.apply_matrix(
        @element,
        [[1, 0, @position[0]], [0, 1, @position[1]], [0, 0, 1]]
      )
      DrawingUtils.create_element(
        @element,
        'circle',
        {
          cx: 0
          cy: 0
          r: size/2,
          style: 'fill: white;'
        }
      )
      DrawingUtils.create_element(
        @element,
        'circle',
        {
          cx: 0
          cy: 0
          r: size/4,
          style: "fill: #{@options.color || '#ff0000'};"
        }
      )
    @drag = new DrawingDrag(
      @element,
      {
        move: (touch, listener)=>
          DrawingUtils.style(@element, 'opacity', 0)
          @move(touch, listener)
        end: =>
          @end()
        cancel: =>
          @cancel()
      }
    )
  end: ()->
    @drag.destroy()
    @options.end()
  cancel: ()->
    @drag.destroy()
    @options.cancel()
  move: (touch, listener)->
    @options.move(touch, listener) if @options.move?
  destroy: ->
    return if @destroyed
    @destroyed = true
    @drag.destroy()
    @element.parentNode.removeChild(@element)

export { DrawingHandle }
