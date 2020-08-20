import { Referentiel, MatrixUtils } from 'referentiel'
import { Geometry } from './geometry'
import { DownListener } from './drawing_listener.js'
import { DrawingPathTool } from './drawing_path_tool.js'
import { DrawingObjectTool } from './drawing_object_tool.js'
import { DrawingTransform } from './drawing_transform.js'
import { DrawingSelect } from './drawing_select.js'
import { DrawingUtils as Utils } from './drawing_utils.js'
import { DrawingArrow } from './drawing_arrow.js'
import { DrawingDoubleArrow } from './drawing_double_arrow.js'
import { DrawingLine } from './drawing_line.js'
import { DrawingRect } from './drawing_rect.js'
import { DrawingCircle } from './drawing_circle.js'
import { DrawingNote } from './drawing_note.js'
import { Zoomable } from './zoomable.js'

class Drawing {
  constructor (svg1, options1 = {}) {
    var base, base1
    this.svg = svg1
    this.options = options1
    this._init();
    (base = this.options).color || (base.color = '#FF0000');
    (base1 = this.options).tool || (base1.tool = 'path')
  }

  _init () {
    this._downListener = Utils.addEventListener(this.svg, 'touchstart mousedown', (e) => { this.down(e) })
    return Utils.style(this.svg, 'cursor', 'crosshair')
  }

  down (e) {
    if(e.touches !== undefined && e.touches.length > 1) { return }
    e.preventDefault()
    e.stopPropagation()
    if (this._tool) {
      return
    }
    switch (this.options.tool) {
      case 'arrow':
        this._drawingObject(DrawingArrow, e)
        break
      case 'double-arrow':
        this._drawingObject(DrawingDoubleArrow, e)
        break
      case 'line':
        this._drawingObject(DrawingLine, e)
        break
      case 'circle':
        this._drawingObject(DrawingCircle, e)
        break
      case 'rect':
        this._drawingObject(DrawingRect, e)
        break
      case 'note':
        this._drawingObject(DrawingNote, e)
        break
      default:
        this._tool = new DrawingPathTool(this.svg, {
          color: this.options.color,
          size: this.options.size,
          end: (element) => {
            this._tool = null
            this._newCallback(element)
            if (this.options.showControls !== undefined && this.options.showControls !== null) { this.options.showControls(true) }
          },
          cancel: () => {
            this._tool = null
            this.select(e.target)
            if (this.options.showControls !== undefined && this.options.showControls !== null) { this.options.showControls(true) }
          }
        })
    }
    if (this.options.showControls !== undefined && this.options.showControls !== null) { this.options.showControls(false) }
  }

  _drawingObject (objectClass, e) {
    this._tool = new DrawingObjectTool(this.svg, {
      color: this.options.color,
      size: this.options.size,
      promptText: this.options.promptText,
      objectClass: objectClass,
      end: (element) => {
        this._tool = null
        this._newCallback(element)
        if (this.options.showControls !== undefined && this.options.showControls !== null) { this.options.showControls(true) }
      },
      cancel: () => {
        this._tool = null
        this.select(e.target)
        if (this.options.showControls !== undefined && this.options.showControls !== null) { this.options.showControls(true) }
      }
    })
  }

  select (element) {
    var type
    if (element === null) {
      if (this._transform != null) {
        this._transform.destroy()
      }
      this.selected = null
      this.selectCallback()
      return false
    }
    if (element === this.svg) {
      this.select(null)
      return false
    }
    if (element.parentNode !== this.svg) {
      return this.select(element.parentNode)
    }
    if (this.selected !== element) {
      if (this._transform != null) {
        this._transform.destroy()
      }
      this.selected = element
      this.selectCallback()
      type = element.getAttribute('data-sharinpix-type')
      switch (type) {
        case 'text':
          this._transform = this.transform(this.selected)
          break
        case 'text-with-background':
          this._transform = this.transform(this.selected)
          break
        case 'sticker':
          this._transform = this.transform(this.selected)
          break
        case 'path':
          this._transform = this.transform(this.selected)
          break
        case 'rect':
          this._transform = this.transform(this.selected)
          break
        case 'arrow':
          this._transform = this.transform(this.selected)
          break
        case 'double-arrow':
          this._transform = this.transform(this.selected)
          break
        case 'line':
          this._transform = this.transform(this.selected)
          break
        case 'circle':
          this._transform = this.transform(this.selected)
          break
        case 'note':
          this._transform = this.transform(this.selected)
          break
        default:
          this._transform = new DrawingSelect(this.selected)
      }
      return true
    } else {
      return this.select(null)
    }
  }

