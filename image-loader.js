'use strict';
var EMPTY_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
var loaded = {};

function clearImageVariable (image) {
	// img.src = null; //null will download an image at currentpage/null
	image.src = EMPTY_IMAGE;//GC, http://www.fngtps.com/2010/mobile-safari-image-resource-limit-workaround/
}

function promiseMeYoullDownloadThis (src) {
	let image = new Image();
	let promise = new Promise(function (resolve, reject) {
		image.addEventListener('load', () => resolve(image));
		image.addEventListener('error', () => reject(image));
		image.src = src;

		setTimeout(function () {
			if (image.complete) {
				resolve(image);
			}
		}, 0);
	});
	promise.image = image;
	return promise;
}

export function forget (src) {
	if(loaded[src]) {
		delete loaded[src].image;
		loaded[src].then(clearImageVariable);
		delete loaded[src];
	}
}

export default function load (src, preloadOnly = false) {
	if(loaded[src]) {
		return loaded[src];
	}
	let download = promiseMeYoullDownloadThis(src);
	if (preloadOnly) {
		download.then(image => forget(image.src));
	} else {
		loaded[download.image.src] = download;
		return download;
	}
}