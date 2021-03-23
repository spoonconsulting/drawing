import { DrawingUtils } from './drawing_utils.js'
import { Geometry } from './geometry.js'
import { Referentiel, MatrixUtils } from 'referentiel'

class DoubleArrow {
  constructor (options) {
    var base
    this.options = options
    this.path = DrawingUtils.create_element(this.options.parent, 'path')
    DrawingUtils.style(this.options.parent, 'stroke', this.options.color)
    DrawingUtils.style(this.options.parent, 'fill', this.options.color)
    DrawingUtils.style(this.options.parent, 'stroke-width', this.options.size + 'px')
    DrawingUtils.style(this.options.parent, 'strokeLinecap', 'round');
    (base = this.options).arrow_size || (base.arrow_size = this.options.size * 3)
    this.arrows = [this.arrow(), this.arrow()]
  }

  arrow () {
    var arrow, s
    s = this.options.arrow_size
    arrow = DrawingUtils.create_element(this.options.parent, 'path', {
      d: `M0,0L${-s / 2},${-s}L${s / 2},${-s}L0,0`
    })
    DrawingUtils.style(arrow, 'stroke', 'none')
    return arrow
  }

  update (from, to) {
    var angle
    this.from = from
    this.to = to
    if (this.bigEnough()) {
      this.options.parent.setAttribute('opacity', 1)
      this.path.setAttribute('d', `M${this.from[0]},${this.from[1]} L${this.to[0]},${this.to[1]}`)
      angle = this.angle()
      DrawingUtils.apply_matrix(this.arrows[0], Geometry.multiply_matrix(Geometry.translation_matrix(this.to), Geometry.rotation_matrix(angle), Geometry.translation_matrix([0, this.options.arrow_size / 3])))
      return DrawingUtils.apply_matrix(this.arrows[1], Geometry.multiply_matrix(Geometry.translation_matrix(this.from), Geometry.rotation_matrix(angle + Math.PI), Geometry.translation_matrix([0, this.options.arrow_size / 3])))
    } else {
      return this.options.parent.setAttribute('opacity', 0)
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

  angle () {
    return Geometry.angle(this.from, [this.from[0], this.from[0] + 100000], this.to)
  }

  end (callback) {
    if (this.options.promptText != null) {
      this.options.promptText('', (input) => {
        if (input !== '') {
          var textGroup = DrawingUtils.create_element(this.options.parent, 'g')
          var text = DrawingUtils.create_element(textGroup, 'text', {
            'font-size': Math.round(DrawingUtils.size(this.options.parent) * 0.03),
            'font-family': 'sans-serif'
          })
          DrawingUtils.style(text, 'stroke-width', '0')
          DrawingUtils.edit_text(text, input)

          var referentiel = new Referentiel(this.options.parent.parentElement)
          var gfrom = referentiel.localToGlobal(this.from)
          var gto = referentiel.localToGlobal(this.to)
          var angle = Geometry.angle(gfrom, [gfrom[0], gfrom[0] + 100000], gto)
          angle = (angle % Math.PI) - Math.PI / 2


          return DrawingUtils.apply_matrix(
            textGroup,
            Geometry.multiply_matrix(
              referentiel.matrixInv(),
              Geometry.translation_matrix(
                referentiel.localToGlobal(Geometry.barycentre([this.from, this.to]))
              ),
              Geometry.rotation_matrix(angle),
              Geometry.translation_matrix([0, -text.getBBox().height])
            )
          )
        }
      })
      return callback()
    } else {
      return callback()
    }
  }

  bigEnough () {
    return this.size() > 15
  }
}

DoubleArrow.type = 'double-arrow'

export { DoubleArrow }
