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
			'background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQI12NgYGDYDAAAuAC0TCbBxgAAAABJRU5ErkJggg==);',
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
			showClose : true,
			zIndex : o.zIndex + 5
		};

		if (o.saveTo) {
			$(o.saveTo).data('modal-ref', this.$el);
		}

		popup_options = $.extend({}, o, popup_options);

		// popup_options.saveTo = null, since we are saving 'modal-ref' instead
		popup_options.saveTo = null;

		popup_options.popupClass = 'modal' + (o.popupClass ? ' ' + o.popupClass : '');

		this.$el.popup(popup_options);
		this.$overlay.hide();

		// reset $.fn.popup's .popup-close functionality
		this.$overlay.find('.popup-close').on('click', function() {
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
			this.$overlay.hide();
			this.$body.css('overflow', 'visible').off('.modal');
		}
	};

	Modal.prototype.destroy = function() {
		if (this.options.saveTo) {
			$(this.options.saveTo).removeData('modal-ref');
		}
		this.$el.trigger('modalDestroy');
		this.$body.css('overflow', 'visible').off('.modal');
		this.$overlay.remove();
	};

	Modal.prototype.replaceContent = function(content) {
		this.$el.popup('replaceContent', content);
	}


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
				this.done(function(data) {
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
					if (instance[option]) {
						rtnValue = instance[option](args);
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
		saveTo : null,
		zIndex : 5000
	};

}(window.jQuery);