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

for(var i = 0, l = xPathResult.snapshotLength; i < l + 1; i++) {
    var textNode = xPathResult.snapshotItem(i);
    textNode.data = alphabetize(textNode.data);
}
