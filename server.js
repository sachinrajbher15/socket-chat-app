const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

let messages = []; // In-memory storage

app.use(express.static('public'));

io.on('connection', socket => {
  console.log('User connected:', socket.id);

  // Send existing messages to the new user
  socket.emit('loadMessages', messages);

  socket.on('sendMessage', msg => {
    const newMsg = { id: Date.now(), text: msg };
    messages.push(newMsg);
    io.emit('newMessage', newMsg);
  });

  socket.on('updateMessage', updated => {
    messages = messages.map(msg => msg.id === updated.id ? { ...msg, text: updated.text } : msg);
    io.emit('messagesUpdated', messages);
  });

  socket.on('deleteMessage', id => {
    messages = messages.filter(msg => msg.id !== id);
    io.emit('messagesUpdated', messages);
  });
});

http.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
