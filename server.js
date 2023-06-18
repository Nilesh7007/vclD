const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    socket.on('join', (room, namep) => {
      socket.join(room);
      socket.broadcast.to(room).emit('user-connected', namep);
  
      socket.on('disconnect', () => {
        socket.broadcast.to(room).emit('user-disconnected', namep);
      });
    });
  
    socket.on('toggle-mic', (room) => {
      socket.broadcast.to(room).emit('toggle-mic', room);
    });
  
    socket.on('toggle-video', (room) => {
      socket.broadcast.to(room).emit('toggle-video', room);
    });
  
    socket.on('offer', (room, offer) => {
      socket.to(room).emit('offer', offer);
    });
  
    socket.on('answer', (room, answer) => {
      socket.to(room).emit('answer', answer);
    });
  
    socket.on('ice-candidate', (room, candidate) => {
      socket.to(room).emit('ice-candidate', candidate);
    });
  });

const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});