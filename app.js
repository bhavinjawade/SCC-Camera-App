// Set constraints for the video stream
var constraints = { video: { facingMode: {exact: 'environment'}}, audio: false };
var track = null;
var fd = new FormData();

// Define constants
const cameraView = document.querySelector("#camera--view"),
    cameraOutput = document.querySelector("#camera--output"),
    cameraSensor = document.querySelector("#camera--sensor"),
    cameraTrigger = document.querySelector("#camera--trigger");

// Access the device camera and stream to cameraView
function cameraStart() {
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function(stream) {
            track = stream.getTracks()[1];
            cameraView.srcObject = stream;
        })
        .catch(function(error) {
            console.error("Oops. Something is broken.", error);
        });
}
count = 0
// Take a picture when cameraTrigger is tapped
cameraTrigger.onclick = function() {
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

// Start the video stream when the window loads
window.addEventListener("load", cameraStart, false);

function sendImages(){
    let headers = new Headers();

    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('Origin','https://07f1-68-133-40-138.ngrok.io/scc_server_receive');

    var req = fetch('https://07f1-68-133-40-138.ngrok.io/scc_server_receive', {
        method: 'POST',
        body: fd, /* or aFile[0]*/
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
