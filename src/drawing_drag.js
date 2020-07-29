
import { Referentiel, MatrixUtils } from "referentiel";
import { DrawingUtils } from "./drawing_utils.js";
import { Geometry } from "./geometry.js";

import { MoveListener, DownListener, UpListener } from "./drawing_listener.js";

class DrawingDrag {
  constructor(element, options = {}) {
    this.element = element;
    this.options = options;
    this.svg = this.element.parentNode;
    while (this.svg.localName !== 'svg') {
      this.svg = this.svg.parentNode;
    }
    this._down = new DownListener(this.element, {
      down: (e) => {
        return this.down(e);
      }
    });
    DrawingUtils.style(this.element, 'cursor', 'move');
  }

  down(e) {
    e.preventDefault();
    e.stopPropagation();
    this.referentiel = new Referentiel(this.element);
    this.matrix = this.referentiel.matrixTransform();
    this._move = new MoveListener(this.svg, {
      move: (touches) => {
        return this.move(touches);
      }
    });
    return this._up = new UpListener(this.svg, {
      up: (e) => {
        return this.up(e);
      }
    });
  }

  up(e) {
    e.preventDefault();
    e.stopPropagation();
    this._move.destroy();
    this._up.destroy();
    if ((this.last_move != null) && Geometry.distance(this.last_move) > 10) {
      return this.options.end(this.last_move);
    } else {
      return this.options.cancel();
    }
  }

  move(touches) {
    var touch, translation_matrix;
    if (!this.first_touch) {
      this.first_touch = touches[0];
    }
    touch = touches[0];
    this.last_move = [touch[0] - this.first_touch[0], touch[1] - this.first_touch[1]];
    translation_matrix = [[1, 0, this.last_move[0]], [0, 1, this.last_move[1]], [0, 0, 1]];
    DrawingUtils.apply_matrix(this.element, MatrixUtils.mult(translation_matrix, this.matrix));
    if (this.options.move != null) {
      return this.options.move(this.last_move);
    }
  }

  destroy() {
    DrawingUtils.style(this.element, 'cursor', 'auto');
    if (this._move != null) {
      this._move.destroy();
    }
    if (this._up != null) {
      this._up.destroy();
    }
    return this._down.destroy();
  }

};

export { DrawingDrag };
