$(function() {

	// StyleSwitcher
	$('#navbar').find('.dropdown-menu').on('click', 'a', function() {
		setActiveStyleSheet($(this).data('value'));
		// reposition all open popups
		$('*').filter(function() {
			return $(this).data('popup') !== undefined;
		}).each(function() { $(this).popup('position'); });
	});



	// notification
	$('.notification').eq(1).popup();


	var $notify = $('.notification').eq(3);
	var $notifyBtn = $('.notify-btn').eq(1);

	$notify.popup({
		anchor: $notifyBtn,
		classes: 'bubble',
		collision: false,
		destroyOnHide: false,
		position: 'right',
		showArrow: true,
		showClose: true
	});

	$notifyBtn.on('click', function() {
		$notify.popup('toggle');
	});


	var $commonPopup = $('#common-popup').popup({
		anchor: '#common-button',
		autoShow: false,
		classes: 'bubble',
		collision: false,
		showArrow: true,
		showClose: true
	});


	$('#common-button').on('click', function() {
		$commonPopup.popup('toggle');
	});

	$('#lazy-button').on('click', function() {
		var $this = $(this);

		if (!$this.data('popup-ref')) {
			$('<div id="lazy-popup">I am a lazy loaded popup.</div>').popup({
				anchor: $this,
				classes: 'bubble',
				collision: false,
				showArrow: true,
				showClose: true
			});
		}
		else {
			$this.data('popup-ref').popup('toggle');
		}
	});


	$('.main-demo').on('click', function() {

		var $testHtml = $lorem();
		var $this = $(this);
		var placement = $this.data('placement');

		if (!$this.data('popup-ref')) {
			$testHtml.popup({
				anchor: $this,
				classes: 'bubble',
				collision: null,
				destroyOnHide: true,
				placement: placement,
				showArrow: true,
				showClose: true
			});
		}
		else {
			$this.data('popup-ref').popup('hide');
		}
	});


	$('#position-test').on('click', function() {

		var $testHtml = $lorem();
		var $this = $(this);

		var offset = $('#offset-input').val();
		var anchorPoint = $('#anchorPoint-input').val();

		if (!$this.data('popup-ref')) {
			$testHtml.popup({
				anchor: $this,
				anchorPoint: anchorPoint,
				classes: 'bubble',
				collision: false,
				destroyOnHide: true,
				offset: offset,
				placement: 'top',
				showArrow: true,
				showClose: true
			});
		}
		else {
			$this.data('popup-ref').popup('hide');
		}
	});

	$('.fit-demo').on('click', function() {

		var $testHtml = $lorem();
		var $this = $(this);

		if (!$this.data('popup-ref')) {
			var within = $('#within-radios input[name=within]:checked').val();
			console.log(within);

			$testHtml.popup({
				anchor: $this,
				boundary: '50 10 10 10',
				classes: 'bubble ' + ($this.hasClass('vert') ? 'fit-height' : 'fit-width'),
				collision: $this.hasClass('fit') ? 'fit' : null,
				destroyOnHide: true,
				offset: $this.hasClass('front') ? '50px' : $this.hasClass('vert') ? '50%' : '100%-50px',
				placement: $this.data('placement'),
				showArrow: true,
				showClose: true,
				within: within
			});
		}
		else {
			$this.data('popup-ref').popup('hide');
		}
	});


	$('.flip-demo').on('click', function() {

		var $testHtml = $lorem();
		var $this = $(this);

		if (!$this.data('popup-ref')) {
			var within = $('#within-radios input[name=within]:checked').val();
			console.log(within);
			
			$testHtml.popup({
				anchor: $this,
				boundary: '50 10 10 10',
				classes: 'bubble flip-width',
				collision: 'flip',
				destroyOnHide: true,
				placement: $this.data('placement'),
				showArrow: true,
				showClose: true,
				within: within
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
				html: $lorem()[0].outerHTML,
				delay: 3
			},
			dataType: 'jsonp'
		}).done(function(data) {
			$echoPopup.popup('setContent', data.html);
		});

		var $echoPopup = $.popup($ajax, {
			anchor: '#jqXHR-test',
			classes: 'bubble',
			collision: false,
			placement: 'right',
			destroyOnHide: true,
			showArrow: true,
			showClose: true
		});
	});


	// animation demo
	$('.ani-demo').on('click', function() {

		var $testHtml = $lorem();
		var $this = $(this);

		if (!$this.data('popup-ref')) {
			$testHtml.popup({
				anchor: $this,
				animate: true,
				classes: 'bubble ' + $this.data('ani') || '',
				placement: 'right',
				showArrow: true,
				showClose: true
			});
		}
		else {
			$this.data('popup-ref').popup('toggle');
		}
	});




	function $lorem() {
		return $('<div class="popup"><h3 class="heading">Speech Bubble</h3><div class="body">' + lorem() + "</div></div>");
	}

	function lorem() {
		return "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
	}

});