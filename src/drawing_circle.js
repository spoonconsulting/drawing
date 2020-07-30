import { DrawingUtils } from './drawing_utils.js'

import { Geometry } from './geometry.js'

var DrawingCircle

DrawingCircle = class DrawingCircle {
  constructor (options) {
    this.options = options
    this.rect = DrawingUtils.create_element(this.options.parent, 'circle')
    DrawingUtils.style(this.options.parent, 'stroke', this.options.color)
    DrawingUtils.style(this.options.parent, 'fill', this.options.color)
    DrawingUtils.style(this.rect, 'stroke-width', (this.options.size / 2) + 'px')
    DrawingUtils.style(this.rect, 'fill-opacity', 0.2)
    DrawingUtils.style(this.rect, 'strokeLinecap', 'round')
  }

  update (from, to) {
    this.from = from
    this.to = to
    if (this.bigEnough()) {
      this.rect.setAttribute('opacity', 1)
      this.rect.setAttribute('cx', this.from[0])
      this.rect.setAttribute('cy', this.from[1])
      return this.rect.setAttribute('r', Geometry.distance(this.from, this.to))
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

  end (callback) {
    return callback()
  }

  bigEnough () {
    return this.size() > 8
  }
}

DrawingCircle.type = 'circle'

export {
  DrawingCircle
}
