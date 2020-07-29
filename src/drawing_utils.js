
var DrawingUtils;

import {
  Referentiel
} from "referentiel";

import {
  Geometry
} from "./geometry.js";

DrawingUtils = {
  apply_matrix: function(element, m) {
    return DrawingUtils.style(element, 'transform', `matrix(${[m[0][0], m[1][0], m[0][1], m[1][1], m[0][2], m[1][2]].join(', ')})`);
  },
  style: function(element, key, value) {
    if (key === 'transform') {
      element.setAttribute('transform', value);
    } else {
      element.style[key] = value;
    }
    return true;
  },
  remove: function(element) {
    return element.parentNode.removeChild(element);
  },
  size: function(element) {
    var center, referentiel, top;
    referentiel = new Referentiel(element);
    center = referentiel.global_to_local([window.innerWidth / 2, window.innerHeight / 2]);
    top = referentiel.global_to_local([0, 0]);
    return Geometry.distance(center, top);
  },
  create_element: function(parent, name, attributes = {}) {
    var element, key, value;
    element = document.createElementNS("http://www.w3.org/2000/svg", name);
    for (key in attributes) {
      value = attributes[key];
      element.setAttribute(key, value);
    }
    parent.appendChild(element);
    return element;
  },
  edit_text: function(element, input) {
    var bbox, child, i, j, len, len1, line, ref, ref1, results;
    element.innerHTML = '';
    ref = input.split("\n");
    for (i = 0, len = ref.length; i < len; i++) {
      line = ref[i];
      if (line === '') {
        line = ' ';
      }
      DrawingUtils.create_element(element, 'tspan', {
        dy: '1.2em',
        x: '0'
      }).textContent = line;
    }
    bbox = element.getBBox();
    element.childNodes[0].setAttribute('y', -bbox.height / 2);
    ref1 = element.childNodes;
    results = [];
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      child = ref1[j];
      results.push(child.setAttribute('x', -bbox.width / 2));
    }
    return results;
  }
};

export {
  DrawingUtils
};
