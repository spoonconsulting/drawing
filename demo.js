var $ = window.$
var customPrompt = function (title, placeholder) {
  var input = window.prompt(title, placeholder)
  if (input === null) { return null }

  return input.replace('\n', '\n')
}
$(function () {
  var drawing = new window.Drawing.Drawing(document.querySelector('svg'), {
    promptText: function (placeholder, callback) {
      callback(customPrompt('Enter some text:', placeholder))
    },
    new: function () {
      console.log('NEW ', arguments)
    },
    onChange: function () {
      console.log('Annotation changed !')
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
  drawing.addText('Super !', { background: true })
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
  })

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
