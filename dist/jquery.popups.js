/*! jQuery Popups - v0.8.2 - 2013-09-20
* https://github.com/Encrypter8/Popups
* Copyright (c) 2013 Harris Miller; Licensed MIT */
+function ($, document, window) {

	var Popup = function ($el, options) {
		this.options = options;
		this.$el = $el;
		this.isOpen = false;

		this._create();
	};

	Popup.prototype._create = function() {

		var that = this;
		var o = this.options;

		// us to add px to end of value is just a number is passed
		var addPX = function(value) {
			if (typeof value == 'number') {
				return value + 'px';
			}
			return value;
		};

		var popupStyles = [
			'style=" position: absolute; ',
			o.height ? 'height: ' + addPX(o.height) + '; ' : '',
			o.maxHeight ? 'max-height: ' + addPX(o.maxHeight) + '; ': '',
			o.maxWidth ? 'max-width: ' + addPX(o.maxWidth) + '; ' : '',
			o.minHeight ? 'min-height: ' + addPX(o.minHeight) + '; '  : '',
			o.minWidth ? 'min-width: ' + addPX(o.minWidth) + '; ' : '',
			o.width ? 'width: ' + addPX(o.width) + '; ' : '',
			'z-index: ' + o.zIndex + '"',
		].join('');


		// create popup and add to DOM
		this.$popup = $([
			'<div class="popup-container ' + o.popupClass + '" ' + popupStyles + '>',
				o.showClose ? '<button class="popup-close" type="button"></button>' : '',
				o.showArrow ? '<div class="popup-arrow"><div class="inner-arrow"></div></div>' : '',
			'</div>'
		].join(''));

		this.$arrow = this.$popup.find('.popup-arrow');

		// _appendTo so the plug-in knows where in the DOM to place
		// right now this should only be used by the modal plugin
		// ie, this property is NOT PUBLIC
		o._appendTo = o._appendTo || 'body';

		this.$popup.append(this.$el).appendTo(o._appendTo).hide(); // hide for autoOpen = false, if true, this.open will be called below

		o.saveTo && $(o.saveTo).data('popup-ref', this.$el);

		// if options.showClose, bind click to close popup
		if (o.showClose) {
			this.$popup.find('.popup-close').on('click.popup', function () {
				that.close();
			});
		}

		o.attachTo = $(o.attachTo);

		o.autoOpen && this.open();
	};

	// positionPopup_new is a rewrite to allow of the originally intended appendTo option as well as to account for iFrames
	Popup.prototype.positionPopup_new = function() {

		// return if this.options.attachTo.length
		// return if this.options.attachTo.length == 0
		if(!this.options.attachTo.length) { return; }

		var that = this;
		var o = this.options;

		var $window = $(window);
		var $document = $(document);

		var $appendTo = $(o._appendTo);

		var position = this.getPosition();
	};

	Popup.prototype.getPosition = function() {
		var $attachTo = this.options.attachTo;
		var el = $attachTo[0];
		return $.extend({}, ($.isFunction(el.getBoundingClientRect)) ? el.getBoundingClientRect() : {
			height: el.offsetHeight,
			width: el.offsetWidth
		}, $attachTo.offset());
	};

	Popup.prototype.positionPopup = function() {

		// return if this.options.attachTo.length == 0
		if(!this.options.attachTo.length) { return; }

		var that = this;
		var o = this.options;

		var $window = $(window);
		var $document = $(document);

		var $appendTo = $(o._appendTo);
		var appTop = $appendTo.offset().top;
		var appLeft = $appendTo.offset().left;

		var elOffset = o.attachTo.offset();
		var elWidth = o.attachTo.outerWidth();
		var elHeight = o.attachTo.outerHeight();
		var popWidth = this.$popup.outerWidth();

		var popHeight = this.$popup.outerHeight();
		var posLeft = 0;
		var posTop = 0;

		var arrowClass = '';
		var arrowLeft = 0;
		var arrowTop = 0;

		/*
		 * Responsive Alignment
		 * run only if flag is set and if position != middle (because middle does not position the popup relative to the attachTo element)
		 * we change the position of the pop-up based on if it will fit in the visible window of it's orientation
		 * ie, if position is set to right, will the entire pop-up fit to the right of the binding element, if not, try left side
		 * will try to first fit in the same axis (ie, left will try right first, while top will try bottom first)
		 * will attept other axis if cannot fit in same one, when trying other axis, first attempt will be right/bottom (respectively)
		 * will position to middle if cannot fit in right, left, top, or bottom
		 */
		var origAlign = o.align;
		if (o.responsiveAlignment === true && o.align !== 'middle') {
			// declare login tests
			var willFitOnRight = function () {
				if (elOffset.left + elWidth + popWidth + o.popupBuffer > $window.width()) {
					return false;
				}
				return 'right';
			};

			var willFitOnLeft = function () {
				if (elOffset.left - popWidth - o.popupBuffer < 0) {
					return false;
				}
				return 'left';
			};

			var willFitOnBottom = function () {
				if (elOffset.top + elHeight + popHeight + o.popupBuffer > $document.scrollTop() + $window.height()) {
					return false;
				}
				return 'bottom';
			};

			var willFitOnTop = function () {
				if (elOffset.top - popHeight - o.popupBuffer < $document.scrollTop()) {
					return false;
				}
				return 'top';
			};

			/*
			 * define the order to test based on position set
			 * if options.position was incorrectly set, the code below will re-set options.position = 'middle'
			 * also if you know a better way to go about this, let me know --Harris
			 */
			var testOrder = [];
			switch (o.align) {
				case 'right':
					testOrder = [willFitOnRight, willFitOnLeft, willFitOnBottom, willFitOnTop];
					break;
				case 'left':
					testOrder = [willFitOnLeft, willFitOnRight, willFitOnBottom, willFitOnTop];
					break;
				case 'bottom':
					testOrder = [willFitOnBottom, willFitOnTop, willFitOnRight, willFitOnLeft];
					break;
				case 'top':
					testOrder = [willFitOnTop, willFitOnBottom, willFitOnRight, willFitOnLeft];
					break;
			}

			// run the tests
			var newAlign = false;
			for (var i = 0; i < testOrder.length; i++) {
				newAlign = testOrder[i].call();
				if (newAlign !== false) {
					break;
				}
			}

			// if all tests fail, set to middle
			if (newAlign === false) {
				newAlign = 'middle';
			}

			o.align = newAlign;
		}
		// end Responsive Alignment

		// define Constraint functions
		var keepInVerticalConstraints = function () {
			var diff;
			// shift pop-up up if will display below bottom of window
			if (posTop + popHeight > $document.scrollTop() + $window.height()) {
				diff = (posTop + popHeight) - ($document.scrollTop() + $window.height());
				posTop -= diff;
				arrowTop += diff;
			}

			// shift pop-up down if will display above top of window
			if (posTop < $document.scrollTop()) {
				diff = $document.scrollTop() - posTop;
				posTop += diff;
				arrowTop -= diff;
			}
		};

		var keepInHorizontalConstraints = function () {
			var diff;
			// shift pop-up left if will display past right edge of window (with 10px buffer)
			if (posLeft + popWidth > $window.width()) {
				diff = (posLeft + popWidth) - $window.width();
				posLeft -= diff;
				arrowLeft += diff;
			}

			// shift pop-up right if will display past left edge of window (with 10px buffer);
			if (posLeft < 0) {
				diff = -posLeft;
				posLeft += diff;
				arrowLeft -= diff;
			}
		};

		// position popup next to attachTo
		var offset;
		this.$arrow.removeClass('pointing-up pointing-down pointing-left pointing-right');
		if (o.align == 'top') {
			offset = (popWidth * (o.offsetPercentage * 0.01)) + o.offsetPixels;
			posLeft = elOffset.left + (elWidth / 2) - offset;
			posTop = elOffset.top - popHeight - o.popupBuffer;

			this.$arrow.addClass('pointing-down');
			arrowLeft = offset - (this.$arrow.outerWidth() / 2) - parseInt(this.$popup.css('border-left-width'), 10);
			arrowTop = this.$popup.height();

			if (o.responsiveToEdges) {
				keepInHorizontalConstraints();
			}
		}
		else if (o.align == 'right') {
			offset = (popHeight * (o.offsetPercentage * 0.01)) + o.offsetPixels;
			posLeft = elOffset.left + elWidth + o.popupBuffer;
			posTop = elOffset.top + (elHeight / 2) - offset; // set top of popup to align with middle of binding element

			// add class to arrow
			// we do this now because $arrow needs to have a height/width on it to grab first to determine where to position it
			this.$arrow.addClass('pointing-left');

			arrowLeft = -this.$arrow.outerWidth();
			arrowTop = offset - (this.$arrow.outerHeight() / 2) - parseInt(this.$popup.css('border-top-width'), 10); // pop-ups borderwidth needs to be accounted for here

			if (o.responsiveToEdges) {
				keepInVerticalConstraints();
			}
		}
		else if (o.align == 'bottom') {
			offset = (popWidth * (o.offsetPercentage * 0.01)) + o.offsetPixels;
			posLeft = elOffset.left + (elWidth / 2) - offset;
			posTop = elOffset.top + elHeight + o.popupBuffer;

			this.$arrow.addClass('pointing-up');
			arrowLeft = offset - (this.$arrow.outerWidth() / 2) - parseInt(this.$popup.css('border-left-width'), 10);
			arrowTop = -this.$arrow.outerHeight();

			if (o.responsiveToEdges) {
				keepInHorizontalConstraints();
			}
		}
		else if (o.align == 'left') {
			offset = (popHeight * (o.offsetPercentage * 0.01)) + o.offsetPixels;
			posLeft = elOffset.left - popWidth - o.popupBuffer;
			posTop = elOffset.top + (elHeight / 2) - offset; // set top of popup to align with middle of binding element

			this.$arrow.addClass('pointing-right');
			arrowLeft = this.$popup.width(); // we use $popup.width() here instead of popWidth because popWidth includes the popup's borders
			arrowTop = offset - (this.$arrow.outerHeight() / 2) - parseInt(this.$popup.css('border-top-width'), 10); // pop-ups borderwidth needs to be accounted for here

			if (o.responsiveToEdges) {
				keepInVerticalConstraints();
			}
		}
		else if (o.align == 'middle') {
			posLeft = ($window.width() / 2) - (popWidth / 2);
			if (posLeft < 0) {
				posLeft = 0;
			}

			posTop = $appendTo.scrollTop() + ($window.height() / 2) - (popHeight / 2);
			if (posTop < $appendTo.scrollTop()) {
				posTop = $appendTo.scrollTop();
			}
		}

		// set positioning
		this.$popup.css({ 'left': posLeft, 'top': posTop });
		this.$arrow.css({ 'left': arrowLeft, 'top': arrowTop });

		o.align = origAlign;
	};

	Popup.prototype.open = function() {
		if (this.isOpen) {
			return;
		}
		this.isOpen = true;
		this.$el.trigger('popupOpen');
		this.$popup.show();
		if (this.options.align != 'free') {
			this.positionPopup();
		}
	};

	Popup.prototype.close = function() {
		if (!this.isOpen) {
			return;
		}

		// if jqXHR was initially passed, and the jqXHR has not yet been resolved, we want to 
		if (this.options.jqXHR && this.options.jqXHR.state() == "pending") {
			this.options.jqXHR.abort();
			// we want to always destroy in this case, since we will need to re-call the ajax if user re-opens
			this.destroy();
		}

		if (this.options.destroyOnClose) {
			this.destroy();
		}
		else {
			this.isOpen = false;
			this.$popup.hide();
			this.$el.trigger('popupClose');
		}
	};

	Popup.prototype.toggle = function() {
		this[this.isOpen ? 'close' : 'open']();
	};

	Popup.prototype.destroy = function() {
		if (this.options.saveTo) {
			$(this.options.saveTo).removeData('popup-ref');
		}
		this.$el.trigger('popupDestroy');
		this.$popup.remove();
	};

	Popup.prototype.replaceContent = function(content) {
		this.$el.empty().append(content);
		this.positionPopup();
	};


	//
	// Define $.fn.popup
	//
	$.fn.popup = function (option, args) {

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
			// if node that popup has yet to be instanciated on
			else if (!instance) {
				var options = $.extend({}, $.fn.popup.defaults, typeof option == 'object' && option);
				$this.data('popup', (instance = new Popup($this, options)));
			}
			// if node already has popup instanciated
			else {
				if (typeof option == 'string') {
					// if method/property exists and is not private (all private methods begin with _)
					if (instance[option] && !option.match(/^_/)) {
						// if function
						if (typeof instance[option] == 'function') {
							rtnValue = instance[option](args);
						}
						// if property
						else {
							rtnValue = instance[option];
						}

						if (rtnValue) {
							return false; // break out of .each
						}
					}
					else {
						$.error("fn.Modal says: Method or Property you are trying to call is either private or does not exist");
					}
				}
				// if .popup is just called and has already been instanciated, trigger .toggle()
				else if (!option) {
					instance.toggle();
				}
				// if some other invalid value was passed as option (say a function or a number), nothing will happen
			}
			
		});

		return rtnValue || this;
	};

	$.fn.popup.Constructor = Popup;

	$.fn.popup.defaults = {
		align: 'free',
		attachTo: null,
		autoOpen: true,
		destroyOnClose: false,
		popupClass: '',
		height: 0,
		maxHeight: 0,
		maxWidth: 0,
		minHeight: 0,
		minWidth: 0,
		offsetPercentage: 0,
		offsetPixels: 0,
		popupBuffer: 0,
		responsiveAlignment: true,
		responsiveToEdges: true,
		saveTo: null,
		showArrow: true,
		showClose: true,
		width: 0,
		zIndex: 1000
	};

}(jQuery, document, window);
+function ($, document, window) {

	if (!$.fn.popup) {
		$.error('jquery.modal.js requires jquery.popups.js');
		return;
	}

	// integrated transitionEnd module
	// from Twitter Boostrap (boostrap-transition.js)
	var transitionEnd = (function() {
		var el = document.createElement('modal');
		var transEndEventNames = {
			'WebkitTransition' : 'webkitTransitionEnd',
			'MozTransition' : 'transitionend',
			'OTransition' : 'oTransitionEnd otransitionend',
			'transition' : 'transitionend'
		};

		for(var name in transEndEventNames) {
			if (el.style[name] !== undefined) {
				return transEndEventNames[name];
			}
		}

		// return null is browser does not support transitions
		return null;
	})();

	// left: 37, up: 38, right: 39, down: 40,
	// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
	var keys = [32, 33, 34, 35, 36, 37, 38, 39, 40];

	// this function should disable scrolling on the window when the model is open
	// is doesn't actuallyu "disable" scrolling, but it does catch all the key-commands that would make it scroll
	// NOTE: normally, if you focus within the popup-container, the above keys will scroll that (if it's longer enough)
	// this disableScroll will display that as well, but I think it's an acceptable loss
	var disableScroll = function() {
		$(document.body).on('keydown.modal', function(e) {
			for (var i = 0; i < keys.length; i++) {
				if (e.keyCode == keys[i]) {
					e.preventDefault();
					return;
				}
			}
		});
	};

	var enableScroll = function() {
		$(document.body).off('keydown.modal');
	};

	var Modal = function($el, options) {
		this.options = options;
		this.$el = $el;
		if (window == window.top) {
			this._$body = $(document.body);
			this.inIframe = false;
		}
		else {
			this._$body = $(window.top.document.body);
			this.inIframe = true;
		}
		this.isOpen = false;

		this._create();
	};

	Modal.prototype._create = function() {
		var that = this;
		var o = this.options;

		// background-image is a base64 encodement of a 1x1 px png of rgba(0,0,0,.7)
		// we do this too support down to IE8, otherwise I would just do:  'background-color: rgba(0,0,0,.7);',
		var overlayStyles = [
			'style="',
			'background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQI12NgYGDYDAAAuAC0TCbBxgAAAABJRU5ErkJggg==);',
			'bottom: 0;',
			'left: 0;',
			'opacity: 0;',
			'overflow-x: auto;',
			'overflow-y: auto;',
			'position: fixed;',
			'right: 0;',
			'top: 0;',
			'transition: opacity ' + o.transitionTime + 's;',
			'width: 100%;',
			'z-index: ' + o.zIndex + ';',
			'"'
		].join('');

		this.$overlay = $('<div class="overlay" ' + overlayStyles + '></div>').appendTo(this._$body);

		var constant_options = {
			align : 'middle',
			_appendTo : that.$overlay,
			attachTo : that.$overlay,
			showArrow : false,
			zIndex : o.zIndex + 5
		};
		
		o.saveTo && $(o.saveTo).data('modal-ref', this.$el);

		$.extend(o, constant_options);

		// popup_options.saveTo = null, since we are saving 'modal-ref' instead
		o.saveTo = null;

		o.popupClass = 'modal' + (o.popupClass ? ' ' + o.popupClass : '');

		this.$el.popup(o);
		this.$overlay.hide();

		// reset $.fn.popup's .popup-close functionality
		this.$overlay.find('.popup-close').off('click.popup').on('click.modal', function() {
			that.close();
		});

		if (o.autoOpen) {
			that.open();
		}
	};


	Modal.prototype.open = function() {
		var that = this;

		// already open?
		if (this.isOpen) {
			return;
		}

		disableScroll();

		this.isOpen = true;
		this.$overlay.show().addClass('show');
		// timeout so DOM renderer can change element's state first before applying transition
		// as recommended: https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Using_CSS_transitions#Which_CSS_properties_are_animatable.3F
		window.setTimeout(function() {
			that.$overlay.css('opacity', 1);
		}, 20);

		this._$body.css('overflow', 'hidden');

		// close on escape
		if (this.options.closeOnEscape) {
			this._$body.on('keydown.modal', function(e) {
				// keycode 27 = escape
				if (e.keyCode == 27) {
					that.close();
				}
			});
		}
	};

	Modal.prototype.close = function() {
		var that = this;

		enableScroll();

		// if jqXHR was initially passed, and the jqXHR has not yet been resolved, we want to 
		if (this.options.jqXHR && this.options.jqXHR.state() == "pending") {
			this.options.jqXHR.abort();
			// we want to always destroy in this case, since we will need to re-call the ajax if user re-opens
			this.destroy();
		}
		if (this.options.destroyOnClose) {
			this.destroy();
		}
		else {
			this.isOpen = false;
			// transition close if set and browser can
			if (this.options.transition && transitionEnd) {
				this.$overlay.one(transitionEnd, function() {
					that._closeModal();
				});
				this.$overlay.css('opacity', 0);
			}
			else{
				this._closeModal();
			}
		}
	};

	Modal.prototype.toggle = function() {
		this.isOpen ? this.close() : this.open();
	};

	Modal.prototype.destroy = function() {
		var that = this;

		// remove saveTo ref
		if (this.options.saveTo) {
			$(this.options.saveTo).removeData('modal-ref');
		}
		this.$el.trigger('modalDestroy');
		// transition close if set and browser can
		if (this.options.transition && transitionEnd) {
			this.$overlay.one(transitionEnd, function() {
				that._closeModal();
			});
			this.$overlay.css('opacity', 0);
		}
		else {
			that._closeModal();
		}
	};

	Modal.prototype.replaceContent = function(content) {
		this.$el.popup('replaceContent', content);
	};

	Modal.prototype._closeModal = function() {
		this.options.destoryOnClse ? this.$overlay.remove() : this.$overlay.hide();
		this._$body.css('overflow', 'visible').off('.modal');
	};


	//
	// Define $.fn.Modal
	//
	$.fn.modal = function (option, args) {
		var rtnValue = null;
		this.each(function() {
			var $this = $(this);
			var instance = $this.data('modal');

			// "if it looks like a duck, sounds like a duck, walks like a duck"
			// test on this to see if it's an jqXHR object
			if (this.readyState && this.promise) {
				option.jqXHR = this;
				var $html = $('<div>').modal(option);
				$html.popup('$popup').addClass('loading');
				this.always(function() {
					$html.popup('$popup').removeClass('loading');
				});
				// return single jquery object of newly created node with popup instanciated on it
				rtnValue = $html;
				return false;
			}

			if (!instance) {
				var options = $.extend({}, $.fn.modal.defaults, typeof option == 'object' && option);
				$this.data('modal', (instance = new Modal($this, options)));
			}
			else {
				if (typeof option == 'string') {
					// if method/property exists and is not private (all private methods begin with _)
					if (instance[option] && !option.match(/^_/)) {
						// if function
						if (typeof instance[option] == 'function') {
							rtnValue = instance[option](args);
						}
						// if property
						else {
							rtnValue = instance[option];
						}

						if (rtnValue) {
							return false; // break out of .each
						}
					}
					else {
						$.error("fn.Modal says: Method or Property you are trying to call is either private or does not exist");
					}
				}
				// if option was not passed, toggle the modal
				else if(!option) {
					instance.toggle();
				}
				// if some other invalid value was passed as option (say a function or a number), nothing will happen
			}
		});

		// return either the value returned a method of the instance called, or simply return itself
		return rtnValue || this;
	};

	$.fn.modal.Constructor = Modal;

	$.fn.modal.defaults = {
		autoOpen: true,
		closeOnEscape: true,
		destroyOnClose: false,
		popupClass: '',
		saveTo: null,
		showClose: true,
		transition: true,
		transitionTime: 0.6,
		zIndex: 5000
	};

}(jQuery, document, window);