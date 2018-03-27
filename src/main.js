global.assert = require('assert');
global.net = require('net');
global.process = require('process');
global.util = require('util');
global.util.inherits = require('inherits');
global.Worker = require('webworker').Worker;

global.Promise = require('es6-promise');

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

// WADO Image Loader
const cornerstoneWADOImageLoader = require('cornerstone-wado-image-loader');
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.webWorkerManager.initialize({
  useWebWorkers: false,
  webWorkerPath: './lib/cornerstoneWADOImageLoaderWebWorker.js',
  taskConfiguration: {
    decodeTask: {
      codecsPath: './lib/cornerstoneWADOImageLoaderCodecs.js'
    }
  }
});

cornerstoneWADOImageLoader.configure({
  beforeSend: function(xhr) {
    console.warn('>>>>BEFORE_SEND');
    xhr.setRequestHeader('Authorization', 'orthanc:orthanc');
  }
});
//
// // Load and draw the cornerstone image
// console.warn('>>>>BEFORE');
// cornerstone.loadImage('wadors:https://rawgit.com/cornerstonejs/cornerstoneWADOImageLoader/master/testImages/wadors/CTImageEvenAligned.dat').then(function(image) {
//   console.warn('>>>>AAA');
//   cornerstone.displayImage(element, image);
//
//   element.addEventListener('cornerstoneimagerendered', imageLoadCallback);
// });

function loadAndViewImage(imageId) {
    console.warn('>>>>loadImage', imageId);
    const promise = cornerstone.loadImage(imageId).then(function(image) {
        console.log(image);
        const viewport = cornerstone.getDefaultViewportForImage(element, image);
        cornerstone.displayImage(element, image, viewport);
        imageLoadCallback();
    }, function(error) {
        console.error(error);
    });
    console.warn('>>>>isPromise', promise instanceof Promise);
}

function getImageFrameURI(metadataURI, metadata) {
    // Use the BulkDataURI if present int the metadata
    if(metadata['7FE00010'] && metadata['7FE00010'].BulkDataURI) {
        return metadata['7FE00010'].BulkDataURI;
    }

    // fall back to using frame #1
    return metadataURI + '/frames/1';
}

function downloadAndView() {
    const url = 'https://raw.githubusercontent.com/cornerstonejs/cornerstoneWADOImageLoader/master/testImages/wadors';
    const metadataURI = url + '/metadata';

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Make sure it's a JSON document
            data = JSON.parse(this.responseText);

            const metadata = data[0];
            // const imageFrameURI = getImageFrameURI(metadataURI, metadata);
            const imageFrameURI = 'https://rawgit.com/cornerstonejs/cornerstoneWADOImageLoader/master/testImages/wadors/CTImageEvenAligned.dat';
            const imageId = 'wadors:' + imageFrameURI

            cornerstoneWADOImageLoader.wadors.metaDataManager.add(imageId, metadata);

            // image enable the dicomImage element and activate a few tools
            loadAndViewImage(imageId);
        }
    };

    xhr.open('GET', metadataURI, true);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.send();
}

downloadAndView();

// https://github.com/cornerstonejs/cornerstoneWADOImageLoader/blob/1498ba391d690794d37da83e135b93ac4350fd33/src/imageLoader/decodeImageFrame.js#L3
// https://github.com/cornerstonejs/cornerstoneWADOImageLoader/blob/eab9926e6120afeb0a7092a77aced7187cd05aba/src/imageLoader/webWorkerManager.js#L235
// https://github.com/cornerstonejs/cornerstoneWADOImageLoader/blob/eab9926e6120afeb0a7092a77aced7187cd05aba/src/imageLoader/webWorkerManager.js#L71
