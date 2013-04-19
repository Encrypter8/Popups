//
// popups.extensions.js
// required jquery.popups.js
//

!function ($) {

	if (!$.popup) {
		$.error('popups.extensions.js requires jquery.popups.js');
		return;
	}


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
	};


	$.fn.popupOnHover = function($html, options) {
		var defaults = {
			className: 'bubble',
			minHeight: 90,
			minWidth: 160
		};
		options = $.extend(defaults, options);

		// constants (the options that you always need to set no matter what, don't put these in defaults, as they can be overwritten by options)
		options.align = 'free';
		options.className += ' hover';

		var $hoverPopup = $html.popup(options).popup('get$popup').hide();

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


	$.fn.modal = function(options) {

		var that = this;

		var defaults = {
			align: 'middle',
			className: 'bubble modal',
			showX: true
		}

		this.popup(defaults);

		var $overlay = $('<div class="overlay"></div>').appendTo(document.body);

		that.popup('get$popup').appendTo($overlay);
		$(document.body).addClass('no-scroll').on('keydown.no-scroll', function(e) {
			// the background is still scrollable via the press of the spacebar
			// we deactivate that here (keyCode 32 = spacebar)
			if (e.keyCode == 32) {
				e.preventDefault();
				// transfer to overlay
			}
		})

		// TODO: refocus is focused on background
		$(document.body).on('focus', function(e) {
			if (!$(e.target).closest($overlay)) {
				$overlay.trigger('focus');
			}
		});
	};

}(window.jQuery);