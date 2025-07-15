document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token"); // ✅ Clear the token on logout
  window.location.href = "/";
});

// Add product handler
document.getElementById("addProductForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token"); // ✅ Get token

  const product = {
    name: document.getElementById("name").value,
    image: document.getElementById("image").value,
    category: document.getElementById("category").value,
    price: document.getElementById("price").value,
    description: document.getElementById("description").value,
  };

  const msg = document.getElementById("formMsg");
  msg.textContent = "Adding product...";

  try {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token // ✅ Token header added
      },
      body: JSON.stringify(product)
    });

    const data = await res.json();
    if (res.ok) {
      msg.style.color = "green";
      msg.textContent = "✅ Product added!";
      e.target.reset();
    } else {
      msg.style.color = "red";
      msg.textContent = data.message || "Failed to add product";
    }
  } catch (err) {
    msg.style.color = "red";
    msg.textContent = "Server error";
  }
});

async function loadProducts() {
  const container = document.getElementById("productList");
  container.innerHTML = "Loading...";

  try {
    const res = await fetch("/api/products");
    const products = await res.json();

    container.innerHTML = "";

    products.forEach((product) => {
      const div = document.createElement("div");
      div.className = "product-card";
      div.innerHTML = `
        <img src="${product.image}" alt="${product.name}" />
        <h4>${product.name}</h4>
        <p>₹${product.price}</p>
        <button onclick="deleteProduct('${product._id}')">Delete</button>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    container.innerHTML = "Failed to load products";
  }
}

async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  const token = localStorage.getItem("token"); // ✅ Get token

  try {
    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + token // ✅ Token header added
      }
    });

    if (res.ok) {
      alert("Product deleted");
      loadProducts();
    } else {
      alert("Failed to delete");
    }
  } catch {
    alert("Server error");
  }
}

loadProducts();
