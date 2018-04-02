global.Promise = require('es6-promise');

const imageWidth = 512;
const imageHeight = 512;

const cornerstone = require('cornerstone-core');
const cornerstoneTools = require('cornerstone-tools');

const element = document.createElement('div');
element.style.width = imageWidth + 'px';
element.style.height = imageHeight + 'px';
document.body.appendChild(element);
cornerstone.enable(element, { renderer: 'canvas' });
const enabledElement = cornerstone.getEnabledElement(element);

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
        // element.removeEventListener('cornerstoneimagerendered', writeFileHandler);
        writeFile();
        console.log('=> Image successfully generated');
    };

    element.addEventListener('cornerstoneimagerendered', writeFileHandler);
};

// Get the canvas context
const context = enabledElement.canvas.getContext('2d');

// Write the image in the file system
const writeFile = function() {
    const fs = require('fs');
    const dataUrl = enabledElement.canvas.toDataURL('image/jpeg', 1);
    const base64Data = dataUrl.replace(/^data:image\/(jpeg|png);base64,/, '');
    console.warn('>>>>BASE64', base64Data);
    fs.write('test.jpg', atob(base64Data), 'b');
};

const cornerstoneWebImageLoader = require('cornerstone-web-image-loader');
cornerstoneWebImageLoader.external.cornerstone = cornerstone;

cornerstoneWebImageLoader.configure({
    beforeSend: function(xhr) {
        // Add custom headers here (e.g. auth tokens)
        //xhr.setRequestHeader('x-auth-token', 'my auth token');
    }
});

const url = 'https://rawgit.com/cornerstonejs/cornerstoneWebImageLoader/master/examples/Renal_Cell_Carcinoma.jpg';

// image enable the dicomImage element and activate a few tools
cornerstone.enable(element);
cornerstone.loadImage(url).then(function(image) {
    cornerstone.displayImage(element, image);
    element.addEventListener('cornerstoneimagerendered', imageLoadCallback);
});
