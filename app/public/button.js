const socket = new WebSocket('ws://157.230.12.97:8080');
const button = document.getElementById('pressButton');
const messagesDiv = document.getElementById('messages');

socket.onopen = () => {
    console.log('Connected to the WebSocket server');
};

socket.onmessage = (event) => {
    const message = "hello";
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.textContent = message;
    messagesDiv.appendChild(messageDiv);
};

socket.onerror = (error) => {
    console.error('WebSocket error: ', error);
};

button.onclick = () => {
    const message = 'A user pressed the button!';
    socket.send(message);  
};
