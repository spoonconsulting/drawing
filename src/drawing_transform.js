
import {
  Referentiel,
  MatrixUtils
} from 'referentiel'

import {
  DrawingUtils
} from './drawing_utils.js'

import {
  DrawingDrag
} from './drawing_drag.js'

import {
  DrawingHandle
} from './drawing_handle.js'

import {
  Geometry
} from './geometry.js'

var DrawingTransform

DrawingTransform = class DrawingTransform {
  constructor (element1, options) {
    this.element = element1
    this.options = options
    this.destroyed = false
    this.svg = this.element.parentNode
    while (this.svg.localName !== 'svg') {
      this.svg = this.svg.parentNode
    }
    this.svg.appendChild(this.element)
    this.init()
  }

  init () {
    var bbox, center, matrix, padding, referentiel, time, transformHandleCenter, transformHandleCenterDistance
    if (this.last_init) {
      time = Date.now() - this.last_init
      if (time < 500 && this.options.click) {
        this.options.click()
      }
    }
    this.last_init = Date.now()
    if (this.position_handle != null) {
      this.position_handle.destroy()
    }
    bbox = this.element.getBBox()
    this.referentiel = new Referentiel(this.element)
    matrix = this.referentiel.matrixTransform()
    center = MatrixUtils.multVector(matrix, [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2, 1])
    center = [center[0], center[1]]
    if (this.drag != null) {
      this.drag.destroy()
    }
    this.drag = new DrawingDrag(this.element, {
      move: () => {
        this.transform_handle.destroy()
        return this.position_handle.destroy()
      },
      cancel: () => {
        this.init()
        return this.options.cancel()
      },
      end: () => {
        this.options.end()
        return this.init()
      }
    })
    referentiel = new Referentiel(this.svg)
    padding = Geometry.distance(referentiel.globalToLocal([window.innerWidth / 2, window.innerHeight / 2]), referentiel.globalToLocal([0, 0])) * 0.01
    this.position_handle = new DrawingHandle(this.svg, center, {
      color: '#04844b',
      move: (position) => {
        var translationMatrix
        this.transform_handle.destroy()
        translationMatrix = [[1, 0, position[0]], [0, 1, position[1]], [0, 0, 1]]
        return DrawingUtils.apply_matrix(this.element, MatrixUtils.mult(translationMatrix, matrix))
      },
      end: (position) => {
        this.options.end()
        return this.init()
      },
      cancel: (position) => {
        this.options.cancel()
        return this.init()
      },
      element: () => {
        var element
        element = DrawingUtils.create_element(this.svg, 'rect', {
          x: bbox.x - padding,
          y: bbox.y - padding,
          width: bbox.width + 2 * padding,
          height: bbox.height + 2 * padding,
          style: 'fill:#CCCCCC; opacity: 0.3;'
        })
        DrawingUtils.apply_matrix(element, matrix)
        this.svg.insertBefore(element, this.element)
        return element
      }
    })
    if (this.transform_handle != null) {
      this.transform_handle.destroy()
    }
    transformHandleCenter = MatrixUtils.multVector(matrix, [bbox.x + bbox.width + padding, bbox.y + bbox.height + padding, 1])
    transformHandleCenterDistance = Geometry.distance(center, [transformHandleCenter[0], transformHandleCenter[1]])
    this.transform_handle = new DrawingHandle(this.svg, transformHandleCenter, {
      color: '#0070d2',
      element: () => {
        var group, icon, scale, size, translate
        group = DrawingUtils.create_element(this.svg, 'g')
        size = Geometry.distance(referentiel.globalToLocal([0, 0]), referentiel.globalToLocal([20, 20]))
        DrawingUtils.create_element(group, 'circle', {
          r: size / 2,
          fill: 'white',
          style: 'opacity: 1'
        })
        icon = DrawingUtils.create_element(group, 'path', {
          d: 'M448.1 344v112c0 13.3-10.7 24-24 24h-112c-21.4 0-32.1-25.9-17-41l36.2-36.2L224 295.6 116.8 402.9 153 439c15.1 15.1 4.4 41-17 41H24c-13.3 0-24-10.7-24-24V344c0-21.4 25.9-32.1 41-17l36.2 36.2L184.5 256 77.2 148.7 41 185c-15.1 15.1-41 4.4-41-17V56c0-13.3 10.7-24 24-24h112c21.4 0 32.1 25.9 17 41l-36.2 36.2L224 216.4l107.3-107.3L295.1 73c-15.1-15.1-4.4-41 17-41h112c13.3 0 24 10.7 24 24v112c0 21.4-25.9 32.1-41 17l-36.2-36.2L263.6 256l107.3 107.3 36.2-36.2c15.1-15.2 41-4.5 41 16.9z',
          style: `fill: ${this.options.color || '#0070d2'};`
        })
        scale = size / 1024
        translate = size / 4.5
        DrawingUtils.apply_matrix(icon, [[scale, 0, -translate], [0, scale, -translate], [0, 0, 1]])
        DrawingUtils.apply_matrix(group, [[1, 0, transformHandleCenter[0]], [0, 1, transformHandleCenter[1]], [0, 0, 1]])
        return group
      },
      move: (move) => {
        var angle, position, scale, transformationMatrix
        this.position_handle.destroy()
        position = [transformHandleCenter[0] + move[0], transformHandleCenter[1] + move[1]]
        angle = Geometry.angle(center, transformHandleCenter, position)
        scale = 1 + (Geometry.distance(center, position) - transformHandleCenterDistance) / transformHandleCenterDistance
        transformationMatrix = Geometry.multiply_matrix([[1, 0, center[0]], [0, 1, center[1]], [0, 0, 1]], [[scale, 0, 0], [0, scale, 0], [0, 0, 1]], Geometry.rotation_matrix(angle), [[1, 0, -center[0]], [0, 1, -center[1]], [0, 0, 1]])
        return DrawingUtils.apply_matrix(this.element, Geometry.multiply_matrix(transformationMatrix, matrix))
      },
      cancel: (position) => {
        return this.init()
      },
      end: (position) => {
        return this.init()
      }
    })
  }

  destroy () {
    if (this.destroyed) {
      return
    }
    this.destroyed = true
    this.position_handle.destroy()
    this.transform_handle.destroy()
    return this.drag.destroy()
  }
}

export {
  DrawingTransform
}
