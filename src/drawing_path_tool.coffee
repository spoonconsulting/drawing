import { MoveListener, UpListener } from "./drawing_listener.coffee"
import { DrawingUtils } from "./drawing_utils.coffee"
import { Geometry } from "./geometry.coffee"

class DrawingPathTool
  constructor: (@element, @options)->
    @destroyed = false
    @_points = []
    @_up_listener = new UpListener(
      @element,
      up: (e)=>
        @up(e)
    )
    @_move_listener = new MoveListener(
      @element,
      move: (touches)=>
        @move(touches)
    )
    @path = document.createElementNS("http://www.w3.org/2000/svg", 'path')

    @size = DrawingUtils.size(@element) * 0.01
    switch @options.size
      when 'small' then @size /= 2
      when 'large' then @size *= 2

    @group = document.createElementNS("http://www.w3.org/2000/svg", 'g')
    DrawingUtils.style(@group, 'stroke', @options.color || '#ff0000')
    DrawingUtils.style(@group, 'strokeWidth', @size+'px')
    DrawingUtils.style(@path, 'strokeLinecap', 'round')
    DrawingUtils.style(@path, 'fill', 'none')
    @group.setAttribute('data-sharinpix-type', 'path')
    @group.appendChild(@path)
    @element.appendChild(@group)
  up: (e)->
    return if @destroyed
    e.preventDefault()
    e.stopPropagation()
    if @_points.length > 3
      @options.end(@group)
    else
      @options.cancel()
      @group.parentNode.removeChild(@group)
    @destroy()
  d: ->
    return '' if @_points.length < 1
    d = "M#{@_points[0][0]},#{@_points[0][1]}"
    d += "L#{@_points[0][0]},#{@_points[0][1]}"
    for point in @_points
      d += "L#{point[0]},#{point[1]}"
    d
  round: (value)->
    Math.round(value + @size/2)
  round_point: (point)->
    [@round(point[0]), @round(point[1])]
  move: (touches)->
    return if @destroyed
    return @destroy() if touches.length > 1
    new_point = @round_point(touches[0])
    if @_points.length > 0
      last_point = @_points[@_points.length-1]
      return if Geometry.distance(new_point, last_point) < 3
    @_points.push new_point
    @path.setAttribute('d', @d())
  destroy: ->
    return if @destroyed
    @destroyed = true
    @_up_listener.destroy()
    @_move_listener.destroy()

export { DrawingPathTool }
