import Nudged from 'nudged'
import { Utils } from './utils.js'
import { Referentiel, MatrixUtils } from 'referentiel'

class Zoomable {
  constructor (config) {
    this.config = config
    this.container = this.config.container
    this.element = this.config.element
    this._moveListener = Utils.addEventListener(this.container, 'touchmove mousemove', (e) => { this.move(e) })
    this._wheelListener = Utils.addEventListener(this.container, 'wheel', (e) => { this.wheel(e) })
    this.transformation = Nudged.Transform.IDENTITY
    this.start = null
    this.dragging = false
  }

  destroy () {
    if (this.destroyed) {
      return
    }
    this._moveListener()
    this._upListener()
    this.downListener()
    this.destroyed = true
    this.listener.destroy()
    return this.element.remove()
  }

  wheel (e) {
    e.preventDefault()
    e.stopPropagation()
    var touches = Utils.extractTouches(e)
    var zoom = 1.2
    if (e.deltaY < 0) {
      zoom = 0.8
    }
    var cursor = Referentiel.convertPointFromPageToNode(this.element, touches[0])
    var pivot = MatrixUtils.multVector(
      (new Referentiel(this.element)).matrixTransform(),
      [cursor[0], cursor[1], 1]
    ).slice(0, 2)
    this.transformation = Nudged.Transform.IDENTITY.scaleBy(zoom, pivot).multiplyBy(this.transformation)
    this.updatePosition()
  }

  tick () {
    if (this.zooming === false) { return }
    if (this.lastMoveEvent) {
      var touches = Utils.extractTouches(this.lastMoveEvent)
      if (this.start === null || this.start.length !== touches.length) {
        this.containerReferentiel = new Referentiel(this.container)
        // this.matrix = this.referentiel.matrixTransform()
        this.start = touches.map((touch) => {
          return this.containerReferentiel.globalToLocal(touch)
        })
      }
      touches = touches.map((touch) => {
        return this.containerReferentiel.globalToLocal(touch)
      })
      var transformation = Nudged.estimateTS(this.start, touches)
      var newTransformation = transformation.multiplyBy(this.transformation)
      // if(newTransformation.scale > 1) {
      this.transformation = newTransformation
      // }
      this.updatePosition()
      this.start = touches
    }
    window.requestAnimationFrame(() => { this.tick() })
  }

  updatePosition () {
    Utils.apply_matrix(this.element, Utils.nudgedMatrix(this.transformation.getMatrix()))
  }

  startZoom () {
    if (this.zooming) { return }
    this.zooming = true
    this.start = null
    this._upListener = Utils.addEventListener(this.container, 'touchend touchcancel mouseout mouseup', (e) => { this.up(e) }, true)
    window.requestAnimationFrame(() => { this.tick() })
  }

  up (e) {
    e.preventDefault()
    e.stopPropagation()
    if (Utils.eventInScope(e, this.container)) { return }
    if (e.touches !== undefined && e.touches !== null && e.touches.length > 0) {
      return
    }
    this.stopZoom()
  }

  stopZoom () {
    if (!this.zooming) { return }
    this.lastMoveEvent = null
    this.start = null
    this.zooming = false
    this._upListener()
  }

  move (e) {
    if (e.touches !== null && e.touches !== undefined && e.touches.length > 1) {
      e.preventDefault()
      e.stopPropagation()
      this.startZoom()
      this.lastMoveEvent = e
    } else {
      this.stopZoom()
    }
  }
};

export { Zoomable }
