import { DrawingUtils } from "./drawing_utils.coffee"
import { Geometry } from "./geometry.coffee"

class DrawingArrow
  constructor: (@options)->
    @path = DrawingUtils.create_element(@options.parent, 'path')
    DrawingUtils.style(@options.parent, 'stroke', @options.color)
    DrawingUtils.style(@options.parent, 'fill', @options.color)
    DrawingUtils.style(@options.parent, 'stroke-width', @options.size+'px')
    DrawingUtils.style(@options.parent, 'strokeLinecap', 'round')
    @options.arrow_size ||= @options.size * 3
    s = @options.arrow_size
    @arrow = DrawingUtils.create_element(@options.parent, 'path', {
      d: "M0,0L#{-s/2},#{-s}L#{s/2},#{-s}L0,0"
    })
    DrawingUtils.style(@arrow, 'stroke', 'none')
  update: (@from, @to)->
    if @big_enough()
      @options.parent.setAttribute('opacity', 1)
      @path.setAttribute('d', "M#{@from[0]},#{@from[1]} L#{@to[0]},#{@to[1]}")
      angle = Geometry.angle(@from, [@from[0], @from[0]+1000], @to)
      DrawingUtils.apply_matrix(@arrow, Geometry.multiply_matrix(
        Geometry.translation_matrix(@to)
        Geometry.rotation_matrix(angle)
        Geometry.translation_matrix([0, @options.arrow_size/3])
      ))
    else
      @options.parent.setAttribute('opacity', 0)
  angle: ->
    Geometry.angle(@from, [@from[0], @from[0]+100000], @to)
  size: ->
    return 0 unless @from?
    return 0 unless @to?
    Geometry.distance(@from, @to)
  end: (callback)->
    if @options.prompt_text?
      @options.prompt_text '', (input)=>
        if input != ''
          @text_group = DrawingUtils.create_element(@options.parent, 'g')
          @text = DrawingUtils.create_element(@text_group, 'text', {
            'font-size': Math.round(DrawingUtils.size(@options.parent) * 0.03),
            'font-family': 'sans-serif'
          })
          DrawingUtils.style(@text, 'stroke-width', '0')
          DrawingUtils.edit_text(@text, input)
          bbox = @text.getBBox()
          padding = DrawingUtils.size(@options.parent)*0.01
          hyp = Math.sqrt(bbox.width*bbox.width+bbox.height*bbox.height)/2
          offset_angle = @angle()+Math.PI/2
          offsetX = (bbox.height/2)/Math.tan(offset_angle)
          offsetY = (bbox.height/2)/Math.tan(offset_angle)
          offsetX = hyp * Math.cos(offset_angle)
          offsetY = hyp * Math.sin(offset_angle)
          if Math.abs(offsetX) > bbox.width/2
            offsetX = Math.abs(offsetX)/offsetX * bbox.width/2
            offsetX += Math.abs(offsetX)/offsetX * padding
          if Math.abs(offsetY) > bbox.height/2
            offsetY = Math.abs(offsetY)/offsetY * bbox.height/2
            offsetY += Math.abs(offsetY)/offsetY * padding
          center = [
            @from[0] - offsetX,
            @from[1] - offsetY
          ]
          DrawingUtils.apply_matrix(@text_group, Geometry.translation_matrix(center))
    callback()
  big_enough: ->
    @size() > 15
DrawingArrow.type = 'arrow'

export { DrawingArrow }
