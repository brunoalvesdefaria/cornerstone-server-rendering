var jsdom = require('jsdom');
var JSDOM = jsdom.JSDOM;

// var htmlElement = require('html-element');
// global.window = htmlElement.window;
// global.document = htmlElement.document;
global.window = (new JSDOM('', { pretendToBeVisual: true })).window;
global.document = global.window.document;
global.CustomEvent = window.CustomEvent;

global.canvas = require('canvas-prebuilt');
// var createCanvas = canvas.createCanvas;
// var loadImage = canvas.loadImage;
// var mainCanvas = createCanvas(512, 512);
// global.document = {
//   createElement: function (elementName) {
//     return mainCanvas;
//   },
// };

console.warn('>>>>INIT');
var cornerstone = require('cornerstone-core');
var containerElement = document.createElement('div');
// var canvas = canvasLib.createCanvas(512, 512);
// containerElement.appendChild(canvas);

cornerstone.enable(containerElement);
var enabledElement = cornerstone.getEnabledElement(containerElement);

var ctx = enabledElement.canvas.getContext('2d');
console.warn('>>>>canvas', enabledElement.canvas);
ctx.strokeStyle = 'rgba(0,0,0,0.5)';
ctx.beginPath();
ctx.lineTo(50, 102);
ctx.lineTo(100, 102);
ctx.stroke();
console.warn('<img src="' + enabledElement.canvas.toDataURL() + '" />');
