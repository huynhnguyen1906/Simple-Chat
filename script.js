const socket = io();

let name = prompt("お名前は?");
while (name && name.length > 50) {
	alert("50文字以内で入力してください");
	name = prompt("お名前は?");
}

if (!name) {
	document.body.innerHTML = "";
} else {
	const input = document.querySelector("#input");
	const messages = document.querySelector("#messages");
	const sendButton = document.querySelector("#sendButton");

	function sendMessage() {
		const messageContent = input.innerText.trim();
		if (messageContent.length > 500) {
			alert("500文字以内で入力してください");
			return;
		}
		if (messageContent) {
			socket.emit("chat", { name, value: messageContent });
			input.innerText = "";
		}
	}

	sendButton.addEventListener("click", sendMessage);

	input.addEventListener("keydown", (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	});

	input.addEventListener("paste", (e) => {
		e.preventDefault();
		const text = (e.clipboardData || window.clipboardData).getData("text");
		document.execCommand("insertText", false, text);
		input;
	});

	socket.on("chat", (message) => {
		addMessage(message, message.name === name);
	});

	function addMessage(message, isMine) {
		const messageContent = message.value.replace(/\n/g, "<br>");
		let messageHTML = `
			<div class="${isMine ? "myMessage" : "otherMessage"}">
				${!isMine ? `<span>${message.name}</span>` : ""}
				<p>${messageContent}</p>
			</div>
		`;
		messages.insertAdjacentHTML("beforeend", messageHTML);
		if (isMine) {
			messages.scrollTop = messages.scrollHeight;
		}
	}
}
