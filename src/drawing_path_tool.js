
var DrawingPathTool;

import {
  MoveListener,
  UpListener
} from "./drawing_listener.js";

import {
  DrawingUtils
} from "./drawing_utils.js";

import {
  Geometry
} from "./geometry.js";

DrawingPathTool = class DrawingPathTool {
  constructor(element, options) {
    this.element = element;
    this.options = options;
    this.destroyed = false;
    this._points = [];
    this._up_listener = new UpListener(this.element, {
      up: (e) => {
        return this.up(e);
      }
    });
    this._move_listener = new MoveListener(this.element, {
      move: (touches) => {
        return this.move(touches);
      }
    });
    this.path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    this.size = DrawingUtils.size(this.element) * 0.01;
    switch (this.options.size) {
      case 'small':
        this.size /= 2;
        break;
      case 'large':
        this.size *= 2;
    }
    this.group = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    DrawingUtils.style(this.group, 'stroke', this.options.color || '#ff0000');
    DrawingUtils.style(this.group, 'strokeWidth', this.size + 'px');
    DrawingUtils.style(this.path, 'strokeLinecap', 'round');
    DrawingUtils.style(this.path, 'fill', 'none');
    this.group.setAttribute('data-sharinpix-type', 'path');
    this.group.appendChild(this.path);
    this.element.appendChild(this.group);
  }

  up(e) {
    if (this.destroyed) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    if (this._points.length > 3) {
      this.options.end(this.group);
    } else {
      this.options.cancel();
      this.group.parentNode.removeChild(this.group);
    }
    return this.destroy();
  }

  d() {
    var d, i, len, point, ref;
    if (this._points.length < 1) {
      return '';
    }
    d = `M${this._points[0][0]},${this._points[0][1]}`;
    d += `L${this._points[0][0]},${this._points[0][1]}`;
    ref = this._points;
    for (i = 0, len = ref.length; i < len; i++) {
      point = ref[i];
      d += `L${point[0]},${point[1]}`;
    }
    return d;
  }

  round(value) {
    return Math.round(value + this.size / 2);
  }

  round_point(point) {
    return [this.round(point[0]), this.round(point[1])];
  }

  move(touches) {
    var last_point, new_point;
    if (this.destroyed) {
      return;
    }
    if (touches.length > 1) {
      return this.destroy();
    }
    new_point = this.round_point(touches[0]);
    if (this._points.length > 0) {
      last_point = this._points[this._points.length - 1];
      if (Geometry.distance(new_point, last_point) < 3) {
        return;
      }
    }
    this._points.push(new_point);
    return this.path.setAttribute('d', this.d());
  }

  destroy() {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    this._up_listener.destroy();
    return this._move_listener.destroy();
  }

};

export {
  DrawingPathTool
};
