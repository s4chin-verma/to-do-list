function updateCurrentTime() {
    var currentTimeElement = document.getElementById('current-time');
    var currentTime = new Date().toLocaleTimeString();
    currentTimeElement.textContent = currentTime;
  }
  
  // Update the current time every second
  setInterval(updateCurrentTime, 1000);
  