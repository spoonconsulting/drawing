Geometry = {
  distance: (a,b)->
    b = [0, 0] unless b?
    x = a[0] - b[0]
    y = a[1] - b[1]
    Math.sqrt(x*x + y*y)
  scale: (a,b)->
    if a.length > 1 and b.length > 1
      d1 = @distance(a[0], a[1])
      d2 = @distance(b[0], b[1])
      2.0 * (d1-d2) / (d1+d2)
    else
      0.0
  translation: (a,b)->
    return [0, 0] if a.length == 0 or b.length == 0
    if a.length >=2 and b.length >= 2
      @translation([@barycentre(a)], [@barycentre(b)])
    else
      return [b[0][0] - a[0][0], b[0][1] - a[0][1]]
  barycentre: (points)->
    x = 0
    y = 0
    for point in points
      x += point[0]
      y += point[1]
    [ x / points.length, y / points.length ]
  angle: (center, a, b)->
    angle = Math.atan2(b[1] - center[1], b[0] - center[0]) \
      - Math.atan2(a[1] - center[1], a[0] - center[0])
    (angle + Math.PI * 2) % (2 * Math.PI)
  translation_matrix: (v)->
    [
      [1, 0, v[0]]
      [0, 1, v[1]]
      [0, 0, 1]
    ]
  rotation_matrix: (angle)->
    [
      [Math.cos(angle), -Math.sin(angle), 0],
      [Math.sin(angle), Math.cos(angle), 0],
      [0, 0, 1]
    ]
  multiply_matrix: ()->
    [a, b, others...] = arguments
    res = []
    for i in [0...3]
      res[i] = []
      for j in [0...3]
        res[i][j] = 0.0
        for k in [0...3]
          res[i][j] += a[i][k]*b[k][j]
    if others.length > 0
      Geometry.multiply_matrix(res, others...)
    else
      res
}

export { Geometry }