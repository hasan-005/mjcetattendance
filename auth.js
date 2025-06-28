/*import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Firebase Config
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Register User
export async function registerUser(data) {
  const { email, password, name, role, department, semester, section, roll } = data;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    await set(ref(db, `users/${uid}`), {
      name,
      email,
      role,
      department,
      semester,
      section,
      roll: role === 'student' ? roll : ""
    });

    if (role === 'student') {
      await set(ref(db, `students/${department}/sem${semester}/${section}/${roll}`), {
        name,
        roll
      });
    }

    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Login User
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      return { success: false, message: "User not found in database." };
    }

    const userData = snapshot.val();
    return { success: true, role: userData.role };
  } catch (error) {
    return { success: false, message: error.message };
  }
}*/
import app from "./firebase-config.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const auth = getAuth(app);
const db = getDatabase(app);

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;
    const userSnap = await get(ref(db, `users/${uid}`));

    if (!userSnap.exists()) {
      alert("User record not found.");
      return;
    }

    const userData = userSnap.val();
    if (userData.role === "teacher") {
      window.location.href = "teacher.html";
    } else if (userData.role === "student") {
      window.location.href = "student.html";
    } else {
      alert("Unknown role.");
    }

  } catch (err) {
    alert("Login error: " + err.message);
  }
});
