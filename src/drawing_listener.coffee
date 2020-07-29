import { Referentiel } from "referentiel"

class MoveListener
  constructor: (@element, @options)->
    @destroyed = false
    @_referentiel = new Referentiel(@element)
    @_move = (e)=>
      return if @destroyed
      return if e.touches? and e.touches.length > 1
      e.preventDefault()
      e.stopPropagation()
      @_touches = []
      if e.touches?
        for i in [0...e.touches.length]
          touch = e.touches[i]
          @_touches.push([touch.pageX, touch.pageY])
      else
        @_touches.push([e.pageX, e.pageY])
    @element.addEventListener 'touchmove', @_move
    @element.addEventListener 'mousemove', @_move
    @loop_callback = =>
      @tick()
    requestAnimationFrame @loop_callback
  tick: ->
    return if @destroyed
    touches = []
    if @_touches?
      for touch in @_touches
        touches.push(@_referentiel.global_to_local(touch))
    @options.move(touches) if touches.length > 0
    requestAnimationFrame @loop_callback
  destroy: ->
    return if @destroyed
    @destroyed = true
    @element.removeEventListener 'touchmove', @_move
    @element.removeEventListener 'mousemove', @_move

class DownListener
  constructor: (@element, @options)->
    @_listener = (e)=> @down(e)
    @destroyed = false
    @element.addEventListener 'touchstart', @_listener
    @element.addEventListener 'mousedown', @_listener
  down: (e)->
    return if @destroyed
    return if e.touches? and e.touches.length > 1
    @options.down(e)
  destroy: ->
    return if @destroyed
    @destroyed = true
    @element.removeEventListener 'mousedown', @_listener
    @element.removeEventListener 'touchstart', @_listener

class UpListener
  constructor: (@element, @options)->
    @_listener = (e)=> @up(e)
    @destroyed = false
    @element.addEventListener 'touchend', @_listener
    @element.addEventListener 'touchcancel', @_listener
    @element.addEventListener 'mouseout', @_listener
    @element.addEventListener 'mouseup', @_listener
  up: (e)->
    return if @destroyed
    return if e.touches? and e.touches.length > 1
    @options.up(e) unless @event_in_scope(e)
  destroy: ->
    return if @destroyed
    @destroyed = true
    @element.removeEventListener 'touchend', @_listener
    @element.removeEventListener 'touchcancel', @_listener
    @element.removeEventListener 'mouseout', @_listener
    @element.removeEventListener 'mouseup', @_listener
  event_in_scope: (event)->
    e = event.relatedTarget
    return false if event.relatedTarget == null
    while e
      return true if e == @element
      e = e.parentNode
    false

export { MoveListener, DownListener, UpListener }
