global.Promise = require('es6-promise');
require('./imageIdLoader.js');

const imageWidth = 256;
const imageHeight = 256;

const cornerstone = require('cornerstone-core');
const cornerstoneTools = require('cornerstone-tools');

const element = document.createElement('div');
element.style.width = imageWidth + 'px';
element.style.height = imageHeight + 'px';
document.body.appendChild(element);
cornerstone.enable(element);
const enabledElement = cornerstone.getEnabledElement(element);

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

    const writeFileHandler = function() {
        element.removeEventListener('cornerstoneimagerendered', writeFileHandler);
        writeFile();
        console.log('=> Image successfully generated');
    };

    element.addEventListener('cornerstoneimagerendered', writeFileHandler);
};

// Load and draw the cornerstone image
/*cornerstone.loadImage('idloader://1').then(function(image) {
    const viewport = cornerstone.getDefaultViewportForImage(element, image);


    cornerstone.displayImage(element, image, viewport);

    element.addEventListener('cornerstoneimagerendered', imageLoadCallback);
});*/