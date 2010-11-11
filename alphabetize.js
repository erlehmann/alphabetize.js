function alphabetize(text) {
    return text.replace(/ /g,'').split('').sort(asort).join('\u200b');
    /* joining with a zero width space makes line breaks possible */
}

function asort(x, y) {
    if (x.charCodeAt(0) <= 64) {
        if (y.charCodeAt(0) <= 64) {
            if (x > y) { return 1; }
            if (x < y) { return -1; }
        }
        if (65 <= y.charCodeAt(0) <= 122) { return 1; }
        if (y.charCodeAt(0) >= 123) { return -1; }
    }
    if (y.charCodeAt(0) <= 64) {
        if (65 <= x.charCodeAt(0) <= 122) { return -1; }
        if (x.charCodeAt(0) >= 123) { return 1; }
    }
    var a = String(x).toUpperCase();
    var b = String(y).toUpperCase();
    if (a > b) { return 1; }
    if (a < b) { return -1; }   
    return 0;
}

var xPathResult = document.evaluate(
    './/text()[normalize-space(.) != '']',
    document.body,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
);

for(var i = 0, l = xPathResult.snapshotLength; i < l; i++) {
    var textNode = xPathResult.snapshotItem(i);
    if (textNode != null) {
        textNode.data = alphabetize(textNode.data);
    }
};

/* now images will be “sorted” */

function luminance(pixel) {
    return ((0.299 * pixel[0]) + (0.587 * pixel[1]) + (0.114 * pixel[2])) * (1 / pixel[3]);
}

function isort(x, y) {
    var a = luminance(x);
    var b = luminance(y);
    if (a > b) { return 1; }
    if (a < b) { return -1; }
    return 0;
}

function luminize(image) {
    var canvas = document.createElement('canvas');
    var canvasContext = canvas.getContext('2d');

    var width = image.width;
    var height = image.height;
    canvas.width = width;
    canvas.height = height;
    canvasContext.drawImage(image, 0, 0);

    try {
        var imageData = canvasContext.getImageData(0, 0, width, height);
    } catch(e) {
        /* old canvas did not get the image due to cross domain restrictions,
         * create new canvas with random image data */
        var canvas = document.createElement('canvas');
        var canvasContext = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;

        var imageData = canvasContext.createImageData(width, height);

        r = parseInt(Math.random() * 256);
        g = parseInt(Math.random() * 256);
        b = parseInt(Math.random() * 256);
        a = 256;

        for (y = 0; y < height; y++) {
            outpos = y * width * 4;
            for (x = 0; x < width; x++) {
                if (Math.random() < 0.00001) {
                    r = parseInt(Math.random() * 256);
                    g = parseInt(Math.random() * 256);
                }
                if (Math.random() < 0.00001) {
                    g = parseInt(Math.random() * 256);
                    b = parseInt(Math.random() * 256);
                }
                if (Math.random() < 0.00001) {
                    b = parseInt(Math.random() * 256);
                    r = parseInt(Math.random() * 256);
                }
                if (Math.random() < 0.001) { a = parseInt(Math.random() * 256); }
                /* rgba */
                imageData.data[outpos++] = r - 4 + parseInt(Math.random() * 4);
                imageData.data[outpos++] = g - 4 + parseInt(Math.random() * 4);
                imageData.data[outpos++] = b - 4 + parseInt(Math.random() * 4);
                imageData.data[outpos++] = a - 4 + parseInt(Math.random() * 4);
            }
        };
    }
    var imageArray = new Array(0);

    /* copy imageData to array */
    for (y = 0; y < height; y++) {
        inpos = y * width * 4;
        for (x = 0; x < width; x++) {
            var pixel = new Array(4);
            /* rgba */
            pixel[0] = imageData.data[inpos++];
            pixel[1] = imageData.data[inpos++];
            pixel[2] = imageData.data[inpos++];
            pixel[3] = imageData.data[inpos++];

            imageArray.push(pixel);
        }
    };

    imageArray = imageArray.sort(isort);

    /* copy array to imageData */
    for (y = 0; y < height; y++) {
        outpos = y * width * 4;
        for (x = 0; x < width; x++) {
            pixel = imageArray.pop();
            /* rgba */
            imageData.data[outpos++] = pixel[0];
            imageData.data[outpos++] = pixel[1];
            imageData.data[outpos++] = pixel[2];
            imageData.data[outpos++] = pixel[3];
        }
    };

    canvasContext.putImageData(imageData, 0, 0, 0, 0, imageData.width, imageData.height);
    return canvas.toDataURL();
}

/* needed so the script does not become unresponsive */
function luminizeDelayLoop() {
  if(i < images.length){
    var image = images[i];
    /* don't work on already converted images */
    if (image.src.slice(0, 5) != 'data:') {
        image.src = luminize(image);
    };
    i++;
    window.setTimeout('luminizeDelayLoop()', 100);
  }
}

var images = document.getElementsByTagName('img');
var i = 0;
luminizeDelayLoop();
