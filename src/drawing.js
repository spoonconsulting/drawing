import { Referentiel, MatrixUtils } from "referentiel";
import { Geometry } from "./geometry";
import { DownListener } from "./drawing_listener.js";
import { DrawingPathTool } from "./drawing_path_tool.js";
import { DrawingObjectTool } from "./drawing_object_tool.js";
import { DrawingTransform } from "./drawing_transform.js";
import { DrawingSelect } from "./drawing_select.js";
import { DrawingUtils } from "./drawing_utils.js";
import { DrawingArrow } from "./drawing_arrow.js";
import { DrawingDoubleArrow } from "./drawing_double_arrow.js";
import { DrawingLine } from "./drawing_line.js";
import { DrawingRect } from "./drawing_rect.js";
import { DrawingCircle } from "./drawing_circle.js";
import { DrawingNote } from "./drawing_note.js";

class Drawing {
  constructor(svg1, options1 = {}) {
    var base, base1;
    this.svg = svg1;
    this.options = options1;
    this._init();
    (base = this.options).color || (base.color = '#FF0000');
    (base1 = this.options).tool || (base1.tool = 'path');
  }

  _init() {
    this._down = new DownListener(this.svg, {
      down: (e) => {
        return this.down(e);
      }
    });
    return DrawingUtils.style(this.svg, 'cursor', 'crosshair');
  }

