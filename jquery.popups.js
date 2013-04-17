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
		this.$body = $(document.body);

		this.create();
	};

	Popup.prototype.create = function() {

		// set options.orientation to 'start' if invalid option is choosen
		if (this.options.orientation != 'start' || this.options.orientation != 'middle' || this.options.orientation != 'end') { this.options.orientation = 'start'; }

		if (this.options.className != '') { this.options.className = ' ' + this.options.className; }

		var guid = _guid();

		// create popup and add to DOM
		this.$popup = $([
			'<div id="popup-' + guid + '" class="popup-container' + this.options.className + '" style="min-width: ' + this.options.minWidth + 'px; min-height: ' + this.options.minHeight + 'px;">',
				this.options.showX ? '<button class="sprite popup-x" type="button"></button>' : '',
				'<div class="popup-arrow"><div class="inner-arrow"></div></div>', // pointing-left will be placed variably
			'</div>'
		].join(''));

		this.$popup.append(this.$el);
		this.$body.append(this.$popup);

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
	};

	Popup.prototype.get$popup = function() {
		return this.$popup;
	}


	//
	// Define jQuery.Popup
	//
	$.popup = function(el, option, arg) {

		var $el = $(el);
		var instance = $el.data('modal');

		var options = $.extend({}, $.popup.defaults, typeof option == 'object' && option)

		// has an instance of $.modal been created on $el?
		if (!instance) {
			$el.data('modal', (instance = new Popup(el, options)));
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
		align: 'right',
		attachTo: null,
		autoOpen: true,
		className: '',
		responsivePosition: false,
		minHeight: 0,
		minWidth: 0,
		offsetPercentage: 0,
		offsetPixels: 0,
		popupBuffer: 0,
		responsivePosition: false,
		removeOnClose: false,
		showArrow: false,
		showOnCreate: true,
		showX: false
	};

	$.fn.popup = function (option, arg) {
		// this plug only works on a single jquery element
		return $.popup(this[0], option, arg);
	};

}(window.jQuery);