const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const namep = urlParams.get('name');
const room = urlParams.get('room');

const socket = io();

let localStream;
let remoteStream;
let peerConnection;
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then((stream) => {
    localStream = stream;
    const localVideo = document.getElementById('local-video');
    localVideo.srcObject = localStream;
    socket.emit('join', room, namep);
  })
  .catch((error) => {
    console.error('Error accessing media devices:', error);
  });

socket.on('user-connected', () => {
  console.log('User connected');
  startCall();
});

socket.on('user-disconnected', () => {
  console.log('User disconnected');
  endCall();
});

// socket.on('ice-candidate', (candidate) => {
//   peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
//     .catch((error) => {
//       console.error('Error adding ICE candidate:', error);
//     });
// });


function startCall() {
  const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
  peerConnection = new RTCPeerConnection(configuration);
  
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });
  
  peerConnection.ontrack = (event) => {
    remoteStream = event.streams[0];
    const remoteVideo = document.getElementById('remote-video');
    remoteVideo.srcObject = remoteStream;
  };
  
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('ice-candidate', room, event.candidate);
    }
  };
  
  socket.on('ice-candidate', (candidate) => {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
      .catch((error) => {
        console.error('Error adding ICE candidate:', error);
      });
  });
  
  peerConnection.createOffer()
  .then((offer) => {
    return peerConnection.setLocalDescription(offer);
  })
  .then(() => {
    socket.emit('offer', room, peerConnection.localDescription);
  })
  .catch((error) => {
    console.error('Error creating offer:', error);
  });
}

socket.on('offer', (offer) => {
  const peerConnection = new RTCPeerConnection();
  
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });
  
  peerConnection.ontrack = (event) => {
    remoteStream = event.streams[0];
    const remoteVideo = document.getElementById('remote-video');
    remoteVideo.srcObject = remoteStream;
  };
  
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('ice-candidate', room, event.candidate);
    }
  };
  
  peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
    .then(() => {
      return peerConnection.createAnswer();
    })
    .then((answer) => {
      return peerConnection.setLocalDescription(answer);
    })
    .then(() => {
      socket.emit('answer', room, peerConnection.localDescription);
    })
    .catch((error) => {
      console.error('Error creating answer:', error);
    });
});

// socket.on('answer', (answer) => {
//   const peerConnection = new RTCPeerConnection();
  
//   localStream.getTracks().forEach((track) => {
//     peerConnection.addTrack(track, localStream);
//   });


socket.on('answer', (answer) => {
  peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
    .catch((error) => {
      console.error('Error setting remote description:', error);
    });

  
//   peerConnection.ontrack = (event) => {
//     remoteStream = event.streams[0];
//     const remoteVideo = document.getElementById('remote-video');
//     remoteVideo.srcObject = remoteStream;
//   };
  
//   peerConnection.onicecandidate = (event) => {
//     if (event.candidate) {
//       socket.emit('ice-candidate', room, event.candidate);
//     }
//   };
  
//   peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
//     .catch((error) => {
//       console.error('Error setting remote description:', error);
//     });
// });

// socket.on('ice-candidate', (candidate) => {
//   peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
//     .catch((error) => {
//       console.error('Error adding ICE candidate:', error);
//     });
});

function toggleMic() {
  const audioTrack = localStream.getAudioTracks()[0];
  audioTrack.enabled = !audioTrack.enabled;
}

function toggleVideo() {
  const videoTrack = localStream.getVideoTracks()[0];
  videoTrack.enabled = !videoTrack.enabled;
}

function endCall() {
  const remoteVideo = document.getElementById('remote-video');
  remoteVideo.srcObject = null;
  remoteStream = null;
}