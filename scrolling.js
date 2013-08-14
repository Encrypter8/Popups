$(function() {
	var keyHold = false;
	var keyHoldCode = false;

	$(document).keydown(function(ev) {
		if (!keyHold && !ev.ctrlKey && !ev.altKey) {
			// up, w
			if (ev.keyCode == 38 || ev.keyCode == 87) { // 38 = up, 87 = w
				ev.preventDefault();
				if ($(window).scrollTop() > 0) {
					keyHold = true;
					keyHoldCode = setInterval(function() {
						if (keyHold) {
							jQuery.scrollTo("-=12");
						}
					}, 20);
				}
				return false;
			// down, s
			} else if (ev.keyCode == 40 || ev.keyCode == 83) { // 40 = down, 83 = s
				ev.preventDefault();
				keyHold = true;
				keyHoldCode = setInterval(function() {
					if (keyHold) {
						jQuery.scrollTo("+=12");
					}
				}, 20);
				return false;
			}
		}
	});

	$(document).keyup(function(ev) {
		if ($.inArray(ev.keyCode, [37, 65, 39, 68, 38, 87, 40, 83])) {
			keyHoldCode = window.clearInterval(keyHoldCode);
			keyHold = false;
		}
	});
});