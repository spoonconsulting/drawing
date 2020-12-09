import { DrawingUtils as Utils } from './drawing_utils.js'
import './menu.sass'

const DEFAULT_COLORS = {
  red: '#e74c3c',
  orange: '#f39c12',
  green: '#2ecc71',
  blue: '#3498db',
  purple: '#8e44ad',
  pink: '#fc6ffc',
  yellow: '#f1c40f',
  white: '#ecf0f1',
  black: '#2c3e50'
}
const DEFAULT_TOOLS = ['hand', 'path', 'arrow', 'double-arrow', 'line', 'circle', 'rect', 'note']
const DEFAULT_ICONS = {
  hand: 'M372.57 112.641v-10.825c0-43.612-40.52-76.691-83.039-65.546-25.629-49.5-94.09-47.45-117.982.747C130.269 26.456 89.144 57.945 89.144 102v126.13c-19.953-7.427-43.308-5.068-62.083 8.871-29.355 21.796-35.794 63.333-14.55 93.153L132.48 498.569a32 32 0 0 0 26.062 13.432h222.897c14.904 0 27.835-10.289 31.182-24.813l30.184-130.958A203.637 203.637 0 0 0 448 310.564V179c0-40.62-35.523-71.992-75.43-66.359zm27.427 197.922c0 11.731-1.334 23.469-3.965 34.886L368.707 464h-201.92L51.591 302.303c-14.439-20.27 15.023-42.776 29.394-22.605l27.128 38.079c8.995 12.626 29.031 6.287 29.031-9.283V102c0-25.645 36.571-24.81 36.571.691V256c0 8.837 7.163 16 16 16h6.856c8.837 0 16-7.163 16-16V67c0-25.663 36.571-24.81 36.571.691V256c0 8.837 7.163 16 16 16h6.856c8.837 0 16-7.163 16-16V101.125c0-25.672 36.57-24.81 36.57.691V256c0 8.837 7.163 16 16 16h6.857c8.837 0 16-7.163 16-16v-76.309c0-26.242 36.57-25.64 36.57-.691v131.563z',
  path: 'M290.74 93.24l128.02 128.02-277.99 277.99-114.14 12.6C11.35 513.54-1.56 500.62.14 485.34l12.7-114.22 277.9-277.88zm207.2-19.06l-60.11-60.11c-18.75-18.75-49.16-18.75-67.91 0l-56.55 56.55 128.02 128.02 56.55-56.55c18.75-18.76 18.75-49.16 0-67.91z',
  circle: 'M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200z',
  rect: 'M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-6 400H54c-3.3 0-6-2.7-6-6V86c0-3.3 2.7-6 6-6h340c3.3 0 6 2.7 6 6v340c0 3.3-2.7 6-6 6z',
  'double-arrow': 'M377.941 169.941V216H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.568 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296h243.882v46.059c0 21.382 25.851 32.09 40.971 16.971l86.059-86.059c9.373-9.373 9.373-24.568 0-33.941l-86.059-86.059c-15.119-15.12-40.971-4.412-40.971 16.97z',
  arrow: 'M313.941 216H12c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12h301.941v46.059c0 21.382 25.851 32.09 40.971 16.971l86.059-86.059c9.373-9.373 9.373-24.569 0-33.941l-86.059-86.059c-15.119-15.119-40.971-4.411-40.971 16.971V216z',
  line: 'M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z'
}

class Menu {
  constructor (drawing, options = {}) {
    this.drawing = drawing
    this.options = options
    this.tools = this.options.tools || DEFAULT_TOOLS
    this.icons = DEFAULT_ICONS
    this.colors = this.options.colors || DEFAULT_COLORS
    this.menu = this.createElement('div', 'drawing-menu')
    this.createColorsMenu(this.menu)
    this.createToolsMenu(this.menu)
    this.updateSelected()
    document.body.appendChild(this.menu)
    this._click = Utils.addEventListener(this.menu, 'click', (e) => { this.click(e) })
    this._enter = Utils.addEventListener(this.menu, 'mouseenter', (e) => { this.open() })
    this._leave = Utils.addEventListener(this.menu, 'mouseleave', (e) => { this.close() })
  }

  updateSelected () {
    if (this.selected !== undefined) { this.menu.removeChild(this.selected) }
    this.selected = this.createElement('div', 'drawing-selected', this.menu)
    var item = this.createElement('a', 'drawing-selected', this.selected)
    item.setAttribute('href', '#')
    item.appendChild(this.createIcon(this.icons[this.drawing.tool]))
    item.style.backgroundColor = this.drawing.color + '99'
    item.style.color = Utils.contrastColor(this.drawing.color)
  }

  toggle () {
    console.log('toggle')
    this.menu.classList.toggle('open')
  }

  close () {
    console.log('close')
    this.menu.classList.remove('open')
  }

  open () {
    console.log('open')
    this.menu.classList.add('open')
  }

  click (e) {
    e.preventDefault()
    e.stopPropagation()
    console.log(e, e.originalTarget)
    var elem = e.target
    while (elem.tagName !== 'A') {
      elem = elem.parentElement
      if (elem === this.menu) { return this.toggle() }
    }
    switch (elem.classList[0]) {
      case 'drawing-color':
        this.drawing.setColor(this.colors[elem.getAttribute('data-color')])
        this.updateSelected()
        this.close()
        return
      case 'drawing-tool':
        this.drawing.setTool(elem.getAttribute('data-tool'))
        this.updateSelected()
        this.close()
        return
      case 'drawing-selected':
        break
    }
    this.toggle()
    console.log('ICIC', elem.classList[0])
  }

  createColorsMenu (menu) {
    var colorMenu = this.createElement('div', 'drawing-colors', menu)
    for (const name in this.colors) {
      var item = this.createElement('a', 'drawing-color', colorMenu)
      item.style.backgroundColor = this.colors[name]
      item.setAttribute('href', '#')
      item.setAttribute('data-color', name)
      item.setAttribute('title', name)
    }
    return colorMenu
  }

  createToolsMenu (menu) {
    var toolMenu = this.createElement('div', 'drawing-tools', menu)
    this.tools.forEach((name) => {
      var item = this.createElement('a', 'drawing-tool', toolMenu)
      item.setAttribute('href', '#')
      item.setAttribute('data-tool', name)
      item.setAttribute('title', name)
      item.appendChild(this.createIcon(this.icons[name]))
    })
    return toolMenu
  }

  createIcon (path) {
    var svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    svgElement.setAttribute('viewBox', '0 0 512 512')
    svgElement.innerHTML = '<path fill="currentColor" d="' + path + '" />'
    return svgElement
  }

  createElement (tag, klass, parentElement = null) {
    var div = document.createElement(tag)
    div.classList.add(klass)
    if (parentElement !== null) {
      parentElement.appendChild(div)
    }
    return div
  }
}

export { Menu }
