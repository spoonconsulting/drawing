import { Referentiel, MatrixUtils } from 'referentiel'
import { Geometry } from './geometry'
import { DrawingPathTool } from './drawing_path_tool.js'
import { DrawingObjectTool } from './drawing_object_tool.js'
import { DrawingTransform } from './drawing_transform.js'
import { DrawingSelect } from './drawing_select.js'
import { DrawingUtils as Utils } from './drawing_utils.js'
import { Arrow } from './arrow.js'
import { DoubleArrow } from './double_arrow.js'
import { DrawingLine } from './drawing_line.js'
import { DrawingRect } from './drawing_rect.js'
import { DrawingCircle } from './drawing_circle.js'
import { DrawingNote } from './drawing_note.js'
import { Hand as HandTool } from './tools/hand.js'
import { Menu } from './menu.js'

class Drawing {
  constructor (svg, options = {}) {
    this.svg = svg
    this.options = options
    this.color = this.options.color || '#ff0000'
    this.tool = this.options.tool || 'hand'
    this._init()
  }

  _init () {
    this._downListener = Utils.addEventListener(this.svg, 'touchstart mousedown', (e) => {
      this.down(e)
      if (this.options.showControls) { this.options.showControls(false) }
    })
    this.setTool(this.tool)
  }

  down (e) {
    if (e.touches !== undefined && e.touches.length > 1) { return }
    e.preventDefault()
    e.stopPropagation()
    if (this._tool) {
      return
    }
    switch (this.tool) {
      case 'arrow':
        this._drawingObject(Arrow, e)
        break
      case 'double-arrow':
        this._drawingObject(DoubleArrow, e)
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
      case 'path':
        this._tool = new DrawingPathTool(this.svg, {
          color: this.color,
          size: this.options.size,
          end: (element) => {
            this._tool = null
            this._newCallback(element)
            if (this.options.showControls) { this.options.showControls(true) }
          },
          cancel: () => {
            this._tool = null
            this.select(e.target)
            if (this.options.showControls) { this.options.showControls(true) }
          }
        })
        break
      default:
        this._tool = new HandTool(this.svg, {
          end: () => {
            this._tool = null
            console.log('END !!')
            if (this.options.showControls) { this.options.showControls(true) }
          }
        })
    }
    if (this.options.showControls !== undefined && this.options.showControls !== null) { this.options.showControls(false) }
  }

  _drawingObject (objectClass, e) {
    this._tool = new DrawingObjectTool(this.svg, {
      color: this.color,
      size: this.options.size,
      promptText: this.options.promptText,
      objectClass: objectClass,
      end: (element) => {
        this._tool = null
        this._newCallback(element)
        if (this.options.showControls) { this.options.showControls(true) }
      },
      cancel: () => {
        this._tool = null
        this.select(e.target)
        if (this.options.showControls) { this.options.showControls(true) }
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
    if (this.options.selected) {
      return this.options.selected(this.selected)
    }
  }

  _newCallback (element) {
    if (this.options.new) {
      this.options.new(element)
    }
    this.onChange()
  }

  transform (element) {
    return new DrawingTransform(element, {
      handles: this.options.handles,
      start: () => {
        if (this.options.showControls) { this.options.showControls(false) }
      },
      end: () => {
        if (this.options.showControls) { this.options.showControls(true) }
        this.onChange()
      },
      new: (newElement) => {
        this._newCallback(newElement)
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
          default:
            if (this.options.promptText) {
              this.options.promptText(element.getAttribute('data-sharinpix-note-text') || '', function (input) {
                if (input !== '') {
                  element.setAttribute('data-sharinpix-note-text', input)
                } else {
                  element.removeAttribute('data-sharinpix-note-text')
                }
              })
            }
        }
      }
    })
  }

  onChange () {
    if (this.options.onChange) {
      this.options.onChange()
    }
  }

  setSize (size) {
    this.options.size = size
  }

  setTool (tool) {
    this.tool = tool
    Utils.style(this.svg, 'cursor', this.tool === 'hand' ? '' : 'crosshair')
  }

  setColor (color) {
    var element
    this.color = color
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
      Utils.style(textElement, 'fill', Utils.contrastColor(this.color))
      Utils.style(textElement, 'stroke', Utils.contrastColor(this.color))
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

  addText (input, options = {}) {
    var referentiel = new Referentiel(this.svg)
    var group = Utils.create_element(this.svg, 'g')
    var text = Utils.create_element(group, 'text', {
      'stroke-width': 0,
      'font-size': Math.round(Geometry.distance([window.innerWidth, 0], [0, 0]) * 0.025),
      'font-family': 'sans-serif'
    })
    Utils.edit_text(text, input)
    Utils.apply_matrix(
      group,
      MatrixUtils.mult(
        referentiel.matrixInv(),
        [[1, 0, window.innerWidth / 2], [0, 1, window.innerHeight / 2], [0, 0, 1]]
      )
    )

    if (options.background === true) {
      group.setAttribute('data-sharinpix-type', 'text-with-background')
      var rect = Utils.create_element(group, 'rect', {
        'stroke-width': 0,
        fill: this.color
      })
      group.insertBefore(rect, text)
      Utils.style(group, 'fill', Utils.contrastColor(this.color))
      Utils.style(group, 'stroke', Utils.contrastColor(this.color))
      this.setTextBackgroundSize(group)
    } else {
      group.setAttribute('data-sharinpix-type', 'text')
      Utils.style(group, 'fill', this.color)
      Utils.style(group, 'stroke', this.color)
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
    var dataImg, group, height, image, referentiel, scale, width
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
    scale = (Geometry.distance([window.innerWidth, 0], [0, 0]) / 4) / width
    Utils.apply_matrix(
      group,
      MatrixUtils.mult(
        referentiel.matrixInv(),
        [[1, 0, window.innerWidth / 2], [0, 1, window.innerHeight / 2], [0, 0, 1]],
        [[scale, 0, 0], [0, scale, 0], [0, 0, 1]],
        [[1, 0, -width / 2], [0, 1, -height / 2], [0, 0, 1]]
      )
    )
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
    this._downListener()
  }
};

export { Referentiel, Drawing, MatrixUtils, Geometry, Menu }
