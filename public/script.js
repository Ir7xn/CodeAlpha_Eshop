
// If token exists in localStorage, allow user
const token = localStorage.getItem("token");

if (!token) {
  // Check URL params for Google login
  const urlParams = new URLSearchParams(window.location.search);
  const gToken = urlParams.get("token");
  const name = urlParams.get("name");

  if (gToken && name) {
    localStorage.setItem("token", gToken);
    localStorage.setItem("name", name);
    // Optionally clean up URL
    window.history.replaceState({}, document.title, "/index.html");
  } else {
    window.location.href = "auth.html"; // or your login/signup page
  }
}

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function updateCartCount() {
  document.getElementById("cart-count").textContent = cart.length;
}

fetch('/api/products')
  .then(res => res.json())
  .then(products => {
    const container = document.getElementById('products');
    container.innerHTML = ''; // clear any existing content

    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <h3>${product.name}</h3>
        <p><strong>₹${product.price}</strong></p>
        <p>${product.description}</p>
        <button class="add-to-cart">Add to Cart</button>
      `;

      // Add event listener to button
      const button = card.querySelector('.add-to-cart');
      button.addEventListener('click', () => {
        cart.push(product);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        alert(`${product.name} added to cart!`);
      });

      container.appendChild(card);
    });

    // Call this after rendering products
    updateCartCount();
  })
  .catch(err => console.error('Error fetching products:', err));

// Logout handler
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "auth.html";
});

// Call once in case page loads before products
updateCartCount();

// Sidebar toggle
document.getElementById("openSidebar").addEventListener("click", () => {
  document.getElementById("sidebar").style.width = "250px";
});

document.getElementById("closeSidebar").addEventListener("click", () => {
  document.getElementById("sidebar").style.width = "0";
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "auth.html";
});
