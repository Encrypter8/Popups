//
// popups jQuery plug-in
//

!function ($) {

	var _guid = function() {
		var s4 = function() { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); };
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	};

	var Popup = function (el, options) {
		this.options = options;
		this.$el = $(el);

		if (this.$el.length == 1) {
			this.create();
		}
		else {
			$.error("$.popup requires that $el is a single jquery element");
			return;
		}
	};

	Popup.prototype.create = function() {

		if (this.options.className != '') { this.options.className = ' ' + this.options.className; }

				this.guid = _guid();

		// create popup and add to DOM
		this.$popup = $([
			'<div id="popup-' + this.guid + '" class="popup-container' + this.options.className + '" style="min-width: ' + this.options.minWidth + 'px; min-height: ' + this.options.minHeight + 'px;">',
				this.options.showX ? '<button class="sprite popup-x" type="button"></button>' : '',
				'<div class="popup-arrow"><div class="inner-arrow"></div></div>',
			'</div>'
		].join(''));

		this.$arrow = this.$popup.find('.popup-arrow');

		if (this.options.appendOrAfter != 'append' && this.options.appendOrAfter != 'after') { this.options.appendOrAfter = 'append'; }

		this.options.appendTo = this.options.appendTo || $(document.body);
		this.$popup.append(this.$el);
		this.options.appendTo[this.options.appendOrAfter](this.$popup);

		// if showX, bind click to remove popup *Please Note: Removing, not hiding
		if (this.options.showX) {
			this.$popup.find('.popup-x').on('click', function () {
				var action = this.options.removeOnClose ? 'remove' : 'close';
				this.$el.popup(action);
			});
		}

		if (!this.options.showArrow) {
			this.$popup.find('.popup-arrow').remove();
		}

		if (this.options.align != 'free' && this.options.attachTo$el) {
			this.options.attachTo$el = $(this.options.attachTo$el);
			this.positionPopup();
		}
	};


	Popup.prototype.positionPopup = function() {
		var that = this;

		var $window = $(window);
		var $document = $(document);

		var elOffset = this.options.attachTo$el.offset();
		var elWidth = this.options.attachTo$el.outerWidth();
		var elHeight = this.options.attachTo$el.outerHeight();
		var popWidth = this.$popup.outerWidth();
		var popHeight = this.$popup.outerHeight();

		var posLeft = 0;
		var posTop = 0;

		var arrowClass = '';
		var arrowLeft = 0;
		var arrowTop = 0;

		// reset options.orientation to 'start' if invalid option is choosen
		if (this.options.orientation != 'start' || this.options.orientation != 'middle' || this.options.orientation != 'end') { this.options.orientation = 'start'; }

		// Responsive Alignment
		// run only if flag is set and if position != middle (because middle does not position the popup relative to the binding element)
		// we change the position of the pop-up based on if it will fit in the visible window of it's orientation
		// ie, if position is set to right, will the entire pop-up fit to the right of the binding element, if not, try left side
		// will try to first fit in the same plane (ie, left will try right first, while top will try bottom first)
		// will attept other plane if cannot fit in same plane, when trying other plane, first attempt will be right/bottom (respective of plane)
		// will position to middle if cannot fit in right, left, top, or bottom
		//
		if (this.options.responsiveAlignment == true && this.options.align != 'middle') {
			// declare login tests
			var willFitOnRight = function () {
				if (elOffset.left + elWidth + popWidth + that.options.popupBuffer > $window.width()) {
					return false;
				};
				return 'right';
			};

			var willFitOnLeft = function () {
				if (elOffset.left - popWidth - that.options.popupBuffer < 0) {
					return false;
				};
				return 'left';
			};

			var willFitOnBottom = function () {
				if (elOffset.top + elHeight + popHeight + that.options.popupBuffer > $document.scrollTop() + $window.height()) {
					return false;
				}
				return 'bottom';
			};

			var willFitOnTop = function () {
				if (elOffset.top - popHeight - that.options.popupBuffer < $document.scrollTop()) {
					return false;
				}
				return 'top';
			};

			// define the order to test based on position set
			// if options.position was incorrectly set, the code below will re-set options.position = 'middle'
			// also if you know a better way to go about this, let me know --Harris
			var testOrder = [];
			if (this.options.align == 'right') {
				testOrder = [willFitOnRight, willFitOnLeft, willFitOnBottom, willFitOnTop];
			}
			else if (this.options.align == 'left') {
				testOrder = [willFitOnLeft, willFitOnRight, willFitOnBottom, willFitOnTop];
			}
			else if (this.options.align == 'bottom') {
				testOrder = [willFitOnBottom, willFitOnTop, willFitOnRight, willFitOnLeft];
			}
			else if (this.options.align == 'top') {
				testOrder = [willFitOnTop, willFitOnBottom, willFitOnRight, willFitOnLeft];
			}

			// run the tests
			var newAlign = false;
			for (var i = 0; i < testOrder.length; i++) {
				newAlign = testOrder[i].call();
				if (newAlign != false) {
					break;
				}
			}

			// if all tests fail, set to middle
			if (newAlign == false) {
				newAlign = 'middle';
			}

			this.options.align = newAlign;
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
			
			if (posLeft + popWidth > $window.width()) {
				var diff = (posLeft + popWidth) - $window.width();
				posLeft -= diff;
				arrowLeft += diff;
			}

			// shift pop-up right if will display past left edge of window (with 10px buffer);
			if (posLeft < 0) {
				var diff = -posLeft;
				posLeft += diff;
				arrowLeft -= diff;
			}
		};


		// position popup next to $el
		if (this.options.align == 'top') {
			var offset = (popWidth * (this.options.offsetPercentage * 0.01)) + this.options.offsetPixels;
			posLeft = elOffset.left + (elWidth / 2) - offset;
			posTop = elOffset.top - popHeight - this.options.popupBuffer;

			this.$arrow.addClass('pointing-down');
			arrowLeft = offset - (this.$arrow.outerWidth() / 2) - parseInt(this.$popup.css('border-left-width'));
			arrowTop = this.$popup.height();

			if (this.options.responsiveToEdges) {
				keepInHorizontalConstraints();
			}
		}
		else if (this.options.align == 'right') {
			var offset = (popHeight * (this.options.offsetPercentage * 0.01)) + this.options.offsetPixels;

			posLeft = elOffset.left + elWidth + this.options.popupBuffer;
			posTop = elOffset.top + (elHeight / 2) - offset; // set top of popup to align with middle of binding element

			// add class to arrow
			// we do this now because $arrow needs to have a height/width on it to grab first to determine where to position it
			this.$arrow.addClass('pointing-left');

			arrowLeft = -this.$arrow.outerWidth();
			arrowTop = offset - (this.$arrow.outerHeight() / 2) - parseInt(this.$popup.css('border-top-width')); // pop-ups borderwidth needs to be accounted for here

			if (this.options.responsiveToEdges) {
				keepInVerticalConstraints();
			}
		}
		else if (this.options.align == 'bottom') {
			var offset = (popWidth * (this.options.offsetPercentage * 0.01)) + this.options.offsetPixels;
			posLeft = elOffset.left + (elWidth / 2) - offset;
			posTop = elOffset.top + elHeight + this.options.popupBuffer;

			this.$arrow.addClass('pointing-up');
			arrowLeft = offset - (this.$arrow.outerWidth() / 2) - parseInt(this.$popup.css('border-left-width'));
			arrowTop = -this.$arrow.outerHeight();

			if (this.options.responsiveToEdges) {
				keepInHorizontalConstraints();
			}
		}
		else if (this.options.align == 'left') {
			var offset = (popHeight * (this.options.offsetPercentage * 0.01)) + this.options.offsetPixels;
			posLeft = elOffset.left - popWidth - this.options.popupBuffer;
			posTop = elOffset.top + (elHeight / 2) - offset; // set top of popup to align with middle of binding element

			this.$arrow.addClass('pointing-right');
			arrowLeft = this.$popup.width(); // we use $popup.width() here instead of popWidth because popWidth includes the popup's borders
			arrowTop = offset - (this.$arrow.outerHeight() / 2) - parseInt(this.$popup.css('border-top-width')); // pop-ups borderwidth needs to be accounted for here

			if (this.options.responsiveToEdges) {
				keepInVerticalConstraints();
			}
		}
		else if (this.options.align == 'middle') {
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
		this.$popup.css({ 'left': posLeft, 'top': posTop });
		this.$arrow.css({ 'left': arrowLeft, 'top': arrowTop });
	};

	Popup.prototype.get$popup = function() {
		return this.$popup;
	};

	Popup.prototype.getGuid = function() {
		return this.guid;
	};

	Popup.prototype.reAlignPopup = function() {
		this.positionPopup();
	};


	//
	// Define jQuery.Popup
	//
	$.popup = function(el, option, arg) {

		//

		var $el = $(el);
		var instance = $el.data('popup');

		var options = $.extend({}, $.popup.defaults, typeof option == 'object' && option)

		// has an instance of $.modal been created on $el?
		if (!instance) {
			$el.data('popup', (instance = new Popup(el, options)));
		}

		// if options == 'string', user is trying envoke a method of $.modal
		if (typeof option == 'string') {
			if (instance[option]) {
				var rtnVar = instance[option](arg);
				if (rtnVar) {
					return rtnVar;
				}
			}
		}
		
		// return $el for chaining
		return $el;
	}

	$.popup.defaults = {
		align: 'free',
		attachTo$el: null,
		appendTo: null,
		appendOrAfter: 'append',
		autoOpen: true,
		className: '',
		minHeight: 0,
		minWidth: 0,
		offsetPercentage: 0,
		offsetPixels: 0,
		orientation: 'right',
		popupBuffer: 0,
		responsiveAlignment: false,
		responsiveToEdges: false,
		removeOnClose: false,
		showArrow: false,
		showX: false
	};

	$.fn.popup = function (option, arg) {
		var rtnArray = [];
		this.each(function() {
			rtnArray.push($.popup(this, option, arg));
		});

		if (rtnArray.length == 1) {
			return rtnArray[0];
		}
		else {
			// if an array of jquery objects
			// change to a single jquery collection
			if (rtnArray[0] instanceof window.jQuery) {
				$.each(rtnArray, function(i) {
					rtnArray[i] = rtnArray[i][0];
				})
				rtnArray = $(rtnArray);
			}
			return rtnArray;
		}
	};


	$.fn.bubble = function(options, arg) {
		var defaults = {
			className: '',
			popupBuffer: 20,
			offsetPercentage: 0,
			offsetPixels: 50,
			responsiveAlignment: true,
			responsiveToEdges: true,
			showArrow: true,
			showX: true
		};

		options = $.extend(defaults, options);

		options.className += ' bubble';

		return this.popups(options, arg);
	}


	$.fn.popupOnHover = function($html, options) {
		defaults = {
			className: 'bubble',
			minHeight: 90,
			minWidth: 160,
		}
		options = $.extend(defaults, options);

		// constants (the options that you always need to set no matter what, don't put these in defaults, as they can be overwritten by options)
		options.align = 'free';
		options.className += ' hover';

		var $hoverPopup = $html.popup(options).popup('get$popup').hide();

		console.log($hoverPopup);

		return this.each(function() {
			var $this = $(this);
			$this.on('mousemove', function(e) {
				$hoverPopup.css({ 'left': e.pageX + 10, 'top': e.pageY + 10});
			}).on('mouseenter', function() {
				$hoverPopup.show();
			}).on('mouseleave', function() {
				$hoverPopup.hide();
			});
		});
	}

}(window.jQuery);