  selectCallback () {
    if (this.options.selected !== null && this.options.selected !== undefined) {
      return this.options.selected(this.selected)
    }
  }

  _newCallback (element) {
    if (this.options.new !== null && this.options.new !== undefined) {
      this.options.new(element)
    }
    this.onChange()
  }

  transform (element) {
    return new DrawingTransform(element, {
      handles: this.options.handles,
      start: () => {
        if (this.options.showControls !== undefined && this.options.showControls !== null) { this.options.showControls(false) }
      },
      end: () => {
        if (this.options.showControls !== undefined && this.options.showControls !== null) { this.options.showControls(true) }
        this.onChange()
      },
      click: () => {
        if (element.attributes['data-sharinpix-type'] == null) {
          return
        }
        var type = element.attributes['data-sharinpix-type'].value
        switch (type) {
          case 'text-with-background':
          case 'text':
            if (this.options.promptText) {
              var textElement = element.querySelector('text')
              var text
              if (textElement.children.length > 0) {
                var parts = []
                var ref = textElement.children
                var len = ref.length
                for (var i = 0; i < len; i++) {
                  var child = ref[i]
                  parts.push(child.innerText || child.textContent)
                }
                text = parts.join('\n')
              } else {
                text = textElement.innerText || textElement.textContent
              }
              this.select(null)
              this.options.promptText(text, (input) => {
                Utils.edit_text(textElement, input)
                if (type === 'text-with-background') {
                  this.setTextBackgroundSize(element)
                }
                this.select(element)
              })
            }
            break
          case 'note':
            if (this.options.promptText) {
              this.options.promptText(element.getAttribute('data-sharinpix-note-text'), function (input) {
                if (input !== '') {
                  return element.setAttribute('data-sharinpix-note-text', input)
                }
              })
            }
        }
      }
    })
  }

  onChange () {
    if (this.options.onChange !== undefined && this.options.onChange !== null) {
      this.options.onChange()
    }
  }

  setSize (size) {
    this.options.size = size
  }

  setTool (tool) {
    this.options.tool = tool
  }

  setColor (color) {
    var element
    this.options.color = color
    if (this.selected == null) {
      return
    }
    element = this.selected.firstChild
    if (element == null) {
      return
    }
    Utils.style(this.selected, 'fill', color)
    Utils.style(this.selected, 'stroke', color)
    if (this.selected.attributes['data-sharinpix-type'].value === 'text-with-background') {
      var rectElement = this.selected.querySelector('rect')
      Utils.style(rectElement, 'fill', color)
      var textElement = this.selected.querySelector('text')
      Utils.style(textElement, 'fill', Utils.contrastColor(this.options.color))
      Utils.style(textElement, 'stroke', Utils.contrastColor(this.options.color))
    }
    this.onChange()
  }

  delete () {
    var element
    if (this.selected == null) {
      this.selectLast()
    }
    if (this.selected == null) {
      return
    }
    element = this.selected
    this.select(null)
    element.parentNode.removeChild(element)
    this.selectLast()
    this.onChange()
  }

  selectLast () {
    if (this.selected) {
      return
    }
    if (this.svg.lastChild != null) {
      return this.select(this.svg.lastChild)
    }
  }

