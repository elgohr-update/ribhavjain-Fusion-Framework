$(Configuration.tab).append(
	"<canvas id='rubberbandCanvas' style='cursor: crosshair;'>" +
	"<img src='" + Configuration.url + "' id='rubberbandimage'></img>" +
	"</canvas>" +
	"<div id='rubberbandDiv'></div>" +
	"<div id='rubberbandFormDiv'><form id='rubberbandForm' action='#' onsubmit='return false;'>" +
	"<fieldset>" +
	"<label for='rubberbandFormTag'>Tag :</label><input type='text' id='rubberbandFormTag' />" +
	"<label for='rubberbandFormComment'>Comment :</label><textarea type='text' id='rubberbandFormComment'></textarea>" +
	"</fieldset>" +
	"<input type='button' id='rubberbandFormSubmit' value='Submit' />" +
	"<input type='button' id='rubberbandFormCancel' value='Cancel' />" +
	"</form></div>"
	);

var mousedown = {},
	rubberbandRectangle = {},
	dragging = false;

// ----------------------------------------------------------------------
// IMAGE LOADED CODE
// ----------------------------------------------------------------------
$("#rubberbandimage").on("load", function() {
	var image = $("#rubberbandimage")[0];
	var canvas = $("#rubberbandCanvas")[0];
	var context = canvas.getContext('2d');

	if (image.width < 750) {
		canvas.width = image.width;
		canvas.height = image.height;
	} else {
		canvas.width = 750;
		canvas.height = image.height * (canvas.width / image.width);
	}
	context.drawImage(image, 0, 0, canvas.width, canvas.height);
});

// ----------------------------------------------------------------------
// RUBBER BAND CODE
// ----------------------------------------------------------------------
function rubberbandStart(x, y) {
	mousedown.x = x;
	mousedown.y = y;

	rubberbandRectangle.left   = mousedown.x;
	rubberbandRectangle.top    = mousedown.y;
	rubberbandRectangle.width  = 0,
	rubberbandRectangle.height = 0;

	resizeRubberbandDiv();
	moveRubberbandDiv();
	showRubberbandDiv();

	dragging = true;
}

function rubberbandStretch(x, y) {
	rubberbandRectangle.left   = x < mousedown.x ? x : mousedown.x;
	rubberbandRectangle.top    = y < mousedown.y ? y : mousedown.y;
	rubberbandRectangle.width  = Math.abs(x - mousedown.x),
	rubberbandRectangle.height = Math.abs(y - mousedown.y);

	moveRubberbandDiv();
	resizeRubberbandDiv();
}

function rubberbandEnd() {
	var canvas = $("#rubberbandCanvas")[0];
	var rubberbandFormDiv = $("#rubberbandFormDiv")[0];
	var bbox = canvas.getBoundingClientRect();

   //rubberbandDiv.style.width = 0;
   //rubberbandDiv.style.height = 0;

   //hideRubberbandDiv();

   rubberbandFormDiv.style.display = 'inline';
   rubberbandFormDiv.style.top  = (canvas.offsetTop + rubberbandRectangle.top)  + 'px';
   rubberbandFormDiv.style.left = (canvas.offsetLeft + rubberbandRectangle.left + rubberbandRectangle.width) + 'px';

   dragging = false;
}

function moveRubberbandDiv() {
	var canvas = $("#rubberbandCanvas")[0];
	var rubberbandDiv = $("#rubberbandDiv")[0];

	rubberbandDiv.style.top  = (canvas.offsetTop + rubberbandRectangle.top) + 'px';
	rubberbandDiv.style.left = (canvas.offsetLeft + rubberbandRectangle.left) + 'px';
}

function resizeRubberbandDiv() {
	var rubberbandDiv = $("#rubberbandDiv")[0];

	rubberbandDiv.style.width  = rubberbandRectangle.width + 'px';
	rubberbandDiv.style.height = rubberbandRectangle.height + 'px';
}

