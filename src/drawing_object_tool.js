import { MoveListener, UpListener } from './drawing_listener.js'
import { DrawingUtils as Utils } from './drawing_utils.js'

class DrawingObjectTool {
  constructor (element, options) {
    var ObjectClass
    this.element = element
    this.options = options
    this.destroyed = false
    this._points = []
    this._up_listener = new UpListener(this.element, {
      up: (e) => {
        return this.up(e)
      }
    })
    this._move_listener = new MoveListener(this.element, {
      move: (touches) => {
        return this.move(touches)
      }
    })

    var pointers = {}
    this._pointerUpListener = Utils.addEventListener(this.element, 'pointerup', (e) => {
      delete pointers[e.pointerId]
    })
    this._pointerMoveListener = Utils.addEventListener(this.element, 'pointermove', (e) => {
      pointers[e.pointerId] = e
      if (Object.keys(pointers).length === 1) {
        e.stopPropagation()
        e.preventDefault()
      }
    })

    this.group = Utils.create_element(this.element, 'g', {
      'data-sharinpix-type': this.options.objectClass.type
    })
    this.size = Utils.size(this.element) * 0.01
    ObjectClass = this.options.objectClass
    this.object = new ObjectClass({
      parent: this.group,
      color: this.options.color,
      size: this.size,
      promptText: this.options.promptText
    })
  }

  up (e) {
    if (this.destroyed) {
      return
    }
    e.preventDefault()
    e.stopPropagation()
    if (this.object.bigEnough()) {
      this.object.end(() => {
        return this.options.end(this.group)
      })
    } else {
      this.options.cancel()
      Utils.remove(this.group)
    }
    return this.destroy()
  }

  round (value) {
    return Math.round(value)
  }

  roundPoint (point) {
    return [this.round(point[0]), this.round(point[1])]
  }

  move (touches) {
    if (this.destroyed) {
      return
    }
    if (touches.length > 1) {
      return this.destroy()
    }
    this.end = this.roundPoint(touches[0])
    if (!this.start) {
      this.start = this.end
    }
    return this.object.update(this.start, this.end)
  }

  destroy () {
    if (this.destroyed) {
      return
    }
    this.destroyed = true
    this._up_listener.destroy()
    this._pointerMoveListener()
    this._pointerUpListener()
    return this._move_listener.destroy()
  }
}

export { DrawingObjectTool }
