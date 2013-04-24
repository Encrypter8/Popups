//
// jquery.modal.js
// requires jquery.popups.js
//

!function($) {

	if (!$.fn.popup) {
		$.error('popups.extensions.js requires jquery.popups.js');
		return;
	}

	var Modal = function($el, options) {
		this.options = options;
		this.$el = $el;
		this.$overlay = $('<div class="overlay"></div>');
		this.$body = $(document.body);
		this.$isOpen = false;

		this._create();
	}

	Modal.prototype._create = function() {
		var that = this;

		var popup_options = {
			align: 'middle',
			destroyOnClose: false,
			showClose: true
		};
		popup_options.popupClass = 'modal' + (this.options.popupClass ? ' ' + this.options.popupClass : '');

		this.$popup = this.$el.popup(popup_options).popup('$popup');
		this.$popup.appendTo(this.$overlay);
		this.$overlay.appendTo(document.body).hide();

		// reset $.fn.popup's .popup-close functionality
		this.$overlay.find('.popup-close').off('click').on('click', function() {
			that.close();
		});

		if (this.options.autoOpen) {
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
		if (that.options.closeOnEscape) {
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
	$.fn.modal = function (option, arg) {
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
						rtnValue = instance[option](arg);
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
		popupClass : '',
		closeOnEscape : true,
		destroyOnClose : false
	};

}(window.jQuery);