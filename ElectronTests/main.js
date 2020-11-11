// jshint esversion: 8

var { app, BrowserWindow, screen } = require("electron");

function createWindow(size, file) {
	var win = new BrowserWindow({
		width: size.width,
		height: size.height,
		webPreferences: { nodeIntegration: true }
	});

	win.loadFile(file);
}

app.whenReady().then(function() {
	var size = screen.getPrimaryDisplay().workAreaSize;
	createWindow(size, "main.html");
});

app.on("window-all-closed", function() {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", function() {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

console.log(123456789);