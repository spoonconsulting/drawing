
var DrawingNote;

import {
  DrawingUtils
} from "./drawing_utils.js";

import {
  Geometry
} from "./geometry.js";

DrawingNote = class DrawingNote {
  constructor(options) {
    this.options = options;
    this.path = DrawingUtils.create_element(this.options.parent, 'path');
    DrawingUtils.style(this.options.parent, 'stroke', this.options.color);
    DrawingUtils.style(this.options.parent, 'fill', this.options.color);
    DrawingUtils.style(this.options.parent, 'stroke-width', (this.options.size / 2) + 'px');
    DrawingUtils.style(this.options.parent, 'stroke-linecap', 'round');
    DrawingUtils.style(this.path, 'fill-opacity', 0.1);
  }

  update(from, to) {
    var _from, _to, fold_length, fold_pct, len, path_d, wid;
    this.from = from;
    this.to = to;
    if (this.big_enough()) {
      this.options.parent.setAttribute('opacity', 1);
      _from = [Math.min(this.from[0], this.to[0]), Math.min(this.from[1], this.to[1])];
      _to = [Math.max(this.from[0], this.to[0]), Math.max(this.from[1], this.to[1])];
      [len, wid] = [_to[0] - _from[0], _to[1] - _from[1]];
      fold_pct = 0.25;
      fold_length = Math.min(fold_pct * len, fold_pct * wid);
      path_d = `M0,0 L${len},${0} L${len},${wid - fold_length} L${len - fold_length},${wid} L0,${wid} L0,0 M${len},${wid - fold_length} L${len - fold_length},${wid - fold_length} L${len - fold_length},${wid}`;
      this.path.setAttribute('d', path_d);
      return DrawingUtils.apply_matrix(this.path, Geometry.translation_matrix(_from));
    } else {
      return this.options.parent.setAttribute('opacity', 0);
    }
  }

  size() {
    if (this.from == null) {
      return 0;
    }
    if (this.to == null) {
      return 0;
    }
    return Geometry.distance(this.from, this.to);
  }

  big_enough() {
    return this.size() > 8;
  }

  end(callback) {
    if (this.options.prompt_text != null) {
      this.options.prompt_text('', (input) => {
        if (input !== '') {
          return this.options.parent.setAttribute('data-sharinpix-note-text', input);
        }
      });
    }
    return callback();
  }

};

DrawingNote.type = 'note';

export {
  DrawingNote
};
