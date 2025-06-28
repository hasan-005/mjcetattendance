import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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

  try {
    const studentsSnapshot = await get(ref(db, "students"));
    if (!studentsSnapshot.exists()) {
      alert("Student data not found.");
      return;
    }

    const allStudents = studentsSnapshot.val();
    found:
    for (const d in allStudents) {
      for (const s in allStudents[d]) {
        for (const c in allStudents[d][s]) {
          for (const r in allStudents[d][s][c]) {
            if (r === rollNo) {
              dept = d;
              sem = s.replace("sem", "");
              sec = c;
              studentName = allStudents[d][s][c][r].name;
              break found;
            }
          }
        }
      }
    }

    if (!dept || !sem || !sec) {
      alert("Student not found in database.");
      return;
    }

    if (studentName) {
      document.getElementById("rollNo").innerText += ` (${studentName})`;
    }

    const attendanceRef = ref(db, `attendance/${dept}/sem${sem}/${sec}`);
    const attendanceSnap = await get(attendanceRef);
    let totalHours = 0;
    let presentHours = 0;

    if (attendanceSnap.exists()) {
      const attendanceData = attendanceSnap.val();
      for (const date in attendanceData) {
        const record = attendanceData[date][rollNo];
        if (record) {
          const { status, hours } = record;
          if (typeof hours === "number") {
            totalHours += hours;
            if (status === "present") {
              presentHours += hours;
            }
          }
        }
      }
    }

    document.getElementById("daysPresent").innerText = presentHours;
    document.getElementById("totalClasses").innerText = totalHours;
    document.getElementById("percentage").innerText =
      totalHours > 0 ? ((presentHours / totalHours) * 100).toFixed(2) + "%" : "0%";

  } catch (err) {
    console.error("Dashboard error:", err);
    alert("Failed to load dashboard.");
  }
});
