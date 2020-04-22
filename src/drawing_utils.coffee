import { Referentiel } from "./referentiel.coffee"
import { Geometry } from "./geometry.coffee"

DrawingUtils = {
  apply_matrix: (element, m)->
    DrawingUtils.style(
      element,
      'transform',
      "matrix(#{[m[0][0], m[1][0], m[0][1], m[1][1], m[0][2], m[1][2]].join(', ')})"
    )
  style: (element, key, value)->
    if key == 'transform'
      element.setAttribute('transform', value)
    else
      element.style[key] = value
    true
  remove: (element)->
    element.parentNode.removeChild(element)
  size: (element)->
    referentiel = new Referentiel(element)
    center = referentiel.global_to_local([window.innerWidth/2, window.innerHeight/2])
    top = referentiel.global_to_local([0, 0])
    Geometry.distance(center, top)
  create_element: (parent, name, attributes = {})->
    element = document.createElementNS("http://www.w3.org/2000/svg", name)
    for key, value of attributes
      element.setAttribute(key, value)
    parent.appendChild(element)
    element
  edit_text: (element, input)->
    element.innerHTML = ''
    for line in input.split("\n")
      line = ' ' if line == ''
      DrawingUtils.create_element(
        element,
        'tspan',
        {
          dy: '1.2em',
          x: '0'
        }
      ).textContent = line
    bbox = element.getBBox()
    element.childNodes[0].setAttribute('y', -bbox.height/2)
    for child in element.childNodes
      child.setAttribute('x', -bbox.width/2)
}

export { DrawingUtils }
