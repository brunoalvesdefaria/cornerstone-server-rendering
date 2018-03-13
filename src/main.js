require('./imageIdLoader.js');

const imageWidth = 256;
const imageHeight = 256;

const cornerstone = require('cornerstone-core');
const containerElement = document.createElement('div');
containerElement.style.width = imageWidth + 'px';
containerElement.style.height = imageHeight + 'px';
document.body.appendChild(containerElement);
cornerstone.enable(containerElement);
const enabledElement = cornerstone.getEnabledElement(containerElement);

// Get the canvas context
const context = enabledElement.canvas.getContext('2d');

// Write the image in the file system
const writeFile = function() {
  const fs = require('fs');
  const dataUrl = enabledElement.canvas.toDataURL('image/jpeg', 1);
  const base64Data = dataUrl.replace(/^data:image\/(jpeg|png);base64,/, '');
  fs.write('test.jpg', atob(base64Data), 'b');
};

// Draw the tool data over the image
const drawTools = function() {
  // Draw the stroke
  context.strokeStyle = 'rgba(0, 255, 0, 0.9)';
  context.beginPath();
  context.lineTo(10, 25);
  context.lineTo(200, 50);
  context.stroke();
};

// Load and draw the cornerstone image
cornerstone.loadImage('idloader://1').then(function(image) {
  cornerstone.displayImage(containerElement, image);

  setTimeout(function() {
    drawTools();
    writeFile();
    console.warn('>>>>DONE');
  }, 1000);
});
