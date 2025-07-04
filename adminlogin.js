// admin-login.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  child
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ✅ Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCBKwrEO53ah1XbqBezByOPfwsiWgljkEY",
  authDomain: "mjcet-attendance-db13b.firebaseapp.com",
  databaseURL: "https://mjcet-attendance-db13b-default-rtdb.firebaseio.com",
  projectId: "mjcet-attendance-db13b",
  storageBucket: "mjcet-attendance-db13b.firebasestorage.app",
  messagingSenderId: "353462379631",
  appId: "1:353462379631:web:31259dc4db9785c608d99a",
  measurementId: "G-MS2GTQ5KW6"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

window.adminLogin = async function () {
  const emailInput = document.getElementById("adminEmail").value.trim();
  const passwordInput = document.getElementById("adminPassword").value;
  const errorMessage = document.getElementById("errorMessage");

  if (!emailInput || !passwordInput) {
    errorMessage.textContent = "Please enter email and password.";
    return;
  }

  try {
    const adminKey = emailInput.replace(/\./g, "_"); // ✅ fix: replace all dots
    const snapshot = await get(child(ref(db), `admins/${adminKey}`));
    
    if (snapshot.exists()) {
      const adminData = snapshot.val();
      if (adminData.password === passwordInput) {
        // ✅ Store session and redirect
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("adminEmail", emailInput);
        window.location.href = "admin.html"; // redirect
      } else {
        errorMessage.textContent = "Incorrect password.";
      }
    } else {
      errorMessage.textContent = "Admin not found.";
    }
  } catch (error) {
    console.error("Login Error:", error);
    errorMessage.textContent = "Login failed. Try again.";
  }
};
