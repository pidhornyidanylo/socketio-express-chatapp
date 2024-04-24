const chatSheet = document.querySelector(".chat-sheet");
const submitForm = document.querySelector(".submit-form");
const roomName = document.querySelector(".room-name");
const roomInfo = document.querySelector(".room-info");
const usersList = document.getElementById("users-list");
const input = document.getElementById('msg');
const typingBlock = document.querySelector(".typing")
const {
    username,
    room
} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})
const socket = io();
// =====================================================================

socket.emit("join", {
    username,
    room
});

// =====================================================================
socket.on("room-users", ({
    room,
    users
}) => {
    outputRoomName(room);
    outputUsers(users);
    console.log(room);
})

function outputRoomName(room) {
    roomName.innerText = room;
}

function outputUsers(users) {
    usersList.innerHTML = `  
        ${users.map(user => `<li>${user.username}</li>`).join("")}
    `;
}

roomName.addEventListener("mouseenter", (e) => {
    usersList.style.display = "block";
    usersList
})

roomName.addEventListener("mouseleave", (e) => {
    usersList.style.display = "none";
})

// =====================================================================

socket.on("message", (message) => {
    outputMessage(message);
    chatSheet.scrollTop = chatSheet.scrollHeight;
})

submitForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = e.target.elements.msg.value;
    socket.emit("chat-message", message);
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
})

const outputMessage = (message) => {
    const div = document.createElement("div");
    div.classList.add("message");
    if (message.username === username) {
        div.style = "display:flex; justify-content: end;"
    }
    div.innerHTML = `
    <div class="message" style="background-color: azure; display: inline-block; margin-bottom: 20px; padding: 10px 20px; border-radius: 5px;">
        <div class="message-info">
            <span style="${message.username === "BOT" ? "background-color: lightpink;" : "background-color: darkgray;"} padding: 2px 5px; margin-right: 10px; border-radius: 5px">${message.username}</span>
            <span>${message.time}</span>
        </div>
        <hr>
        <span>${message.text}</span>
    </div>
    `
    document.querySelector(".chat-sheet").appendChild(div);
}
// =====================================================================
var timeout = undefined;
let typing = false;

input.addEventListener("keypress", (e) => {
    typing = true;
    socket.emit('typing', {
        user: username,
        typing: true
    });

    // Clear the timeout if it exists
    clearTimeout(timeout);

    // Set a new timeout to reset typing status after 2 seconds
    timeout = setTimeout(() => {
        typing = false;
        socket.emit('typing', {
            user: username,
            typing: false
        });
    }, 2000);
});

socket.on('display', (data) => {
    if (data.typing == true)
        typingBlock.textContent = `${data.user} is typing...`;
    else
        typingBlock.textContent = ``;
});