$(function() {

	// notification
	$('.notification').eq(1).popup({
		showArrow: false,
		showClose: false
	});

	$('.notification').eq(3).popup({
		attachTo: $('.notify-btn').eq(1),
		classes: 'bubble',
		collision: false,
		position: 'right',
		showArrow: true,
		showClose: true
	});


	$('.main-demo').on('click', function() {
		var $testHtml = $('<div class="popup">' + lorem() + '</div>');
		var $this = $(this);
		var placement = $this.data('placement');

		if (!$this.data('popup-ref')) {
			$testHtml.popup({
				attachTo: $this,
				classes: 'bubble set-width',
				//collision: false,
				destroyOnHide: true,
				placement: placement
			});
		}
		else {
			$this.data('popup-ref').popup('hide');
		}
	});

	$('#offset-test').on('click', function() {

		var $testHtml = $('<div class="popup">' + lorem() + "</div>");
		var $this = $(this);

		var offset = $('#offset-input').val();

		if (!$this.data('popup-ref')) {
			$testHtml.popup({
				attachTo: $this,
				classes: 'bubble',
				destroyOnHide: true,
				offset: offset,
				placement: 'right'
			});
		}
		else {
			$this.data('popup-ref').popup('hide');
		}
	});

	$('.fit-demo').on('click', function() {

		var $testHtml = $('<div class="popup">' + lorem() + "</div>");
		var $this = $(this);

		if (!$this.data('popup-ref')) {
			$testHtml.popup({
				attachTo: $this,
				boundary: '50 10 10 10',
				classes: 'bubble ' + ($this.hasClass('vert') ? 'fit-height' : 'fit-width'),
				collision: $this.hasClass('fit') ? 'fit' : null,
				destroyOnHide: true,
				offset: $this.hasClass('front') ? '50px' : $this.hasClass('vert') ? '50%' : '100%-50px',
				placement: $this.data('placement')
			});
		}
		else {
			$this.data('popup-ref').popup('hide');
		}

	});

	$('#jqXHR-test').on('click', function() {

		var echo = $('#jqXHR-echo').val();

		var $ajax = $.ajax({
			type: 'GET',
			url: 'http://jsfiddle.net/echo/jsonp/',
			data: {
				html: '<div class="popup">Here is your Echo:<br /><span class="echo"></span></div>',
				echo: echo,
				delay: 3
			},
			dataType: 'jsonp'
		}).done(function(data) {
			$echoPopup.popup('setContent', data.html);
			$echoPopup.find('.echo').text(data.echo);
		});

		var $echoPopup = $.popup($ajax, {
			attachTo: '#jqXHR-test',
			classes: 'bubble',
			collision: false,
			placement: 'right',
			destroyOnHide: true
		});
	});


	function lorem() {
		return "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
	}

});