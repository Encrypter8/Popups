/*
 * jquery.modal.js
 * By: Harris Miller
 * For: Makrit On Demand
 * Requires: jquery.popups.js
 */

!function($) {

	if (!$.fn.popup) {
		$.error('popups.extensions.js requires jquery.popups.js');
		return;
	}

	var Modal = function($el, options) {
		this.options = options;
		this.$el = $el;
		this.$body = $(document.body);
		this.isOpen = false;

		this._create();
	}

	Modal.prototype._create = function() {
		var that = this;
		var o = this.options

		// background-image is a base64 encodement of a 1x1 px png of rbg(0,0,0,.7)
		// we do this too support down to IE7
		var overlayStyles = [
			'style="',
			'background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QQTFiM7wlG6ZwAAAAxpVFh0Q29tbWVudAAAAAAAvK6ymQAAAA1JREFUCNdjYGBg2AwAALgAtEwmwcYAAAAASUVORK5CYII=);',
			'bottom: 0;',
			'left: 0;',
			'overflow-x: auto;',
			'overflow-y: auto;',
			'position: fixed;',
			'right: 0;',
			'top: 0;',
			'width: 100%;',
			'z-index: ' + that.options.zIndex + ';',
			'"'
		].join('');

		this.$overlay = $('<div class="overlay" ' + overlayStyles + '></div>').appendTo(document.body);

		var popup_options = {
			align : 'middle',
			appendTo : that.$overlay,
			destroyOnClose : false,
			showClose : true,
			zIndex : o.zIndex + 5
		};
		popup_options.popupClass = 'modal' + (o.popupClass ? ' ' + o.popupClass : '');

		this.$el.popup(popup_options);
		this.$overlay.hide();

		// reset $.fn.popup's .popup-close functionality
		this.$overlay.find('.popup-close').off('click').on('click', function() {
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

		this.isOpen = true;
		this.$overlay.show();

		this.$body.css('overflow', 'hidden');

		// TODO:
		// apparently triggering the event 'scroll' won't actually scroll the window or element
		// need to figure out how to actually do this
		this.$body.on('keydown.modal', function(e) {
			// keycode 32 = space
			if (e.keyCode == 32) {
				e.preventDefault();
				that.$overlay.trigger('scroll');
			}
		});

		// close on escape
		if (this.options.closeOnEscape) {
			this.$body.on('keydown.modal', function(e) {
				// keycode 27 = escape
				if (e.keyCode == 27) {
					that.close();
				}
			});
		}
	};

	Modal.prototype.close = function() {
		if (this.options.destroyOnClose) {
			this.destroy();
		}
		else {
			this.isOpen = false;
			this.$overlay.hide();
			this.$body.css('overflow', 'visible').off('.modal');
		}
	};

	Modal.prototype.destroy = function() {
		this.$el.popup('destroy');
		this.$overlay.remove();
	};


	//
	// Define $.fn.Modal
	//
	$.fn.modal = function (option) {
		var rtnValue = null;
		this.each(function() {
			var $this = $(this);
			var instance = $this.data('modal');

			if (!instance) {
				var options = $.extend({}, $.fn.modal.defaults, typeof option == 'object' && option);
				$this.data('modal', (instance = new Modal($this, options)));
			}
			else {
				if (typeof option == 'string') {
					if (instance[option]) {
						rtnValue = instance[option]();
						return false;
					}
				}
				else {
					instance.open();
				}
			}
		});

		return rtnValue || this;
	};

	$.fn.modal.defaults = {
		autoOpen : true,
		closeOnEscape : true,
		destroyOnClose : false,
		popupClass : '',
		zIndex : 5000
	};

}(window.jQuery);