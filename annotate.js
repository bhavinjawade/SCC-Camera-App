'use strict';
var open = false;

var ImageAnnotations = {}
var currentImage = ""

fetch('./fruits.txt')
  .then(response => response.text())
  .then(text => {
      console.log(text);
      var fruits = text.split('\n');
      for (var i=0; i < fruits.length; i++){
        document.getElementById("fruits_selector").innerHTML += '<option value="' + fruits[i] + '">' + fruits[i] + '</option>'
      }
    })
  // outputs the content of the text file

document.getElementById("save_btn").addEventListener("click", function(){
    var attributes = [];
    var allElements = document.querySelectorAll(".select2-selection__choice");    
    for (var i = 0; i < allElements.length; i++) {
        if (allElements[i].getAttribute("title")) {
            attributes.push(allElements[i].getAttribute("title"));
        }
    }
    ImageAnnotations["img_"+currentImage]["tags"] = attributes;
    ImageAnnotations["img_"+currentImage]["image"] = images[currentImage][1];
    sendImages(ImageAnnotations["img_"+currentImage])
});

document.getElementById("icon_exp").addEventListener("click", function(){
    if (!open){
        document.getElementById("label_box").style.height="32%";
        document.getElementById("label_box").style.opacity=1;
        document.getElementById("arrowoicon").style.transform="rotate(180deg)";    
        open = true;
    }else {
        document.getElementById("label_box").style.height="8%";
        document.getElementById("label_box").style.opacity=1;
        document.getElementById("arrowoicon").style.transform="rotate(360deg)";    
        open = false;
    }
});

$(document).ready(function() {
    $('.js-example-basic-multiple').select2();
});

var images = localStorage.getItem("images_scc");
images = JSON.parse(images);
console.log(images)
var width = window.innerWidth;
var height = window.innerHeight;

var imghtml = ""
i = 0
for (const item of images) {
    imghtml += '<img class="imgthumb" id="imgth_' +i + '" src="' + item[1] + ' "/>'
    i += 1;
}

document.getElementById("img_thumbnails").innerHTML = imghtml;

function changeImage(evt){
    var thumbnails = document.getElementsByClassName("imgthumb");
    for (var i = 0; i < thumbnails.length; i++ ) {
        thumbnails[i].style.width = "50px";
        thumbnails[i].style.height = "50px";
    }
    document.getElementById("container").innerHTML = ""
    evt.currentTarget.style.width = "55px";
    evt.currentTarget.style.height = "55px";
}

var elements = document.getElementsByClassName("imgthumb");
for (var i = 0; i < elements.length; i++) {
    elements[i].data_id = i;
    elements[i].addEventListener('click', function (evt) {
        currentImage = evt.currentTarget.data_id;
        ImageAnnotations["img_" + evt.currentTarget.data_id] = {image_id: evt.currentTarget.data_id}
        console.log(ImageAnnotations)
        changeImage(evt)
        var imageObj = new Image();
        imageObj.src = evt.srcElement.currentSrc;
        console.log(imageObj.width, imageObj.height, evt.currentTarget.data_id);
        var stage = new Konva.Stage({
            container: 'container',
            width: width,
            height: (imageObj.height / imageObj.width) * width,
        });

        var layer = new Konva.Layer();
        stage.add(layer);


        imageObj.onload = function () {
            var image = new Konva.Image({
                x: 0,
                y: 0,
                image: imageObj,
                width: width,
                height: (imageObj.height / imageObj.width) * width
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
            var rect_count = 0
            function createRect(x, y) {
                console.log("Inside createRect")
                var group = new Konva.Group({
                    name: 'rect_btn_grp'
                })
                var rect2 = new Konva.Rect({
                    x: x,
                    y: y,
                    width: 100,
                    height: 90,
                    fill: 'transparent',
                    name: 'rect',
                    draggable: true,
                });
                rect2.name('box_'+rect_count)
                rect_count += 1
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
                // layer.add(rect2);
                // layer.add(button); 
                // layer.add(tr1);                

                var tr1 = new Konva.Transformer();
                tr1.borderStrokeWidth(3);
                tr1.borderStroke("white")
                // by default select all shapes
                var nodelist = [rect2, button]
                tr1.nodes(nodelist);
                group.add(rect2)
                group.add(button)
                group.add(tr1)
                layer.add(group);
                button.on('click tap', function (e) {
                    tr1.destroy();
                    rect2.destroy();
                    button.destroy();
                    group.destroy();
                    layer.draw();
                });
            }

            stage.on('dblclick dbltap', function (e) {
                console.log(e.target.className)
                // if we are selecting with rect, do nothing
                if (e.target.className == 'Rect') {
                    console.log("Rectangle", e.target.attrs.name)
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
                    var all_rectangles = layer.find('.rect_btn_grp');
                    console.log(all_rectangles)
                    return;
                }
            });
        };
    });
}

elements[0].click()

function sendImages(dataToSend){
    let headers = new Headers();

    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('Origin','http://localhost:8080/scc_server_receive/');
    console.log(dataToSend)
    var req = fetch('http://localhost:8080/scc_server_receive/', {
        method: 'POST',
        body: JSON.stringify(dataToSend), /* or aFile[0]*/
        mode: 'no-cors',
        credentials: 'include',
        headers: headers
      }); // returns a promise
      
      req.then(function(response) {
        if (response.ok) {

        } else {
        }
      }, function(error) {
        console.error('failed due to network error or cross domain')
      })
}



// imageObj.src = 'https://previews.123rf.com/images/posinote/posinote1711/posinote171100095/91013749-mixed-many-type-of-fruits-with-full-frame-and-vertical-photo-.jpg'