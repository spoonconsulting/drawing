import { Referentiel, MatrixUtils } from "referentiel"
import { DrawingUtils } from "./drawing_utils.coffee"
import { Geometry } from "./geometry.coffee"
import { MoveListener, DownListener, UpListener } from "./drawing_listener.coffee"

class DrawingDrag
  constructor: (@element, @options = {})->
    @svg = @element.parentNode
    @svg = @svg.parentNode while @svg.localName != 'svg'
    @_down = new DownListener(@element, down: (e)=> @down(e))
    DrawingUtils.style(@element, 'cursor', 'move')
  down: (e)->
    e.preventDefault()
    e.stopPropagation()
    @referentiel = new Referentiel(@element)
    @matrix = @referentiel.matrixTransform()
    @_move = new MoveListener(@svg, move: (touches)=> @move(touches))
    @_up = new UpListener(@svg, up: (e)=> @up(e))
  up: (e)->
    e.preventDefault()
    e.stopPropagation()
    @_move.destroy()
    @_up.destroy()
    if @last_move? and Geometry.distance(@last_move) > 10
      @options.end(@last_move)
    else
      @options.cancel()
  move: (touches)->
    @first_touch = touches[0] unless @first_touch
    touch = touches[0]
    @last_move = [
      touch[0] - @first_touch[0],
      touch[1] - @first_touch[1]
    ]
    translation_matrix = [
      [1, 0, @last_move[0]]
      [0, 1, @last_move[1]]
      [0, 0, 1]
    ]
    DrawingUtils.apply_matrix(
      @element,
      MatrixUtils.mult(translation_matrix, @matrix)
    )
    @options.move(@last_move) if @options.move?
  destroy: ->
    DrawingUtils.style(@element, 'cursor', 'auto')
    @_move.destroy() if @_move?
    @_up.destroy() if @_up?
    @_down.destroy()

export { DrawingDrag }
