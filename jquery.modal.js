//
// jquery.modal.js
// requires jquery.popups.js
//

!function($) {

	if (!$.popup) {
		$.error('popups.extensions.js requires jquery.popups.js');
		return;
	}

	var Modal = function($el, options) {
		this.options = options;
		this.$el = $el;
		this.$overlay = $('<div class="overlay"></div>');
		this.$body = $(document.body);

		this.create();
	}

	Modal.prototype.create = function() {
		var that = this;

		var popup_options = {
			align: 'middle',
			destroyOnClose: false,
			showX: true
		};
		popup_options.className = 'modal' + this.options.className ? ' ' + this.options.className : '';

		this.$el.popup(popup_options).popup('get$popup').appendTo(this.$overlay);
		this.$overlay.appendTo(document.body).hide();

		this.$overlay.find('.popup-x').off('click').on('click', function() {
			that.close();
		});

		if (this.options.autoOpen) {
			that.open();
		}
	};


	Modal.prototype.open = function() {
		this.$overlay.show();

		this.$body.addClass('no-scroll').on('keydown.no-scroll', function(e) {
			// the background is still scrollable via the press of the spacebar
			// we deactivate that here (keyCode 32 = spacebar)
			if (e.keyCode == 32) {
				e.preventDefault();
				// transfer to overlay
			}
		})

		// TODO: refocus is focused on background
		this.$body.on('focus', function(e) {
			if (!$(e.target).closest($overlay)) {
				$overlay.trigger('focus');
			}
		});
	};

	Modal.prototype.close = function() {
		this.$overlay.hide();
		this.$body.removeClass('no-scroll').off('.no-scroll');
	};

	Modal.prototype.destroy = function() {
		this.$el.popup('destroy');
		this.$overlay.remove();
	};

	Modal.prototype.toggle = function() {
		
	}


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

			if (typeof option == 'string') {
				if (instance[option]) {
					rtnValue = instance[option](arg);
					return false;
				}
			}
			else {
				instance.open();
			}
		});

		return rtnValue || this;
	};

	$.fn.modal.defaults = {
		autoOpen : true,
		className : '',
		closeOnEscape : true,
		destroyOnClose : false
	};

}(window.jQuery);