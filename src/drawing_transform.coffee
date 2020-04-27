import { Referentiel } from "./referentiel.coffee"
import { DrawingUtils } from "./drawing_utils.coffee"
import { DrawingDrag } from "./drawing_drag.coffee"
import { DrawingHandle } from "./drawing_handle.coffee"
import { Geometry } from "./geometry.coffee"

class DrawingTransform
  constructor: (@element, @options)->
    @destroyed = false
    @svg = @element.parentNode
    while @svg.localName != 'svg'
      @svg = @svg.parentNode
    @svg.appendChild(@element)
    @init()
  init: ->
    if @last_init
      time = Date.now() - @last_init
      @options.click() if time < 500 and @options.click
    @last_init = Date.now()
    @position_handle.destroy() if @position_handle?
    bbox = @element.getBBox()
    @referentiel = new Referentiel(@element)
    matrix = @referentiel.matrix_transformation()
    center = @referentiel._multiply_point(matrix, [
      bbox.x + bbox.width / 2
      bbox.y + bbox.height / 2
    ])

    @drag.destroy() if @drag?
    @drag = new DrawingDrag(
      @element
      {
        move: =>
          @transform_handle.destroy()
          @position_handle.destroy()
        cancel: =>
          @init()
          @options.cancel()
        end: =>
          @options.end()
          @init()
      }
    )

    referentiel = new Referentiel(@svg)
    padding = Geometry.distance(
      referentiel.global_to_local([window.innerWidth/2, window.innerHeight/2]),
      referentiel.global_to_local([0, 0])
    ) * 0.01

    @position_handle = new DrawingHandle(
      @svg,
      center,
      {
        color: '#04844b',
        move: (position)=>
          @transform_handle.destroy()
          translation_matrix = [
            [1, 0, position[0]],
            [0, 1, position[1]],
            [0, 0, 1]
          ]
          DrawingUtils.apply_matrix(@element, @referentiel._multiply(translation_matrix, matrix))
        end: (position)=>
          @options.end()
          @init()
        cancel: (position)=>
          @options.cancel()
          @init()
        element: =>
          element = DrawingUtils.create_element(@svg, 'rect', {
            x: bbox.x - padding
            y: bbox.y - padding
            width: bbox.width + 2 * padding
            height: bbox.height + 2 * padding
            style: "fill:#CCCCCC; opacity: 0.3;"
          })
          DrawingUtils.apply_matrix(element, matrix)
          @svg.insertBefore(element, @element)
          element
      }
    )
    @transform_handle.destroy() if @transform_handle?
    transform_handle_center = @referentiel._multiply_point(
      matrix,
      [
        bbox.x + bbox.width + padding
        bbox.y + bbox.height + padding
      ]
    )
    transform_handle_center_distance = Geometry.distance(center, transform_handle_center)
    @transform_handle = new DrawingHandle(
      @svg,
      transform_handle_center,
      {
        color: '#0070d2',
        element: =>
          group = DrawingUtils.create_element(@svg, 'g')
          size = Geometry.distance(
            referentiel.global_to_local([0,0]),
            referentiel.global_to_local([20,20])
          )
          DrawingUtils.create_element(
            group,
            'circle',
            { r: size/2, fill: 'white', style: 'opacity: 1' }
          )
          icon = DrawingUtils.create_element(
            group,
            'path',
            {
              d: 'M448.1 344v112c0 13.3-10.7 24-24 24h-112c-21.4 \
              0-32.1-25.9-17-41l36.2-36.2L224 295.6 116.8 402.9 153 439c15.1 \
              15.1 4.4 41-17 41H24c-13.3 0-24-10.7-24-24V344c0-21.4 \
              25.9-32.1 41-17l36.2 36.2L184.5 256 77.2 148.7 41 185c-15.1 15.1-41 \
              4.4-41-17V56c0-13.3 10.7-24 24-24h112c21.4 0 32.1 25.9 17 41l-36.2 \
              36.2L224 216.4l107.3-107.3L295.1 73c-15.1-15.1-4.4-41 17-41h112c13.3 \
              0 24 10.7 24 24v112c0 21.4-25.9 32.1-41 17l-36.2-36.2L263.6 \
              256l107.3 107.3 36.2-36.2c15.1-15.2 41-4.5 41 16.9z'
              style: "fill: #{@options.color || '#0070d2'};"
            }
          )
          scale = size / 1024
          translate = size / 4.5
          DrawingUtils.apply_matrix(
            icon,
            [
              [scale, 0, -translate],
              [0, scale, - translate],
              [0, 0, 1]
            ]
          )
          DrawingUtils.apply_matrix(
            group,
            [
              [1, 0, transform_handle_center[0]],
              [0, 1, transform_handle_center[1]],
              [0, 0, 1]
            ]
          )
          group
        move: (move)=>
          @position_handle.destroy()
          position = [
            transform_handle_center[0] + move[0],
            transform_handle_center[1] + move[1]
          ]
          angle = Geometry.angle(center, transform_handle_center, position)
          scale = 1 + (
            Geometry.distance(center, position)-transform_handle_center_distance
          ) / transform_handle_center_distance
          transformation_matrix = Geometry.multiply_matrix(
            [
              [1, 0, center[0]],
              [0, 1, center[1]],
              [0, 0, 1]
            ],
            [
              [scale, 0, 0],
              [0, scale, 0],
              [0, 0, 1]
            ],
            Geometry.rotation_matrix(angle)
            [
              [1, 0, -center[0]],
              [0, 1, -center[1]],
              [0, 0, 1]
            ]
          )
          DrawingUtils.apply_matrix(
            @element,
            Geometry.multiply_matrix(transformation_matrix, matrix)
          )
        cancel: (position)=>
          @init()
        end: (position)=>
          @init()
      }
    )
  destroy: ->
    return if @destroyed
    @destroyed = true
    @position_handle.destroy()
    @transform_handle.destroy()
    @drag.destroy()

export { DrawingTransform }
