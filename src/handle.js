import { Drag } from './drag.js'

class Handle {
  constructor (element, options = {}) {
    this.element = element
    this.options = options
    this.destroyed = false

    var start = options.start || function () {}
    options.start = () => {
      this.default_opacity = this.element.style.opacity
      this.element.style.opacity = 0
      start()
    }
    var end = options.end || function () {}
    options.end = () => {
      this.element.style.opacity = this.default_opacity
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
