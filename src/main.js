var canvas = require('canvas');
var createCanvas = canvas.createCanvas;
var loadImage = canvas.loadImage;
var mainCanvas = createCanvas(512, 512);
global.document = {
  createElement: function (elementName) {
    return mainCanvas;
  },
};

var cornerstone = require('cornerstone-core');

var ctx = mainCanvas.getContext('2d');
ctx.strokeStyle = 'rgba(0,0,0,0.5)';
ctx.beginPath();
ctx.lineTo(50, 102);
ctx.lineTo(100, 102);
ctx.stroke();
console.warn('<img src="' + mainCanvas.toDataURL() + '" />');
