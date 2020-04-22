import { DrawingUtils } from "./drawing_utils.coffee"
import { Geometry } from "./geometry.coffee"

class DrawingNote
  constructor: (@options)->
    @path = DrawingUtils.create_element(@options.parent, 'path')
    DrawingUtils.style(@options.parent, 'stroke', @options.color)
    DrawingUtils.style(@options.parent, 'fill', @options.color)
    DrawingUtils.style(@options.parent, 'stroke-width', (@options.size/2)+'px')
    DrawingUtils.style(@options.parent, 'stroke-linecap', 'round')
    DrawingUtils.style(@path, 'fill-opacity', 0.1)
  update: (@from, @to)->
    if @big_enough()
      @options.parent.setAttribute('opacity', 1)
      _from = [ Math.min(@from[0], @to[0]), Math.min(@from[1], @to[1]) ]
      _to = [ Math.max(@from[0], @to[0]), Math.max(@from[1], @to[1]) ]
      [ len, wid ] = [ _to[0]-_from[0], _to[1]-_from[1] ]
      fold_pct = 0.25
      fold_length = Math.min(fold_pct*len, fold_pct*wid)
      path_d = "M0,0 L#{len},#{0} L#{len},#{wid-fold_length} L#{len-fold_length},#{wid} L0,#{wid} \
L0,0 M#{len},#{wid-fold_length} L#{len-fold_length},#{wid-fold_length} L#{len-fold_length},#{wid}"
      @path.setAttribute('d', path_d)
      DrawingUtils.apply_matrix(@path, Geometry.translation_matrix(_from))
    else
      @options.parent.setAttribute('opacity', 0)
  size: ->
    return 0 unless @from?
    return 0 unless @to?
    Geometry.distance(@from, @to)
  big_enough: ->
    @size() > 8
  end: (callback)->
    if @options.prompt_text?
      @options.prompt_text '', (input)=>
        @options.parent.setAttribute('data-sharinpix-note-text', input) if input != ''
    callback()
DrawingNote.type = 'note'

export { DrawingNote }
