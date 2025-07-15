// Flip the card
function flipCard() {
  const container = document.getElementById("flip-container");
  const wrapper = document.querySelector(".flip-wrapper");

  container.classList.toggle("flipped");
  wrapper.classList.toggle("flipped");
}

// Show message on screen
function showMessage(type, text, boxId) {
  const msgBox = document.getElementById(boxId);
  msgBox.className = ""; // Reset
  msgBox.classList.add(type === "success" ? "success" : "error");
  msgBox.classList.remove("hidden");
  msgBox.textContent = text;
  setTimeout(() => msgBox.classList.add("hidden"), 4000);
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  showMessage("success", "Logging in...", "messageBox");

  try {
    const res = await fetch("/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

if (res.ok) {
  localStorage.setItem("token", data.token);
  showMessage("success", "Redirecting... Happy Shopping!", "messageBox");

  setTimeout(() => {
    window.location.href = data.redirectTo;  // Dynamic redirect
  }, 2000);
}

 else {
      showMessage("error", data.message || "Login failed", "messageBox");
    }
  } catch (err) {
    showMessage("error", "Server error", "messageBox");
  }
});



// Send OTP handler
document.getElementById("sendOtp").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();

  if (!email) {
    return showMessage("error", "Please enter your email first", "messageBoxSignup");
  }

  const sendBtn = document.getElementById("sendOtp");
  sendBtn.disabled = true;
  sendBtn.innerText = "Sending...";

  try {
    const res = await fetch("/api/users/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    if (res.ok) {
      showMessage("success", data.message || "OTP sent successfully", "messageBoxSignup");
    } else {
      showMessage("error", data.message || "Failed to send OTP", "messageBoxSignup");
    }
  } catch (err) {
    showMessage("error", "Server error while sending OTP", "messageBoxSignup");
  } finally {
    sendBtn.disabled = false;
    sendBtn.innerText = "Send OTP";
  }
});

// Signup handler
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const otp = document.getElementById("otp").value;
  const dob = document.getElementById("dob").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    return showMessage("error", "Passwords do not match", "messageBoxSignup");
  }

  showMessage("success", "Verifying OTP...", "messageBoxSignup");

  try {
    const otpRes = await fetch("/api/users/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp })
    });

    const otpData = await otpRes.json();
    if (!otpRes.ok || !otpData.verified) {
      return showMessage("error", "OTP verification failed", "messageBoxSignup");
    }

    showMessage("success", "Registering user...", "messageBoxSignup");

    const regRes = await fetch("/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, dob })
    });

    const regData = await regRes.json();
    if (regRes.ok) {
      showMessage("success", "Registration successful!", "messageBoxSignup");
      setTimeout(() => flipCard(), 1500);
    } else {
      showMessage("error", regData.message || "Registration failed", "messageBoxSignup");
    }
  } catch {
    showMessage("error", "Server error", "messageBoxSignup");
  }
});

// Google login redirect
document.getElementById("googleLoginIcon").addEventListener("click", () => {
  window.location.href = "/auth/google";
});
