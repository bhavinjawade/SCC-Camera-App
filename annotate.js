'use strict';
var open = false;

var ImageAnnotations = {}
var currentImage = ""

var base_app_url = "https://d686-128-205-33-151.ngrok.io"

var items_list = []

var sample_labels = [] //["Apple", "Banana", "Mango", "Orange"]

fetch('./fruits_list_updated.txt')
  .then(response => response.text())
  .then(text => {
      console.log(text);
      var fruits = text.split('\n');
      autocomplete(document.getElementById("myInput"), fruits);
      autocomplete(document.getElementById("quantity"), ["Ounce", "Pound", "Item", "Gallon"]);

    //   for (var i=0; i < fruits.length; i++){
    //     document.getElementById("fruits_selector").innerHTML += '<option value="' + fruits[i] + '">' + fruits[i] + '</option>'
    //   }
    })
  // outputs the content of the text file

function additemfunc(){
    var item = document.getElementById("myInput").value;
    var price = document.getElementById("price").value;
    var quantity = document.getElementById("quantity").value;
    console.log(item, price, quantity)
    items_list.push([item, price, quantity])
    document.getElementById("item_tablets").innerHTML += "<div class='tablet'><div class='tabtext item'>" + item + " </div><div class='tabtext price'>&nbsp $"+ price + "</div><div class='tabtext quanity'>/" + quantity + "</div></div>"
    document.getElementById("myInput").value = "";
    document.getElementById("price").value = "";
    document.getElementById("quantity").value = "";
}
  
document.getElementById('input-file')
  .addEventListener('change', getFile)

function getFile(event) {
	const input = event.target
    if ('files' in input && input.files.length > 0) {
        readFileContent(input.files[0]).then(content => {
            var datadict = JSON.parse(content)
            localStorage.setItem("images_scc", JSON.stringify(Array.from(Object.entries(datadict))));
            latitude = datadict["gps_location"][0];
            longitude = datadict["gps_location"][1];
            localStorage.setItem("latitude",latitude);
            localStorage.setItem("longitude",longitude);  
            window.location.reload();      
        }).catch(error => console.log(error))
    }
}

function readFileContent(file) {
	const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = event => resolve(event.target.result)
    reader.onerror = error => reject(error)
    reader.readAsText(file)
  })
}

function getlocation() {
  navigator.geolocation.getCurrentPosition(setLoc);
}

function setLoc(pos) {
    console.log(pos)
    latitude = pos.coords.latitude;
    longitude = pos.coords.longitude;
}

document.getElementById("getpredbtn").addEventListener("click", function(){
    ImageAnnotations["img_"+currentImage]["location"] = {
        "latitude": latitude,
        "longitude": longitude
    }
    ImageAnnotations["img_"+currentImage]["image"] = images[currentImage][1];
    sendImages(ImageAnnotations["img_"+currentImage])
    // var price = "NA"
    // var quantity = "NA"
  });

function editItem(item){
  document.getElementById("myInput").value = item;
  document.getElementById("price").value = "";
  document.getElementById("quantity").value = "";
  document.getElementById(item).style.display = "None";
}

document.getElementById("save_btn").addEventListener("click", function(){
  var attributes = [];
  var allElements = items_list    
  for (var i = 0; i < allElements.length; i++) {
      attributes.push(allElements[i]);
  }
  console.log(attributes)

  ImageAnnotations["img_"+currentImage]["tags"] = attributes;
  ImageAnnotations["img_"+currentImage]["isfimp"] = document.getElementById("isfimp").checked;
  ImageAnnotations["img_"+currentImage]["ispa"] = document.getElementById("ispa").checked;
  ImageAnnotations["img_"+currentImage]["location"] = {
      "latitude": latitude,
      "longitude": longitude
  }

  ImageAnnotations["img_"+currentImage]["image"] = images[currentImage][1];
  ImageAnnotations["img_"+currentImage]["seq_id"] = currentImage
  sendImagesAndAnnotations(ImageAnnotations["img_"+currentImage])
});


