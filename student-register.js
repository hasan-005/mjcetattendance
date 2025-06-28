// student-register.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Your Firebase config
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

// Handle student registration
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const roll = document.getElementById("roll").value.trim();
  const department = document.getElementById("department").value;
  const semester = document.getElementById("semester").value;
  const section = document.getElementById("section").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Save user info under /users and under /students
    await set(ref(db, `users/${uid}`), {
      name,
      email,
      role: "student",
      department,
      semester,
      section,
      roll
    });

    await set(ref(db, `students/${department}/sem${semester}/${section}/${roll}`), {
      name,
      roll
    });

    alert("Student registered successfully!");
    window.location.href = "student-dashboard.html";
  } catch (error) {
    alert("Registration failed: " + error.message);
  }
});
