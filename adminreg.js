import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  child
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCBKwrEO53ah1XbqBezByOPfwsiWgljkEY",
  authDomain: "mjcet-attendance-db13b.firebaseapp.com",
  databaseURL: "https://mjcet-attendance-db13b-default-rtdb.firebaseio.com",
  projectId: "mjcet-attendance-db13b",
  storageBucket: "mjcet-attendance-db13b.appspot.com",
  messagingSenderId: "353462379631",
  appId: "1:353462379631:web:31259dc4db9785c608d99a"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

window.registerAdmin = async function () {
  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value;
  const messageDiv = document.getElementById("message");

  if (!email || !password) {
    messageDiv.textContent = "Please enter both email and password.";
    messageDiv.className = "error";
    return;
  }

  try {
    // ✅ Convert email to key-safe format
    const adminKey = email.replace(/\./g, "_");

    const snapshot = await get(child(ref(db), `admins/${adminKey}`));
    if (snapshot.exists()) {
      messageDiv.textContent = "Admin already exists.";
      messageDiv.className = "error";
      return;
    }

    await set(ref(db, `admins/${adminKey}`), {
      email: email,
      password: password
    });

    messageDiv.textContent = "Registered successfully. Redirecting...";
    messageDiv.className = "success";

    localStorage.setItem("adminEmail", email);
    localStorage.setItem("adminLoggedIn", "true");

    setTimeout(() => {
      window.location.href = "admin.html";
    }, 2000);

  } catch (error) {
    console.error("Registration failed:", error);
    messageDiv.textContent = "Registration failed. Try again.";
    messageDiv.className = "error";
  }
};
