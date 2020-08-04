import { DrawingUtils } from './drawing_utils.js'
import { Geometry } from './geometry.js'

class DrawingRect {
  constructor (options) {
    this.options = options
    this.rect = DrawingUtils.create_element(this.options.parent, 'rect')
    DrawingUtils.style(this.options.parent, 'stroke', this.options.color)
    DrawingUtils.style(this.options.parent, 'fill', this.options.color)
    DrawingUtils.style(this.options.parent, 'stroke-width', (this.options.size / 2) + 'px')
    DrawingUtils.style(this.options.parent, 'strokeLinecap', 'round') // stroke-linecap ?
    DrawingUtils.style(this.rect, 'fill-opacity', 0.2)
  }

  update (from, to) {
    this.from = from
    this.to = to
    if (this.bigEnough()) {
      this.rect.setAttribute('opacity', 1)
      this.rect.setAttribute('x', Math.min(this.from[0], this.to[0]))
      this.rect.setAttribute('y', Math.min(this.from[1], this.to[1]))
      this.rect.setAttribute('width', Math.abs(this.from[0] - this.to[0]))
      return this.rect.setAttribute('height', Math.abs(this.from[1] - this.to[1]))
    } else {
      return this.rect.setAttribute('opacity', 0)
    }
  }

  size () {
    if (this.from == null) {
      return 0
    }
    if (this.to == null) {
      return 0
    }
    return Geometry.distance(this.from, this.to)
  }

  bigEnough () {
    return this.size() > 8
  }

  end (callback) {
    return callback()
  }
}

DrawingRect.type = 'rect'

export { DrawingRect }
