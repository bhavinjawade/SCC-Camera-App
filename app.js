function openFullscreen() {
  document.getElementById("splash").remove();
  elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
  }
}

function download(content, fileName, contentType) {
  var a = document.createElement("a");
  var file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

// Set constraints for the video stream
var constraints = { video: { facingMode: { exact: 'environment' } }, audio: false };
var track = null;
var fd = new FormData();
var base_app_url = "https://c2f6-128-205-33-32.ngrok.io"
// Define constants
function getlocation() {
  navigator.geolocation.getCurrentPosition(setLoc);
}
getlocation()

var latitude = ""
var longitude = ""
function setLoc(pos) {
  console.log(pos)
  latitude = pos.coords.latitude;
  longitude = pos.coords.longitude;
  localStorage.setItem("latitude", latitude);
  localStorage.setItem("longitude", longitude);
}

const cameraView = document.querySelector("#camera--view"),
  cameraOutput = document.querySelector("#camera--output"),
  cameraSensor = document.querySelector("#camera--sensor"),
  cameraTrigger = document.querySelector("#camera--trigger");

document.getElementById("annotate").addEventListener("click", function () {
  console.log("clicked on button");
  datadict = {}
  for (var pair of fd.entries()) {
    datadict[pair[0]] = pair[1];
  }
  localStorage.setItem("images_scc", JSON.stringify(Array.from(Object.entries(datadict))));
  window.location.href = 'annotate.html';
});

document.getElementById("saveforlater").addEventListener("click", function () {
  console.log("clicked on button");
  datadict = {}
  for (var pair of fd.entries()) {
    datadict[pair[0]] = pair[1];
  }
  datadict["gps_location"] = [localStorage.getItem("latitude"), localStorage.getItem("longitude")]
  localStorage.setItem("images_scc", JSON.stringify(Array.from(Object.entries(datadict))));
  download(JSON.stringify(datadict), "SCC_images.json", 'text/plain')
});

// Access the device camera and stream to cameraView
function cameraStart() {
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      track = stream.getTracks()[1];
      cameraView.srcObject = stream;
    })
    .catch(function (error) {
      console.error("Oops. Something is broken.", error);
    });
}
count = 0
// Start the video stream when the window loads
window.addEventListener("load", cameraStart, false);

// Take a picture when cameraTrigger is tapped
cameraTrigger.onclick = function () {
  count += 1
  cameraSensor.width = cameraView.videoWidth;
  cameraSensor.height = cameraView.videoHeight;
  cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);
  cameraOutput.src = cameraSensor.toDataURL("image/webp");
  console.log(cameraOutput.src)
  cameraOutput.classList.add("taken");
  console.log(cameraOutput);
  document.getElementById('camera--output').style.display = "block";
  fd.append('image_' + count, cameraOutput.src)
  // track.stop();
};

function sendImages() {
  let headers = new Headers();

  headers.append('Content-Type', 'application/json');
  headers.append('Accept', 'application/json');
  headers.append('Origin', base_app_url + '/model_infer/');

  var req = fetch(base_app_url + '/model_infer/', {
    method: 'POST',
    body: fd, /* or aFile[0]*/
    mode: 'no-cors',
    credentials: 'include',
    headers: headers
  }); // returns a promise

  req.then(function (response) {
    if (response.ok) {
    } else {
    }
  }, function (error) {
    console.error('failed due to network error or cross domain')
  })
}
