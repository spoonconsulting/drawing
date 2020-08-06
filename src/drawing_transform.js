import { Referentiel, MatrixUtils } from 'referentiel'
import { Drag } from './drag.js'
import { Handle } from './handle.js'
import { DrawingUtils as Utils } from './drawing_utils.js'
import { Geometry } from './geometry.js'

class DrawingTransform {
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
    if (this.last_init) {
      time = Date.now() - this.last_init
      if (time < 500 && this.options.click) {
        this.options.click()
        return
      }
    }
    this.last_init = Date.now()
    this.referentiel = new Referentiel(this.element)
    this.containerReferentiel = new Referentiel(this.svg)
    this.size = Geometry.distance(this.containerReferentiel.globalToLocal([0, 0]), this.containerReferentiel.globalToLocal([20, 20]))
    this.padding = this.size / 2
    this.bbox = this.element.getBBox()
    if (this.drag != null) {
      this.drag.destroy()
    }
    this.initDrag()
    this.initHandles()
  }

  initDrag () {
    this.drag = new Drag(this.element, {
      start: () => {
        if (this.options.start !== undefined && this.options.start !== null) { this.options.start() }
        this.removeHandleExcept()
      },
      end: () => {
        this.init()
        if (this.options.end !== undefined && this.options.end !== null) { this.options.end() }
      },
      container: this.svg
    })
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
        if (this.options.start !== undefined && this.options.start !== null) { this.options.start() }
        this.removeHandleExcept(positionHandle)
      },
      move: () => {
        this.element.setAttribute('transform', positionHandle.element.getAttribute('transform'))
      },
      end: () => {
        this.init()
        if (this.options.end !== undefined && this.options.end !== null) { this.options.end() }
      }
    })
    this.handles.push(positionHandle)

    if (this.options.handles === false) { return }

    var handlePosition = MatrixUtils.multVector(
      (new Referentiel(this.element)).matrixTransform(),
      [this.bbox.x + this.bbox.width + this.padding, this.bbox.y + this.bbox.height + this.padding, 1]
    )
    var handleCenter = MatrixUtils.multVector(
      (new Referentiel(this.element)).matrixTransform(),
      [this.bbox.x + this.bbox.width / 2, this.bbox.y + this.bbox.height / 2, 1]
    )

    handle = Utils.create_element(this.svg, 'g', {})
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
        if (this.options.start !== undefined && this.options.start !== null) { this.options.start() }
        this.removeHandleExcept(rotateScaleHandle)
      },
      move: (matrix) => { Utils.apply_matrix(this.element, MatrixUtils.mult(matrix, new Referentiel(this.element).matrixTransform())) },
      end: () => {
        this.init()
        if (this.options.end !== undefined && this.options.end !== null) { this.options.end() }
      }
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
      transform: 'scale(' + this.size / 1024 + ') translate(-256 -256)'
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
        if (this.options.start !== undefined && this.options.start !== null) { this.options.start() }
        this.removeHandleExcept(rotateHandle)
      },
      move: (matrix) => { Utils.apply_matrix(this.element, MatrixUtils.mult(matrix, new Referentiel(this.element).matrixTransform())) },
      cancel: () => { this.init() },
      end: () => {
        this.init()
        if (this.options.end !== undefined && this.options.end !== null) { this.options.end() }
      }
    })
    this.handles.push(rotateHandle)

    handle = Utils.create_element(this.svg, 'g', {})
    Utils.create_element(handle, 'circle', {
      r: this.size / 2,
      fill: 'white'
    })
    Utils.create_element(handle, 'path', {
      r: this.size / 2,
      d: 'M448.1 344v112c0 13.3-10.7 24-24 24h-112c-21.4 0-32.1-25.9-17-41l36.2-36.2L224 295.6 116.8 402.9 153 439c15.1 15.1 4.4 41-17 41H24c-13.3 0-24-10.7-24-24V344c0-21.4 25.9-32.1 41-17l36.2 36.2L184.5 256 77.2 148.7 41 185c-15.1 15.1-41 4.4-41-17V56c0-13.3 10.7-24 24-24h112c21.4 0 32.1 25.9 17 41l-36.2 36.2L224 216.4l107.3-107.3L295.1 73c-15.1-15.1-4.4-41 17-41h112c13.3 0 24 10.7 24 24v112c0 21.4-25.9 32.1-41 17l-36.2-36.2L263.6 256l107.3 107.3 36.2-36.2c15.1-15.2 41-4.5 41 16.9z',
      fill: '#0070d2',
      transform: 'scale(' + this.size / 1024 + ') translate(-225 -256)'
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
        if (this.options.start !== undefined && this.options.start !== null) { this.options.start() }
        this.removeHandleExcept(scaleHandle)
      },
      move: (matrix) => { Utils.apply_matrix(this.element, MatrixUtils.mult(matrix, new Referentiel(this.element).matrixTransform())) },
      end: () => {
        this.init()
        if (this.options.end !== undefined && this.options.end !== null) { this.options.end() }
      },
      cancel: () => { this.init() }
    })
    this.handles.push(scaleHandle)
  }

  destroy () {
    this.removeHandleExcept()
    this.drag.destroy()
  }
}

export { DrawingTransform }
