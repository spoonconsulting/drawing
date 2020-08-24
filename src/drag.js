import { Referentiel, MatrixUtils } from 'referentiel'
import { DrawingUtils as Utils } from './drawing_utils.js'
import Nudged from 'nudged'

class Drag {
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
    this.startDrag = Date.now()
    this.dragging = true
    this.start = null
    this.lastMoveEvent = null
    this.lastEstimate = null
    this.referentiel = new Referentiel(this.element)
    this._moveListener = Utils.addEventListener(this.container, 'touchmove mousemove', (e) => { this.move(e) })
    this._upListener = Utils.addEventListener(this.container, 'touchend touchcancel mouseout mouseup', (e) => { this.up(e) })
    if (this.options.start !== undefined && this.options.start !== null) { this.options.start(e) }
    window.requestAnimationFrame(() => { this.tick() })
  }

  tick () {
    if (!this.dragging) { return }
    if (this.lastMoveEvent) {
      var touches = Utils.extractTouches(this.lastMoveEvent)
      if (this.start === null || this.start.length !== touches.length) {
        this.containerReferentiel = new Referentiel(this.container)
        this.matrix = this.referentiel.matrixTransform()
        this.start = touches.map((touch) => {
          return this.containerReferentiel.globalToLocal(touch)
        })
      }
      touches = touches.map((touch) => {
        return this.containerReferentiel.globalToLocal(touch)
      })
      var estimate = ''
      if (this.lastMoveEvent.shiftKey) { estimate += 'S' }
      if (this.lastMoveEvent.ctrlKey) { estimate += 'R' }
      if (estimate === '' || this.options.transformations !== undefined) {
        estimate = this.options.transformations || 'TSR'
        this.pivot = this.options.pivot
      } else {
        if (this.pivot === undefined || this.pivot === null) {
          var bbox = this.element.getBBox()
          this.pivot = MatrixUtils.multVector(
            (new Referentiel(this.element)).matrixTransform(),
            [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2, 1]
          ).slice(0, 2)
        }
      }
      this.lastEstimate = Nudged.estimate(estimate, this.start, touches, this.pivot)
      var transformationMatrix = Utils.nudgedMatrix(this.lastEstimate.getMatrix())
      var newMatrix = MatrixUtils.mult(transformationMatrix, this.matrix)
      var s = Math.sqrt(newMatrix[0][0] * newMatrix[0][0] + newMatrix[0][1] * newMatrix[0][1])
      if (s > 0.1) {
        this.matrix = newMatrix
        Utils.apply_matrix(this.element, this.matrix)
        if (this.options.move !== undefined && this.options.move !== null) { this.options.move(transformationMatrix) }
      }
      this.start = touches
    }
    window.requestAnimationFrame(() => { this.tick() })
  }

  up (e) {
    e.preventDefault()
    e.stopPropagation()
    if (Utils.eventInScope(e, this.container)) { return }
    if (e.touches !== undefined && e.touches !== null && e.touches.length > 0) {
      return
    }
    this.dragging = false
    this._moveListener()
    this._upListener()
    if (Date.now() - this.startDrag > 300) {
      if (this.options.end !== undefined && this.options.end !== null) { this.options.end() }
    } else {
      if (this.options.cancel !== undefined && this.options.cancel !== null) { this.options.cancel() }
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

export { Drag }
