/*
 * jquery.modal.js
 * By: Harris Miller
 * For: Makrit On Demand
 * Requires: jquery.popups.js
 */

!function($) {

	if (!$.fn.popup) {
		$.error('jquery.modal.js requires jquery.popups.js');
		return;
	}

	// integrated transitionEnd module
	// from Twitter Boostrap (boostrap-transition.js)
	var transitionEnd = (function() {
		var el = document.createElement('modal');
		var transEndEventNames = {
			'WebkitTransition' : 'webkitTransitionEnd',
			'MozTransition' : 'transitionend',
			'OTransition' : 'oTransitionEnd otransitionend',
			'transition' : 'transitionend'
		};

		for(var name in transEndEventNames) {
			if (el.style[name] !== undefined) {
				return transEndEventNames[name];
			}
		}

		// return null is browser does not support transitions
		return null;
	})();

	var Modal = function($el, options) {
		this.options = options;
		this.$el = $el;
		this._$body = $(document.body);
		this.isOpen = false;

		this._create();
	};

	Modal.prototype._create = function() {
		var that = this;
		var o = this.options;

		// background-image is a base64 encodement of a 1x1 px png of rbg(0,0,0,.7)
		// we do this too support down to IE7
		var overlayStyles = [
			'style="',
			'background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQI12NgYGDYDAAAuAC0TCbBxgAAAABJRU5ErkJggg==);',
			'bottom: 0;',
			'left: 0;',
			'opacity: 0;',
			'overflow-x: auto;',
			'overflow-y: auto;',
			'position: fixed;',
			'right: 0;',
			'top: 0;',
			'transition: opacity ' + o.transitionTime + 's;',
			'width: 100%;',
			'z-index: ' + o.zIndex + ';',
			'"'
		].join('');

		this.$overlay = $('<div class="overlay" ' + overlayStyles + '></div>').appendTo(this._$body);

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
		this.$overlay.find('.popup-close').off('click.popup').on('click.modal', function() {
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
		this.$overlay.show().addClass('show');
		// timeout so DOM renderer can change element's state first before applying transition
		// as recommended: https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Using_CSS_transitions#Which_CSS_properties_are_animatable.3F
		window.setTimeout(function() {
			that.$overlay.css('opacity', 1);
		}, 20);

		this._$body.css('overflow', 'hidden');

		// close on escape
		if (this.options.closeOnEscape) {
			this._$body.on('keydown.modal', function(e) {
				// keycode 27 = escape
				if (e.keyCode == 27) {
					that.close();
				}
			});
		}
	};

	Modal.prototype.close = function() {
		var that = this;
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
			// transition close if set and browser can
			if (this.options.transition && transitionEnd) {
				this.$overlay.one(transitionEnd, function() {
					that._closeModal();
				});
			}
			else{
				this._closeModal.call(that);
			}
			this.$overlay.css('opacity', 0);
		}
	};

	Modal.prototype.toggle = function() {
		this.isOpen ? this.close() : this.open();
	};

	Modal.prototype.destroy = function() {
		var that = this;

		// remove saveTo ref
		if (this.options.saveTo) {
			$(this.options.saveTo).removeData('modal-ref');
		}
		this.$el.trigger('modalDestroy');
		// transition close if set and browser can
		if (this.options.transition && transitionEnd) {
			this.$overlay.one(transitionEnd, function() {
				that._closeModal.call(that);
			});
		}
	};

	Modal.prototype.replaceContent = function(content) {
		this.$el.popup('replaceContent', content);
	};

	Modal.prototype._closeModal = function() {
		this.options.destoryOnClse ? this.$overlay.remove() : this.$overlay.hide();
		this._$body.css('overflow', 'visible').off('.modal');
	};


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
				this.done(function() {
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
					// if method/property exists and is not private (all private methods begin with _)
					if (instance[option] && !option.match(/^_/)) {
						// if function
						if (typeof instance[option] == 'function') {
							rtnValue = instance[option](args);
						}
						// if property
						else {
							rtnValue = instance[option];
						}

						if (rtnValue) {
							return false; // break out of .each
						}
					}
					else {
						$.error("fn.Modal says: Method or Property you are trying to call is either private or does not exist");
					}
				}
				// if option was not passed, toggle the modal
				else if(!option) {
					instance.toggle();
				}
				// if some other invalid value was passed as option (say a function or a number), nothing will happen
			}
		});

		// return either the value returned a method of the instance called, or simply return itself
		return rtnValue || this;
	};

	$.fn.modal.defaults = {
		autoOpen : true,
		closeOnEscape : true,
		destroyOnClose : false,
		popupClass : '',
		saveTo : null,
		transition : true,
		transitionTime : 0.6,
		zIndex : 5000
	};

}(window.jQuery);