//
// popups.extensions.js
// required jquery.popups.js
//

!function ($) {

	if (!$.fn.popup) {
		$.error('popups.extensions.js requires jquery.popups.js');
		return;
	}


	$.fn.bubble = function(options, arg) {
		var defaults = {
			popupName: '',
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
	};


	$.fn.popupOnHover = function($el, options) {
		var defaults = {
			popupClass: 'bubble',
			minHeight: 90,
			minWidth: 160
		};
		options = $.extend(defaults, options);

		// constants (the options that you always need to set no matter what, don't put these in defaults, as they can be overwritten by options)
		options.align = 'free';
		options.className += ' hover';

		var $hoverPopup = $el.popup(options).popup('$popup').hide();

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
	};

}(window.jQuery);