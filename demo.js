window.addEventListener('load', function (e) {
  var drawing = new window.Drawing.Drawing(document.querySelector('svg'), {
    prompt_text: function (placeholder, callback) {
      callback(window.prompt('Enter some text:', placeholder))
    }
  })

  drawing.setColor('#e83100')
  // drawing.addText('Super !')
  // drawing.addText('Super !');
  // drawing.addTextWithBackground('Plop !')

  var toolItems = document.querySelectorAll('.svg-tools .item')
  var toolItemClickHandler = function (e) {
    var tool = e.currentTarget.dataset.tool
    var color = e.currentTarget.dataset.color
    var edit = e.currentTarget.dataset.edit
    var devare_ = e.currentTarget.dataset.devare

    if (tool) { drawing.setTool(tool) } else if (color) { drawing.setColor(color) } else if (edit) { drawing.selectLast() } else if (devare_) { drawing.devare() }
  }

  for (var i = 0; i < toolItems.length; i++) {
    toolItems[i].addEventListener('click', toolItemClickHandler)
  }
})
