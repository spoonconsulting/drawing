import { DrawingUtils } from './drawing_utils.js'
import { Geometry } from './geometry.js'

class DrawingArrow {
  constructor (options) {
    var base, s
    this.options = options
    this.path = DrawingUtils.create_element(this.options.parent, 'path')
    DrawingUtils.style(this.options.parent, 'stroke', this.options.color)
    DrawingUtils.style(this.options.parent, 'fill', this.options.color)
    DrawingUtils.style(this.options.parent, 'stroke-width', this.options.size + 'px')
    DrawingUtils.style(this.options.parent, 'strokeLinecap', 'round');
    (base = this.options).arrow_size || (base.arrow_size = this.options.size * 3)
    s = this.options.arrow_size
    this.arrow = DrawingUtils.create_element(this.options.parent, 'path', {
      d: `M0,0L${-s / 2},${-s}L${s / 2},${-s}L0,0`
    })
    DrawingUtils.style(this.arrow, 'stroke', 'none')
  }

  update (from, to) {
    var angle
    this.from = from
    this.to = to
    if (this.bigEnough()) {
      this.options.parent.setAttribute('opacity', 1)
      this.path.setAttribute('d', `M${this.from[0]},${this.from[1]} L${this.to[0]},${this.to[1]}`)
      angle = Geometry.angle(this.from, [this.from[0], this.from[0] + 1000], this.to)
      return DrawingUtils.apply_matrix(this.arrow, Geometry.multiply_matrix(Geometry.translation_matrix(this.to), Geometry.rotation_matrix(angle), Geometry.translation_matrix([0, this.options.arrow_size / 3])))
    } else {
      return this.options.parent.setAttribute('opacity', 0)
    }
  }

  angle () {
    return Geometry.angle(this.from, [this.from[0], this.from[0] + 100000], this.to)
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
    if (this.options.promptText != null) {
      this.options.promptText('', (input) => {
        var bbox, center, hyp, offsetX, offsetY, offsetAngle, padding
        if (input !== '') {
          this.text_group = DrawingUtils.create_element(this.options.parent, 'g')
          this.text = DrawingUtils.create_element(this.text_group, 'text', {
            'font-size': Math.round(DrawingUtils.size(this.options.parent) * 0.03),
            'font-family': 'sans-serif'
          })
          DrawingUtils.style(this.text, 'stroke-width', '0')
          DrawingUtils.edit_text(this.text, input)
          bbox = this.text.getBBox()
          padding = DrawingUtils.size(this.options.parent) * 0.01
          hyp = Math.sqrt(bbox.width * bbox.width + bbox.height * bbox.height) / 2
          offsetAngle = this.angle() + Math.PI / 2
          offsetX = (bbox.height / 2) / Math.tan(offsetAngle)
          offsetY = (bbox.height / 2) / Math.tan(offsetAngle)
          offsetX = hyp * Math.cos(offsetAngle)
          offsetY = hyp * Math.sin(offsetAngle)
          if (Math.abs(offsetX) > bbox.width / 2) {
            offsetX = Math.abs(offsetX) / offsetX * bbox.width / 2
            offsetX += Math.abs(offsetX) / offsetX * padding
          }
          if (Math.abs(offsetY) > bbox.height / 2) {
            offsetY = Math.abs(offsetY) / offsetY * bbox.height / 2
            offsetY += Math.abs(offsetY) / offsetY * padding
          }
          center = [this.from[0] - offsetX, this.from[1] - offsetY]
          return DrawingUtils.apply_matrix(this.text_group, Geometry.translation_matrix(center))
        }
      })
    }
    return callback()
  }

  bigEnough () {
    return this.size() > 15
  }
};

DrawingArrow.type = 'arrow'

export { DrawingArrow }
