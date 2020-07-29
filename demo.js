window.addEventListener('load', function(e) {
  var drawing = new Drawing.Drawing(document.querySelector('svg'), {});

  drawing.setColor('#e83100');

  var toolItems = document.querySelectorAll('.svg-tools .item');
  var toolItemClickHandler = function(e) {
    var tool = e.currentTarget.dataset.tool;
    var color = e.currentTarget.dataset.color;
    var edit = e.currentTarget.dataset.edit;
    var devare_ = e.currentTarget.dataset.devare;

    if (tool)
      drawing.setTool(tool);
    else if (color)
      drawing.setColor(color);
    else if (edit)
      drawing.selectLast();
    else if (devare_)
      drawing.devare();
  }

  for (var i = 0; i < toolItems.length; i++) {
    toolItems[i].addEventListener('click', toolItemClickHandler);
  }
})
