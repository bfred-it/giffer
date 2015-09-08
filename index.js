'use strict';
import load, {forget as forgetImage} from './image-loader.js';
import {getCanvas} from './canvas-utils.js';
import GIF from 'animated_gif';
// import {Readable, Writable} from 'stream';
import streamArray from 'stream-array';
import through2 from 'through2';
import GIFEncoder from 'gif-stream/encoder';
import neuquant from 'neuquant';
import CanvasStream from './canvas-stream.js';
import blobStream from 'blob-stream';

const workerPath = 'worker.min.js';

function makeGif ([base, overlays]) {
	var gif = new GIF({
	  width: 507,
	  height: 507,
	  workerPath: workerPath,
	  numWorkers: 2
	});
	gif.setDelay(0.001);


	overlays.forEach(img => {
		gif.addFrame(playground.el);
	});
	// overlays.forEach(img => document.body.appendChild(img));

	gif.onRenderProgress(function (a) {
		document.body.innerHTML = 'frame '+Math.round(a * overlays.length) + ' of ' + overlays.length;
	});
	let startTime = Date.now();
	gif.getBlobGIF(function(blob) {
    var animatedImage = new Image();
    animatedImage.src = URL.createObjectURL(blob);
    document.body.innerHTML = 'Rendered '+overlays.length+' frames in '+(Date.now()-startTime)/1000+' seconds<br>';
    document.body.appendChild(animatedImage);
    gif.destroy();
	});
}

let playground = getCanvas(507, 507);
let base;

let downloadImage = through2({ objectMode: true }, function (url, enc, imageLoaded) {
	// console.log('downloading', url)
	load(url).then(imageLoaded.bind(null, null));
}, function () {
	console.info('downloads done!')
});

let createFrame = through2({ objectMode: true }, function (img, enc, frameCreated) {
	// console.log('creating frame for', img.src)
	playground.drawImage(base, 0, 0);
	playground.drawImage(img, 0, 0);
	forgetImage(img.src);
	frameCreated(null, {
		url: img.src,
		width: playground.canvas.width,
		height: playground.canvas.height,
		data: playground.getImageData(0, 0, playground.canvas.width, playground.canvas.height).data
	});
}, function () {
	console.info('frames created!')
});

let log = through2({ objectMode: true }, function (input, enc, done) {
	console.log('logging', input);
	done(null, input);
});

let i = 0;
let logBuffer = through2(function (input, enc, done) {
	console.log('logging', input);
	done(null, input);
});


function init (baseImage) {
	base = baseImage;
	let overlays = [];
	for(let i = 1; i <= 70; i++) {
		overlays.push('images/'+i+'.png');
	}

	// perhaps push a header/config as the first object
	streamArray(overlays)
	.pipe(downloadImage)
	.pipe(createFrame)
	.pipe(new CanvasStream())
	.pipe(new neuquant.Stream())
	.pipe(new GIFEncoder())

	.pipe(blobStream())
	.on('finish', function() {
		console.log('a')
		// get a blob
		var blob = this.toBlob();

		// or get a blob URL
		var url = this.toBlobURL();
		window.open(url);
	});
}

load('base.png').then(init);
