import { Referentiel, MatrixUtils } from 'referentiel'
import { Drag } from './drag.js'
import { Handle } from './handle.js'
import { DrawingUtils as Utils } from './drawing_utils.js'
import { Geometry } from './geometry.js'

class DrawingTransform {
  constructor (element1, options) {
    this.element = element1
    this.options = options
    this.destroyed = false
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
    if (this.last_init) {
      time = Date.now() - this.last_init
      if (time < 500 && this.options.click) {
        this.options.click()
      }
    }
    this.last_init = Date.now()
    this.element.style.pointerEvents = 'all'
    this.referentiel = new Referentiel(this.element)
    this.containerReferentiel = new Referentiel(this.svg)
    this.size = Geometry.distance(this.containerReferentiel.globalToLocal([0, 0]), this.containerReferentiel.globalToLocal([20, 20]))
    this.padding = this.size / 2
    this.bbox = this.element.getBBox()
    if (this.drag != null) {
      this.drag.destroy()
    }
    this.initDrag()
    this.removeHandleExcept()
    this.initPositionHandle()
    this.initHandles()
  }

  initDrag () {
    this.drag = new Drag(this.element, {
      start: () => {
        this.removeHandleExcept()
      },
      cancel: () => {
        this.init()
        return this.options.cancel()
      },
      end: () => {
        this.options.end()
        return this.init()
      },
      container: this.svg
    })
  }

  removeHandleExcept (exceptHandle) {
    this.handles = this.handles.map((handle) => {
      if (handle !== exceptHandle) {
        handle.destroy()
        return null
      }
      return handle
    }).filter(function (i) { return i !== null })
    console.log('after remove', this.handles)
  }

  initPositionHandle () {
    var handle = Utils.create_element(this.svg, 'rect', {
      x: this.bbox.x - this.padding,
      y: this.bbox.y - this.padding,
      width: this.bbox.width + 2 * this.padding,
      height: this.bbox.height + 2 * this.padding,
      style: 'fill:#CCCCCC; opacity: 0.3;'
    })
    Utils.apply_matrix(handle, this.referentiel.matrixTransform())
    this.svg.insertBefore(handle, this.element)
    var positionHandle = new Handle(handle, {
      start: () => {
        this.removeHandleExcept(positionHandle)
      },
      move: () => {
        this.element.setAttribute('transform', positionHandle.element.getAttribute('transform'))
      },
      end: () => {
        this.init()
      }
    })
    this.handles.push(positionHandle)
  }

