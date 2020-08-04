import { DrawingUtils } from './drawing_utils.js'
import { Drag } from './drag.js'

class Handle {
  constructor (element, options = {}) {
    this.element = element
    this.options = options
    this.destroyed = false

    var start = options.start || function () {}
    options.start = () => {
      DrawingUtils.style(this.element, 'opacity', 0)
      start()
    }
    var end = options.end || function () {}
    options.end = () => {
      DrawingUtils.style(this.element, 'opacity', 1)
      end()
    }
    this.drag = new Drag(this.element, options)
  }

  destroy () {
    if (this.destroyed) {
      return
    }
    this.destroyed = true
    this.drag.destroy()
    this.element.parentNode.removeChild(this.element)
  }
}

export { Handle }
