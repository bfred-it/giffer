'use strict';
import PixelStream from 'pixel-stream';
import through2 from 'through2';

let logBuffer = through2(function (input, enc, done) {
	console.log('canvas stream', input);
	done(null, input);
});

export default function	() {
	let pixels = new PixelStream();

	let outstream = through2({ objectMode: true }, function (canvas, encoding, done) {
		console.log('%cgot canvas','background: orange', canvas.url);
		/*
		canvas: {
			width: playground.canvas.width,
			height: playground.canvas.height,
			data: playground.getImageData(0, 0, playground.canvas.width, playground.canvas.height).data
		}
		*/

		if (!pixels._emitFormat) {
			pixels.emit('format', {
				width: canvas.width,
				height: canvas.height,
			});
			pixels._emitFormat = true;
		}

		pixels.emit('frame', {
			delay: 1000,
			transparentColor: null,
			x: 0,
			y: 0,
			width: canvas.width,
			height: canvas.width,
		});
		console.time('hello')
		pixels.push(new Buffer(canvas.data));
		console.timeEnd('hello')

		done();
	});
	// pixels.on('data', (a) => console.log(a));

	// http://stackoverflow.com/a/26978048/288906
	outstream._pipe = outstream.pipe;
	outstream.pipe = function(destination, options) {
		return pixels.pipe(destination, options);
	};

	return outstream;
}