import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  updatePassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  get
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ✅ Firebase config
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

// 🔒 Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => window.location.href = "student-login.html");
});

let globalDept = "", globalSem = "", globalSec = "", globalRoll = "";

// ✅ Load profile and subject-wise attendance
onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location.href = "student-login.html";

  const email = user.email;
  const roll = email.split("@")[0];
  globalRoll = roll;

  let name = "", dept = "", sem = "", sec = "";

  const studentsSnapshot = await get(ref(db, "students"));
  if (studentsSnapshot.exists()) {
    const all = studentsSnapshot.val();
    for (const d in all) {
      for (const s in all[d]) {
        for (const c in all[d][s]) {
          if (all[d][s][c][roll]) {
            dept = d;
            sem = s.replace("sem", "");
            sec = c;
            name = all[d][s][c][roll].name;
          }
        }
      }
    }
  }

  if (!dept || !sem || !sec) return alert("Student not found.");

  globalDept = dept;
  globalSem = sem;
  globalSec = sec;

  // 🎯 Set profile info
  document.getElementById("rollNo").innerText = roll;
  document.getElementById("studentName").innerText = name;
  document.getElementById("studentDept").innerText = dept.toUpperCase();
  document.getElementById("studentSem").innerText = sem;
  document.getElementById("studentSec").innerText = sec.toUpperCase();

  // 📊 Faculty-wise attendance
  const attendancePath = `attendance/${dept}/sem${sem}/${sec}`;
  const snapshot = await get(ref(db, attendancePath));
  const facultyWise = {};
  let totalHours = 0, attendedHours = 0;

  if (snapshot.exists()) {
    const data = snapshot.val();
    for (const date in data) {
      const rollData = data[date][roll];
      if (!rollData) continue;

      for (const faculty in rollData) {
        const rec = rollData[faculty];
        if (!facultyWise[faculty]) {
          facultyWise[faculty] = { attended: 0, total: 0 };
        }

        facultyWise[faculty].total += rec.hours;
        if (rec.status === "present") {
          facultyWise[faculty].attended += rec.hours;
          attendedHours += rec.hours;
        }

        totalHours += rec.hours;
      }
    }
  }

  const table = document.getElementById("subjectAttendanceTable");
  table.innerHTML = "";

  for (const faculty in facultyWise) {
    const f = facultyWise[faculty];
    const percent = f.total > 0
      ? ((f.attended / f.total) * 100).toFixed(2) + "%"
      : "0%";

    table.innerHTML += `
      <tr>
        <td>${faculty}</td>
        <td>${f.attended}</td>
        <td>${f.total}</td>
        <td>${percent}</td>
      </tr>`;
  }

  const overall = totalHours > 0 ? ((attendedHours / totalHours) * 100).toFixed(2) : "0";
  document.getElementById("overallPercent").innerText = overall + "%";
});

// ✏️ Placeholder for edit
window.updateProfile = () => {
  alert("Update logic to be added here if needed.");
};

// 🔐 Change Password
window.changePassword = () => {
  const newPass = document.getElementById("newPassword").value;
  const user = auth.currentUser;
  if (user && newPass) {
    updatePassword(user, newPass)
      .then(() => alert("Password updated"))
      .catch(err => alert(err.message));
  } else {
    alert("Please enter a valid new password.");
  }
};

// 📅 Calendar View Attendance
window.loadAttendanceByDate = async () => {
  const selectedDate = document.getElementById("calendarDate").value;
  const container = document.getElementById("calendarAttendanceInfo");

  if (!selectedDate || !globalRoll || !globalDept || !globalSem || !globalSec) {
    container.innerHTML = "<p>Please wait or check login data.</p>";
    return;
  }

  const path = `attendance/${globalDept}/sem${globalSem}/${globalSec}/${selectedDate}/${globalRoll}`;
  const snapshot = await get(ref(db, path));

  if (!snapshot.exists()) {
    container.innerHTML = "<p>No attendance found for this date.</p>";
    return;
  }

  const data = snapshot.val();
  let html = `<table>
                <tr><th>Name of Faculty</th><th>Status</th><th>Total Hours</th></tr>`;

  for (const faculty in data) {
    const rec = data[faculty];
    html += `
      <tr>
        <td>${faculty}</td>
        <td style="color:${rec.status === "present" ? "#4caf50" : "#ff4d4d"}">
          ${rec.status === "present" ? "Present" : "Absent"}
        </td>
        <td>${rec.hours}</td>
      </tr>`;
  }

  html += "</table>";
  container.innerHTML = html;
};


