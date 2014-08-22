//@BANNER

+function ($, document, window) {

	"use strict";

	// globally used variables
	var i,
		$window = $(window),
		$document = $(document),
		$body = $(document.body),

		transitionSupport,

		guid = 0,

		// regex to match offset
		// accepts: "25", "+25", "-25", "25px", "25%", "+25%", "-25%", "25%+50", "25%-50", "25%-50px"
		// for "50%-25px", exec gives ["50%-25px", "50%", "-25"]
		// point is to grab the separate percent and pixel value off the submitted input
		rPctPxComboMatch = /^(?:\+?(\-?\d+(?:\.\d+)?%))?(?:\+?(\-?\d+(?:\.\d+)?)(?:px)?)?$/,

		// this strips the px off a valid pixel input
		// accepts: "25" or "25px"
		// exec[1] will give 25 for the above cases
		rPxMatch = /^(\d*(?:\.\d+)?)(?:px)?$/,

		// placement options
		rPlacementOptions = /top|bottom|right|left|middle|free/,

		// positions for horizontal fit
		rHorizontal = /top|bottom|middle/,

		// positions for vertical fit
		rVertical = /right|left|middle/,

		// collision flip
		rFlip = /flip/,

		// collision fit
		rFit = /fit/;
	

	// define Popup
	var Popup = function ($el, options) {
		var that = this,
			o = options,
			$popup;

		this.options = o;
		this.$el = $el;
		this.isShowing = false;

		this.guid = "popup" + (++guid);

		// set animate is lack of support
		!transitionSupport && (o.animate = false);

		// normalize o.placement
		typeof o.placement !== 'string' && (o.placement = 'free');
		o.placement = o.placement.toLowerCase();
		!rPlacementOptions.test(o.placement) && (o.placement = 'free');
		this.placement = o.placement;

		// set $anchor and calculate Boundary
		this.$anchor = $(o.anchor);
		this.boundary = calculateBoundary.call(this);

		// create popup container
		this.$popupContainer = $('<div class="popup-container">').addClass(o.classes);
		o.showArrow && this.$popupContainer.addClass('show-arrow');

		// if no custom templates, use default
		o.closeTemplate = o.closeTemplate || '<button class="popup-close" type="button"></button>';
		o.arrowTemplate = o.arrowTemplate || '<div class="popup-arrow"><div class="inner-arrow"></div></div>';

		// create close and arrow if needed
		this.$closeButton = o.showClose ? $(o.closeTemplate).appendTo(this.$popupContainer) : null;
		this.$arrow = o.showArrow ? $(o.arrowTemplate).appendTo(this.$popupContainer) : null;

		// if showClose, bind click event
		this.$closeButton && this.$closeButton.on('click', $.proxy(this.hide, this));

		// if o.container, move $el to that container
		// else if $el is not already a child of document.body, add it
		if (o.container) {
			$(o.container).append($el);
		}
		else if (!$.contains(document.body, $el.get(0))) {
			$body.append($el);
		}

		// move $el into $popup and place $popup where $el used to be
		// always hide here, if o.autoShow, popup will open below
		$el.after(this.$popupContainer);
		this.$popupContainer.append($el).hide();

		// add visibility hidden when o.animate == true
		o.animate && this.$popupContainer.css('visibility', 'hidden');

		// if anchor, save ref of popup
		this.$anchor && this.$anchor.data('popup-ref', this.$el);

		// position on window resize
		$window.on('resize.' + this.guid, $.proxy(this.position, this));

		// trigger create event
		$el.trigger('create.popup');

		// finally, if autoShow, open!
		o.autoShow && this.show();
	};

	Popup.prototype.position = function() {

		// no point in positioning if we're not showing
		if (!this.isShowing) { return; }

		var placement = this.placement,
			o = this.options,
			offset = calculatePctPxValue.call(this, this.$popupContainer, this.options.offset),
			elWidth = this.$popupContainer[0].offsetWidth,
			elHeight = this.$popupContainer[0].offsetHeight,
			atPos = getPosition(this.$anchor),
			atPoint = calculatePctPxValue.call(this, o.anchor, o.anchorPoint),
			elPos = { top: null, left: null },
			boundary = this.boundary;

		// figure out the correct placement for determining collision "flip"
		// if placement is free or middle, we don't do collision detection
		if (placement !== 'free' && placement !== 'middle' && rFlip.test(o.collision)) {
			var testOrder = [],
				newPlacement = false,

			// define flip tests
			willFitOnRight = function() {
				if (atPos.left + atPos.width + elWidth > $window.width() - boundary.right) {
					return false;
				}
				return 'right';
			},

			willFitOnLeft = function() {
				if (atPos.left - elWidth < boundary.left) {
					return false;
				}
				return 'left';
			},

			willFitOnBottom = function() {
				if (atPos.top + atPos.height + elHeight > $document.scrollTop() + $window.height() - boundary.bottom) {
					return false;
				}
				return 'bottom';
			},

			willFitOnTop = function() {
				if (atPos.top - elHeight < $document.scrollTop() + boundary.top) {
					return false;
				}
				return 'top';
			};

			// determine test order
			switch (placement) {
				case 'right':
					testOrder = [willFitOnRight, willFitOnLeft];
					break;
				case 'left':
					testOrder = [willFitOnLeft, willFitOnRight];
					break;
				case 'bottom':
					testOrder = [willFitOnBottom, willFitOnTop];
					break;
				case 'top':
					testOrder = [willFitOnTop, willFitOnBottom];
					break;
			}

			//run tests
			for (i = 0; i < testOrder.length; i++) {
				newPlacement = testOrder[i]();
				if (newPlacement !== false) {
					break;
				}
			}

			// if all tests fail, set to middle
			newPlacement === false && (newPlacement = 'middle');

			// set display position
			placement = newPlacement;
		}


		// add class to popup for styling (first remove all possible classes)
		this.$popupContainer.removeClass('top bottom right left middle free').addClass(placement);


		switch (placement) {
			case 'top':
				elPos = { top: atPos.top - elHeight - parseFloat(this.$popupContainer.css('margin-bottom')), left: atPos.left + atPoint - offset};
				break;
			case 'bottom':
				elPos = { top: atPos.top + atPos.height + parseFloat(this.$popupContainer.css('margin-top')), left: atPos.left + atPoint - offset };
				break;
			case 'right':
				elPos = { top: atPos.top + atPoint - offset, left: atPos.left + atPos.width + parseFloat(this.$popupContainer.css('margin-left')) };
				break;
			case 'left':
				elPos = { top: atPos.top + atPoint - offset, left: atPos.left - elWidth - parseFloat(this.$popupContainer.css('margin-right')) };
				break;
			case 'middle':
				elPos = { top: $document.scrollTop() + $window.height()/2 - elHeight/2, left: $window.width()/2 - elWidth/2 };
				break;
			default:
				// if placement is == to something other than what is in the switch statement,
				// it is considered "free" and is left with the null vals
				placement = 'free';
		}

		// reposition the popup along the opposite axis of how it's positioned
		// ie: if position is right or left, reposition along the virtical axis
		// if the popup excedes the limit of the window
		// don't do if placement == free
		// always do for middle along BOTH axes
		// and of course if the collision flag contains 'fit' for all other situations
		if (rFit.test(o.collision)) {
			var adj; //the adjustment to be made

			// fit in horizontal axis
			if (rHorizontal.test(placement)) {
				// shift popup to the left
				if (elPos.left + elWidth > $window.width() - boundary.right) {
					adj = (elPos.left + elWidth) - ($window.width() - boundary.right);
					elPos.left -= adj;
					offset += adj;
				}

				// shift popup to the 
				// always do this incase the shift left pushed popup beyond window right edge
				if (elPos.left < boundary.left) {
					adj = (-elPos.left + boundary.left);
					elPos.left += adj;
					offset -= adj;
				}
			}

			// fit in vertical axis
			if (rVertical.test(placement)) {
				// shift popup up
				if (elPos.top + elHeight > $document.scrollTop() + $window.height() - boundary.bottom) {
					adj = (elPos.top + elHeight) - ($document.scrollTop() + $window.height() - boundary.bottom);
					elPos.top -= adj;
					offset += adj;
				}

				// shift popup down
				// again, always do this incase the shift up pushed popup beyond the window top edge
				if (elPos.top < $document.scrollTop() + boundary.top) {
					adj = (($document.scrollTop() - elPos.top) + boundary.top);
					elPos.top += adj;
					offset -= adj;
				}
			}
		}
		
		// position popup, $.fn.offset will correctly position the popup at the coords passed in regardless of which of it's parent
		// elements is the first to have a position of absolute/relative/fixed
		this.$popupContainer.offset(elPos);

		// position arrow, arrow also has point at middle of $anchor
		if (o.showArrow) {
			var $arrow = this.$arrow,
				arrPos = { top: null, left: null },
				popupBorderTop = parseFloat(this.$popupContainer.css('border-top-width')),
				popupBorderLeft = parseFloat(this.$popupContainer.css('border-left-width'));

			// first, clear previous position
			$arrow.css({ left: '', right: '', top: '', bottom: '' });
			
			// then place the arrow in the correct position
			// back out the arrow position to consider it's starting point to be at the border and not the padding
			// arrow will not be placed if placement is middle or free
			switch (placement) {
				case 'top':
					arrPos = { bottom: -$arrow.outerHeight(), left: -$arrow.outerWidth()/2 + offset - popupBorderLeft }; break;
				case 'bottom':
					arrPos = { top: -$arrow.outerHeight(), left: -$arrow.outerWidth()/2 + offset - popupBorderLeft }; break;
				case 'right':
					arrPos = { top: -$arrow.outerHeight()/2 + offset - popupBorderTop, left: -$arrow.outerWidth() }; break;
				case 'left':
					arrPos = { top: -$arrow.outerHeight()/2 + offset - popupBorderTop, right: -$arrow.outerWidth() }; break;
			}

			$arrow.css(arrPos);
		}

		this.$el.trigger('positioned.popup');

		return placement;
	};

	// consider: rename to 'show'
	Popup.prototype.show = function() {
		var that = this;

		if (this.isShowing) { return; }
		this.isShowing = true;
		this.$el.trigger('show.popup');
		this.$popupContainer.show();
		this.position();

		if (this.options.animate) {
			// delays and queues are to defeat race conditions
			this.$popupContainer
				.addClass('ani-start')
				.css('visibility', "visible")
				.delay(30)
				.queue(function(next) { that.$popupContainer.addClass('ani-show'); next(); })
				.delay(30)
				.queue(function(next) {
					that.$popupContainer.removeClass('ani-start');

					// because the transitionEnd event fires for every transition, we don't listen to the transitionEnd event
					// it's reliable enough to just measure what the total transition time is and do a setTimeout
					window.setTimeout(function() {
						that.$popupContainer.removeClass('ani-show');
						finishShow();
					}, getTotalTransitionTime(that.$popupContainer));

					next();
				});
		}
		else {
			finishShow();
		}

		function finishShow() {
			that.$popupContainer.addClass('showing');
			that.$el.trigger('shown.popup');
		}
	};

	// consider: rename to 'hide'
	Popup.prototype.hide = function() {
		var that = this;
		// if jqXHR was initially passed, and the jqXHR has not yet been resolved, we want to abort the XHR call
		// we want to always destroy in this case, since we will need to re-call the ajax if user re-opens
		if (this.options.jqXHR && this.options.jqXHR.state() === 'pending') {
			this.options.jqXHR.abort();
			this.destroy();
		}

		if (!this.isShowing) { return; }

		this.$el.trigger('hide.popup');
		this.$popupContainer.removeClass('showing');

		if (this.options.animate) {
			// delays and queues are to defeat race conditions
			this.$popupContainer.addClass('ani-hide')
			.delay(30)
			.queue(function(next) {
				that.$popupContainer.addClass('ani-end');

				window.setTimeout(function() {
					that.$popupContainer.removeClass('ani-hide ani-end').css('visibility', 'hidden');
					finishHide();
				}, getTotalTransitionTime(that.$popupContainer));

				next();
			});				
		}
		else {
			finishHide();
		}

		function finishHide() {

			that.isShowing = false;
			that.$popupContainer.hide();
			that.$el.trigger('hidden.popup');

			if (that.options.destroyOnHide) {
				that.destroy();
			}
		}
	};


	Popup.prototype.toggle = function() {
		this.isShowing ? this.hide() : this.show();
	};


	Popup.prototype.destroy = function() {
		this.$anchor && this.$anchor.removeData('popup-ref');

		// remove events
		$window.off('resize.' + this.guid);
		this.$el.off('.popup');

		this.$el.trigger('destroy.popup');
		this.$popupContainer.remove();
	};


	Popup.prototype.setContent = function(content) {
		this.$el.empty().append(content);
		this.position();
	};


	// save reference to existing definition for no conflict
	var old = $.fn.popup;

	// define $.fn.popup
	$.fn.popup = function(option, arg) {
		
		var rtnValue;
		this.each(function() {
			var $this = $(this),
				instance = $this.data('popup');

			// "if it looks like a duck, sounds like a duck, walks like a duck"
			// test on this to see if it's an jqXHR object
			if (this.readyState && this.promise) {
				option.jqXHR = this;
				option.loadingTemplate = option.loadingTemplate || '<div class="popup-inner">';
				var $html = $(option.loadingTemplate).popup(option);
				$html.popup('$popupContainer').addClass('loading');
				this.always(function(data) {
					$html.popup('$popupContainer').removeClass('loading');
				});
				// return single jquery object of newly created node with popup instanciated on it
				rtnValue = $html;
				return false;
			}
			// else if popup has not yet been instantiated
			else if (!instance) {
				option = $.extend({}, $.fn.popup.defaults, $.isPlainObject(option) && option, $this.data());
				$this.data('popup', (instance = new Popup($this, option)));
			}
			// if popup has been instantiated
			else {

				if (typeof option === 'string') {
					// if method/property exists
					if (option in instance) {
						// if function
						if ($.isFunction(instance[option])) {
							rtnValue = instance[option](arg);
						}
						// if property
						else {
							rtnValue = instance[option];
						}
					}

					// follow how jQuery gets only return the method/property value first in the collection when it's a get
					// so we want to break out of the .each here
					if (rtnValue !== undefined) {
						return false;
					}
				}
				// if nothing was passed OR the the options object was passed in again, just toggle
				// Q: why do we toggle for the options object being passed in again?
				// A: to avoid having to wrap your using .popup when you're not destroying on close
				//    i.e. just re-open it since it still exists
				else if (!option || $.isPlainObject(option)) {
					instance.toggle();
				}
				else {
					$.error('fn.popup says: Method or Property you are trying to access does not exist');
				}
			}
			// if some other invalid value was passed as options, fail silently
		});

		// return value (if it exists) or return this (for chaining)
		if (rtnValue !== undefined) {
			return rtnValue;
		}
		return this;
	};


	// create static method for popups
	// this is mostly to be used with jqXHR objects
	// since to most developers this:
	//	$.popup(jqXHR, {...});
	// makes more sense that doing this:
	//	$(jqXHR).popup({...});
	//
	$.popup = function(el, option) {
		var $el = $(el).first();

		if ($el.length === 0) {
			$.error('fn.popup says: selector returned zero results');
			return $el;
		}

		return $el.popup(option);
	};


	$.fn.popup.Constructor = Popup;

	// these are the defaults value
	// feel free to change these to your liking
	$.fn.popup.defaults = {
		animate: false,
		anchor: null,
		anchorPoint: '50%',
		arrowTemplate: null,
		autoShow: true,
		boundary: 10,
		classes: null,
		closeTempalte: null,
		collision: 'flip', // valid options are 'flip', 'fit', or 'flipfit'
		container: null,
		destroyOnHide: false,
		loadingTemplate: null,
		offset: '50%', 
		placement: 'right',
		showArrow: false, // consider: rename to 'addArrow'
		showClose: false  // consider: rename to 'addClose'
		//within: $window, // bound the popup within
	};

	/*
	 * Events:
	 * create.popup
	 * show.popup
	 * shown.popup
	 * positioned.popup
	 * hide.popup
	 * hidden.popup
	 * destroy.popup
	 *
	 */

	// popup no conflict
	$.fn.popup.noConflict = function() {
		$.fn.popup = old;
		return this;
	};

	// private functions
	// add 'px' to the end of a number value, used for css
	function addPX(value) {
		if ($.isNumeric(value)) {
			return value + 'px';
		}
		return value;
	}

	// returns .getBoundingClientRect or (if that function does not exits) a calculated version of
	function getPosition($el) {
		if (!$el || !$el[0]) {
			return { left: 0, top: 0 };
		}

		var el = $el[0];

		return $.extend({}, $.isFunction(el.getBoundingClientRect) ? el.getBoundingClientRect() : {
			width: el.offsetWidth,
			height: el.offsetHeight
		}, $el.offset());
	}

	// calculates the pixel value as given by "50%-25px" format, which is the format for o.offset and o.anchorPoint
	// $el should be $popupContainer when calculating offset, and should be o.anchor when calculating anchorPoint
	// value will be o.offset or o.anchorPoint
	function calculatePctPxValue($el, value) {
		// return 0 if el is a bad value
		if (!$el || !$el.length) { return 0;}

		var placement = this.placement,
			parsedValue = rPctPxComboMatch.exec(value),
			elWidth = $el[0].offsetWidth,
			elHeight = $el[0].offsetHeight,
			rtnValue = 0; // zero by default

		// if value of this.options.rtnValue was invalid, use the default option
		if (!parsedValue) {
			parsedValue = rPctPxComboMatch.exec('50%');
		}

		// if parsedValue has a percent value
		if (parsedValue && parsedValue[1]) {
			if (placement === 'right' || placement === 'left') {
				rtnValue = elHeight * (parseFloat(parsedValue[1]) / 100);
			}
			if (placement === 'top' || placement === 'bottom') {
				rtnValue = elWidth * (parseFloat(parsedValue[1]) / 100);
			}
		}
		// if parsedValue has a pixel value (not we need to ADD to rtnValue here, not set)
		if (parsedValue && parsedValue[2]) {
			rtnValue += parseFloat(parsedValue[2]);
		}

		// if rtnValue is unintendedly 0 at this point, that means your $.fn.popup.defaults.rtnValue is an invalid value
		return rtnValue;
	}

	// calculate boundary object
	function calculateBoundary() {
		// normalize o.boundary
		if (!this.options.boundary && this.options.boundary !== 0) { this.options.boundary = '0'; }
		if ($.isNumeric(this.options.boundary)) { this.options.boundary = this.options.boundary.toString(); }

		var parse = this.options.boundary.split(' '),
			i;

		// if the parse has incorrect length, return 0s
		if (parse.length < 1 || parse > 4) {
			return { top: 0, right: 0, bottom: 0, left: 0 };
		}

		// turn all entries into floats, if parseFloat returns NaN, set to 0
		for (i = 0; i < parse.length; i++) {
			parse[i] = parseFloat(parse[i]) || 0;
		}

		// check for all 4 cases
		switch(parse.length) {
			case 4:
				return { top: parse[0], right: parse[1], bottom: parse[2], left: parse[3] };
			case 3:
				return { top: parse[0], right: parse[1], bottom: parse[2], left: parse[1] };
			case 2:
				return { top: parse[0], right: parse[1], bottom: parse[0], left: parse[1] };
			case 1:
				return { top: parse[0], right: parse[0], bottom: parse[0], left: parse[0] };
			default:
				// impossible to reach here, but just in case
				return { top: 0, right: 0, bottom: 0, left: 0 };
		}
	}


	// animation/transition related helpers
	function getTotalTransitionTime($el) {
		var i, total, max = 0,
			duration = $el.css('transition-duration').split(', '),
			delay = $el.css('transition-delay').split(', ');

		for (i = 0; i < duration.length; i++) {
			total = parseFloat(duration[i]) + parseFloat(delay[i]);
			max = max < total ? total : max;
		}

		return max * 1000 + 30; // + 30 if max == 0, we want some kind of delay here at least
	}


	// credit to bootstrap here
	function determineTransitionSupport() {
		var el = document.createElement('popup');

		var transEndEventNames = {
			WebkitTransition: 'webkitTransitionEnd',
			OTransition: 'oTransitionEnd otransitionend',
			transition: 'transitionend'
		};

		for (var name in transEndEventNames) {
			if (el.style[name] !== undefined) {
				return { end: transEndEventNames[name] };
			}
		}

		return false;
	}

	$(function() {
		transitionSupport = determineTransitionSupport();
	});

}(jQuery, document, window);