var $ = window.$
var customPrompt = function (title, placeholder) {
  var input = window.prompt(title, placeholder)
  if (input === null) { return null }

  return input.replace('\n', '\n')
}
$(function () {
  var drawing = new window.Drawing.Drawing(document.getElementById('drawing'), {
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

  drawing.setColor('#e83100')
  drawing.addText('Super  asdasdas das dasd asd asd asd!', { background: true })
  drawing.addImage('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgdmlld0JveD0iMCAwIDQyNi42NjcgNDI2LjY2NyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDI2LjY2NyA0MjYuNjY3OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8cGF0aCBzdHlsZT0iZmlsbDojNkFDMjU5OyIgZD0iTTIxMy4zMzMsMEM5NS41MTgsMCwwLDk1LjUxNCwwLDIxMy4zMzNzOTUuNTE4LDIxMy4zMzMsMjEzLjMzMywyMTMuMzMzDQoJYzExNy44MjgsMCwyMTMuMzMzLTk1LjUxNCwyMTMuMzMzLTIxMy4zMzNTMzMxLjE1NywwLDIxMy4zMzMsMHogTTE3NC4xOTksMzIyLjkxOGwtOTMuOTM1LTkzLjkzMWwzMS4zMDktMzEuMzA5bDYyLjYyNiw2Mi42MjINCglsMTQwLjg5NC0xNDAuODk4bDMxLjMwOSwzMS4zMDlMMTc0LjE5OSwzMjIuOTE4eiIvPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPC9zdmc+DQo=', 426, 426)

  var menu = new window.Drawing.Menu(drawing)
  console.log('menu', menu)
})
