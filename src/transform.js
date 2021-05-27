import { Referentiel, MatrixUtils } from 'referentiel'
import { Handle } from './handle.js'
import { DrawingUtils as Utils } from './drawing_utils.js'
import { Geometry } from './geometry.js'

class Transform {
  constructor (element1, options) {
    this.element = element1
    this.options = options
    this.svg = this.element.parentNode
    while (this.svg.localName !== 'svg') {
      this.svg = this.svg.parentNode
    }
    this.svg.appendChild(this.element)
    this.handles = []
    this.init()
  }

  init () {
    var time
    if (this.lastInit) {
      time = Date.now() - this.lastInit
      if (time < 500 && this.options.click) {
        this.options.click()
        return
      }
    }
    this.lastInit = Date.now()
    this.referentiel = new Referentiel(this.element)
    this.containerReferentiel = new Referentiel(this.svg)
    this.size = Geometry.distance(this.containerReferentiel.globalToLocal([0, 0]), this.containerReferentiel.globalToLocal([20, 20]))
    this.padding = 5
    this.bbox = this.element.getBBox()
    this.initHandles()
  }

  start (e) {
    if (e.altKey) { this.copy = this.makeACopy() }
    if (this.options.start) { this.options.start(e) }
    if(this.background) { this.background.remove() }
  }

  cancel () {
    if (this.copy) {
      this.copy.remove()
      this.copy = null
    }
    this.init()
    if (this.options.end) { this.options.end() }
  }

  end () {
    this.init()
    if (this.copy) {
      if (this.options.new) { this.options.new(this.copy) }
      this.copy = null
    }
    if (this.options.end) { this.options.end() }
  }

  removeHandleExcept (exceptHandle) {
    this.handles = this.handles.map((handle) => {
      if (handle === exceptHandle) {
        return handle
      }
      handle.destroy()
      return null
    }).filter(function (i) { return i !== null })
  }

