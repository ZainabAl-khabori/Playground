// jshint esversion: 8

$(".book-cover").each(async function() {
	await book(this);
});

async function book(cover) {
	pdfjsLib.GlobalWorkerOptions.workerSrc = "/build/pdf.worker.js";

	var url = $(cover).attr("book");
	var name = url.substring(url.lastIndexOf("/") + 1).split(".")[0];
	var parent = $(cover).parent();
	var index = parent.children().index(cover);
	var coverUrl = $(cover).attr("cover");

	var img = new Image();
	var dims = {};
	img.onload = function() {
		var scale = $(cover).outerWidth(true) / img.width;
		dims.width = $(cover).outerWidth(true);
		dims.height = img.height * scale;
		$(cover).css("height", dims.height);
	};

	img.src = coverUrl;
	$(cover).css("background-image", "url('" + coverUrl + "')");

	var container = $("<div class='book-viewer'></div>");
	container.append("<div class='book-wrapper'><div class='flipbook book'></div></div>");
	container.append("<div class='book-controls'><button type='button' name='close'>X</button></div>");
	var book = $(".book", container)[0];

	var pdf = window.localStorage.getItem(name);
	var saved = true;
	if (!pdf) {
		saved = false;

		var loadingTask = pdfjsLib.getDocument(url);
		pdf = await loadingTask.promise;
	}

	var getViewport = function(page, maxHeight) {
		var pageHeight = saved ? page.height : page.getViewport({ scale: 1 }).height;
		var pageWidth = saved ? page.width : page.getViewport({ scale: 1 }).width;

		var heightScale = maxHeight / pageHeight;
		var widthScale = ($(document).outerWidth(true) - 150) / (pageWidth * 2);
		var scale = Math.min(heightScale, widthScale);

		var viewport = page.getViewport({ scale: scale });
		if (saved) {
			viewport = {
				width: pageWidth * scale,
				height: pageHeight * scale
			};
		}

		return viewport;
	};

	var drawImg = async function(src, canvas) {
		return new Promise(function(resolve, reject) {
			var img = new Image();
			var dims = {};
			img.onload = function() {
				var scale = $(book).parents(".book-viewer").outerWidth(true) / img.width;
				dims.width = $(book).parents(".book-viewer").outerWidth(true);
				dims.height = img.height * scale;

				canvas.width = dims.width;
				canvas.height = dims.height;

				canvas.getContext("2d").drawImage(img, 0, 0, dims.width, dims.height);
				resolve(dims);
			};

			img.src = src;
		});
	};

	var rendered = Array(pdf.numPages).fill(false);
	var renderPage = async function(i, maxHeight) {
		rendered[i - 1] = true;

		var page = saved ? pdf.pages[i - 1] : await pdf.getPage(i);
		var viewport = getViewport(page, maxHeight);

		if (saved) {
			if (pdf.nonBlank.includes(i)) {
				$(".p" + i, book).addClass("non-blank");
			}
		} else {
			var objects = await page.getOperatorList();

			if ($(".p" + i, book).is(".hard") && objects.argsArray.length > 0) {
				$(".p" + i, book).addClass("non-blank");
			}
		}

		var canvas = $("canvas", $(".p" + i, book));
		canvas.attr("width", viewport.width);
		canvas.attr("height", viewport.height);

		if (saved) {
			var dims = await drawImg(page.data, canvas[0]);
			$(".book-loading", $(".p" + i, book)).remove();
			return dims;
		} else {
			if (canvas.length > 0) {
				var context = canvas[0].getContext("2d");
				var renderContext = {
					canvasContext: context,
					viewport: viewport
				};

				page.render(renderContext);
				$(".book-loading", $(".p" + i, book)).remove();
			} else {
				rendered[i - 1] = false;
			}
			return viewport;
		}
	};

	if (index === 0) {
		parent.prepend(container);
	} else {
		$(parent.children()[index - 1]).after(container);
	}

	var numPages = pdf.numPages % 2 === 1 ? pdf.numPages + 1 : pdf.numPages;
	for (var i = 0; i < numPages; i++) {
		var bookPage = $("<div class='p" + (i + 1) + "'><canvas></canvas></div>");

		if (i < 2 || i > (numPages - 3)) {
			bookPage.addClass("hard");
		}

		bookPage.append("<div class='gradient'></div>");
		bookPage.append("<img class='book-loading' src='../loading-icon.gif' alt='loading'>");
		$(book).append(bookPage);
	}

	var finalHeight = $(window).outerHeight(true) * 0.75;
	var scale = finalHeight / dims.height;
	var finalWidth = dims.width * scale;

	$(book).parents(".book-wrapper").css("width", finalWidth * 2);
	$(book).parents(".book-viewer").css("height", finalHeight);

	$(book).turn({
		width: finalWidth * 2,
		height: finalHeight,
		autoCenter: true,
		duration: 1000
	});

	var top = $(book).offset().top;
	var left = $(book).offset().left;
	$(book).parents(".book-viewer").hide();

	var close = false;
	$(cover).click(async function() {
		$(this).css("pointer-events", "none");
		$(book).parents(".book-viewer").fadeIn();
		$(book).turn("page", 3);
		await renderPage(3, finalHeight);
	});

	$(book).on("turning", async function(e, pageNum, view) {
		var range = $(this).turn("range");
		for (var i = range[0]; i <= range[1]; i++) {
			var canvas = $("canvas", $(".p" + i, book));
			if (i <= pdf.numPages && !rendered[i - 1] && canvas.length > 0) {
				await renderPage(i, finalHeight);
			}
		}
	});

	var closeBook = function() {
		close = false;
		$(book).parents(".book-viewer").fadeOut(function() {
			$(cover).css("pointer-events", "");
			if ($(book).turn("page") === pdf.numPages) {
				$(book).turn("page", 1);
			}
		});
	};

	$("button[name='close']", container).click(function() {
		close = true;
		var current = $(book).turn("page");
		if (current !== 1 && current !== pdf.numPages) {
			$(book).turn("page", 1);
		} else {
			closeBook();
		}
	});

	$(book).on("turned ", async function(e, pageNum, view) {
		if (close) {
			closeBook();
		}
	});
}
