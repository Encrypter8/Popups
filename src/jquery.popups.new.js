/*
 * jquery.popup.js
 * By: Harris Miller
 * Rewrite
 */

/*
 * Events:
 * create.popup
 * show.popup
 * shown.popup
 * hide.popup
 * hidden.popup
 * destroy.popup
 */

+function ($, document, window) {

	// globally used variables
	// we always want to use the top frame, this will allow iframe appcliations to always display relative to the viewport properly
	var win, doc, body;
	try {
		win = window.top;
		doc = win.document;
		body = doc.body;
	}
	catch(e) {
		win = window;
		doc = win.document;
		body = doc.body;
	}
	var $window = $(win);
	var $document = $(doc);
	var $body = $(body);

	// regex to match offset
	// accepts: "25", "+25", "-25", "25px", "25%", "+25%", "-25%", "25%+50", "25%-50", "25%-50px"
	// for "50%-25", exec gives ["50%-25", "50%", "-25"]
	// point is to grab the separate percent and pixel value off the submitted input
	var offsetMatch = /^(?:\+?(\-?\d+(?:\.\d+)?%))?(?:\+?(\-?\d+(?:\.\d+)?)(?:px)?)?$/;

	// placement options
	var responsivePlacementOptions = /top|bottom|right|left/;


	// define Popup
	var Popup = function ($el, options) {
		var that = this;

		this.el = this.$el = $el;
		this.isOpen = false;
		var o = this.options = options;

		// process options
		// i want all the options passed to be part of the object so they can be get/set later on
		for (var opt in options) {
			this[opt] = options[opt];
		}
		// handle special cases
		this.placement = this.placement.toLowerCase();

		// handle options that need to be jQueryfied
		this.$attachTo = this.attachTo = $(this.attachTo);
		this.$container = this.container = $(this.container);
		this.$triggerEl = this.$triggerEl = $(this.triggerEl);

		// create popup container
		this.$popup = $('<div class="popup-container">').addClass(this.classes);

		// create close and arrow if needed
		this.$close = this.showClose ? $('<button class="popup-close" type="button"></button>').appendTo(this.$popup) : null;
		this.$arrow = this.showArrow ? $('<div class="popup-arrow"><div class="inner-arrow"></div></div>').appendTo(this.$popup) : null;

		// if showClose, bind click event
		if (this.$close) {
			this.$close.on('click', function() {
				that.close();
			});
		}

		// append popup-container to o.container
		// hide, if o.autoOpen, popup will open below
		this.$popup.append(this.$el).appendTo(this.$container).hide();

		// if attachTo, save ref of popup
		this.$attachTo && this.$attachTo.data('popup-ref', this.$popup);

		// trigger create event
		$el.trigger('create.popup');

		// finally, if autoOpen, open!
		this.autoOpen && this.open();
	};


	Popup.prototype.positionPopup = function() {
	
		var placement = this.placePopup(this.placement);
		var newPlacement;

		// if this.collision == true, replace if needed
		// it's easiest to place the Popup in it's intended position first, and then check if it needs to be moved
		if (this.collision) {
			newPlacement = this.collitionDetection(placement);
			if (placement !== newPlacement) {
				placement = this.placePopup(newPlacement);
			}
		}


		return;		
	};


	// returns .getBoundingClientRect or (if that function does not exits) a calculated version of
	Popup.prototype.getPosition = function($el) {
		if (!$el || !$el[0]) {
			return { left: 0, top: 0 };
		}

		var el = $el[0];

		if ($.isFunction(el.getBoundingClientRect)) {
			return el.getBoundingClientRect();
		}

		var offset = $el.offset();

		return $.extend({}, {
			height: el.offsetHeight,
			width: el.offsetWidth,
		}, offset, {
			bottom: el.offsetHeight + offset.top,
			right: el.offsetWidth + offset.left
		});
	};

	// return new placement if collition is detected
	// if no collition, returns original placement
	Popup.prototype.collitionDetection = function(placement) {
		if (!placement || !responsivePlacementOptions.test(placement)) {
			return placement;
		}

		var popupPosition = this.getPosition(this.$popup);

		// currently just return what was submitted until method is written out
		return placement;
	
	};

	Popup.prototype.calculateOffset = function(placement) {
		var parsedOffset = offsetMatch.exec(this.offset);
		var elWidth = this.$popup[0].offsetWidth;
		var elHeight = this.$popup[0].offsetHeight;
		var offset = 0; // zero by default;

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

		return offset;
	};


	Popup.prototype.placePopup = function(placement) {
		var buffer = this.buffer;
		var offset = this.calculateOffset(placement);
		var elWidth = this.$popup[0].offsetWidth;
		var elHeight = this.$popup[0].offsetHeight;
		var atPos = this.getPosition(this.attachTo);
		var elPos = { top: null, left: null };

		switch (placement) {
			case 'top':
				elPos = { top: atPos.top - elHeight - buffer, left: atPos.left + atPos.width/2 - offset}; break;
			case 'bottom':
				elPos = { top: atPos.top + atPos.height + buffer, left: atPos.left + atPos.width/2 - offset }; break;
			case 'right':
				elPos = { top: atPos.top + atPos.height/2 - offset, left: atPos.left + atPos.width + buffer }; break;
			case 'left':
				elPos = { top: atPos.top + atPos.height/2 - offset, left: atPos.left - elWidth - buffer }; break;
			case 'middle':
				elPos = { top: $window.height()/2 - elHeight/2, left: $window.width()/2 - elWidth/2 }; break;
			default:
				// if placement is == to something other than what is in the switch statement,
				// it is considered "free" and is left with the null vals
				placement = 'free';
		}
		
		// position popup, $.fn.offset will correctly position the popup at the coords passed in regardless of which of it's parent
		// elements is the first to have a position of absolute/relative/fixed
		this.$popup.offset(elPos);

		// add class to popup for styling (first remove all posible classes)
		this.$popup.removeClass('top bottom right left middle free').addClass(placement);

		// position arrow, arrow also has point at middle of $attachTo
		if (this.showArrow) {
			var $arrow = this.$arrow;

			var arrPos = { top: null, left: null };
			switch (placement) {
				case 'top':
					arrPos = { bottom: -$arrow.outerHeight(), left: -$arrow.outerWidth()/2 + offset }; break;
				case 'bottom':
					arrPos = { top: -$arrow.outerHeight(), left: -$arrow.outerWidth()/2 + offset }; break;
				case 'right':
					arrPos = { top: -$arrow.outerHeight()/2 + offset, left: -$arrow.outerWidth() }; break;
				case 'left':
					arrPos = { top: -$arrow.outerHeight()/2 + offset, right: -$arrow.outerWidth() }; break;
			}

			$arrow.css(arrPos);
		}

		return placement;
	};


	Popup.prototype.open = function() {
		if (this.isOpen) { return; }
		this.isOpen = true;
		this.$el.trigger('open.popup');
		this.$popup.show();
		this.positionPopup();
	};


	Popup.prototype.close = function() {
		// if jqXHR was initially passed, and the jqXHR has not yet been resolved, we want to abort the XHR call
		// we want to always destroy in this case, since we will need to re-call the ajax if user re-opens
		if (this.jqXHR && this.jqXHR.state() === 'pending') {
			this.jqXHR.abort();
			this.destroy();
		}

		if (!this.isOpen) { return; }

		if (this.destroyOnClose) {
			this.destroy();
		}
		else {
			this.isOpen = false;
			this.$popup.hide();
			this.$el.trigger('close.popup');
		}
	};


	Popup.prototype.toggle = function() {
		if (this.isOpen) { return this.close(); }
		return this.open();
	};


	Popup.prototype.destroy = function() {
		if (this.$saveTo) {
			this.$saveTo.removeData('popup-ref');
		}
		this.$el.trigger('destroy.popup');
		this.$popup.remove();
	};


	Popup.prototype.replaceContent = function(content) {
		this.$el.empty().append(content);
		this.positionPopup();
	};


	// save reference to existing definition for no conflict
	var old = $.fn.popup;

	// define $.fn.popup
	$.fn.popup = function(option, arg) {
		
		var rtnValue = null;
		this.each(function() {
			var $this = $(this);
			var instance = $this.data('popup');

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
						// if property (assume if not a method)
						else {
							// set
							if (arg !== undefined) {
								instance[option] = arg;
							}
							// get
							else {
								rtnValue = instance[option];
							}
						}
					}

					// follow how jQuery gets only return the method/property value first in the collection when it's a get
					// so we want to break out of the .each here
					if (rtnValue) {
						return false;
					}
				}
				else if (!option) {
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

	$.fn.popup.Constructor = Popup;

	// these are the defaults value
	// feel free to change these to your liking
	$.fn.popup.defaults = {
		attachTo: null,
		autoOpen: false,
		buffer: 10,
		container: $body,
		destroyOnClose: false,
		classes: null,
		offset: '50%', // want to explore having this input be '-35', '50%', or '+50%-30' or any combo of
		placement: null,
		collision: 'flipfit',
		collisionWithin: $window, // bound the popup within
		showArrow: true,
		showClose: true,
		triggerEl: null,
		trigger: 'click'
	};

	// popup no conflict
	$.fn.popup.noConflict = function() {
		$.fn.popup = old;
		return this;
	};

	// utility functions
	// add 'px' to the end of a number value, used for css
	function addPX(value) {
		if ($.isNumeric(value)) {
			return value + 'px';
		}
		return value;
	}

}(jQuery, document, window);