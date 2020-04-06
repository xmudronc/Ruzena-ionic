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

$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "palette.csv",
        dataType: "text",
        success: function(data) {
			processData(data);
		}
     });
});

function loadImage() {
    var input, file, fr;

    if (typeof window.FileReader !== 'function') {
        write("The file API isn't supported on this browser yet.");
        return;
    }

    input = document.getElementById('imgfile');
    if (!input) {
        console.log("Um, couldn't find the imgfile element.");
    }
    else if (!input.files) {
        console.log("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0]) {
        console.log("Please select a file before clicking 'Load'");
    }
    else {
        file = input.files[0];
        fr = new FileReader();
        fr.onload = createImage;
        fr.readAsDataURL(file);
    }

    function createImage() {
        img = new Image();
        img.onload = imageLoaded;
        img.src = fr.result;
    }

    function imageLoaded() {
        var canvas = document.getElementById("canvas")
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        var MAX_WIDTH = 400;
        var MAX_HEIGHT = 400;
        var width = img.width;
        var height = img.height;

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
        imgRes.src = ctx.canvas.toDataURL(img, 'image/jpeg', 0);
    }
}

function processImg(img) {
    console.time("quant");
    q.sample(img);
    var pal = q.palette();
    var reduced = q.reduce(img);
    console.timeEnd("quant");
    putPixels(reduced, img.naturalWidth, img.naturalHeight);

    document.body.appendChild(document.createElement("br"));
    putPixels(pal, 8, 8, "pal_final");
}

function putPixels(subpxArr, width, height, id) {
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
    }
}

function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
}