function showRubberbandDiv() {
	var rubberbandDiv = $("#rubberbandDiv")[0];
	var rubberbandFormDiv = $("#rubberbandFormDiv")[0];

	rubberbandFormDiv.style.display = 'none';
	rubberbandDiv.style.display = 'inline';
}

function hideRubberbandDiv() {
	var rubberbandDiv = $("#rubberbandDiv")[0];
	var rubberbandFormDiv = $("#rubberbandFormDiv")[0];

	rubberbandDiv.style.display = 'none';
	rubberbandFormDiv.style.display = 'none';
}

function resetRubberband() {
	var image = $("#rubberbandimage")[0];
	var canvas = $("#rubberbandCanvas")[0];
	var context = canvas.getContext('2d');
	var rubberbandDiv = $("#rubberbandDiv")[0];

	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	context.drawImage(image, 0, 0, canvas.width, canvas.height);
	rubberbandDiv.style.width = 0;
	rubberbandDiv.style.height = 0;
	hideRubberbandDiv();
}

// ----------------------------------------------------------------------
// CANVAS MOUSE EVENT HANDLERS
// ----------------------------------------------------------------------
$("#rubberbandCanvas").on("mousedown", function (e) {
	var x = e.offsetX;
	var y = e.offsetY;

	e.preventDefault();
	rubberbandStart(x, y);
});

$("#rubberbandCanvas").on("mousemove", function (e) {
	var x = e.offsetX;
	var y = e.offsetY;

	e.preventDefault();
	if (dragging) {
		rubberbandStretch(x, y);
	}
});

$("#rubberbandCanvas").on("mouseup", function (e) {
	e.preventDefault();
	rubberbandEnd();
});

// ----------------------------------------------------------------------
// FORM SUBMISSIONS
// ----------------------------------------------------------------------
$("#rubberbandFormSubmit").on("click", function(e) {
	var canvas = $("#rubberbandCanvas")[0];
	var x = rubberbandRectangle.left / canvas.width;
	var y = rubberbandRectangle.top / canvas.height;
	var w = rubberbandRectangle.width / canvas.width;
	if (x + w > 1) {
		w = 1.0 - x;
	}
	var h = rubberbandRectangle.height / canvas.height;
	if (y + h > 1) {
		h = 1.0 - y;
	}
	if ($("#rubberbandFormTag").val() != "") {
		var text = $("#rubberbandFormTag").val();
		var request = window.jsRoutes.controllers.Datasets.tag(Configuration.id).ajax({
			data: JSON.stringify({ text:   text, 
								   fileid: Configuration.fileid,
								   x:      x,
								   y:      y,
								   w:      w,
								   h:      h }),
			type: 'POST',
			contentType: "application/json",
		});

		request.done(function (response, textStatus, jqXHR){ 
			var url = window.jsRoutes.controllers.Tags.search(text).url;
			$('#tagList').append("<li><a href='" + url + "'>" + text + "</a></li>");
			$('#tagField').val("");
		});

		request.fail(function (jqXHR, textStatus, errorThrown){
			console.error("The following error occured: " + textStatus, errorThrown);
		});

		$("#rubberbandFormTag").val("");
	}
	if ($("#rubberbandFormComment").val() != "") {
		var text = $("#rubberbandFormComment").val();
		var request = window.jsRoutes.controllers.Datasets.comment(Configuration.id).ajax({
			data: JSON.stringify({ text:   text, 
								   fileid: Configuration.fileid,
								   x:      x,
								   y:      y,
								   w:      w,
								   h:      h }),
			type: 'POST',
			contentType: "application/json",
		});

		request.done(function (response, textStatus, jqXHR){ 
			//console.log("Response " + response);
		});

		request.fail(function (jqXHR, textStatus, errorThrown){
			console.error("The following error occured: " + textStatus, errorThrown);
		});

		$("#rubberbandFormComment").val("");
	}
	rubberbandFormTag.value = "";
	resetRubberband();
	return false;
});


$("#rubberbandFormCancel").on("click", function(e) {
	$("#rubberbandFormTag").val("");
	$("#rubberbandFormComment").val("");
	resetRubberband();
	return false;
});