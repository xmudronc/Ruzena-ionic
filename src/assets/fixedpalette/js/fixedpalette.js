let map = new Map();
let palette = [];
let img;
let imgRes = new Image();
imgRes.onload = function() {
    processImg(imgRes);
};

var q = new RgbQuant({
	colors: 10,
	method: 2,
	initColors: 4096,
	minHueCols: 2048,
	dithKern: 'Atkinson',
	dithSerp: true,
	palette: palette 
});

var fun = function (palette, img) {
    return new Promise((resolve, reject) => {
        q = new RgbQuant({
            colors: 10,
            method: 2,
            initColors: 4096,
            minHueCols: 2048,
            dithKern: 'Atkinson',
            dithSerp: true,
            palette: palette 
        }); 
        createImage(img);
    });
}

function createImage(src) { console.log('createImage');
    img = new Image();
    img.onload = imageLoaded(src);
    img.src = src;
}

function imageLoaded(src) { console.log('imageLoaded');

let tmp=document.createElement("img");
tmp.src=src;
document.body.appendChild(tmp);

    var canvas = document.getElementById("canvas");
    canvas.width = 500;//tmp.width;
    canvas.height = 500;//tmp.height; console.log(canvas);
    var ctx = canvas.getContext("2d");
    var MAX_WIDTH = 400;
    var MAX_HEIGHT = 400;
    var width = 500;//tmp.width;
    var height = 500;//tmp.height; console.log(tmp.width);

    if (width > height) {
        if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
        }
    } else {
        if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
        }
    }
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);
    //imgRes.src = ctx.canvas.toDataURL(img, 'image/jpeg', 0);
    console.log(ctx.canvas.toDataURL(img, 'image/jpeg', 0));
}

function processImg(img) { console.log('processImg');
    console.time("quant");
    q.sample(img);
    var pal = q.palette();
    var reduced = q.reduce(img);
    console.timeEnd("quant");
    putPixels(reduced, img.naturalWidth, img.naturalHeight);

    document.body.appendChild(document.createElement("br"));
    putPixels(pal, 8, 8, "pal_final");
}

function putPixels(subpxArr, width, height, id) { console.log('putPixels');
    var can = document.createElement("canvas");
    id && can.setAttribute("id", id);
    can.width = width;
    can.height = height;
    var ctx = can.getContext("2d");
    var imgd = ctx.createImageData(can.width,can.height);
    imgd.data.set(subpxArr);
    ctx.putImageData(imgd,0,0);
    document.body.appendChild(can);
}

function processData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');

    for (var i=1; i<allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        if (data.length == headers.length) {

            let obj = {
                anchor: undefined,
                dmc: undefined,
                hex: undefined,
                name: undefined
            };
            for (var j=0; j<headers.length; j++) {
                obj.anchor = data[0];
                obj.dmc = data[1];
                obj.hex = data[2];
                obj.name = data[3];
            }
            let key = hexToRgb(obj.hex);
            palette.push(key);
            map.set(key, obj);
        }
    } console.log(map);
}

function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
}

export { q, fun };