  down(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this._tool) {
      return;
    }
    if (this.selected != null) {
      this.select(null);
    }
    switch (this.options.tool) {
      case 'arrow':
        return this._drawing_object(DrawingArrow, e);
      case 'double-arrow':
        return this._drawing_object(DrawingDoubleArrow, e);
      case 'line':
        return this._drawing_object(DrawingLine, e);
      case 'circle':
        return this._drawing_object(DrawingCircle, e);
      case 'rect':
        return this._drawing_object(DrawingRect, e);
      case 'note':
        return this._drawing_object(DrawingNote, e);
      default:
        return this._tool = new DrawingPathTool(this.svg, {
          color: this.options.color,
          size: this.options.size,
          end: (element) => {
            this._tool = null;
            return this._new_callback(element);
          },
          cancel: () => {
            this._tool = null;
            return this.select(e.target);
          }
        });
    }
  }

  _drawing_object(object_class, e) {
    return this._tool = new DrawingObjectTool(this.svg, {
      color: this.options.color,
      size: this.options.size,
      prompt_text: this.options.prompt_text,
      object_class: object_class,
      end: (element) => {
        this._tool = null;
        return this._new_callback(element);
      },
      cancel: () => {
        this._tool = null;
        return this.select(e.target);
      }
    });
  }

  select(element) {
    var type;
    if (element == null) {
      if (this._transform != null) {
        this._transform.destroy();
      }
      this.selected = null;
      this._select_callback();
      return false;
    }
    if (element === this.svg) {
      return false;
    }
    if (element.parentNode !== this.svg) {
      return this.select(element.parentNode);
    }
    if (this.selected !== element) {
      if (this._transform != null) {
        this._transform.destroy();
      }
      this.selected = element;
      this._select_callback();
      type = element.getAttribute('data-sharinpix-type');
      switch (type) {
        case 'text':
          this._transform = this.transform(this.selected);
          break;
        case 'sticker':
          this._transform = this.transform(this.selected);
          break;
        case 'path':
          this._transform = this.transform(this.selected);
          break;
        case 'rect':
          this._transform = this.transform(this.selected);
          break;
        case 'arrow':
          this._transform = this.transform(this.selected);
          break;
        case 'double-arrow':
          this._transform = this.transform(this.selected);
          break;
        case 'line':
          this._transform = this.transform(this.selected);
          break;
        case 'circle':
          this._transform = this.transform(this.selected);
          break;
        case 'note':
          this._transform = this.transform(this.selected);
          break;
        default:
          this._transform = new DrawingSelect(this.selected);
      }
      return true;
    } else {
      return this.select(null);
    }
  }

  _select_callback() {
    if (this.options.selected != null) {
      return this.options.selected(this.selected);
    }
  }

  _new_callback(element) {
    if (this.options.new != null) {
      return this.options.new(element);
    }
  }

  transform(element) {
    return new DrawingTransform(element, {
      click: () => {
        var child, i, len, parts, ref, text, text_element;
        if (element.attributes['data-sharinpix-type'] == null) {
          return;
        }
        switch (element.attributes['data-sharinpix-type'].value) {
          case 'text':
            if (this.options.prompt_text) {
              text_element = element.children[0];
              if (text_element.children.length > 0) {
                parts = [];
                ref = text_element.children;
                for (i = 0, len = ref.length; i < len; i++) {
                  child = ref[i];
                  parts.push(child.innerText || child.textContent);
                }
                text = parts.join("\n");
              } else {
                text = text_element.innerText || text_element.textContent;
              }
              return this.options.prompt_text(text, (input) => {
                if (input !== '') {
                  DrawingUtils.edit_text(element.children[0], input);
                }
                this.select(null);
                return this.select(element);
              });
            }
            break;
          case 'note':
            if (this.options.prompt_text) {
              return this.options.prompt_text(element.getAttribute('data-sharinpix-note-text'), function(input) {
                if (input !== '') {
                  return element.setAttribute('data-sharinpix-note-text', input);
                }
              });
            }
        }
      },
      end: function() {},
      cancel: function() {}
    });
  }

  setSize(size) {
    return this.options.size = size;
  }

  setTool(tool) {
    return this.options.tool = tool;
  }

  setColor(color) {
    var element;
    this.options.color = color;
    if (this.selected == null) {
      return;
    }
    element = this.selected.firstChild;
    if (element == null) {
      return;
    }
    DrawingUtils.style(this.selected, 'fill', color);
    DrawingUtils.style(this.selected, 'stroke', color);
  }

  delete() {
    var element;
    if (this.selected == null) {
      this.selectLast();
    }
    if (this.selected == null) {
      return;
    }
    element = this.selected;
    this.select(null);
    element.parentNode.removeChild(element);
    return this.selectLast();
  }

  selectLast() {
    if (this.selected) {
      return;
    }
    if (this.svg.lastChild != null) {
      return this.select(this.svg.lastChild);
    }
  }

  rotation_matrix() {
    var angle, matrix, referentiel;
    referentiel = new Referentiel(this.svg);
    matrix = referentiel.matrix();
    angle = -Math.atan2(-matrix[0][1], matrix[1][1]);
    return [[Math.cos(angle), -Math.sin(angle), 0], [Math.sin(angle), Math.cos(angle), 0], [0, 0, 1]];
  }

  addText(input) {
    var center, group, referentiel, size, text;
    size = Math.round(DrawingUtils.size(this.svg) * 0.05);
    referentiel = new Referentiel(this.svg);
    center = referentiel.global_to_local([window.innerWidth / 2, window.innerHeight / 2]);
    group = DrawingUtils.create_element(this.svg, 'g');
    group.setAttribute('data-sharinpix-type', 'text');
    DrawingUtils.style(group, 'fill', this.options.color);
    DrawingUtils.style(group, 'stroke', this.options.color);
    text = DrawingUtils.create_element(group, 'text', {
      'stroke-width': 0,
      'font-size': size,
      'font-family': 'sans-serif'
    });
    DrawingUtils.edit_text(text, input);
    DrawingUtils.apply_matrix(group, MatrixUtils.mult([[1, 0, center[0]], [0, 1, center[1]], [0, 0, 1]], this.rotation_matrix()));
    this._new_callback(group);
    return this.select(text);
  }

  export(options, callback) {
    var container, node, selected, svg;
    selected = this.selected;
    this.destroy();
    container = document.createElement('div');
    container.setAttribute('style', 'display: none;');
    document.body.appendChild(container);
    node = this.svg.cloneNode(true);
    container.appendChild(node);
    if (options.width) {
      node.setAttribute('width', options.width);
    }
    if (options.height) {
      node.setAttribute('height', options.height);
    }
    svg = container.innerHTML;
    document.body.removeChild(container);
    callback(svg);
    this._init();
    if (selected) {
      return this.select(selected);
    }
  }

  addImage(dataUrl, options) {
    var center, dataImg, group, height, image, referentiel, scale, width;
    dataImg = new window.Image();
    dataImg.src = image;
    width = options.width || 100;
    height = options.height || 100;
    group = DrawingUtils.create_element(this.svg, 'g');
    group.setAttribute('data-sharinpix-type', 'sticker');
    if (options.id) {
      group.setAttribute('data-sharinpix-sticker-id', options.id);
    }
    image = DrawingUtils.create_element(group, 'image', {
      x: '0',
      y: '0',
      width: width,
      height: height
    });
    image.setAttributeNS("http://www.w3.org/1999/xlink", 'xlink:href', dataUrl);
    referentiel = new Referentiel(this.svg);
    center = referentiel.global_to_local([window.innerWidth / 2, window.innerHeight / 2]);
    scale = (DrawingUtils.size(this.svg) / 8) / width;
    DrawingUtils.apply_matrix(group, MatrixUtils.mult([[scale, 0, center[0]], [0, scale, center[1]], [0, 0, 1]], this.rotation_matrix(), [[1, 0, -width / 2], [0, 1, -height / 2], [0, 0, 1]]));
    this._new_callback(group);
    return this.select(group);
  }

  destroy() {
    if (this.selected) {
      this.select(null);
    }
    DrawingUtils.style(this.svg, 'cursor', 'auto');
    if (this._transform) {
      this._transform.destroy();
    }
    return this._down.destroy();
  }

};

export { Referentiel, Drawing, MatrixUtils, Geometry };
