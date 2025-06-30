import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  child,
  update
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
const auth = getAuth(app);

// ✅ DOM Elements
const loadBtn = document.getElementById("loadBtn");
const submitBtn = document.getElementById("submitBtn");
const studentTable = document.getElementById("studentTable");
const studentList = document.getElementById("studentList");
const successMessage = document.getElementById("successMessage");
const department = document.getElementById("department");
const semester = document.getElementById("semester");
const section = document.getElementById("section");
const attendanceDate = document.getElementById("attendanceDate");
const numHours = document.getElementById("numHours");

let facultyName = "";

// ✅ Get logged-in teacher's name
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;
    try {
      const snapshot = await get(ref(db, `users/${uid}`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        facultyName = data.name || user.email;
        document.getElementById("loggedFacultyName").innerText = facultyName;
      } else {
        facultyName = user.email;
        document.getElementById("loggedFacultyName").innerText = facultyName;
      }
    } catch (err) {
      console.error("Error fetching faculty info:", err);
    }
  } else {
    alert("Not logged in.");
    window.location.href = "teacher-login.html";
  }
});

// ✅ Load students
loadBtn.addEventListener("click", async () => {
  const dept = department.value;
  const sem = semester.value;
  const sec = section.value;

  if (!dept || !sem || !sec) {
    alert("Please select department, semester and section.");
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
    console.error("Load error:", error);
    alert("Error loading students.");
  }
});

// ✅ Submit attendance
submitBtn.addEventListener("click", async () => {
  const dept = department.value;
  const sem = semester.value;
  const sec = section.value;
  const selectedDate = attendanceDate.value;
  const hours = parseInt(numHours.value);

  if (!selectedDate || !hours || !facultyName) {
    alert("Please enter date, hours and ensure faculty is logged in.");
    return;
  }

  const checkboxes = document.querySelectorAll(".present-checkbox");
  const updates = {};

  checkboxes.forEach((cb) => {
    const roll = cb.dataset.roll;
    const studentPath = `attendance/${dept}/sem${sem}/${sec}/${selectedDate}/${roll}/${facultyName}`;
    updates[studentPath] = {
      status: cb.checked ? "present" : "absent",
      hours: hours
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

// ✅ Check Attendance (global scope for HTML)
window.checkAttendance = async () => {
  const rollNo = document.getElementById("checkRoll").value.trim();
  const dept = department.value;
  const sem = semester.value;
  const sec = section.value;
  const resultDiv = document.getElementById("attendanceResult");

  if (!rollNo || !dept || !sem || !sec) {
    resultDiv.innerHTML = "<span style='color: red;'>❗ Please enter roll number and select department/semester/section.</span>";
    return;
  }

  const dbPath = `attendance/${dept}/sem${sem}/${sec}`;
  let presentCount = 0, totalCount = 0;
  let studentName = "Unknown";

  try {
    const snapshot = await get(child(ref(db), dbPath));
    if (snapshot.exists()) {
      const data = snapshot.val();
      for (const date in data) {
        const entry = data[date][rollNo];
        if (!entry) continue;

        for (const faculty in entry) {
          const record = entry[faculty];
          if (record.status === "present") presentCount++;
          totalCount++;
        }
      }
    }

    const nameSnap = await get(ref(db, `students/${dept}/sem${sem}/${sec}/${rollNo}`));
    if (nameSnap.exists()) {
      studentName = nameSnap.val().name || studentName;
    }

    resultDiv.innerHTML = `
      <strong>Name:</strong> ${studentName}<br>
      <strong>Roll No:</strong> ${rollNo}<br>
      <strong>Classes Attended:</strong> ${presentCount}<br>
      <strong>Total Classes:</strong> ${totalCount}<br>
      <strong>Attendance %:</strong> ${totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(2) + "%" : "0%"}
    `;
  } catch (error) {
    console.error("Check attendance error:", error);
    resultDiv.innerHTML = "<span style='color: red;'>❌ Error fetching attendance.</span>";
  }
};

