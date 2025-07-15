// 🔒 Block if not logged in
const token = localStorage.getItem("token");
if (!token) {
  alert("Please login to view your cart.");
  window.location.href = "/auth.html";
}

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartItemsContainer = document.getElementById("cart-items");
const totalPriceEl = document.getElementById("total-price");

function renderCart() {
  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach((product, index) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <h3>${product.name}</h3>
      <p>Price: ₹${product.price}</p>
      <div>
        <button class="qty-btn" data-index="${index}" data-type="decrease">−</button>
        <span style="margin: 0 10px;">${product.quantity || 1}</span>
        <button class="qty-btn" data-index="${index}" data-type="increase">+</button>
      </div>
      <button class="remove-btn" data-index="${index}">Remove</button>
    `;

    total += product.price * (product.quantity || 1);
    cartItemsContainer.appendChild(card);
  });

  totalPriceEl.textContent = total;
}

renderCart();

// Remove from cart
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-btn")) {
    const index = e.target.getAttribute("data-index");
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }
});

// Place Order
document.getElementById("place-order").addEventListener("click", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login to place an order.");
    window.location.href = "/auth.html";
    return;
  }

  const res = await fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ items: cart })
  });

  const data = await res.json();

  if (res.ok) {
    alert("Order placed successfully!");
    localStorage.removeItem("cart");
    location.reload();
  } else {
    alert(data.message || "Please login to place your order.");
  }
});

// Quantity Change
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("qty-btn")) {
    const index = e.target.getAttribute("data-index");
    const type = e.target.getAttribute("data-type");

    if (type === "increase") {
      cart[index].quantity = (cart[index].quantity || 1) + 1;
    } else if (type === "decrease") {
      cart[index].quantity = Math.max((cart[index].quantity || 1) - 1, 1);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }
});
