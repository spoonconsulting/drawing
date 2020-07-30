var Geometry

Geometry = {
  distance: function (a, b) {
    var x, y
    if (b == null) {
      b = [0, 0]
    }
    x = a[0] - b[0]
    y = a[1] - b[1]
    return Math.sqrt(x * x + y * y)
  },
  scale: function (a, b) {
    var d1, d2
    if (a.length > 1 && b.length > 1) {
      d1 = this.distance(a[0], a[1])
      d2 = this.distance(b[0], b[1])
      return 2.0 * (d1 - d2) / (d1 + d2)
    } else {
      return 0.0
    }
  },
  translation: function (a, b) {
    if (a.length === 0 || b.length === 0) {
      return [0, 0]
    }
    if (a.length >= 2 && b.length >= 2) {
      return this.translation([this.barycentre(a)], [this.barycentre(b)])
    } else {
      return [b[0][0] - a[0][0], b[0][1] - a[0][1]]
    }
  },
  barycentre: function (points) {
    var l, len, point, x, y
    x = 0
    y = 0
    for (l = 0, len = points.length; l < len; l++) {
      point = points[l]
      x += point[0]
      y += point[1]
    }
    return [x / points.length, y / points.length]
  },
  angle: function (center, a, b) {
    var angle
    angle = Math.atan2(b[1] - center[1], b[0] - center[0]) - Math.atan2(a[1] - center[1], a[0] - center[0])
    return (angle + Math.PI * 2) % (2 * Math.PI)
  },
  translation_matrix: function (v) {
    return [[1, 0, v[0]], [0, 1, v[1]], [0, 0, 1]]
  },
  rotation_matrix: function (angle) {
    return [[Math.cos(angle), -Math.sin(angle), 0], [Math.sin(angle), Math.cos(angle), 0], [0, 0, 1]]
  },
  multiply_matrix: function () {
    var a, b, i, j, k, l, m, n, others, res;
    [a, b, ...others] = arguments
    res = []
    for (i = l = 0; l < 3; i = ++l) {
      res[i] = []
      for (j = m = 0; m < 3; j = ++m) {
        res[i][j] = 0.0
        for (k = n = 0; n < 3; k = ++n) {
          res[i][j] += a[i][k] * b[k][j]
        }
      }
    }
    if (others.length > 0) {
      return Geometry.multiply_matrix(res, ...others)
    } else {
      return res
    }
  }
}

export {
  Geometry
}
