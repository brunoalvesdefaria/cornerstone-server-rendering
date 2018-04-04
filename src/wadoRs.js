const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM(`...`);
const { document } = (new JSDOM(`...`)).window;

Object.defineProperties(window.HTMLElement.prototype, {
  offsetLeft: {
    get: function() { return parseFloat(window.getComputedStyle(this).marginLeft) || 0; }
  },
  offsetTop: {
    get: function() { return parseFloat(window.getComputedStyle(this).marginTop) || 0; }
  },
  offsetHeight: {
    get: function() { return parseFloat(window.getComputedStyle(this).height) || 0; }
  },
  offsetWidth: {
    get: function() { return parseFloat(window.getComputedStyle(this).width) || 0; }
  },
  clientHeight: {
    get: function() { return 512 }
  },
  clientWidth: {
    get: function() { return 512 }
  }
});

global.XMLHttpRequest = require('xhr2');
global.window = window;
global.document = document;
global.Worker = require('webworker-threads').Worker;

require('./imageIdLoader.js');

global.performance = require('perf_hooks').performance;

require('custom-event-polyfill');

window.requestAnimationFrame = function requestFrame (callback) {
  return window.setTimeout(callback, 1000 / 60);
}

global.window = window;
global.CustomEvent = window.CustomEvent;
global.requestAnimationFrame = window.requestAnimationFrame;
global.navigator = {
    hardwareConcurrency: 1
};

global.Promise = require('es6-promise');

const imageWidth = 512;
const imageHeight = 512;

const cornerstone = require('cornerstone-core');
const cornerstoneTools = require('cornerstone-tools');

cornerstoneTools.external.cornerstone = cornerstone;

const element = document.createElement('div');
element.style.width = imageWidth + 'px';
element.style.height = imageHeight + 'px';
document.body.appendChild(element);
cornerstone.enable(element, { renderer: 'canvas' });
const enabledElement = cornerstone.getEnabledElement(element);

// Get the canvas context
const context = enabledElement.canvas.getContext('2d');

// Write the image in the file system
const writeFile = function(enabledElement, callback) {
    const fs = require('fs');
    //console.log(enabledElement);
    const dataUrl = enabledElement.canvas.toDataURL('image/png', 1);
    console.warn('dataUrl!');
    //console.warn(dataUrl);
    const base64Data = dataUrl.replace(/^data:image\/(jpeg|png);base64,/, '');
    //console.log(base64Data);
    const buf = new Buffer(base64Data, 'base64');
    fs.writeFile('./test.jpg', buf, callback);
};

// Draw the tool data over the image
const drawTools = function() {
    const toolStates = require('./toolStates.js');

    // Draw the Length tool
    cornerstoneTools.length.enable(element);
    cornerstoneTools.length.activate(element);
    toolStates.lengthToolState.active = true;
    cornerstoneTools.addToolState(element, 'length', toolStates.lengthToolState);

    // Draw the Elliptical ROI tool
    cornerstoneTools.ellipticalRoi.enable(element);
    cornerstoneTools.ellipticalRoi.activate(element);
    toolStates.ellipticalRoiToolState.active = true;
    cornerstoneTools.addToolState(element, 'ellipticalRoi', toolStates.ellipticalRoiToolState);
};

// Define the image load callback
const imageLoadCallback = function(image) {
    element.removeEventListener('cornerstoneimagerendered', imageLoadCallback);

    drawTools();

    const writeFileHandler = function(event) {
        const eventData = event.detail;
        const enabledElement = eventData.enabledElement;

        console.log('writeFileHandler');
        element.removeEventListener('cornerstoneimagerendered', writeFileHandler);
        writeFile(enabledElement, function() {
            console.log('=> Image successfully generated');
        });
    };

    element.addEventListener('cornerstoneimagerendered', writeFileHandler);
};

// WADO Image Loader
const cornerstoneWADOImageLoader = require('cornerstone-wado-image-loader');
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;

cornerstoneWADOImageLoader.webWorkerManager.initialize({
    taskConfiguration: {
        decodeTask: {
            useWebWorkers: false,
            codecsPath: './lib/cornerstoneWADOImageLoaderCodecs.js'
        }
    }
});

function loadAndViewImage(imageId) {
    console.log(imageId)
    cornerstone.loadImage(imageId).then(function(image) {
        console.log('done downloading');

        const printR = function(obj, padding) {
            padding = padding || '';
            const currentPadding = padding + '  ';

            if (!padding) {
                console.log('{');
            }

            Object.keys(obj).forEach(function(key) {
                const item = obj[key];
                if (typeof item === 'object') {
                    console.log(currentPadding + key + ': {');
                    printR(item, currentPadding);
                } else {
                    console.log(currentPadding + key + ': ' + item);
                }
            });
            console.log(padding + '}');

            if (!padding) {
                console.log('\n');
            }
        };

        console.warn('>>>>Image');
        //printR(image);

        console.warn('>>>>PIXEL_DATA');
        const pixelData = image.getPixelData();
        console.log(pixelData.length);

        // const viewport = cornerstone.getDefaultViewportForImage(element, image);
        // console.warn('>>>>Viewport');
        // printR(viewport);

        cornerstone.displayImage(element, image/*, viewport*/);
        element.addEventListener('cornerstoneimagerendered', imageLoadCallback);
    }, function(error) {
        throw new Error(error);
        console.error(error);
    });
}

const imageId = 'dicomweb:http://rawgit.com/chafey/byozfwv/master/sampleData/1.2.840.113619.2.5.1762583153.215519.978957063.80.dcm';
//const imageId = 'dicomweb:http://localhost:8000/image.dcm';
//const imageId = 'idloader://1'

loadAndViewImage(imageId);
