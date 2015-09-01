'use strict';
import load, {forget as forgetImage} from './image-loader.js';
import {getCanvas} from './canvas-utils.js';
import GIF from 'animated_gif';
const workerPath = 'worker.min.js';

function makeGif ([base, overlays]) {
	let playground = getCanvas(507, 507);
	var gif = new GIF({
	  width: 507,
	  height: 507,
	  workerPath: workerPath,
	  numWorkers: 2
	});
	gif.setDelay(0.001);


	overlays.forEach(img => {
		playground.ctx.drawImage(base, 0, 0);
		playground.ctx.drawImage(img, 0, 0);
		forgetImage(img.src);
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

function init () {
	let overlays = [];
	for(let i = 1; i <= 71; i++) {
		overlays.push(load('images/'+i+'.png'));
	}
	Promise.all([
		load('base.png'),
		Promise.all(overlays)
	]).then(makeGif);
}

init();