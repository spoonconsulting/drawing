var DownListener, MoveListener, UpListener;

import { Referentiel } from "referentiel";

MoveListener = class MoveListener {
  constructor(element, options) {
    this.element = element;
    this.options = options;
    this.destroyed = false;
    this._referentiel = new Referentiel(this.element);
    this._move = (e) => {
      var i, j, ref, results, touch;
      if (this.destroyed) {
        return;
      }
      if ((e.touches != null) && e.touches.length > 1) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      this._touches = [];
      if (e.touches != null) {
        results = [];
        for (i = j = 0, ref = e.touches.length; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
          touch = e.touches[i];
          results.push(this._touches.push([touch.pageX, touch.pageY]));
        }
        return results;
      } else {
        return this._touches.push([e.pageX, e.pageY]);
      }
    };
    this.element.addEventListener('touchmove', this._move);
    this.element.addEventListener('mousemove', this._move);
    this.loop_callback = () => {
      return this.tick();
    };
    requestAnimationFrame(this.loop_callback);
  }

  tick() {
    var j, len, ref, touch, touches;
    if (this.destroyed) {
      return;
    }
    touches = [];
    if (this._touches != null) {
      ref = this._touches;
      for (j = 0, len = ref.length; j < len; j++) {
        touch = ref[j];
        touches.push(this._referentiel.global_to_local(touch));
      }
    }
    if (touches.length > 0) {
      this.options.move(touches);
    }
    return requestAnimationFrame(this.loop_callback);
  }

  destroy() {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    this.element.removeEventListener('touchmove', this._move);
    return this.element.removeEventListener('mousemove', this._move);
  }

};

DownListener = class DownListener {
  constructor(element, options) {
    this.element = element;
    this.options = options;
    this._listener = (e) => {
      return this.down(e);
    };
    this.destroyed = false;
    this.element.addEventListener('touchstart', this._listener);
    this.element.addEventListener('mousedown', this._listener);
  }

  down(e) {
    if (this.destroyed) {
      return;
    }
    if ((e.touches != null) && e.touches.length > 1) {
      return;
    }
    return this.options.down(e);
  }

  destroy() {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    this.element.removeEventListener('mousedown', this._listener);
    return this.element.removeEventListener('touchstart', this._listener);
  }

};

UpListener = class UpListener {
  constructor(element, options) {
    this.element = element;
    this.options = options;
    this._listener = (e) => {
      return this.up(e);
    };
    this.destroyed = false;
    this.element.addEventListener('touchend', this._listener);
    this.element.addEventListener('touchcancel', this._listener);
    this.element.addEventListener('mouseout', this._listener);
    this.element.addEventListener('mouseup', this._listener);
  }

  up(e) {
    if (this.destroyed) {
      return;
    }
    if ((e.touches != null) && e.touches.length > 1) {
      return;
    }
    if (!this.event_in_scope(e)) {
      return this.options.up(e);
    }
  }

  destroy() {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    this.element.removeEventListener('touchend', this._listener);
    this.element.removeEventListener('touchcancel', this._listener);
    this.element.removeEventListener('mouseout', this._listener);
    return this.element.removeEventListener('mouseup', this._listener);
  }

  event_in_scope(event) {
    var e;
    e = event.relatedTarget;
    if (event.relatedTarget === null) {
      return false;
    }
    while (e) {
      if (e === this.element) {
        return true;
      }
      e = e.parentNode;
    }
    return false;
  }

};

export {
  MoveListener,
  DownListener,
  UpListener
};
