import { Referentiel, MatrixUtils } from 'referentiel'
import { DrawingUtils as Utils } from './drawing_utils.js'
import { Geometry } from './geometry.js'

import { MoveListener, DownListener, UpListener } from './drawing_listener.js'

class DrawingDrag {
  constructor (element, options = {}) {
    this.element = element
    this.options = options
    this.dragging = false
    this.svg = this.element.parentNode
    while (this.svg.localName !== 'svg') {
      this.svg = this.svg.parentNode
    }
    console.log('Drawing drag', this.element)
    this._downListener = Utils.addEventListener(this.element, 'touchstart mousedown', (e)=>{ this.down(e) });
    Utils.style(this.element, 'cursor', 'move')
  }

  down (e) {
    e.preventDefault()
    e.stopPropagation()
    console.log('Down !')
    if(this.dragging) { return }
    this.dragging = true
    this.start = Utils.extractTouches(e)
    this.lastMoveEvent = null
    this.referentiel = new Referentiel(this.element)
    this.matrix = this.referentiel.matrixTransform()
    this._moveListener = Utils.addEventListener(this.svg, 'touchmove mousemove', (e) => { this.move(e) })
    this._upListener = Utils.addEventListener(this.svg, 'touchend touchcancel mouseout mouseup', (e)=> { this.up(e) })
    window.requestAnimationFrame(()=>{ this.tick() })
  }

  // matrixFromPoints2(a, b) {
  //   var center = [ a[0] + (b[0] - a[0])/2.0, a[1] + (b[1] - a[1])/2.0 ]
  //   return ([
  //     [center[0], a[0], b[0]],
  //     [center[1], a[1], b[1]],
  //     [0, 1, 0]
  //   ])
  // }

  matrixFromPoints(a, b) {
    return ([
      [0, a[0], b[0]],
      [0, a[1], b[1]],
      [1, 0, 0]
    ])
  }

  invMatrix(mat) {
    var a = mat[0][0];
    var b = mat[0][1];
    var c = mat[1][0];
    var d = mat[1][1];
    return [
      [d/(a*d-b*c), -c/(a*d-b*c)],
      [-b/(a*d-b*c), a/(a*d-b*c)]
    ]
  }

  tick (){
    if(!this.dragging) { console.log('We Stop now !'); return }
    if(this.lastMoveEvent) {
      var touches = Utils.extractTouches(this.lastMoveEvent)
      var transformationMatrix
      transformationMatrix = [
        [1, 0, touches[0][0] - this.start[0][0]],
        [0, 1, touches[0][1] - this.start[0][1]],
        [0, 0, 1]
      ]
      if(touches.length > 1) {
        if(this.start.length > 1) {
          console.log('We are multitouch !!', this.start, touches)
          var source = this.matrixFromPoints(this.start[0], this.start[1])
          var destination = this.matrixFromPoints(touches[0], touches[1])
          var inv = this.invMatrix([
            [this.start[0][0], this.start[1][0]],
            [this.start[0][1], this.start[1][1]]
          ])
          console.log('inv 2x2', inv)
          console.log('source', source)
          console.log('destination', destination)
          console.log('inverse', MatrixUtils.inv(source))
          console.log('transformationMatrix', transformationMatrix)
          transformationMatrix = MatrixUtils.mult(destination, [
            [inv[0][0], inv[1][0], 0],
            [inv[0][1], inv[1][1], 0],
            [0, 0, 1]
          ])
        } else {
          console.log('We register the second touch in start !')
          this.start.push(touches[1])
        }
      }
      console.log('Apply', transformationMatrix);
      Utils.apply_matrix(this.element, MatrixUtils.mult(transformationMatrix, this.matrix))
    }
    window.requestAnimationFrame(()=>{ this.tick() })
  }

  up (e) {
    e.preventDefault()
    e.stopPropagation()
    if (Utils.eventInScope(e, this.svg)) { return }
    console.log('STOP !!');
    this.dragging = false
    this._moveListener()
    this._upListener()
    // if ((this.last_move != null) && Geometry.distance(this.last_move) > 10) {
    //   return this.options.end(this.last_move)
    // } else {
    //   return this.options.cancel()
    // }
  }

  move (e) {
    e.preventDefault()
    e.stopPropagation()
    this.lastMoveEvent = e
    // console.log('MOVING !!', Utils.extractTouches(e))
    // var touch, translationMatrix
    // if (!this.first_touch) {
    //   this.first_touch = touches[0]
    // }
    // touch = touches[0]
    // this.last_move = [touch[0] - this.first_touch[0], touch[1] - this.first_touch[1]]
    // translationMatrix = [[1, 0, this.last_move[0]], [0, 1, this.last_move[1]], [0, 0, 1]]
    // DrawingUtils.apply_matrix(this.element, MatrixUtils.mult(translationMatrix, this.matrix))
    // if (this.options.move != null) {
    //   return this.options.move(this.last_move)
    // }
  }

  destroy () {
    if (this._downListener) { this._downListener() }
    if (this._upListener) { this._upListener() }
    if (this._moveListener) { this._moveListener() }
    Utils.style(this.element, 'cursor', 'auto')
  }
};

export { DrawingDrag }