  initHandles () {
    this.removeHandleExcept()

    var matrix = this.referentiel.matrixTransform()
    var x1 = MatrixUtils.multVector(matrix, [this.bbox.x, this.bbox.y, 1])
    var x2 = MatrixUtils.multVector(matrix, [this.bbox.x, this.bbox.y + this.bbox.height, 1])
    var x3 = MatrixUtils.multVector(matrix, [this.bbox.x + this.bbox.width, this.bbox.y + this.bbox.height, 1])
    var x4 = MatrixUtils.multVector(matrix, [this.bbox.x + this.bbox.width, this.bbox.y, 1])

    if(this.background) { this.background.remove(); }
    this.background = Utils.create_element(this.svg, 'path', {
      d: `M${x1[0]},${x1[1]} L${x2[0]},${x2[1]} L${x3[0]},${x3[1]} L${x4[0]},${x4[1]} L${x1[0]},${x1[1]}`,
      style: `stroke: #CCCCCC; stroke-linecap: square; stroke-width: ${this.size};fill:#CCCCCC; opacity: 0.3;`
    })
    this.svg.insertBefore(this.background, this.element)

    var handle = Utils.create_element(this.svg, 'path', {
      d: `M${x1[0]},${x1[1]} L${x2[0]},${x2[1]} L${x3[0]},${x3[1]} L${x4[0]},${x4[1]} L${x1[0]},${x1[1]}`,
      style: `stroke-linecap: square; stroke-width: ${this.size};fill:#CCCCCC; opacity: 0;`
    })

    var positionHandle = new Handle(handle, {
      start: (e) => {
        this.start(e)
        this.removeHandleExcept(positionHandle)
      },
      move: (matrix) => {
        Utils.apply_matrix(this.element, MatrixUtils.mult(matrix, new Referentiel(this.element).matrixTransform()))
      },
      cancel: () => { this.cancel() },
      end: () => { this.end() }
    })
    this.handles.push(positionHandle)

    if (this.options.handles === false) { return }

    var handleCenter = Geometry.barycentre([x1, x2, x3, x4])

    handle = Utils.create_element(this.svg, 'g', {})
    Utils.create_element(handle, 'circle', {
      r: this.size / 2,
      fill: 'white'
    })
    Utils.create_element(handle, 'path', {
      r: this.size / 2,
      d: 'M370.72 133.28C339.458 104.008 298.888 87.962 255.848 88c-77.458.068-144.328 53.178-162.791 126.85-1.344 5.363-6.122 9.15-11.651 9.15H24.103c-7.498 0-13.194-6.807-11.807-14.176C33.933 94.924 134.813 8 256 8c66.448 0 126.791 26.136 171.315 68.685L463.03 40.97C478.149 25.851 504 36.559 504 57.941V192c0 13.255-10.745 24-24 24H345.941c-21.382 0-32.09-25.851-16.971-40.971l41.75-41.749zM32 296h134.059c21.382 0 32.09 25.851 16.971 40.971l-41.75 41.75c31.262 29.273 71.835 45.319 114.876 45.28 77.418-.07 144.315-53.144 162.787-126.849 1.344-5.363 6.122-9.15 11.651-9.15h57.304c7.498 0 13.194 6.807 11.807 14.176C478.067 417.076 377.187 504 256 504c-66.448 0-126.791-26.136-171.315-68.685L48.97 471.03C33.851 486.149 8 475.441 8 454.059V320c0-13.255 10.745-24 24-24z',
      fill: '#0070d2',
      transform: 'scale(' + this.size / 1024 + ') translate(-256 -256)'
    })
    Utils.apply_matrix(handle, [[1, 0, x4[0]], [0, 1, x4[1]], [0, 0, 1]])
    var rotateHandle = new Handle(handle, {
      transformations: 'R',
      pivot: handleCenter,
      start: (e) => {
        this.start(e)
        this.removeHandleExcept(rotateHandle)
      },
      move: (matrix) => { Utils.apply_matrix(this.element, MatrixUtils.mult(matrix, new Referentiel(this.element).matrixTransform())) },
      cancel: () => { this.cancel() },
      end: () => { this.end() }
    })
    this.handles.push(rotateHandle)

    handle = Utils.create_element(this.svg, 'g', {})
    Utils.create_element(handle, 'circle', {
      r: this.size / 2,
      fill: 'white'
    })
    Utils.create_element(handle, 'path', {
      r: this.size / 2,
      d: 'M377.941 169.941V216H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.568 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296h243.882v46.059c0 21.382 25.851 32.09 40.971 16.971l86.059-86.059c9.373-9.373 9.373-24.568 0-33.941l-86.059-86.059c-15.119-15.12-40.971-4.412-40.971 16.97z',
      fill: '#0070d2',
      transform: 'rotate(-45) scale(' + this.size / 1024 + ') translate(-225 -256)'
    })
    Utils.apply_matrix(handle, [[1, 0, x2[0]], [0, 1, x2[1]], [0, 0, 1]])
    var scaleHandle = new Handle(handle, {
      transformations: 'S',
      pivot: handleCenter,
      start: (e) => {
        this.start(e)
        this.removeHandleExcept(scaleHandle)
      },
      move: (matrix) => { Utils.apply_matrix(this.element, MatrixUtils.mult(matrix, new Referentiel(this.element).matrixTransform())) },
      end: () => { this.end() },
      cancel: () => { this.cancel() }
    })
    this.handles.push(scaleHandle)

    handle = Utils.create_element(this.svg, 'g', {})
    Utils.create_element(handle, 'circle', {
      r: this.size / 2,
      fill: 'white'
    })
    Utils.create_element(handle, 'circle', {
      r: this.size / 4,
      fill: '#0070d2'
    })
    Utils.apply_matrix(handle, [[1, 0, x3[0]], [0, 1, x3[1]], [0, 0, 1]])
    var rotateScaleHandle = new Handle(handle, {
      transformations: 'SR',
      pivot: handleCenter,
      start: (e) => {
        this.start(e)
        this.removeHandleExcept(rotateScaleHandle)
      },
      move: (matrix) => {
        Utils.apply_matrix(this.element, MatrixUtils.mult(matrix, new Referentiel(this.element).matrixTransform()))
      },
      end: () => { this.end() },
      cancel: () => { this.end() }
    })
    this.handles.push(rotateScaleHandle)
  }

  makeACopy () {
    var copy = this.element.cloneNode(true)
    this.svg.insertBefore(copy, this.element)
    return copy
  }

  destroy () {
    this.removeHandleExcept()
    if(this.background) { this.background.remove(); }
  }
}

export { Transform }
