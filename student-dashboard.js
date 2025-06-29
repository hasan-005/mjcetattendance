import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut, updatePassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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
  signOut(auth).then(() => {
    window.location.href = "student-login.html";
  });
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "student-login.html";
    return;
  }

  const email = user.email;
  const rollNo = email.split("@")[0];
  document.getElementById("rollNo").innerText = rollNo;

  let dept = null, sem = null, sec = null, studentName = null;

  const studentsSnapshot = await get(ref(db, "students"));
  if (!studentsSnapshot.exists()) return;
  const allStudents = studentsSnapshot.val();

  outer: for (const d in allStudents) {
    for (const s in allStudents[d]) {
      for (const c in allStudents[d][s]) {
        for (const r in allStudents[d][s][c]) {
          if (r === rollNo) {
            dept = d;
            sem = s.replace("sem", "");
            sec = c;
            studentName = allStudents[d][s][c][r].name;
            document.getElementById("studentName").innerText = studentName;
            document.getElementById("studentDept").innerText = dept;
            document.getElementById("studentSem").innerText = sem;
            document.getElementById("studentSec").innerText = sec;
            document.getElementById("editName").value = studentName;
            document.getElementById("editEmail").value = email;
            break outer;
          }
        }
      }
    }
  }

  const attendanceRef = ref(db, `attendance/${dept}/sem${sem}/${sec}`);
  const attendanceSnap = await get(attendanceRef);

  let totalHours = 0;
  let presentHours = 0;
  const calendarGrid = document.getElementById("calendarGrid");
  calendarGrid.innerHTML = "";

  if (attendanceSnap.exists()) {
    const attendanceData = attendanceSnap.val();
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');

    for (const date in attendanceData) {
      const record = attendanceData[date][rollNo];
      if (record) {
        const { status, hours } = record;
        if (typeof hours === "number") {
          totalHours += hours;
          if (status === "present") presentHours += hours;
        }

        if (date.startsWith(`${year}-${month}`)) {
          const dayNum = parseInt(date.split("-")[2]);
          const div = document.createElement("div");
          div.className = `calendar-day ${status}`;
          div.innerText = dayNum;
          calendarGrid.appendChild(div);
        }
      }
    }
  }

  document.getElementById("daysPresent").innerText = presentHours;
  document.getElementById("totalClasses").innerText = totalHours;
  document.getElementById("percentage").innerText =
    totalHours > 0 ? ((presentHours / totalHours) * 100).toFixed(2) + "%" : "0%";
});

window.updateProfile = async function () {
  const name = document.getElementById("editName").value;
  const email = document.getElementById("editEmail").value;
  const rollNo = document.getElementById("rollNo").innerText;

  const studentsSnapshot = await get(ref(db, "students"));
  if (!studentsSnapshot.exists()) return;

  const allStudents = studentsSnapshot.val();
  for (const d in allStudents) {
    for (const s in allStudents[d]) {
      for (const c in allStudents[d][s]) {
        if (allStudents[d][s][c][rollNo]) {
          await update(ref(db, `students/${d}/${s}/${c}/${rollNo}`), { name });
          alert("Profile updated successfully.");
          return;
        }
      }
    }
  }
};

window.changePassword = async function () {
  const newPassword = document.getElementById("newPassword").value;
  const user = auth.currentUser;

  try {
    await updatePassword(user, newPassword);
    alert("Password updated successfully.");
  } catch (error) {
    alert("Error updating password: " + error.message);
  }
};
