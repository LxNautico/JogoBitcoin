// Assuming your code looks like this:

// Initialize the encyclopedia container with display: none
const encyclopediaContainer = document.getElementById('encyclopedia');
encyclopediaContainer.style.display = 'none';

// Your other initialization code...

// Update the event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    CryptoEncyclopedia.init(); // Initializing the Encyclopedia
    // Ensure that the encyclopedia remains closed by default
    encyclopediaContainer.style.display = 'none';
});
