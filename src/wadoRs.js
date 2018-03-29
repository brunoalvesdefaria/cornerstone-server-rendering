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

cornerstoneWADOImageLoader.configure({
    beforeSend: function(xhr) {
        xhr.setRequestHeader('Authorization', 'orthanc:orthanc');
    }
});

cornerstoneWADOImageLoader.webWorkerManager.initialize({
    taskConfiguration: {
        decodeTask: {
            useWebWorkers: false,
            codecsPath: './lib/cornerstoneWADOImageLoaderCodecs.js'
        }
    }
});

function loadAndViewImage(imageId) {
    cornerstone.loadImage(imageId).then(function(image) {
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
        printR(image);

        console.warn('>>>>PIXEL_DATA');
        printR(image.getPixelData());

        const viewport = cornerstone.getDefaultViewportForImage(element, image);
        console.warn('>>>>Viewport');
        printR(viewport);

        cornerstone.displayImage(element, image, viewport);
        element.addEventListener('cornerstoneimagerendered', imageLoadCallback);
    }, function(error) {
        console.error(error);
    });
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
            const imageId = 'wadors:' + imageFrameURI;

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
