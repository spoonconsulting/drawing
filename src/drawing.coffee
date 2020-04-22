import { Referentiel } from "./referentiel.coffee"
import { DownListener } from "./drawing_listener.coffee"
import { DrawingPathTool } from "./drawing_path_tool.coffee"
import { DrawingObjectTool } from "./drawing_object_tool.coffee"
import { DrawingTransform } from "./drawing_transform.coffee"
import { DrawingSelect } from "./drawing_select.coffee"
import { DrawingUtils } from "./drawing_utils.coffee"
import { DrawingArrow } from "./drawing_arrow.coffee"
import { DrawingDoubleArrow } from "./drawing_double_arrow.coffee"
import { DrawingLine } from "./drawing_line.coffee"
import { DrawingRect } from "./drawing_rect.coffee"
import { DrawingCircle } from "./drawing_circle.coffee"
import { DrawingNote } from "./drawing_note.coffee"

class Drawing
  constructor: (@svg, @options = {})->
    @_init()
    @options.color ||= '#FF0000'
    @options.tool ||= 'path'
  _init: ->
    @_down = new DownListener(@svg, down: (e)=>
      @down(e)
    )
    DrawingUtils.style(@svg, 'cursor', 'crosshair')
  down: (e)->
    e.preventDefault()
    e.stopPropagation()
    return if @_tool
    @select(null) if @selected?
    switch @options.tool
      when 'arrow'
        @_drawing_object(DrawingArrow, e)
      when 'double-arrow'
        @_drawing_object(DrawingDoubleArrow, e)
      when 'line'
        @_drawing_object(DrawingLine, e)
      when 'circle'
        @_drawing_object(DrawingCircle, e)
      when 'rect'
        @_drawing_object(DrawingRect, e)
      when 'note'
        @_drawing_object(DrawingNote, e)
      else
        @_tool = new DrawingPathTool(
          @svg,
          {
            color: @options.color
            size: @options.size
            end: (element)=>
              @_tool = null
              @_new_callback(element)
            cancel: =>
              @_tool = null
              @select(e.target)
          }
        )
  _drawing_object: (object_class, e)->
    @_tool = new DrawingObjectTool(
      @svg,
      {
        color: @options.color
        size: @options.size
        prompt_text: @options.prompt_text
        object_class: object_class
        end:(element) =>
          @_tool = null
          @_new_callback(element)
        cancel: =>
          @_tool = null
          @select(e.target)
      }
    )
  select: (element)->
    unless element?
      @_transform.destroy() if @_transform?
      @selected = null
      @_select_callback()
      return false
    return false if element == @svg
    return @select(element.parentNode) if element.parentNode != @svg
    if @selected != element
      @_transform.destroy() if @_transform?
      @selected = element
      @_select_callback()
      type = element.getAttribute('data-sharinpix-type')
      switch type
        when 'text' then @_transform = @transform(@selected)
        when 'sticker' then @_transform = @transform(@selected)
        when 'path' then @_transform = @transform(@selected)
        when 'rect' then @_transform = @transform(@selected)
        when 'arrow' then @_transform = @transform(@selected)
        when 'double-arrow' then @_transform = @transform(@selected)
        when 'line' then @_transform = @transform(@selected)
        when 'circle' then @_transform = @transform(@selected)
        when 'note' then @_transform = @transform(@selected)
        else
          @_transform = new DrawingSelect(@selected)
      return true
    else
      @select(null)
  _select_callback: ->
    @options.selected(@selected) if @options.selected?
  _new_callback: (element)->
    @options.new(element) if @options.new?
  transform: (element)->
    new DrawingTransform(element, {
      click: =>
        return unless element.attributes['data-sharinpix-type']?
        switch element.attributes['data-sharinpix-type'].value
          when 'text'
            if @options.prompt_text
              text_element = element.children[0]
              if text_element.children.length > 0
                parts = []
                for child in text_element.children
                  parts.push(child.innerText || child.textContent)
                text = parts.join("\n")
              else
                text = text_element.innerText || text_element.textContent
              @options.prompt_text(text, (input)=>
                DrawingUtils.edit_text(element.children[0], input) if input != ''
                @select(null)
                @select(element)
              )
          when 'note'
            if @options.prompt_text
              @options.prompt_text element.getAttribute('data-sharinpix-note-text'), (input)->
                element.setAttribute('data-sharinpix-note-text', input) if input != ''
      end: ->
      cancel: ->
    })
  setSize: (size)->
    @options.size = size
  setTool: (tool)->
    @options.tool = tool
  setColor: (color)->
    @options.color = color
    return unless @selected?
    element = @selected.firstChild
    return unless element?
    DrawingUtils.style(@selected, 'fill', color)
    DrawingUtils.style(@selected, 'stroke', color)
    return
  delete: ->
    @selectLast() unless @selected?
    return unless @selected?
    element = @selected
    @select(null)
    element.parentNode.removeChild(element)
    @selectLast()
  selectLast: ->
    @select(@svg.lastChild) if @svg.lastChild?
  rotation_matrix: ->
    referentiel = new Referentiel(@svg)
    matrix =  referentiel.matrix()
    angle = -Math.atan2(-matrix[0][1], matrix[1][1])
    [
      [Math.cos(angle),-Math.sin(angle), 0],
      [Math.sin(angle),Math.cos(angle), 0],
      [0,0,1]
    ]
  addText: (input)->
    size = Math.round(DrawingUtils.size(@svg) * 0.05)
    referentiel = new Referentiel(@svg)
    center = referentiel.global_to_local([window.innerWidth/2, window.innerHeight/2])
    group = DrawingUtils.create_element(@svg, 'g')
    group.setAttribute('data-sharinpix-type', 'text')
    DrawingUtils.style(group, 'fill', @options.color)
    DrawingUtils.style(group, 'stroke', @options.color)
    text = DrawingUtils.create_element(
      group,
      'text',
      {
        'stroke-width': 0,
        'font-size': size,
        'font-family': 'sans-serif'
      }
    )
    DrawingUtils.edit_text(text, input)
    DrawingUtils.apply_matrix(
      group,
      referentiel._multiply(
        [
          [1,0, center[0]],
          [0,1, center[1]],
          [0,0,1]
        ],
        @rotation_matrix()
      )
    )
    @_new_callback(group)
    @select(text)
  export: (options, callback)->
    selected = @selected
    @destroy()
    container = document.createElement('div')
    container.setAttribute('style', 'display: none;')
    document.body.appendChild(container)
    node = @svg.cloneNode(true)
    container.appendChild(node)
    node.setAttribute('width', options.width) if options.width
    node.setAttribute('height', options.height) if options.height
    svg = container.innerHTML
    document.body.removeChild(container)
    callback(svg)
    @_init()
    @select(selected) if selected
  addImage: (dataUrl, options)->
    dataImg = new window.Image
    dataImg.src = image
    width = options.width || 100
    height = options.height || 100
    group = DrawingUtils.create_element(@svg, 'g')
    group.setAttribute('data-sharinpix-type', 'sticker')
    group.setAttribute('data-sharinpix-sticker-id', options.id) if options.id
    image = DrawingUtils.create_element(
      group,
      'image',
      {
        x: '0'
        y: '0'
        width: width
        height: height
      }
    )
    image.setAttributeNS("http://www.w3.org/1999/xlink", 'xlink:href', dataUrl)
    referentiel = new Referentiel(@svg)
    center = referentiel.global_to_local([window.innerWidth/2, window.innerHeight/2])
    scale = (DrawingUtils.size(@svg) / 8) / width
    DrawingUtils.apply_matrix(
      group,
      referentiel._multiply(
        [
          [scale, 0, center[0]],
          [0, scale, center[1]],
          [0, 0, 1]

        ],
        @rotation_matrix(),
        [
          [1, 0, - width/2],
          [0, 1, - height/2],
          [0, 0, 1]

        ]
      )
    )
    @_new_callback(group)
    @select(group)
  destroy: ->
    @select(null) if @selected
    DrawingUtils.style(@svg, 'cursor', 'auto')
    @_transform.destroy() if @_transform
    @_down.destroy()

export { Drawing }
