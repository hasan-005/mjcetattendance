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

  try {
    // Fetch teacher access code from Firebase
    const accessCodeRef = ref(db, "accessCode/teacher");
    const snapshot = await get(accessCodeRef);
    const storedAccessCode = snapshot.exists() ? snapshot.val() : null;

    console.log("Entered Code:", teacherCode);
    console.log("Code from DB:", storedAccessCode);

    // Convert both to string and compare
    if (String(teacherCode) !== String(storedAccessCode)) {
      alert("Invalid Teacher Access Code!");
      return;
    }

    // Create new user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Save full profile in /users
    await set(ref(db, `users/${uid}`), {
      name,
      email,
      department,
      role: "teacher"
    });

    // Save under /teachers/{department}/teacherN
    const deptRef = ref(db, `teachers/${department}`);
    const deptSnapshot = await get(deptRef);
    const teacherCount = deptSnapshot.exists() ? Object.keys(deptSnapshot.val()).length + 1 : 1;

    await set(ref(db, `teachers/${department}/teacher${teacherCount}`), name);

    // Save session and redirect
    localStorage.setItem("uid", uid);
    localStorage.setItem("role", "teacher");

    alert("Teacher registered successfully!");
    window.location.href = "teacher-dashboard.html";
  } catch (error) {
    console.error("Registration Error:", error);
    alert("Error: " + error.message);
  }
});

