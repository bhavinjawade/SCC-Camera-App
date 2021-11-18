var width = window.innerWidth;
var height = window.innerHeight;

var stage = new Konva.Stage({
    container: 'container',
    width: width,
    height: height,
});

var layer = new Konva.Layer();
stage.add(layer);

var imageObj = new Image();
imageObj.onload = function () {
    var image = new Konva.Image({
        x: 0,
        y: 0,
        image: imageObj,
        width: width,
        height: height
    });
    layer.add(image)

    // add a new feature, lets add ability to draw selection rectangle
    var selectionRectangle = new Konva.Rect({
        fill: 'rgba(0,0,255,0.5)',
        visible: false,
    });
    layer.add(selectionRectangle);

    var x1, y1, x2, y2;
    stage.on('mousedown touchstart', (e) => {
        // do nothing if we mousedown on any shape
        if (e.target !== stage) {
            return;
        }
        e.evt.preventDefault();
        x1 = stage.getPointerPosition().x;
        y1 = stage.getPointerPosition().y;
        x2 = stage.getPointerPosition().x;
        y2 = stage.getPointerPosition().y;

        selectionRectangle.visible(true);
        selectionRectangle.width(0);
        selectionRectangle.height(0);
    });

    stage.on('mousemove touchmove', (e) => {
        // do nothing if we didn't start selection
        if (!selectionRectangle.visible()) {
            return;
        }
        e.evt.preventDefault();
        x2 = stage.getPointerPosition().x;
        y2 = stage.getPointerPosition().y;

        selectionRectangle.setAttrs({
            x: Math.min(x1, x2),
            y: Math.min(y1, y2),
            width: Math.abs(x2 - x1),
            height: Math.abs(y2 - y1),
        });
    });

    stage.on('mouseup touchend', (e) => {
        // do nothing if we didn't start selection
        if (!selectionRectangle.visible()) {
            return;
        }
        e.evt.preventDefault();
        // update visibility in timeout, so we can check it in click event
        setTimeout(() => {
            selectionRectangle.visible(false);
        });

        var shapes = stage.find('.rect');
        var box = selectionRectangle.getClientRect();
        var selected = shapes.filter((shape) =>
            Konva.Util.haveIntersection(box, shape.getClientRect())
        );
        tr.nodes(selected);
    });

    function createRect(x, y){
        console.log("Inside createRect")
        var rect2 = new Konva.Rect({
            x: x,
            y: y,
            width: 100,
            height: 90,
            fill: 'transparent',
            name: 'rect',
            draggable: true,
        });

        var button = new Konva.Label({
            x: x,
            y: y,
            opacity: 0.75,
          });
          button.add(new Konva.Tag({
            fill: 'white',
            lineJoin: 'round',
            shadowColor: 'white',
            shadowBlur: 10,
            shadowOffset: 10,
            shadowOpacity: 0.5
          }));
          
          button.add(new Konva.Text({
            text: 'X',
            fontSize: 18,
            padding: 5,
            fill: 'black'
          }));
          
          
          button.on('click', () => {
              alert('clicked on canvas button');
          })

        layer.add(rect2);
        layer.add(button);      

        var tr1 = new Konva.Transformer();
        tr1.borderStrokeWidth(3);
        tr1.borderStroke("white")
        layer.add(tr1);
        // by default select all shapes
        var nodelist = [rect2, button]
        tr1.nodes(nodelist);

        button.on('click tap', function (e) {
            tr1.destroy();
            rect2.destroy();
            button.destroy();
            layer.draw();
        });
    }

    // clicks should select/deselect shapes
    stage.on('click', function (e) {
        console.log(e)
        // if we are selecting with rect, do nothing
        if (selectionRectangle.visible()) {
            console.log("Rectangle")
            return;
        }

        // if click on empty area - remove all selections
        if (e.target === stage) {
            console.log("Empty Area")
            tr.nodes([]);
            return;
        }

        // do nothing if clicked NOT on our rectangles

        if (e.target.className == 'Image') {
            console.log("Empty Area - not rect", e)
            var pos = stage.getPointerPosition();
            createRect(pos.x, pos.y)
            return;
        }
    });

    stage.on('dbltap', function (e) {
        console.log(e)
        // if we are selecting with rect, do nothing
        if (selectionRectangle.visible()) {
            console.log("Rectangle")
            return;
        }

        // if click on empty area - remove all selections
        if (e.target === stage) {
            console.log("Empty Area")
            tr.nodes([]);
            return;
        }

        // do nothing if clicked NOT on our rectangles

        if (e.target.className == 'Image') {
            console.log("Empty Area - not rect", e)
            var pos = stage.getPointerPosition();
            createRect(pos.x, pos.y)
            return;
        }
    });

};
imageObj.src = 'https://previews.123rf.com/images/posinote/posinote1711/posinote171100095/91013749-mixed-many-type-of-fruits-with-full-frame-and-vertical-photo-.jpg'

