import { Referentiel } from 'referentiel'
import { Geometry } from './geometry.js'

var DrawingUtils = {
  apply_matrix: function (element, m) {
    var scale = Math.sqrt(m[0][0] * m[0][0] + m[1][1] * m[1][1]) + Math.sqrt(m[0][1] * m[0][1] + m[1][0] * m[1][0])
    if(scale > 0.000001) {
      element.style.transform = `matrix(${[m[0][0], m[1][0], m[0][1], m[1][1], m[0][2], m[1][2]].join(', ')})`
    }
  },
  nudgedMatrix: function (m) {
    return [
      [m.a, m.c, m.e],
      [m.b, m.d, m.f],
      [0, 0, 1]
    ]
  },
  style: function (element, key, value) {
    if (['height', 'width', 'x', 'y', 'transform'].indexOf(key) > -1) {
      element.setAttribute(key, value)
      // element.style[key] = value
    } else {
      element.style[key] = value
    }
    return true
  },
  remove: function (element) {
    return element.parentNode.removeChild(element)
  },
  size: function (element) {
    var center, referentiel, top
    referentiel = new Referentiel(element)
    center = referentiel.globalToLocal([window.innerWidth / 2, window.innerHeight / 2])
    top = referentiel.globalToLocal([0, 0])
    return Geometry.distance(center, top)
  },
  create_element: function (parent, name, attributes = {}) {
    var element, key, value
    element = document.createElementNS('http://www.w3.org/2000/svg', name)
    for (key in attributes) {
      value = attributes[key]
      element.setAttribute(key, value)
    }
    parent.appendChild(element)
    return element
  },
  edit_text: function (element, input) {
    if (input === undefined || input === null || input === '') { return }
    var bbox, child, i, j, len, len1, line, ref, ref1, results
    element.innerHTML = ''
    ref = input.split('\n')
    for (i = 0, len = ref.length; i < len; i++) {
      line = ref[i]
      if (line === '') {
        line = ' '
      }
      DrawingUtils.create_element(element, 'tspan', {
        dy: '1.2em',
        x: '0'
      }).textContent = line
    }
    bbox = element.getBBox()
    element.childNodes[0].setAttribute('y', -bbox.height / 2)
    ref1 = element.childNodes
    results = []
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      child = ref1[j]
      results.push(child.setAttribute('x', -bbox.width / 2))
    }
    return results
  },
  addEventListener: function (element, events, func, useCapture) {
    var destroyed = false
    events.split(' ').map(function (ev) {
      element.addEventListener(ev, func, useCapture)
    })
    return function () {
      if (destroyed) { return }
      destroyed = true
      events.split(' ').map(function (ev) {
        element.removeEventListener(ev, func, useCapture)
      })
    }
  },
  eventInScope (event, element) {
    var e = event.relatedTarget
    if (event.relatedTarget === null) {
      return false
    }
    while (e) {
      if (e === element) {
        return true
      }
      e = e.parentNode
    }
    return false
  },
  extractTouches (e) {
    if (e.touches != null) {
      var touches = []
      var i, j, ref
      for (i = j = 0, ref = e.touches.length; (ref >= 0 ? j < ref : j > ref); i = ref >= 0 ? ++j : --j) {
        var touch = e.touches[i]
        touches.push([touch.pageX, touch.pageY])
      }
      return touches
    }
    return [[e.pageX, e.pageY]]
  },
  contrastColor (hexcolor) {
    var b, g, r, yiq
    if (hexcolor.slice(0, 1) === '#') {
      hexcolor = hexcolor.slice(1)
    }
    r = parseInt(hexcolor.substr(0, 2), 16)
    g = parseInt(hexcolor.substr(2, 2), 16)
    b = parseInt(hexcolor.substr(4, 2), 16)
    yiq = (r * 299 + g * 587 + b * 114) / 1000
    if (yiq >= 128) {
      return '#34495e'
    } else {
      return '#ecf0f1'
    }
  }
}

export { DrawingUtils }
