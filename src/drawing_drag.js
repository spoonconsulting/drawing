import { Referentiel, MatrixUtils } from 'referentiel'
import { DrawingUtils as Utils } from './drawing_utils.js'
import Nudged from 'nudged'

class DrawingDrag {
  constructor (element, options = {}) {
    this.element = element
    this.options = options
    this.dragging = false
    this.container = options.container || element.parentNode
    this._downListener = Utils.addEventListener(this.element, 'touchstart mousedown', (e) => { this.down(e) })
    Utils.style(this.element, 'cursor', 'move')
  }

  down (e) {
    e.preventDefault()
    e.stopPropagation()
    if (this.dragging) { return }
    this.dragging = true
    this.start = null
    this.lastMoveEvent = null
    this.lastEstimate = null
    this.referentiel = new Referentiel(this.element)
    this.matrix = this.referentiel.matrixTransform()
    this._moveListener = Utils.addEventListener(this.container, 'touchmove mousemove', (e) => { this.move(e) })
    this._upListener = Utils.addEventListener(this.container, 'touchend touchcancel mouseout mouseup', (e) => { this.up(e) })
    this.bbox = this.element.getBoundingClientRect()
    this.center = [this.bbox.x + this.bbox.width / 2, this.bbox.y + this.bbox.height / 2]
    this.options.start()
    window.requestAnimationFrame(() => { this.tick() })
  }

  tick () {
    if (!this.dragging) { return }
    if (this.lastMoveEvent) {
      var touches = Utils.extractTouches(this.lastMoveEvent)
      if (this.start === null || this.start.length !== touches.length) {
        this.matrix = this.referentiel.matrixTransform()
        this.start = touches
      }
      var estimate = ''
      // if(this.lastMoveEvent.altKey) { estimate += 'T' } This is useless ?
      if (this.lastMoveEvent.shiftKey) { estimate += 'S' }
      if (this.lastMoveEvent.ctrlKey) { estimate += 'R' }
      if (estimate === '') { estimate = 'TSR' }

      this.lastEstimate = Nudged.estimate(estimate, this.start, touches, this.center)
      var m = this.lastEstimate.getMatrix()
      var transformationMatrix = [
        [m.a, m.c, m.e],
        [m.b, m.d, m.f],
        [0, 0, 1]
      ]
      Utils.apply_matrix(this.element, MatrixUtils.mult(transformationMatrix, this.matrix))
    }
    window.requestAnimationFrame(() => { this.tick() })
  }

  up (e) {
    e.preventDefault()
    e.stopPropagation()
    if (Utils.eventInScope(e, this.container)) { return }
    if (e.touches !== undefined && e.touches !== null && e.touches.length > 0) {
      this.matrix = this.referentiel.matrixTransform()
      this.start = Utils.extractTouches(e)
      this.lastMoveEvent = null
      return
    }
    this.dragging = false
    this._moveListener()
    this._upListener()
    if (this.lastEstimate != null) {
      this.options.end()
    } else {
      this.options.cancel()
    }
  }

  move (e) {
    e.preventDefault()
    e.stopPropagation()
    this.lastMoveEvent = e
  }

  destroy () {
    if (this._downListener) { this._downListener() }
    if (this._upListener) { this._upListener() }
    if (this._moveListener) { this._moveListener() }
    Utils.style(this.element, 'cursor', 'auto')
  }
};

export { DrawingDrag }
