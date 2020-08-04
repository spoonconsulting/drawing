
import {
  DrawingUtils
} from './drawing_utils.js'

import {
  Geometry
} from './geometry.js'

var DrawingLine

DrawingLine = class DrawingLine {
  constructor (options) {
    this.options = options
    this.path = DrawingUtils.create_element(this.options.parent, 'path')
    DrawingUtils.style(this.options.parent, 'stroke', this.options.color)
    DrawingUtils.style(this.options.parent, 'stroke-width', this.options.size + 'px')
    DrawingUtils.style(this.path, 'strokeLinecap', 'round')
  }

  update (from, to) {
    this.from = from
    this.to = to
    return this.path.setAttribute('d', `M${this.from[0]},${this.from[1]} L${this.to[0]},${this.to[1]}`)
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

DrawingLine.type = 'line'

export {
  DrawingLine
}
