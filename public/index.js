document.getElementById('join-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const namep = document.getElementById('name').value;
    const room = document.getElementById('room').value;
    
    // Redirect to video.html with room and name as query parameters
    window.location.href = `/video.html?room=${room}&name=${namep}`;
  });
  