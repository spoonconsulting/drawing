import { DrawingUtils as Utils } from './drawing_utils.js'
import { Geometry } from './geometry.js'
import { Referentiel } from 'referentiel'

class DrawingPathTool {
  constructor (element, options) {
    this.element = element
    this.options = options
    this.destroyed = false
    this._moveListener = Utils.addEventListener(this.element, 'touchmove mousemove', (e) => { this.move(e) })
    this._upListener = Utils.addEventListener(this.element, 'touchend touchcancel mouseout mouseup', (e) => { this.up(e) })

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
    this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    this.group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    this.group.setAttribute('data-sharinpix-type', 'path')
    this.group.appendChild(this.path)
    Utils.style(this.group, 'stroke', this.options.color || '#ff0000')
    Utils.style(this.path, 'strokeLinecap', 'round')
    Utils.style(this.path, 'fill', 'none')
    this.element.appendChild(this.group)
    this.reset()
    window.requestAnimationFrame(() => { this.tick() })
  }

  reset () {
    this.path.setAttribute('d', '')
    this._points = []
    this.lastEvent = null
  }

  up (e) {
    if (Utils.eventInScope(e, this.element)) { return }
    if (this.destroyed) { return }
    e.preventDefault()
    e.stopPropagation()
    if (this._points.length > 3) {
      this.options.end(this.group)
    } else {
      this.options.cancel()
      this.group.parentNode.removeChild(this.group)
    }
    return this.destroy()
  }

  d () {
    var d, i, len, point, ref
    if (this._points.length < 1) {
      return ''
    }
    d = `M${this._points[0][0]},${this._points[0][1]}`
    d += `L${this._points[0][0]},${this._points[0][1]}`
    ref = this._points
    for (i = 0, len = ref.length; i < len; i++) {
      point = ref[i]
      d += `L${point[0]},${point[1]}`
    }
    return d
  }

  round (value) {
    return Math.round((value) * 1000) / 1000.0
  }

  roundPoint (point) {
    return [this.round(point[0]), this.round(point[1])]
  }

  move (e) {
    if (e.ctrlKey || e.shiftKey || (e.touches != null && e.touches.length > 1)) {
      return this.reset()
    }
    e.preventDefault()
    e.stopPropagation()
    this.lastEvent = e
  }

  tick () {
    if (this.destroyed) { return }
    if (this.lastEvent !== null) {
      if (this._points.length === 0) {
        this.referentiel = new Referentiel(this.element)
        console.log('REFERENTIEL', this.referentiel)
        this.size = Utils.size(this.element) * 0.01
        switch (this.options.size) {
          case 'small':
            this.size /= 2
            break
          case 'large':
            this.size *= 2
        }
        Utils.style(this.group, 'strokeWidth', this.size + 'px')
      }
      var touches = Utils.extractTouches(this.lastEvent)

      var newPoint = this.roundPoint(this.referentiel.globalToLocal(touches[0]))
      if (this._points.length > 0) {
        var lastPoint = this._points[this._points.length - 1]
        if (Geometry.distance(newPoint, lastPoint) <= 3) {
          newPoint = null
        }
      }
      if (newPoint != null) {
        this._points.push(newPoint)
        this.path.setAttribute('d', this.d())
      }
    }
    window.requestAnimationFrame(() => { this.tick() })
  }

  destroy () {
    if (this.destroyed) { return }
    this._upListener()
    this._moveListener()
    this._pointerMoveListener()
    this._pointerUpListener()
    this.destroyed = true
  }
}

export { DrawingPathTool }
