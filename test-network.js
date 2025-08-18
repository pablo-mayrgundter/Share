// Quick test to verify MSW catch-all is working
fetch('https://api.github.com/test')
  .then(response => response.json())
  .then(data => console.log('Network call succeeded:', data))
  .catch(error => console.log('Network call failed:', error.message))