import { Referentiel } from 'referentiel'
import { Geometry } from './geometry.js'
import { DrawingUtils } from './drawing_utils.js'

var DrawingSelect

DrawingSelect = class DrawingSelect {
  constructor (element, options) {
    this.element = element
    this.options = options
    this.destroyed = false
    this.svg = this.element.parentNode
    while (this.svg.localName !== 'svg') {
      this.svg = this.svg.parentNode
    }
    this.svg.appendChild(this.element)
    this.init()
  }

  init () {
    var bbox, padding, referentiel
    if (this.position_handle != null) {
      this.position_handle.destroy()
    }
    bbox = this.element.getBBox()
    this.referentiel = new Referentiel(this.element)
    referentiel = new Referentiel(this.svg)
    padding = Geometry.distance(referentiel.globalToLocal([window.innerWidth / 2, window.innerHeight / 2]), referentiel.globalToLocal([0, 0])) * 0.01
    this.background = DrawingUtils.create_element(this.svg, 'rect', {
      x: bbox.x - padding,
      y: bbox.y - padding,
      width: bbox.width + 2 * padding,
      height: bbox.height + 2 * padding,
      style: 'fill:red; opacity: 0.3;',
      transform: this.element.getAttribute('transform')
    })
    return this.svg.insertBefore(this.background, this.element)
  }

  destroy () {
    if (this.destroyed) {
      return
    }
    this.destroyed = true
    return DrawingUtils.remove(this.background)
  }
}

export {
  DrawingSelect
}
