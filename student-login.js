// student-login.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCBKwrEO53ah1XbqBezByOPfwsiWgljkEY",
  authDomain: "mjcet-attendance-db13b.firebaseapp.com",
  databaseURL: "https://mjcet-attendance-db13b-default-rtdb.firebaseio.com",
  projectId: "mjcet-attendance-db13b",
  storageBucket: "mjcet-attendance-db13b.appspot.com",
  messagingSenderId: "353462379631",
  appId: "1:353462379631:web:31259dc4db9785c608d99a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Handle login form submit
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const snapshot = await get(ref(db, `users/${uid}`));
    if (!snapshot.exists()) {
      alert("User not found in database.");
      return;
    }

    const userData = snapshot.val();
    if (userData.role !== "student") {
      alert("Access denied. Not a student.");
      return;
    }

    // Redirect to student dashboard
  window.location.href = "student-dashboard.html";

  } catch (error) {
    alert("Login failed: " + error.message);
  }
});
