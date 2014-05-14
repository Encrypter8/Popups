/* jQuery Modal - v1.0.0-RC1 - 2014-05-14
 * https://github.com/harris-miller/Popups
 * Copyright (c) 2014 Harris Miller
 * Licensed MIT 
 */


+function ($, document, window) {

	"use strict";

	var cachedScrollbarWidth;


	//
	//
	// Test Change to see how gh-pages can update with rebasing
	//
	//


	// credit: jQuery UI
	function scrollbarWidth() {
		if (cachedScrollbarWidth !== undefined) {
			return cachedScrollbarWidth;
		}
		var div = $('<div style="display:block;position:absolute;width:50px;height:50px;overflow:hidden;""><div style="height:100px;width:auto;""></div></div>'),
			innerDiv = div.children()[0],
			w1, w2;

		$('body').append(div);
		w1 = innerDiv.offsetWidth;
		div.css('overflow', 'scroll');

		w2 = innerDiv.offsetWidth;

		if (w1 === w2) {
			w2 = div[0].clientWidth;
		}

		div.remove();

		cachedScrollbarWidth = w1 - w2;
		return cachedScrollbarWidth;
	}

 }(jQuery, document, window);