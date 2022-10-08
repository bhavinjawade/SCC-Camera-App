var canvas = document.getElementById('camera--sensor'),
ctx = canvas.getContext('2d'),
rect = {},
drag = false,
mouseX,
mouseY,
closeEnough = 10,
dragTL = dragBL = dragTR = dragBR = false;

function init() {
canvas.addEventListener('mousedown', mouseDown, false);
canvas.addEventListener('mouseup', mouseUp, false);
canvas.addEventListener('mousemove', mouseMove, false);

rect = {
    startX: 20,
    startY: 20,
    w: 150,
    h: 100
}
}

function mouseDown(e) {
mouseX = e.pageX - this.offsetLeft;
mouseY = e.pageY - this.offsetTop;

// if there isn't a rect yet
if (rect.w === undefined) {
    rect.startX = mouseY;
    rect.startY = mouseX;
    dragBR = true;
}

// if there is, check which corner
//   (if any) was clicked
//
// 4 cases:
// 1. top left
else if (checkCloseEnough(mouseX, rect.startX) && checkCloseEnough(mouseY, rect.startY)) {
    dragTL = true;
}
// 2. top right
else if (checkCloseEnough(mouseX, rect.startX + rect.w) && checkCloseEnough(mouseY, rect.startY)) {
    dragTR = true;

}
// 3. bottom left
else if (checkCloseEnough(mouseX, rect.startX) && checkCloseEnough(mouseY, rect.startY + rect.h)) {
    dragBL = true;

}
// 4. bottom right
else if (checkCloseEnough(mouseX, rect.startX + rect.w) && checkCloseEnough(mouseY, rect.startY + rect.h)) {
    dragBR = true;

}
// (5.) none of them
else {
    // handle not resizing
}

ctx.clearRect(0, 0, canvas.width, canvas.height);
draw();

}

function checkCloseEnough(p1, p2) {
return Math.abs(p1 - p2) < closeEnough;
}

function mouseUp() {
dragTL = dragTR = dragBL = dragBR = false;
}

function mouseMove(e) {
mouseX = e.pageX - this.offsetLeft;
mouseY = e.pageY - this.offsetTop;
if (dragTL) {
    rect.w += rect.startX - mouseX;
    rect.h += rect.startY - mouseY;
    rect.startX = mouseX;
    rect.startY = mouseY;
} else if (dragTR) {
    rect.w = Math.abs(rect.startX - mouseX);
    rect.h += rect.startY - mouseY;
    rect.startY = mouseY;
} else if (dragBL) {
    rect.w += rect.startX - mouseX;
    rect.h = Math.abs(rect.startY - mouseY);
    rect.startX = mouseX;
} else if (dragBR) {
    rect.w = Math.abs(rect.startX - mouseX);
    rect.h = Math.abs(rect.startY - mouseY);
}
ctx.clearRect(0, 0, canvas.width, canvas.height);
draw();
}

function draw() {
ctx.fillStyle = "#222222";
ctx.fillRect(rect.startX, rect.startY, rect.w, rect.h);
drawHandles();
}

function drawCircle(x, y, radius) {
ctx.fillStyle = "#FF0000";
ctx.beginPath();
ctx.arc(x, y, radius, 0, 2 * Math.PI);
ctx.fill();
}

function drawHandles() {
drawCircle(rect.startX, rect.startY, closeEnough);
drawCircle(rect.startX + rect.w, rect.startY, closeEnough);
drawCircle(rect.startX + rect.w, rect.startY + rect.h, closeEnough);
drawCircle(rect.startX, rect.startY + rect.h, closeEnough);
}

init();