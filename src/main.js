const imageWidth = 32;
const imageHeight = 32;

const cornerstone = require('cornerstone-core');
const containerElement = document.createElement('div');
containerElement.style.width = imageWidth + 'px';
containerElement.style.height = imageHeight + 'px';
document.body.appendChild(containerElement);
cornerstone.enable(containerElement);
const enabledElement = cornerstone.getEnabledElement(containerElement);

const context = enabledElement.canvas.getContext('2d');
context.fillStyle = '#000000';
context.fillRect(0, 0, imageWidth, imageHeight);
context.strokeStyle = 'rgba(0, 255, 0, 0.75)';
context.beginPath();
context.lineTo(10, 25);
context.lineTo(30, 25);
context.stroke();

const fs = require('fs');
const dataUrl = enabledElement.canvas.toDataURL('image/jpeg', 1);
const base64Data = dataUrl.replace(/^data:image\/(jpeg|png);base64,/, '');
fs.write('test.jpg', atob(base64Data), 'b');
