$("#menu-toggle").click(function(e) {
	e.preventDefault();
	$("#wrapper").toggleClass("toggled");
});

$(function () {
	$('[data-toggle="tooltip"]').tooltip();
});
$("[data-toggle=popover]").popover({
	html : true,
	trigger: 'focus',
	content: function() {
		var content = $(this).attr("data-popover-content");
		return $(content).children(".popover-body").html();
	}
});