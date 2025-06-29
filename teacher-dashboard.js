import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, get, child, set, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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
const auth = getAuth(app);

let facultyName = ""; // Will hold the fetched name of logged-in teacher

// ✅ On teacher login, fetch faculty name from Firebase
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;
    const snapshot = await get(ref(db, `users/${uid}`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      facultyName = data.name || user.email;
      console.log("Faculty name auto-filled:", facultyName);
    } else {
      alert("Faculty profile not found in database.");
    }
  } else {
    alert("Not logged in.");
    window.location.href = "teacher-login.html";
  }
});

const loadBtn = document.getElementById("loadBtn");
const submitBtn = document.getElementById("submitBtn");
const studentTable = document.getElementById("studentTable");
const studentList = document.getElementById("studentList");
const successMessage = document.getElementById("successMessage");

loadBtn.addEventListener("click", async () => {
  const dept = document.getElementById("department").value;
  const sem = document.getElementById("semester").value;
  const sec = document.getElementById("section").value;

  if (!dept || !sem || !sec) {
    alert("Please select Department, Semester and Section.");
    return;
  }

  const path = `students/${dept}/sem${sem}/${sec}`;
  try {
    const snapshot = await get(child(ref(db), path));
    studentList.innerHTML = "";

    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.keys(data).forEach((roll) => {
        const student = data[roll];
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${student.roll}</td>
          <td>${student.name}</td>
          <td><input type="checkbox" class="present-checkbox" data-roll="${student.roll}"></td>
        `;
        studentList.appendChild(row);
      });

      studentTable.style.display = "table";
      submitBtn.style.display = "inline-block";
      successMessage.style.display = "none";
    } else {
      alert("No students found.");
    }

  } catch (error) {
    console.error(error);
    alert("Error loading students.");
  }
});

submitBtn.addEventListener("click", async () => {
  const dept = document.getElementById("department").value;
  const sem = document.getElementById("semester").value;
  const sec = document.getElementById("section").value;
  const selectedDate = document.getElementById("attendanceDate").value;
  const hours = document.getElementById("numHours").value;

  if (!selectedDate || !hours || !facultyName) {
    alert("Missing data: Date, Hours, or Faculty Name not available.");
    return;
  }

  const checkboxes = document.querySelectorAll(".present-checkbox");
  const updates = {};

  checkboxes.forEach((cb) => {
    const roll = cb.dataset.roll;
    const studentPath = `attendance/${dept}/sem${sem}/${sec}/${selectedDate}/${roll}/${facultyName}`;
    updates[studentPath] = {
      status: cb.checked ? "present" : "absent",
      hours: parseInt(hours)
    };
  });

  try {
    await update(ref(db), updates);
    successMessage.style.display = "block";
    setTimeout(() => {
      successMessage.style.display = "none";
    }, 3000);
  } catch (error) {
    console.error("Submit error:", error);
    alert("Failed to submit attendance.");
  }
});

