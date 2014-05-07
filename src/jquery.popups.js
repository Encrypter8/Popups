//@BANNER

+function ($, document, window) {

	//"use strict";

	// globally used variables
	var i,
		$window = $(window),
		$document = $(document),
		$body = $(document.body),

		// regex to match offset
		// accepts: "25", "+25", "-25", "25px", "25%", "+25%", "-25%", "25%+50", "25%-50", "25%-50px"
		// for "50%-25px", exec gives ["50%-25px", "50%", "-25"]
		// point is to grab the separate percent and pixel value off the submitted input
		rOffsetMatch = /^(?:\+?(\-?\d+(?:\.\d+)?%))?(?:\+?(\-?\d+(?:\.\d+)?)(?:px)?)?$/,

		// this strips the px off a valid pixel input
		// accepts: "25" or "25px"
		// exec[1] will give 25 for the above cases
		rPxMatch = /^(\d*(?:\.\d+)?)(?:px)?$/,

		// responsive placement options
		rResponsivePlacementOptions = /top|bottom|right|left/,

		// collision flip
		rFlip = /flip/,

		// collision fit
		rFit = /fit/,

		// positions for horizontal fit
		rHorizontal = /top|bottom|middle/,

		// positions for vertical fit
		rVertical = /right|left|middle/;

		// valid Event Types
		//var rValidEventTypes = /click/; // TODO: expand this list
	

	// define Popup
	var Popup = function ($el, options) {
		var that = this,
			o = options,
			$popup;

		this.options = o;
		this.$el = $el;
		this.isOpen = false;

		// handle special cases that I also what to be properties
		this.placement = o.placement.toLowerCase();
		this.$attachTo = $(o.attachTo);
		//this.$triggerEl = $(o.triggerEl); // TODO: figure out exactly what we're doing with this one
		this.boundary = calculateBoundary.call(this);

		// create popup container
		this.$popup = $('<div class="popup-container">').addClass(o.classes);
		o.showArrow && this.$popup.addClass('show-arrow');

		// create close and arrow if needed
		this.$closeButton = o.showClose ? $('<button class="popup-close" type="button"></button>').appendTo(this.$popup) : null;
		this.$arrow = o.showArrow ? $('<div class="popup-arrow"><div class="inner-arrow"></div></div>').appendTo(this.$popup) : null;

		// if showClose, bind click event
		if (this.$closeButton) {
			this.$closeButton.on('click', function() {
				that.close();
			});
		}

		// if .container, move $el to that container
		// else if $el is not already a child of document.body, add it
		if (o.container) {
			$(o.container).append($el);
		}
		else if (!$.contains(document.body, $el.get(0))) {
			$body.append($el);
		}

		// move $el into $popup and place $popup where $el used to be
		// always hide here, if o.autoOpen, popup will open below
		$el.after(this.$popup);
		this.$popup.append($el).hide();

		// if attachTo, save ref of popup
		this.$attachTo && this.$attachTo.data('popup-ref', this.$el);

		// trigger create event
		$el.trigger('create.popup');

		// finally, if autoOpen, open!
		o.autoOpen && this.open();

		//TODO
		// set triggering element with event to open/close dialog
	};

	Popup.prototype.position = function() {
		var placement = this.placement,
			o = this.options,
			offset = calculateOffset.call(this),
			elWidth = this.$popup[0].offsetWidth,
			elHeight = this.$popup[0].offsetHeight,
			atPos = getPosition(this.$attachTo),
			elPos = { top: null, left: null },
			boundary = this.boundary;

		// figure out the correct placement for determining collision "flip"
		// if placement is free or middle, we don't do collision detection
		if (placement !== 'free' && placement !== 'middle' && rFlip.test(o.collision)) {
			var testOrder = [],
				newPlacement = false,

			// define flip tests
			willFitOnRight = function() {
				if (atPos.left + atPos.width + elWidth > $window.width()) {
					return false;
				}
				return 'right';
			},

			willFitOnLeft = function() {
				if (atPos.left - elWidth < 0) {
					return false;
				}
				return 'left';
			},

			willFitOnBottom = function() {
				if (atPos.top + atPos.height + elHeight > $document.scrollTop() + $window.height()) {
					return false;
				}
				return 'bottom';
			},

			willFitOnTop = function() {
				if (atPos.top - elHeight < $document.scrollTop()) {
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


		// add class to popup for styling (first remove all posible classes)
		this.$popup.removeClass('top bottom right left middle free').addClass(placement);


		switch (placement) {
			case 'top':
				elPos = { top: atPos.top - elHeight - parseFloat(this.$popup.css('margin-bottom')), left: atPos.left + atPos.width/2 - offset};
				break;
			case 'bottom':
				elPos = { top: atPos.top + atPos.height + parseFloat(this.$popup.css('margin-top')), left: atPos.left + atPos.width/2 - offset };
				break;
			case 'right':
				elPos = { top: atPos.top + atPos.height/2 - offset, left: atPos.left + atPos.width + parseFloat(this.$popup.css('margin-left')) };
				break;
			case 'left':
				elPos = { top: atPos.top + atPos.height/2 - offset, left: atPos.left - elWidth - parseFloat(this.$popup.css('margin-right')) };
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
		// ie: if position is right or left, reposition alone the virtical axis
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
		this.$popup.offset(elPos);

		// position arrow, arrow also has point at middle of $attachTo
		if (o.showArrow) {
			var $arrow = this.$arrow,
				arrPos = { top: null, left: null },
				popupBorderTop = parseFloat(this.$popup.css('border-top-width')),
				popupBorderLeft = parseFloat(this.$popup.css('border-left-width'));

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

	Popup.prototype.reposition = Popup.prototype.position;

	Popup.prototype.open = function() {
		if (this.isOpen) { return; }
		this.isOpen = true;
		this.$el.trigger('open.popup');
		this.$popup.show();
		this.reposition();
		this.$el.trigger('opened.popup');
	};


	Popup.prototype.close = function() {
		// if jqXHR was initially passed, and the jqXHR has not yet been resolved, we want to abort the XHR call
		// we want to always destroy in this case, since we will need to re-call the ajax if user re-opens
		if (this.jqXHR && this.jqXHR.state() === 'pending') {
			this.jqXHR.abort();
			this.destroy();
		}

		if (!this.isOpen) { return; }

		this.$el.trigger('close.popup');

		this.isOpen = false;
			this.$popup.hide();
			this.$el.trigger('closed.popup');

		if (this.options.destroyOnClose) {
			this.destroy();
		}
	};


	Popup.prototype.toggle = function() {
		if (this.isOpen) { return this.close(); }
		return this.open();
	};


	Popup.prototype.destroy = function() {
		if (this.$attachTo) {
			this.$attachTo.removeData('popup-ref');
		}

		this.$el.trigger('destroy.popup');
		this.$popup.remove();
	};


	Popup.prototype.replaceContent = function(content) {
		this.$el.empty().append(content);
		this.reposition();
	};


	// save reference to existing definition for no conflict
	var old = $.fn.popup;

	// define $.fn.popup
	$.fn.popup = function(option, arg) {
		
		var rtnValue = null;
		this.each(function() {
			var $this = $(this),
				instance = $this.data('popup');

			// "if it looks like a duck, sounds like a duck, walks like a duck"
			// test on this to see if it's an jqXHR object
			if (this.readyState && this.promise) {
				option.jqXHR = this;
				var $html = $('<div class="popup-inner">').popup(option);
				$html.popup('$popup').addClass('loading');
				this.always(function(data) {
					$html.popup('$popup').removeClass('loading');
				});
				// return single jquery object of newly created node with popup instanciated on it
				rtnValue = $html;
				return false;
			}
			// else if popup has not yet been instantiated
			else if (!instance) {
				option = $.extend({}, $.fn.popup.defaults, $.isPlainObject(option) && option);
				$this.data('popup', (instance = new Popup($this, option)));
			}
			// if popup has been instantiated
			else {

				if (typeof option === 'string') {
					// if method/property exists
					if (instance[option]) {
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
					if (rtnValue) {
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
		return rtnValue || this;
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
			$.error('selector returned zero results');
			return $el;
		}

		return $el.popup(option);
	};


	$.fn.popup.Constructor = Popup;

	// these are the defaults value
	// feel free to change these to your liking
	$.fn.popup.defaults = {
		attachTo: null,
		autoOpen: true,
		//autoTrigger: 'click'
		boundary: 10,
		classes: null,
		//closeOnOutsideClick: false, // TODO: maybe replace with a space delimited set up options (ie, outsideclick, escape, etc)
		collision: 'flipfit', // valid options are 'flip', 'fit', or 'flipfit'
		container: null,
		destroyOnClose: false,
		offset: '50%', 
		placement: 'right',
		showArrow: true,
		showClose: true,
		//triggerEl: null,
		//within: $window, // bound the popup within
	};

	/*
	 * Events
	 * create.popup
	 * open.popup
	 * opened.popup
	 * positioned.popup
	 * close.popup
	 * closed.popup
	 * destroy.popup
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

	// calculates the pixel offset as given by placement = "50%-25px" format, which is the format for o.offset
	function calculateOffset() {
		var placement = this.placement,
			parsedOffset = rOffsetMatch.exec(this.options.offset),
			elWidth = this.$popup[0].offsetWidth,
			elHeight = this.$popup[0].offsetHeight,
			offset = 0; // zero by default

		// if value of this.options.offset was invalid, use the default option
		if (!parsedOffset) {
			parsedOffset = rOffsetMatch.exec($.fn.popup.defaults.offset);
		}

		// if parsedOffset has a percent value
		if (parsedOffset && parsedOffset[1]) {
			if (placement === 'right' || placement === 'left') {
				offset = elHeight * (parseFloat(parsedOffset[1]) / 100);
			}
			if (placement === 'top' || placement === 'bottom') {
				offset = elWidth * (parseFloat(parsedOffset[1]) / 100);
			}
		}
		// if parsedOffset has a pixel value (not we need to ADD to offset here, not set)
		if (parsedOffset && parsedOffset[2]) {
			offset += parseFloat(parsedOffset[2]);
		}

		// if offset is unintendedly 0 at this point, that means your $.fn.popup.defaults.offset is an invalid value
		return offset;
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

}(jQuery, document, window);