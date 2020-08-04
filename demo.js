var $ = window.$
$(function () {
  var drawing = new window.Drawing.Drawing(document.querySelector('svg'), {
    promptText: function (placeholder, callback) {
      callback(window.prompt('Enter some text:', placeholder))
    }
  })

  drawing.setColor('#e83100')
  drawing.addText('Super !')
  // drawing.addText('Super !');
  // drawing.addTextWithBackground('Plop !')

  $('body').on('click', '.svg-tools .item.tool', function () {
    $('.svg-tools .item.tool.selected').removeClass('selected')
    $(this).addClass('selected')
    drawing.setTool($(this).data('tool'))
  })
  $('body').on('click', '.svg-tools .item.action', function () {
    var action = $(this).data('action')
    var options = {}
    if (action === 'textWithBackground') {
      action = 'text'
      options = { withBackground: true }
    }
    if (action === 'text') {
      drawing.addText(window.prompt('Enter some text:', ''), options)
    }
  })

  /* var viewer = new Drawing.Viewer({
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
