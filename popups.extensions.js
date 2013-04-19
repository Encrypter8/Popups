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

		// if you don't wait, the class will actually be added to element
		// before the element is added to the body
		// and that will negate the transition
		$.wait(100, function() {
			$overlay.addClass('shade');
		});

		$overlay.on($.support.transition.end, function() {
			that.popup('get$popup').addClass('show');
		});
	}


}(window.jQuery);