  rotationMatrix () {
    var angle, matrix, referentiel
    referentiel = new Referentiel(this.svg)
    matrix = referentiel.matrix()
    angle = -Math.atan2(-matrix[0][1], matrix[1][1])
    return [[Math.cos(angle), -Math.sin(angle), 0], [Math.sin(angle), Math.cos(angle), 0], [0, 0, 1]]
  }

  addText (input, options = {}) {
    var size = Math.round(Utils.size(this.svg) * 0.05)
    var referentiel = new Referentiel(this.svg)
    var center = referentiel.globalToLocal([window.innerWidth / 2, window.innerHeight / 2])
    var group = Utils.create_element(this.svg, 'g')
    var text = Utils.create_element(group, 'text', {
      'stroke-width': 0,
      'font-size': size,
      'font-family': 'sans-serif'
    })
    Utils.edit_text(text, input)
    Utils.apply_matrix(group, MatrixUtils.mult([[1, 0, center[0]], [0, 1, center[1]], [0, 0, 1]], this.rotationMatrix()))

    if (options.withBackground === true) {
      group.setAttribute('data-sharinpix-type', 'text-with-background')
      var rect = Utils.create_element(group, 'rect', {
        'stroke-width': 0,
        fill: this.options.color
      })
      group.insertBefore(rect, text)
      Utils.style(group, 'fill', Utils.contrastColor(this.options.color))
      Utils.style(group, 'stroke', Utils.contrastColor(this.options.color))
      this.setTextBackgroundSize(group)
    } else {
      group.setAttribute('data-sharinpix-type', 'text')
      Utils.style(group, 'fill', this.options.color)
      Utils.style(group, 'stroke', this.options.color)
    }
    this._newCallback(group)
    return this.select(text)
  }

  setTextBackgroundSize (element) {
    var rectElement = element.querySelector('rect')
    var textElement = element.querySelector('text')
    var bbox = textElement.getBBox()
    Utils.style(rectElement, 'x', bbox.x)
    Utils.style(rectElement, 'y', bbox.y)
    Utils.style(rectElement, 'width', bbox.width)
    return Utils.style(rectElement, 'height', bbox.height)
  }

  export (options, callback) {
    var container, node, selected, svg
    selected = this.selected
    this.destroy()
    container = document.createElement('div')
    container.setAttribute('style', 'display: none;')
    document.body.appendChild(container)
    node = this.svg.cloneNode(true)
    container.appendChild(node)
    if (options.width) {
      node.setAttribute('width', options.width)
    }
    if (options.height) {
      node.setAttribute('height', options.height)
    }
    svg = container.innerHTML
    document.body.removeChild(container)
    callback(svg)
    this._init()
    if (selected) {
      return this.select(selected)
    }
  }

  addImage (dataUrl, options) {
    var center, dataImg, group, height, image, referentiel, scale, width
    dataImg = new window.Image()
    dataImg.src = image
    width = options.width || 100
    height = options.height || 100
    group = Utils.create_element(this.svg, 'g')
    group.setAttribute('data-sharinpix-type', 'sticker')
    if (options.id) {
      group.setAttribute('data-sharinpix-sticker-id', options.id)
    }
    image = Utils.create_element(group, 'image', {
      x: '0',
      y: '0',
      width: width,
      height: height
    })
    image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', dataUrl)
    referentiel = new Referentiel(this.svg)
    center = referentiel.globalToLocal([window.innerWidth / 2, window.innerHeight / 2])
    scale = (Utils.size(this.svg) / 8) / width
    Utils.apply_matrix(group, MatrixUtils.mult([[scale, 0, center[0]], [0, scale, center[1]], [0, 0, 1]], this.rotationMatrix(), [[1, 0, -width / 2], [0, 1, -height / 2], [0, 0, 1]]))
    this._newCallback(group)
    return this.select(group)
  }

  destroy () {
    if (this.selected) {
      this.select(null)
    }
    Utils.style(this.svg, 'cursor', 'auto')
    if (this._transform) {
      this._transform.destroy()
    }
    this._downListene()
  }
};

export { Referentiel, Drawing, MatrixUtils, Geometry, Zoomable }
