const socket = io();

let name = prompt("お名前は?");
while (name && name.length > 50) {
	alert("50文字以内で入力してください");
	name = prompt("お名前は?");
}

if (!name) {
	document.body.innerHTML = "";
} else {
	socket.emit("user joined", name);

	const input = document.querySelector("#input");
	const messages = document.querySelector("#messages");
	const sendButton = document.querySelector("#sendButton");
	const emojiButton = document.querySelector("#emojiButton");
	const stickerButton = document.querySelector("#stickerButton");
	const emojiPopup = document.querySelector("#emojiPopup");
	const stickerPopup = document.querySelector("#stickerPopup");
	const userButton = document.querySelector("#userButton");
	const userPopup = document.querySelector("#userPopup");

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

	emojiButton.addEventListener("click", () => {
		emojiPopup.style.display = emojiPopup.style.display === "block" ? "none" : "block";
	});

	stickerButton.addEventListener("click", () => {
		stickerPopup.style.display = stickerPopup.style.display === "block" ? "none" : "block";
	});

	emojiPopup.addEventListener("click", (e) => {
		if (e.target.classList.contains("emoji")) {
			input.innerText += e.target.innerText;
			emojiPopup.style.display = "none";
			sendMessage();
		}
	});

	stickerPopup.addEventListener("click", (e) => {
		if (e.target.classList.contains("sticker")) {
			socket.emit("chat", { name, value: `<img src="${e.target.src}" alt="sticker">` });
			stickerPopup.style.display = "none";
		}
	});

	document.addEventListener("click", (e) => {
		if (!emojiPopup.contains(e.target) && e.target !== emojiButton) {
			emojiPopup.style.display = "none";
		}
		if (!stickerPopup.contains(e.target) && e.target !== stickerButton) {
			stickerPopup.style.display = "none";
		}
		if (!userPopup.contains(e.target) && e.target !== userButton) {
			userPopup.style.display = "none";
		}
	});

	userButton.addEventListener("click", () => {
		userPopup.style.display = userPopup.style.display === "block" ? "none" : "block";
	});

	socket.on("chat", (message) => {
		addMessage(message, message.name === name);
	});

	socket.on("user joined", (userName) => {
		if (userName === name) {
			addMessage(
				{
					name: "System",
					value: "<span>あなた</span> がルームに参加しました。",
				},
				false
			);
		} else {
			addMessage({ name: "System", value: `<span>${userName}</span> さんが参加しました。` }, false);
		}
		updateUserList();
	});

	socket.on("user left", (userName) => {
		addMessage({ name: "System", value: `<span>${userName}</span> さんが退出しました。` }, false);
		updateUserList();
	});

	function addMessage(message, isMine) {
		const messageContent = message.value.replace(/\n/g, "<br>");
		let messageHTML;

		if (message.name === "System") {
			messageHTML = `
            <div class="systemMessage">
                <p>${messageContent}</p>
            </div>
        `;
		} else {
			if (messageContent.includes("<img")) {
				messageHTML = `
                <div class="${isMine ? "myMessage" : "otherMessage"}">
                    ${!isMine ? `<span>${message.name}</span>` : ""}
                    <div class="imageMessage">${messageContent}</div>
                </div>
            `;
			} else {
				messageHTML = `
                <div class="${isMine ? "myMessage" : "otherMessage"}">
                    ${!isMine ? `<span>${message.name}</span>` : ""}
                    <p>${messageContent}</p>
                </div>
            `;
			}
		}

		messages.insertAdjacentHTML("beforeend", messageHTML);
		if (isMine) {
			messages.scrollTop = messages.scrollHeight;
		}
	}

	function updateUserList() {
		socket.emit("get users");
	}

	socket.on("users", (users) => {
		userPopup.innerHTML = users
			.map(
				(user) => `
            <div class="user">
			<span class="icon"></span>
			<span>${user}</span>
			<span class="status"></span>
            </div>
        `
			)
			.join("");
	});
}
