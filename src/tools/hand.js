import { DrawingUtils as Utils } from '../drawing_utils.js'

class Hand {
  constructor (element, options) {
    this.element = element
    this.options = options
    this.destroyed = false
    this._upListener = Utils.addEventListener(this.element, 'touchend touchcancel mouseout mouseup', (e) => { this.up(e) })
  }

  up (e) {
    this.options.end()
    return this.destroy()
  }

  destroy () {
    if (this.destroyed) { return }
    this._upListener()
    this.destroyed = true
  }
}

export { Hand }
