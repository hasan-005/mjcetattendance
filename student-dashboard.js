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
const db = getDatabase(app);
const auth = getAuth(app);

document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => window.location.href = "student-login.html");
});

let globalDept = "", globalSem = "", globalSec = "", globalRoll = "";

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

  document.getElementById("rollNo").innerText = roll;
  document.getElementById("studentName").innerText = name;
  document.getElementById("studentDept").innerText = dept.toUpperCase();
  document.getElementById("studentSem").innerText = sem;
  document.getElementById("studentSec").innerText = sec.toUpperCase();

  const subjectMappingSnap = await get(ref(db, `subject_mapping/${dept}/sem${sem}/${sec}`));
  const subjectMap = {};
  if (subjectMappingSnap.exists()) {
    const mapData = subjectMappingSnap.val();
    for (const subject in mapData) {
      const teacher = mapData[subject].teacher;
      subjectMap[teacher] = subject;
    }
  }

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
        const subjectName = subjectMap[faculty] || faculty;

        if (!facultyWise[subjectName]) {
          facultyWise[subjectName] = { attended: 0, total: 0 };
        }

        facultyWise[subjectName].total += rec.hours;
        if (rec.status === "present") {
          facultyWise[subjectName].attended += rec.hours;
          attendedHours += rec.hours;
        }

        totalHours += rec.hours;
      }
    }
  }

  const table = document.getElementById("subjectAttendanceTable");
  table.innerHTML = "";

  const labels = [];
  const dataValues = [];

  for (const subject in facultyWise) {
    const f = facultyWise[subject];
    const percent = f.total > 0
      ? ((f.attended / f.total) * 100).toFixed(2) + "%"
      : "0%";

    table.innerHTML += `
      <tr>
        <td>${subject}</td>
        <td>${f.attended}</td>
        <td>${f.total}</td>
        <td>${percent}</td>
      </tr>`;

    labels.push(subject);
    dataValues.push(((f.attended / f.total) * 100).toFixed(2));
  }

  const overall = totalHours > 0 ? ((attendedHours / totalHours) * 100).toFixed(2) : "0";
  document.getElementById("overallPercent").innerText = overall + "%";

  drawBarChart(labels, dataValues);
});

function drawBarChart(labels, dataValues) {
  const ctx = document.getElementById('attendanceBarChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Attendance %',
        data: dataValues.map(v => parseFloat(v)),
        backgroundColor: 'rgba(76, 175, 80, 0.7)',
        borderColor: 'rgba(76, 175, 80, 1)',
        borderWidth: 1,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: context => `${context.parsed.y}%`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            color: '#fff',
            callback: val => `${val}%`
          },
          title: {
            display: true,
            text: 'Percentage',
            color: '#fff'
          },
          grid: {
            color: 'rgba(255,255,255,0.1)'
          }
        },
        x: {
          ticks: { color: '#fff' },
          grid: { display: false }
        }
      }
    }
  });
}

window.updateProfile = () => {
  alert("Update logic to be added here if needed.");
};

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

window.loadAttendanceByDate = async () => {
  const selectedDate = document.getElementById("calendarDate").value;
  const container = document.getElementById("calendarAttendanceInfo");

  if (!selectedDate || !globalRoll || !globalDept || !globalSem || !globalSec) {
    container.innerHTML = "<p>Please wait or check login data.</p>";
    return;
  }

  const subjectMappingSnap = await get(ref(db, `subject_mapping/${globalDept}/sem${globalSem}/${globalSec}`));
  const subjectMap = {};
  if (subjectMappingSnap.exists()) {
    const mapData = subjectMappingSnap.val();
    for (const subject in mapData) {
      const teacher = mapData[subject].teacher;
      subjectMap[teacher] = subject;
    }
  }

  const path = `attendance/${globalDept}/sem${globalSem}/${globalSec}/${selectedDate}/${globalRoll}`;
  const snapshot = await get(ref(db, path));

  if (!snapshot.exists()) {
    container.innerHTML = "<p>No attendance found for this date.</p>";
    return;
  }

  const data = snapshot.val();
  let html = `<table>
                <tr><th>Subject</th><th>Status</th><th>Total Hours</th></tr>`;

  for (const faculty in data) {
    const rec = data[faculty];
    const subjectName = subjectMap[faculty] || faculty;
    html += `
      <tr>
        <td>${subjectName}</td>
        <td style="color:${rec.status === "present" ? "#4caf50" : "#ff4d4d"}">
          ${rec.status === "present" ? "Present" : "Absent"}
        </td>
        <td>${rec.hours}</td>
      </tr>`;
  }

  html += "</table>";
  container.innerHTML = html;
};

