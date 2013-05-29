(function($) {
/*
======== A Handy Little QUnit Reference ========
http://api.qunitjs.com/

Test methods:
	module(name, {[setup][ ,teardown]})
	test(name, callback)
	expect(numberOfAssertions)
	stop(increment)
	start(decrement)
Test assertions:
	ok(value, [message])
	equal(actual, expected, [message])
	notEqual(actual, expected, [message])
	deepEqual(actual, expected, [message])
	notDeepEqual(actual, expected, [message])
	strictEqual(actual, expected, [message])
	notStrictEqual(actual, expected, [message])
	throws(block, [expected], [message])
*/
$(function() {
	var lorem = function() {
		return "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
	};
	$('#modal').text(lorem());
});

test('are plug-ins defined', function() {
	ok($.fn.popup, "$.fn.popups() exists");
	ok($.fn.modal, "$.fn.modal() exists");
});

test('can popup be created', function() {
	var $modal = $('#modal').modal({
		autoOpen : false
	});
	var modal = $modal.data('modal');

	ok($modal, '$modal was created');
	ok(modal, '$modal has .data(\'modal\')');
});


})(jQuery);

