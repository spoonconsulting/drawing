
var DrawingHandle;

import {
  Referentiel
} from "referentiel";

import {
  DrawingUtils
} from "./drawing_utils.js";

import {
  DrawingDrag
} from "./drawing_drag.js";

DrawingHandle = class DrawingHandle {
  constructor(svg, position, options = {}) {
    var referentiel, size;
    this.svg = svg;
    this.position = position;
    this.options = options;
    this.destroyed = false;
    referentiel = new Referentiel(this.svg);
    size = DrawingUtils.size(this.svg) * 0.03;
    if (this.options.element != null) {
      this.element = this.options.element();
    } else {
      this.element = DrawingUtils.create_element(this.svg, 'g');
      DrawingUtils.apply_matrix(this.element, [[1, 0, this.position[0]], [0, 1, this.position[1]], [0, 0, 1]]);
      DrawingUtils.create_element(this.element, 'circle', {
        cx: 0,
        cy: 0,
        r: size / 2,
        style: 'fill: white;'
      });
      DrawingUtils.create_element(this.element, 'circle', {
        cx: 0,
        cy: 0,
        r: size / 4,
        style: `fill: ${this.options.color || '#ff0000'};`
      });
    }
    this.drag = new DrawingDrag(this.element, {
      move: (move) => {
        DrawingUtils.style(this.element, 'opacity', 0);
        return this.move(move);
      },
      end: () => {
        return this.end();
      },
      cancel: () => {
        return this.cancel();
      }
    });
  }

  end() {
    this.drag.destroy();
    return this.options.end();
  }

  cancel() {
    this.drag.destroy();
    return this.options.cancel();
  }

  move(move) {
    if (this.options.move != null) {
      return this.options.move(move);
    }
  }

  destroy() {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    this.drag.destroy();
    return this.element.parentNode.removeChild(this.element);
  }

};

export {
  DrawingHandle
};