  initHandles () {
    if (this.rotateHandle != null) { this.rotateHandle.destroy() }

    var handlePosition = MatrixUtils.multVector(
      (new Referentiel(this.element)).matrixTransform(),
      [this.bbox.x + this.bbox.width + this.padding, this.bbox.y + this.bbox.height + this.padding, 1]
    )
    var handleCenter = MatrixUtils.multVector(
      (new Referentiel(this.element)).matrixTransform(),
      [this.bbox.x + this.bbox.width / 2, this.bbox.y + this.bbox.height / 2, 1]
    )

    var handle = Utils.create_element(this.svg, 'g', {})
    Utils.create_element(handle, 'circle', {
      r: this.size / 2,
      fill: 'white'
    })
    Utils.create_element(handle, 'circle', {
      r: this.size / 4,
      fill: '#0070d2'
    })
    Utils.apply_matrix(handle, [[1, 0, handlePosition[0]], [0, 1, handlePosition[1]], [0, 0, 1]])
    var rotateScaleHandle = new Handle(handle, {
      transformations: 'SR',
      pivot: handleCenter,
      start: () => {
        this.removeHandleExcept(rotateScaleHandle)
      },
      move: (matrix) => { Utils.apply_matrix(this.element, MatrixUtils.mult(matrix, new Referentiel(this.element).matrixTransform())) },
      end: () => { this.init() }
    })
    this.handles.push(rotateScaleHandle)

    handle = Utils.create_element(this.svg, 'g', {})
    Utils.create_element(handle, 'circle', {
      r: this.size / 2,
      fill: 'white'
    })
    Utils.create_element(handle, 'path', {
      r: this.size / 2,
      d: 'M370.72 133.28C339.458 104.008 298.888 87.962 255.848 88c-77.458.068-144.328 53.178-162.791 126.85-1.344 5.363-6.122 9.15-11.651 9.15H24.103c-7.498 0-13.194-6.807-11.807-14.176C33.933 94.924 134.813 8 256 8c66.448 0 126.791 26.136 171.315 68.685L463.03 40.97C478.149 25.851 504 36.559 504 57.941V192c0 13.255-10.745 24-24 24H345.941c-21.382 0-32.09-25.851-16.971-40.971l41.75-41.749zM32 296h134.059c21.382 0 32.09 25.851 16.971 40.971l-41.75 41.75c31.262 29.273 71.835 45.319 114.876 45.28 77.418-.07 144.315-53.144 162.787-126.849 1.344-5.363 6.122-9.15 11.651-9.15h57.304c7.498 0 13.194 6.807 11.807 14.176C478.067 417.076 377.187 504 256 504c-66.448 0-126.791-26.136-171.315-68.685L48.97 471.03C33.851 486.149 8 475.441 8 454.059V320c0-13.255 10.745-24 24-24z',
      fill: '#0070d2',
      transform: 'scale(' + this.size / 1024 + ') translate(' + -(this.size * 7) + ',' + -(this.size * 7) + ')'
    })
    handlePosition = MatrixUtils.multVector(
      (new Referentiel(this.element)).matrixTransform(),
      [this.bbox.x + this.bbox.width + this.padding, this.bbox.y - this.padding, 1]
    )
    Utils.apply_matrix(handle, [[1, 0, handlePosition[0]], [0, 1, handlePosition[1]], [0, 0, 1]])
    var rotateHandle = new Handle(handle, {
      transformations: 'R',
      pivot: handleCenter,
      start: () => {
        this.removeHandleExcept(rotateHandle)
      },
      move: (matrix) => { Utils.apply_matrix(this.element, MatrixUtils.mult(matrix, new Referentiel(this.element).matrixTransform())) },
      end: () => { this.init() }
    })
    this.handles.push(rotateHandle)

    handle = Utils.create_element(this.svg, 'g', {})
    Utils.create_element(handle, 'circle', {
      r: this.size / 2,
      fill: 'white'
    })
    Utils.create_element(handle, 'path', {
      r: this.size / 2,
      d: 'M212.686 315.314L120 408l32.922 31.029c15.12 15.12 4.412 40.971-16.97 40.971h-112C10.697 480 0 469.255 0 456V344c0-21.382 25.803-32.09 40.922-16.971L72 360l92.686-92.686c6.248-6.248 16.379-6.248 22.627 0l25.373 25.373c6.249 6.248 6.249 16.378 0 22.627zm22.628-118.628L328 104l-32.922-31.029C279.958 57.851 290.666 32 312.048 32h112C437.303 32 448 42.745 448 56v112c0 21.382-25.803 32.09-40.922 16.971L376 152l-92.686 92.686c-6.248 6.248-16.379 6.248-22.627 0l-25.373-25.373c-6.249-6.248-6.249-16.378 0-22.627z',
      fill: '#0070d2',
      transform: 'scale(' + this.size / 1024 + ') translate(' + -(this.size * 7) + ',' + -(this.size * 7) + ')'
    })
    handlePosition = MatrixUtils.multVector(
      (new Referentiel(this.element)).matrixTransform(),
      [this.bbox.x - this.padding, this.bbox.y + this.bbox.height + this.padding, 1]
    )
    Utils.apply_matrix(handle, [[1, 0, handlePosition[0]], [0, 1, handlePosition[1]], [0, 0, 1]])
    var scaleHandle = new Handle(handle, {
      transformations: 'S',
      pivot: handleCenter,
      start: () => {
        this.removeHandleExcept(scaleHandle)
      },
      move: (matrix) => { Utils.apply_matrix(this.element, MatrixUtils.mult(matrix, new Referentiel(this.element).matrixTransform())) },
      end: () => { this.init() }
    })
    this.handles.push(scaleHandle)
  }

  destroy () {
    if (this.destroyed) {
      return
    }
    this.destroyed = true
    this.removeHandleExcept()
    this.element.style.pointerEvents = ''
    return this.drag.destroy()
  }
}

export { DrawingTransform }