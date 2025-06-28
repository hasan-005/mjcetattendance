// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCBKwrEO53ah1XbqBezByOPfwsiWgljkEY",
  authDomain: "mjcet-attendance-db13b.firebaseapp.com",
  databaseURL: "https://mjcet-attendance-db13b-default-rtdb.firebaseio.com",
  projectId: "mjcet-attendance-db13b",
  storageBucket: "mjcet-attendance-db13b.appspot.com",
  messagingSenderId: "353462379631",
  appId: "1:353462379631:web:31259dc4db9785c608d99a",
  measurementId: "G-MS2GTQ5KW6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
const auth = getAuth(app);
const db = getDatabase(app);

export { app, auth, db };

import { createUserWithEmailAndPassword } from "firebase/auth";

// In your register function:
const userCredential = await createUserWithEmailAndPassword(auth, email, password);
const user = userCredential.user;

// Then store user data in Realtime Database
await set(ref(db, `users/${user.uid}`), {
  name,
  email,
  role: "student",   // or "teacher"
  roll,
  department,
  semester,
  section,
  daysPresent: 0,
  totalClasses: 0
});

// ALSO store in students path (for teacher to view them)
await set(ref(db, `students/${department}/sem${semester}/${section}/${roll}`), {
  name,
  roll,
  department,
  semester,
  section,
  daysPresent: 0,
  totalClasses: 0
});