document.getElementById("icon_exp").addEventListener("click", function(){
    if (!open){
        document.getElementById("label_box").style.height="83%";
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
var longitude = localStorage.getItem("longitude");
var latitude = localStorage.getItem("latitude");

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
            // stage.on('mousedown touchstart', (e) => {
            //     // do nothing if we mousedown on any shape
            //     if (e.target !== stage) {
            //         return;
            //     }
            //     e.evt.preventDefault();
            //     x1 = stage.getPointerPosition().x;
            //     y1 = stage.getPointerPosition().y;
            //     x2 = stage.getPointerPosition().x;
            //     y2 = stage.getPointerPosition().y;

            //     selectionRectangle.visible(true);
            //     selectionRectangle.width(0);
            //     selectionRectangle.height(0);
            // });


            // stage.on('mousemove touchmove', (e) => {
            //     // do nothing if we didn't start selection
            //     if (!selectionRectangle.visible()) {
            //         return;
            //     }
            //     e.evt.preventDefault();
            //     x2 = stage.getPointerPosition().x;
            //     y2 = stage.getPointerPosition().y;

            //     selectionRectangle.setAttrs({
            //         x: Math.min(x1, x2),
            //         y: Math.min(y1, y2),
            //         width: Math.abs(x2 - x1),
            //         height: Math.abs(y2 - y1),
            //     });
            // });

            // stage.on('mouseup touchend', (e) => {
            //     // do nothing if we didn't start selection
            //     if (!selectionRectangle.visible()) {
            //         return;
            //     }
            //     e.evt.preventDefault();
            //     // update visibility in timeout, so we can check it in click event
            //     setTimeout(() => {
            //         selectionRectangle.visible(false);
            //     });

            //     var shapes = stage.find('.rect');
            //     var box = selectionRectangle.getClientRect();
            //     var selected = shapes.filter((shape) =>
            //         Konva.Util.haveIntersection(box, shape.getClientRect())
            //     );
            //     tr.nodes(selected);
            // });
            // var rect_count = 0
            // function createRect(x, y) {
            //     console.log("Inside createRect")
            //     var group = new Konva.Group({
            //         name: 'rect_btn_grp'
            //     })
            //     var rect2 = new Konva.Rect({
            //         x: x,
            //         y: y,
            //         width: 100,
            //         height: 90,
            //         fill: 'transparent',
            //         name: 'rect',
            //         draggable: true,
            //     });
            //     rect2.name('box_'+rect_count)
            //     rect_count += 1
            //     var button = new Konva.Label({
            //         x: x,
            //         y: y,
            //         opacity: 0.75,
            //     });
            //     button.add(new Konva.Tag({
            //         fill: 'white',
            //         lineJoin: 'round',
            //         shadowColor: 'white',
            //         shadowBlur: 10,
            //         shadowOffset: 10,
            //         shadowOpacity: 0.5
            //     }));
                
            //     button.add(new Konva.Text({
            //         text: 'X',
            //         fontSize: 18,
            //         padding: 5,
            //         fill: 'black'
            //     }));
            //     // layer.add(rect2);
            //     // layer.add(button); 
            //     // layer.add(tr1);                

            //     var tr1 = new Konva.Transformer();
            //     tr1.borderStrokeWidth(3);
            //     tr1.borderStroke("white")
            //     // by default select all shapes
            //     var nodelist = [rect2, button]
            //     tr1.nodes(nodelist);
            //     group.add(rect2)
            //     group.add(button)
            //     group.add(tr1)
            //     layer.add(group);
            //     button.on('click tap', function (e) {
            //         tr1.destroy();
            //         rect2.destroy();
            //         button.destroy();
            //         group.destroy();
            //         layer.draw();
            //     });
            // }

            // stage.on('dblclick dbltap', function (e) {
            //     console.log(e.target.className)
            //     // if we are selecting with rect, do nothing
            //     if (e.target.className == 'Rect') {
            //         console.log("Rectangle", e.target.attrs.name)
            //         return;
            //     }

            //     // if click on empty area - remove all selections
            //     if (e.target === stage) {
            //         console.log("Empty Area")
            //         tr.nodes([]);
            //         return;
            //     }

            //     // do nothing if clicked NOT on our rectangles

            //     if (e.target.className == 'Image') {
            //         console.log("Empty Area - not rect", e)
            //         var pos = stage.getPointerPosition();
            //         createRect(pos.x, pos.y)
            //         var all_rectangles = layer.find('.rect_btn_grp');
            //         console.log(all_rectangles)
            //         return;
            //     }
            // });
        };
    });
}

elements[0].click()

function sendImages(dataToSend){
  let headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Accept', 'application/json');
  
  headers.append('Origin',base_app_url + '/model_infer/');
  console.log(dataToSend)
  fetch(base_app_url + '/model_infer/', {
      method: 'POST',
      body: JSON.stringify(dataToSend), /* or aFile[0]*/
    }).then(response => response.json())
    .then(response => {
      sample_labels = response["data"]
      for (var i = 0; i < sample_labels.length; i++) {
        document.getElementById("pred_item_tablets").innerHTML += 
                  "<div class='pred_tablet' id = '" + sample_labels[i] + "' onclick='editItem(\"" + sample_labels[i] + "\")'> \
                      <div class='tabtext item'>" + sample_labels[i] + "</div>"
                  "</div>"
      }  
    })
}

function sendImagesAndAnnotations(dataToSend){
    let headers = new Headers();

    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('Origin',base_app_url + '/scc_server_receive/');
    console.log(dataToSend)
    var req = fetch(base_app_url + '/scc_server_receive/', {
        method: 'POST',
        body: JSON.stringify(dataToSend), /* or aFile[0]*/
        mode: 'no-cors',
        credentials: 'include',
        headers: headers
      }); // returns a promise
      
      req.then(function(response) {
        console.log(response)
        console.log("Image saved")
        document.getElementById("label_box").style.height="83%";
        document.getElementById("imgth_" + dataToSend["seq_id"]).opacity = "0.5"
        //document.getElementById("imgth_" + (dataToSend["seq_id"] + 1)).click();
        window.alert("Image and Data Saved To Server")
      }, function(error) {
        alert('Saving failed due to network error or cross domain')
      })
}





// imageObj.src = 'https://previews.123rf.com/images/posinote/posinote1711/posinote171100095/91013749-mixed-many-type-of-fruits-with-full-frame-and-vertical-photo-.jpg'

function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
            b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });

    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
  }
  
