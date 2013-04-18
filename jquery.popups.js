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
				'<div class="popup-arrow"><div class="inner-arrow"></div></div>', // pointing-left will be placed variably
			'</div>'
		].join(''));

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

		this.positionPopup();
	};


	Popup.prototype.positionPopup = function() {
		var $window = $(window);
		var $document = $(document);

		var elOffset = this.$el.offset();
		var elWidth = this.$el.outerWidth();
		var elHeight = this.$el.outerHeight();
		var popWidth = this.$popup.outerWidth();
		var popHeight = this.$popup.outerHeight();
		var $arrow = this.$popup.find('.popup-arrow');

		var posLeft = 0;
		var posTop = 0;

		var arrowClass = '';
		var arrowLeft = 0;
		var arrowTop = 0;

		// set options.orientation to 'start' if invalid option is choosen
		if (this.options.orientation != 'start' || this.options.orientation != 'middle' || this.options.orientation != 'end') { this.options.orientation = 'start'; }


	};

	Popup.prototype.get$popup = function() {
		return this.$popup;
	};

	Popup.prototype.getGuid = function() {
		return this.guid;
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
		attachTo: null,
		appendTo: null,
		appendOrAfter: 'append',
		autoOpen: true,
		className: '',
		responsivePosition: false,
		minHeight: 0,
		minWidth: 0,
		offsetPercentage: 0,
		offsetPixels: 0,
		orientation: 'right',
		popupBuffer: 0,
		responsivePosition: false,
		removeOnClose: false,
		showArrow: false,
		showOnCreate: true,
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
			responsivePosition: true,
			showArrow: true,
			showX: true
		};

		options = $.extend(defaults, options);

		options.className += ' bubble';

		return this.popups(options, arg);
	}

}(window.jQuery);