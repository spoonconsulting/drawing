var $ = window.$
var L = window.L
var customPrompt = function (title, placeholder) {
  var input = window.prompt(title, placeholder)
  if (input === null) { return null }

  return input.replace('\n', '\n')
}
$(function () {
  var map = L.map($('.map')[0], { crs: L.CRS.Simple, center: [500, 500], zoom: 2, minZoom: -5 })
  var bounds = [[0, 0], [1000, 1000]]
  L.imageOverlay('https://leafletjs.com/examples/crs-simple/uqm_map_full.png', bounds, { zIndex: 0 }).addTo(map)

  // layer = L.gridLayer({bounds: bounds, tileSize: L.point(1000, 1000), zIndex: 0, maxNativeZoom: 0, minNativeZoom: 0, minZoom: -40, maxZoom: 5})
  //
  // layer.createTile = function(coords) {
  //    var tile = document.createElement('img');
  //    tile.src = 'https://leafletjs.com/examples/crs-simple/uqm_map_full.png'
  //    return tile;
  // }
  // layer.addTo(map)

  var $svg = $('<svg xmlns="http://www.w3.org/2000/svg" ' +
    'xmlns:xlink="http://www.w3.org/1999/xlink" ' +
    'version="1.1" ' +
    'xml:space="preserve"></svg>')
  $svg.attr('viewBox', '0 0 1000 1000')

  // layer = L.gridLayer({bounds: bounds, interactive: true, tileSize: L.point(1000, 1000), zIndex: 1, maxNativeZoom: 0, minNativeZoom: 0, minZoom: -40, maxZoom: 5})

  var elem = document.createElement('div')

  elem.appendChild($svg[0])
  var layer = L.svgOverlay(elem, bounds, { interactive: true, bubblingMouseEvents: false, zIndex: 1 })
  layer.addTo(map)

  var drawing = new window.Drawing.Drawing($svg[0], {
    promptText: function (placeholder, callback) {
      callback(customPrompt('Enter some text:', placeholder))
    },
    new: function () {
      console.log('NEW ', arguments)
    },
    onChange: function () {
      console.log('Annotation changed !')
      drawing.export({}, (svg) => {
        console.log('new SVG', svg)
      })
    },
    showControls: function (controls) {
      if (controls) {
        $('.svg-tools').show()
      } else {
        $('.svg-tools').hide()
      }
    }
  })

  drawing.setTool('path')
  var menu = new window.Drawing.Menu(drawing, {
    tools: ['path', 'arrow', 'double-arrow', 'line', 'circle', 'rect', 'note']
  })
  // menu.delete()

  drawing.setColor('#f0ec00')
  drawing.addText('Super !', { background: true })
  drawing.addImage('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgdmlld0JveD0iMCAwIDQyNi42NjcgNDI2LjY2NyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDI2LjY2NyA0MjYuNjY3OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8cGF0aCBzdHlsZT0iZmlsbDojNkFDMjU5OyIgZD0iTTIxMy4zMzMsMEM5NS41MTgsMCwwLDk1LjUxNCwwLDIxMy4zMzNzOTUuNTE4LDIxMy4zMzMsMjEzLjMzMywyMTMuMzMzDQoJYzExNy44MjgsMCwyMTMuMzMzLTk1LjUxNCwyMTMuMzMzLTIxMy4zMzNTMzMxLjE1NywwLDIxMy4zMzMsMHogTTE3NC4xOTksMzIyLjkxOGwtOTMuOTM1LTkzLjkzMWwzMS4zMDktMzEuMzA5bDYyLjYyNiw2Mi42MjINCglsMTQwLjg5NC0xNDAuODk4bDMxLjMwOSwzMS4zMDlMMTc0LjE5OSwzMjIuOTE4eiIvPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPC9zdmc+DQo=', 426, 426)
  // drawing.addText('Super !');

  $('body').on('click', '.svg-tools .item.tool', function () {
    $('.svg-tools .item.tool.selected').removeClass('selected')
    $(this).addClass('selected')
    drawing.setTool($(this).data('tool'))
  })
  $('body').on('click', '.svg-tools .item.color', function () {
    drawing.setColor($(this).data('color'))
  })
  $('body').on('click', '.svg-tools .item.action', function () {
    var action = $(this).data('action')
    var options = {}
    if (action === 'textWithBackground') {
      action = 'text'
      options = { background: true }
    }
    if (action === 'text') {
      drawing.addText(customPrompt('Enter some text:', ''), options)
    }
    if (action === 'delete') {
      drawing.delete()
    }
  })// */

  // var zoomable = new window.Drawing.Zoomable({
  //   element: document.getElementsByClassName('zoomable-element')[0],
  //   container: document.getElementsByClassName('zoomable')[0]
  // })

  // console.log('Zoomable initialized', zoomable)

  /* new Drawing.Viewer({
    elem: document.getElementsByClassName('viewer')[0],
    callback: (changes, positions) => {
      changes.forEach((change) => {
        $('p', change.elem).html(change.index)
        // $img = $('img', change.elem)
        // console.log $img.attr('src') + Math.round(Math.random()*9)
        // $img.attr('src', $img.attr('src') + Math.round(Math.random()*9))
      })
    },
    destroyed: (e) => {
      $(e).remove()
    }
  }) */
})
