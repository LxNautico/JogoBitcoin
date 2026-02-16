// Updated script.js to prevent automatic opening of CryptoEncyclopedia on page load

// Function to initialize CryptoEncyclopedia
function initCryptoEncyclopedia() {
    // Create the toggle button
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Open Crypto Encyclopedia';
    toggleButton.onclick = function() {
        // Logic to open CryptoEncyclopedia
        const encyclopedia = document.getElementById('crypto-encyclopedia');
        if (encyclopedia) {
            encyclopedia.style.display = encyclopedia.style.display === 'block' ? 'none' : 'block';
        }
    };
    // Append toggle button to the body or other appropriate container
    document.body.appendChild(toggleButton);
}
// Call function on window load
window.onload = initCryptoEncyclopedia;