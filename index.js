const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve the main HTML file
app.get("/", (req, res) => {
	res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
	console.log("a user connected");

	socket.on("user joined", (userName) => {
		io.emit("user joined", userName);
	});

	socket.on("chat", (message) => {
		console.log(message);
		io.emit("chat", message);
	});

	socket.on("disconnect", () => {
		console.log("a user disconnected");
	});
});

// Start the server on port 5000
server.listen(5000, () => {
	console.log("Example app listening on port 5000!");
});
