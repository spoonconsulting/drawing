import { Referentiel } from "./referentiel.coffee"
import { Geometry } from "./geometry.coffee"
import { DrawingUtils } from "./drawing_utils.coffee"

class DrawingSelect
  constructor: (@element, @options)->
    @destroyed = false
    @svg = @element.parentNode
    while @svg.localName != 'svg'
      @svg = @svg.parentNode
    @svg.appendChild(@element)
    @init()
  init: ->
    @position_handle.destroy() if @position_handle?
    bbox = @element.getBBox()
    @referentiel = new Referentiel(@element)
    matrix = @referentiel.matrix_transformation()
    center = @referentiel._multiply_point(matrix, [
      bbox.x + bbox.width / 2
      bbox.y + bbox.height / 2
    ])
    referentiel = new Referentiel(@svg)

    padding = Geometry.distance(
      referentiel.global_to_local([window.innerWidth/2, window.innerHeight/2]),
      referentiel.global_to_local([0, 0])
    ) * 0.01

    @background = DrawingUtils.create_element(@svg, 'rect', {
      x: bbox.x - padding
      y: bbox.y - padding
      width: bbox.width + 2 * padding
      height: bbox.height + 2 * padding
      style: "fill:red; opacity: 0.3;"
      transform: @element.getAttribute('transform')
    })
    @svg.insertBefore(@background, @element)
  destroy: ->
    return if @destroyed
    @destroyed = true
    DrawingUtils.remove(@background)

export { DrawingSelect }
