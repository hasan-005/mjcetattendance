import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const TEACHER_ACCESS_CODE = "556699";

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const department = document.getElementById("department").value.trim();
  const teacherCode = document.getElementById("teacherCode").value.trim();

  if (!name || !email || !password || !department || !teacherCode) {
    alert("All fields are required.");
    return;
  }

  if (teacherCode !== TEACHER_ACCESS_CODE) {
    alert("Invalid Teacher Access Code!");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // 1. Store full teacher profile in /users
    await set(ref(db, `users/${uid}`), {
      name,
      email,
      department,
      role: "teacher"
    });

    // 2. Store name-only under /teachers/{department}/teacherN
    const deptRef = ref(db, `teachers/${department}`);
    const snapshot = await get(deptRef);
    const teacherCount = snapshot.exists() ? Object.keys(snapshot.val()).length + 1 : 1;

    await set(ref(db, `teachers/${department}/teacher${teacherCount}`), name);

    // 3. Save session info and redirect
    localStorage.setItem("uid", uid);
    localStorage.setItem("role", "teacher");

    alert("Teacher registered successfully!");
    window.location.href = "teacher-dashboard.html";
  } catch (error) {
    alert("Error: " + error.message);
  }
});

