/*
 * Popups control object
 */

var Popups = function () {
};


/*
 * Popups.Create($el, content, options);
 * @params
 * $el - jQuery or Element, the element to have to popup created for (and therefor will appear next too)
 * content - Query, Element, or string, the content to fill the popup with. Accepts jQuery, Element, or text
 * options - object, options used in the creation of the popup
 *		align - string, 5 choices: left, right, top, bottom, center-screen
 *		class - string, adds class to popup
 *		minHeight - number, adds a min-height to the popup
 *		minWidth - number, adds a min-width to the popup
 *		offsetPercentage - number, percentage of legth/height of popup to position relative to the binding element
 *		offsetPixels - number, offsets position by given value in px, can be positive or negative. positive shifts right/down, negative shifts left/up
 *		repsonsiveAlignment - bool, 
 *		responsivePosition - bool, is set as true, will auto reposition to attempt to fix the entire popup in the current visible window
 *		showX - boolean, show the "X" close button on pop-up. This button will auto bind to remove the popup from the DOM
 *
 */
Popups.prototype.Create = function ($el, content, options) {
	var defaults = {
		align: 'free',
		className: '',
		minHeight: 0,
		minWidth: 0,
		offsetPercentage: 0,
		offsetPixels: 0,
		orientation: 'start',
		popupBuffer: 0,
		responsivePosition: false,
		showArrow: false,
		showX: false
	};
	options = $.extend(defaults, options);

	// normalize options
	if (!($el instanceof jQuery)) {
		$el = $($el);
	}

	// set options.orientation to 'start' if invalid option is choosen
	if (options.orientation != 'start' || options.orientation != 'middle' || options.orientation != 'end') { options.orientation = 'start'; }

	if (options.className != '') { options.className = ' ' + options.className; }

	var guid = Clear.prototype.guid();

	$el.attr({ 'aria-haspopup': 'true', 'aria-owns': 'popup-' + guid });

	// create popup and add to DOM
	var $popup = $([
		'<div id="popup-' + guid + '" class="popup-container' + options.className + '" style="min-width: ' + options.minWidth + 'px; min-height: ' + options.minHeight + 'px;">',
			options.showX ? '<button class="sprite popup-x" type="button"></button>' : '',
			'<div class="popup-arrow"><div class="inner-arrow"></div></div>', // pointing-left will be placed variably
		'</div>'
	].join(''));

	$popup.append(content);
	$('body').append($popup);


	// if showX, bind click to remove popup *Please Note: Removing, not hiding
	if (options.showX) {
		$popup.find('.popup-x').on('click', function () {
			$popup.remove();
		});
	}

	if (!options.showArrow) {
		$popup.find('.popup-arrow').remove();
	}


	// determine position of pop-up and arrow
	var $window = $(window);
	var $document = $(document);

	var elOffset = $el.offset();
	var elWidth = $el.outerWidth();
	var elHeight = $el.outerHeight();
	var popWidth = $popup.outerWidth();
	var popHeight = $popup.outerHeight();
	var $arrow = $popup.find('.popup-arrow');

	var posLeft = 0;
	var posTop = 0;

	var arrowClass = '';
	var arrowLeft = 0;
	var arrowTop = 0;


	// Responsive Alignment
	// run only if flag is set and if position != middle (because middle does not position the popup relative to the binding element)
	// we change the position of the pop-up based on if it will fit in the visible window of it's orientation
	// ie, if position is set to right, will the entire pop-up fit to the right of the binding element, if not, try left side
	// will try to first fit in the same plane (ie, left will try right first, while top will try bottom first)
	// will attept other plane if cannot fit in same plane, when trying other plane, first attempt will be right/bottom (respective of plane)
	// will position to middle if cannot fit in right, left, top, or bottom
	//
	if (options.responsiveAlignment == true && options.align != 'middle') {
		// declare login tests
		var willFitOnRight = function () {
			if (elOffset.left + elWidth + popWidth + options.popupBuffer > $window.width()) {
				return false;
			};
			return 'right';
		};

		var willFitOnLeft = function () {
			if (elOffset.left - popWidth - options.popupBuffer < 0) {
				return false;
			};
			return 'left';
		};

		var willFitOnBottom = function () {
			if (elOffset.top + elHeight + popHeight + options.popupBuffer > $document.scrollTop() + $window.height()) {
				return false;
			}
			return 'bottom';
		};

		var willFitOnTop = function () {
			if (elOffset.top - popHeight - options.popupBuffer < $document.scrollTop()) {
				return false;
			}
			return 'top';
		};

		// define the order to test based on position set
		// if options.position was incorrectly set, the code below will re-set options.position = 'middle'
		// also if you know a better way to go about this, let me know --Harris
		var testOrder = [];
		if (options.align == 'right') {
			testOrder = [willFitOnRight, willFitOnLeft, willFitOnBottom, willFitOnTop];
		}
		else if (options.align == 'left') {
			testOrder = [willFitOnLeft, willFitOnRight, willFitOnBottom, willFitOnTop];
		}
		else if (options.align == 'bottom') {
			testOrder = [willFitOnBottom, willFitOnTop, willFitOnRight, willFitOnLeft];
		}
		else if (options.align == 'top') {
			testOrder = [willFitOnTop, willFitOnBottom, willFitOnRight, willFitOnLeft];
		}

		// run the tests
		var newAlign = false;
		for (var i = 0; i < testOrder.length; i++) {
			newAlign = testOrder[i]();
			if (newAlign != false) {
				break;
			}
		}

		// if all tests fail, set to middle
		if (newAlign == false) {
			newAlign = 'middle';
		}

		options.align = newAlign;
	}

	// define Constraint functions
	var keepInVerticalConstraints = function () {
		// shift pop-up up if will display below bottom of window
		if (posTop + popHeight > $document.scrollTop() + $window.height()) {
			var diff = (posTop + popHeight) - ($document.scrollTop() + $window.height());
			posTop -= diff;
			arrowTop += diff;
		}

		// shift pop-up down if will display above top of window
		if (posTop < $document.scrollTop()) {
			var diff = $document.scrollTop() - posTop;
			posTop += diff
			arrowTop -= diff;
		}
	};

	var keepInHorizontalConstraints = function () {
		// shift pop-up left if will display past right edge of window (with 10px buffer)
		if (posLeft + popWidth > $window.width() - 10) {
			var diff = (posLeft + popWidth) - $window.width() - 10; // -10 give buffer zone
			posLeft -= diff;
			arrowLeft += diff;
		}

		// shift pop-up right if will display past left edge of window (with 10px buffer);
		if (posLeft < 0) {
			var diff = -posLeft + 10; // +1- give buffer zone
			posLeft += diff;
			arrowLeft -= diff;
		}
	};


	// position popup next to $el
	if (options.align == 'top') {
		var offset = (popWidth * (options.offsetPercentage * 0.01)) + options.offsetPixels;
		posLeft = elOffset.left + (elWidth / 2) - offset;
		posTop = elOffset.top - popHeight - options.popupBuffer;

		$arrow.addClass('pointing-down');
		arrowLeft = offset - ($arrow.outerWidth() / 2) - parseInt($popup.css('border-left-width'));
		arrowTop = $popup.height();

		if (options.responsivePosition) {
			keepInHorizontalConstraints();
		}
	}
	else if (options.align == 'right') {
		var offset = (popHeight * (options.offsetPercentage * 0.01)) + options.offsetPixels;

		posLeft = elOffset.left + elWidth + options.popupBuffer;
		posTop = elOffset.top + (elHeight / 2) - offset; // set top of popup to align with middle of binding element

		// add class to arrow
		// we do this now because $arrow needs to have a height/width on it to grab first to determine where to position it
		$arrow.addClass('pointing-left');

		arrowLeft = -$arrow.outerWidth();
		arrowTop = offset - ($arrow.outerHeight() / 2) - parseInt($popup.css('border-top-width')); // pop-ups borderwidth needs to be accounted for here

		if (options.responsivePosition) {
			keepInVerticalConstraints();
		}
	}
	else if (options.align == 'bottom') {
		var offset = (popWidth * (options.offsetPercentage * 0.01)) + options.offsetPixels;
		posLeft = elOffset.left + (elWidth / 2) - offset;
		posTop = elOffset.top + elHeight + options.popupBuffer;

		$arrow.addClass('pointing-up');
		arrowLeft = offset - ($arrow.outerWidth() / 2) - parseInt($popup.css('border-left-width'));
		arrowTop = -$arrow.outerHeight();

		if (options.responsivePosition) {
			keepInHorizontalConstraints();
		}
	}
	else if (options.align == 'left') {
		var offset = (popHeight * (options.offsetPercentage * 0.01)) + options.offsetPixels;
		posLeft = elOffset.left - popWidth - options.popupBuffer;
		posTop = elOffset.top + (elHeight / 2) - offset; // set top of popup to align with middle of binding element

		$arrow.addClass('pointing-right');
		arrowLeft = $popup.width(); // we use $popup.width() here instead of popWidth because popWidth includes the popup's borders
		arrowTop = offset - ($arrow.outerHeight() / 2) - parseInt($popup.css('border-top-width')); // pop-ups borderwidth needs to be accounted for here

		if (options.responsivePosition) {
			keepInVerticalConstraints();
		}
	}
	else if (options.align == 'middle') {
		posLeft = ($window.width() / 2) - (popWidth / 2);
		if (posLeft < 0) {
			posLeft = 0;
		}

		posTop = $document.scrollTop() + ($window.height() / 2) - (popHeight / 2);
		if (posTop < $document.scrollTop()) {
			posTop = $document.scrollTop();
		}
	}

	// set positioning
	$popup.css({ 'left': posLeft, 'top': posTop });
	$arrow.css({ 'left': arrowLeft, 'top': arrowTop });

	// and return $popup
	return $popup;
};



/*
 * Popups.Bubble
 * a shortcup method to a highly used customed Popup
 */
Popups.prototype.Bubble = function ($el, content, options) {
	var defaults = {
		className: '',
		popupBuffer: 20,
		offsetPercentage: 0,
		offsetPixels: 50,
		responsiveAlignment: true,
		responsivePosition: true,
		showArrow: true,
		showX: true
	};

	options = $.extend(defaults, options);
	options.className += ' bubble';

	return this.Create($el, content, options);
};



/*
 * Removes all Popups from DOM
 * purposed to be used when you only want to display one popup at a time and remove any existing ones first
 */
Popups.prototype.removeAllPopups = function () {
	$('.popup-container').remove();
};



// too remove at end of dev
// this instanciation should happen in js files that plan on using it
Popups = new Popups();