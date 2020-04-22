import { DrawingUtils } from "./drawing_utils.coffee"
import { Geometry } from "./geometry.coffee"

class DrawingDoubleArrow
  constructor: (@options)->
    @path = DrawingUtils.create_element(@options.parent, 'path')
    DrawingUtils.style(@options.parent, 'stroke', @options.color)
    DrawingUtils.style(@options.parent, 'fill', @options.color)
    DrawingUtils.style(@options.parent, 'stroke-width', @options.size+'px')
    DrawingUtils.style(@options.parent, 'strokeLinecap', 'round')
    @options.arrow_size ||= @options.size * 3
    @arrows = [@arrow(), @arrow()]
  arrow: ->
    s = @options.arrow_size
    arrow = DrawingUtils.create_element(@options.parent, 'path', {
      d: "M0,0L#{-s/2},#{-s}L#{s/2},#{-s}L0,0"
    })
    DrawingUtils.style(arrow, 'stroke', 'none')
    arrow
  update: (@from, @to)->
    if @big_enough()
      @options.parent.setAttribute('opacity', 1)
      @path.setAttribute('d', "M#{@from[0]},#{@from[1]} L#{@to[0]},#{@to[1]}")
      angle = @angle()
      DrawingUtils.apply_matrix(@arrows[0], Geometry.multiply_matrix(
        Geometry.translation_matrix(@to)
        Geometry.rotation_matrix(angle)
        Geometry.translation_matrix([0, @options.arrow_size/3])
      ))
      DrawingUtils.apply_matrix(@arrows[1], Geometry.multiply_matrix(
        Geometry.translation_matrix(@from)
        Geometry.rotation_matrix(angle+Math.PI)
        Geometry.translation_matrix([0, @options.arrow_size/3])
      ))
    else
      @options.parent.setAttribute('opacity', 0)
  size: ->
    return 0 unless @from?
    return 0 unless @to?
    Geometry.distance(@from, @to)
  angle: ->
    Geometry.angle(@from, [@from[0], @from[0]+100000], @to)
  end: (callback)->
    if @options.prompt_text?
      @options.prompt_text '', (input)=>
        if input != ''
          center = Geometry.barycentre([@from, @to])
          text_group = DrawingUtils.create_element(@options.parent, 'g')
          text = DrawingUtils.create_element(text_group, 'text', {
            'font-size': Math.round(DrawingUtils.size(@options.parent) * 0.03),
            'font-family': 'sans-serif'
          })
          DrawingUtils.style(text, 'stroke-width', '0')
          DrawingUtils.edit_text(text, input)
          angle = (@angle() % Math.PI) - Math.PI/2
          DrawingUtils.apply_matrix(text_group,
            Geometry.multiply_matrix(
              Geometry.translation_matrix(center),
              Geometry.rotation_matrix(angle),
              Geometry.translation_matrix([ 0, -text.getBBox().height]),
            )
          )
      callback()
    else
      callback()
  big_enough: ->
    @size() > 15
DrawingDoubleArrow.type = 'double-arrow'

export { DrawingDoubleArrow }
