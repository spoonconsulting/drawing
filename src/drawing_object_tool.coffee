import { MoveListener, UpListener } from "./drawing_listener.coffee"
import { DrawingUtils } from "./drawing_utils.coffee"

class DrawingObjectTool
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
    @group = DrawingUtils.create_element(@element, 'g', {
      'data-sharinpix-type': @options.object_class.type
    })

    @size = DrawingUtils.size(@element) * 0.01
    ObjectClass = @options.object_class
    @object = new ObjectClass({
      parent: @group
      color: @options.color
      size: @size
      prompt_text: @options.prompt_text
    })

  up: (e)->
    return if @destroyed
    e.preventDefault()
    e.stopPropagation()
    if @object.big_enough()
      @object.end =>
        @options.end(@group)
    else
      @options.cancel()
      DrawingUtils.remove(@group)
    @destroy()
  round: (value)->
    Math.round(value)
  round_point: (point)->
    [@round(point[0]), @round(point[1])]
  move: (touches)->
    return if @destroyed
    return @destroy() if touches.length > 1
    @end = @round_point(touches[0])
    @start = @end unless @start
    @object.update(@start, @end)
  destroy: ->
    return if @destroyed
    @destroyed = true
    @_up_listener.destroy()
    @_move_listener.destroy()

export { DrawingObjectTool }
