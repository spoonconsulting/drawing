import { DrawingUtils } from './drawing_utils.js'
import { Referentiel, MatrixUtils } from 'referentiel'
import { Geometry } from './geometry.js'

class Arrow {
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
    this.from = from
    this.to = to
    if (this.bigEnough()) {
      this.options.parent.setAttribute('opacity', 1)
      this.path.setAttribute('d', `M${this.from[0]},${this.from[1]} L${this.to[0]},${this.to[1]}`)
      DrawingUtils.apply_matrix(this.arrow, Geometry.multiply_matrix(Geometry.translation_matrix(this.to), Geometry.rotation_matrix(this.angle()), Geometry.translation_matrix([0, this.options.arrow_size / 3])))
    } else {
      this.options.parent.setAttribute('opacity', 0)
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
        if (input !== '') {
          this.text_group = DrawingUtils.create_element(this.options.parent, 'g')
          this.text = DrawingUtils.create_element(this.text_group, 'text', {
            'font-size': 20,
            'font-family': 'sans-serif'
          })
          DrawingUtils.style(this.text, 'stroke-width', '0')
          DrawingUtils.edit_text(this.text, input)
          var referentiel = new Referentiel(this.options.parent.parentElement)
          var bbox = this.text.getBBox()
          var padding = 20
          var gfrom = referentiel.localToGlobal(this.from)
          var offsetAngle = Geometry.angle(gfrom, [gfrom[0], gfrom[0] + 100000], referentiel.localToGlobal(this.to))
          var offset = [
            -(padding + bbox.width / 2) * Math.sin(offsetAngle),
            (padding + bbox.height / 2) * Math.cos(offsetAngle)
          ]

          return DrawingUtils.apply_matrix(
            this.text_group,
            MatrixUtils.mult(
              referentiel.matrixInv(),
              Geometry.translation_matrix([-offset[0], -offset[1]]),
              Geometry.translation_matrix(referentiel.localToGlobal(this.from))
            )
          )
        }
      })
    }
    return callback()
  }

  bigEnough () {
    return this.size() > 15
  }
};

Arrow.type = 'arrow'

export { Arrow }
