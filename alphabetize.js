function alphabetize(text) {
    return text.replace(/ /g,'').split("").sort(asort).join("\u200b");
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
    './/text()[normalize-space(.) != ""]',
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

function luma(pixel) {
    return ((0.299 * pixel[0]) + (0.587 * pixel[1]) + (0.114 * pixel[2])) * (pixel[3] / 256);
}

function isort(x, y) {
    a = luma(x);
    b = luma(y);
    if (a > b) { return 1; }
    if (a < b) { return -1; }
    return 0;
}

function lumanize(image) {
    var canvas = document.createElement("canvas");
    var canvasContext = canvas.getContext("2d");

    var width = image.width;
    var height = image.height;
    canvas.width = width;
    canvas.height = height;
    canvasContext.drawImage(image, 0, 0);

    var imageData = canvasContext.getImageData(0, 0, width, height);
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

var images = document.getElementsByTagName("img");
for (i = 0; i < images.length; i++) {
    var image = images[i];
    image.src = lumanize(image);
}
