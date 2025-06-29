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

// 🔒 Logout functionality
document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => window.location.href = "student-login.html");
});

// ✅ On login
onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location.href = "student-login.html";

  const email = user.email;
  const roll = email.split("@")[0];

  let dept = "", sem = "", sec = "", name = "";

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

  // 🧑 Fill profile
  document.getElementById("rollNo").innerText = roll;
  document.getElementById("studentName").innerText = name;
  document.getElementById("studentDept").innerText = dept.toUpperCase();
  document.getElementById("studentSem").innerText = sem;
  document.getElementById("studentSec").innerText = sec.toUpperCase();

  // 📊 Load attendance
  const attendancePath = `attendance/${dept}/sem${sem}/${sec}`;
  const snapshot = await get(ref(db, attendancePath));
  const facultyWise = {};
  let totalHours = 0;
  let attendedHours = 0;

  if (snapshot.exists()) {
    const data = snapshot.val();

    for (const date in data) {
      const rollData = data[date][roll];
      if (!rollData) continue;

      for (const faculty in rollData) {
        const rec = rollData[faculty];
        if (!facultyWise[faculty]) {
          facultyWise[faculty] = {
            attended: 0,
            total: 0
          };
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

  // 🧾 Render table
  const table = document.getElementById("subjectAttendanceTable");
  table.innerHTML = "";

  for (const faculty in facultyWise) {
    const f = facultyWise[faculty];
    const percent = f.total > 0
      ? ((f.attended / f.total) * 100).toFixed(2) + "%"
      : "0%";

    const row = `
      <tr>
        <td>${faculty}</td>
        <td>${f.attended}</td>
        <td>${f.total}</td>
        <td>${percent}</td>
      </tr>
    `;
    table.innerHTML += row;
  }

  // 📈 Overall percentage
  const overall = totalHours > 0 ? ((attendedHours / totalHours) * 100).toFixed(2) : "0";
  document.getElementById("overallPercent").innerText = overall + "%";
});

// ✏️ Profile Edit Placeholder
window.updateProfile = () => {
  alert("Update logic to be added here if needed.");
};

// 🔐 Change password logic
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

