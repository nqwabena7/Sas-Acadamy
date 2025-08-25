// firebase.js (ES module) — fill in your Firebase config below
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { 
  getDatabase, ref, push, onChildAdded, set, remove, get 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { 
  getStorage, ref as sRef, uploadBytesResumable, getDownloadURL, deleteObject, refFromURL 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

// ======== 1) ADD YOUR FIREBASE CONFIG HERE ========
const firebaseConfig = {
  apiKey: "AIzaSyDhTvUJUIV6BK4uNJ7Tbs0hz1RnY22XlwM",
  authDomain: "school-site-86150.firebaseapp.com",
  databaseURL: "https://school-site-86150-default-rtdb.firebaseio.com",
  projectId: "school-site-86150",
  storageBucket: "school-site-86150.appspot.com",
  messagingSenderId: "367890214792",
  appId: "1:367890214792:web:c0aeb6cb40d1c2c617143d",
  measurementId: "G-N4KFXZ12NF"
};
// ===================================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

// --- Routing helpers ---
const protectedPages = ["index.html","chat.html","quiz.html","notice.html","admin.html","upload.html"];
function currentPage() {
  const parts = window.location.pathname.split("/");
  return parts[parts.length - 1] || "index.html";
}

// --- Auth guards ---
onAuthStateChanged(auth, async (user) => {
  const page = currentPage();
  if (!user && protectedPages.includes(page)) {
    window.location.href = "login.html";
    return;
  }

  // If admin page, check role
  if (page === "admin.html" && user) {
    const snap = await get(ref(db, `users/${user.uid}`));
    const role = snap.exists() ? snap.val().role : "student";
    if (role !== "admin") {
      alert("Access denied: Admins only.");
      window.location.href = "index.html";
      return;
    }
  }

  // Fill simple header name
  const headerUser = document.getElementById("header-user");
  if (headerUser && user) headerUser.textContent = user.email;
});

// --- Auth actions ---
window.signUp = async function () {
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await set(ref(db, `users/${cred.user.uid}`), { email, role: "student" });
    window.location.href = "index.html";
  } catch (e) { alert(e.message); }
};

window.login = async function () {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "index.html";
  } catch (e) { alert(e.message); }
};

window.logout = async function () {
  await signOut(auth);
  window.location.href = "login.html";
};

// --- Chat ---
const chatRef = ref(db, "messages");
window.sendMessage = async function () {
  const user = auth.currentUser;
  if (!user) return alert("Login required");
  const message = document.getElementById('message')?.value?.trim();
  if (!message) return;
  const username = user.email.split("@")[0];
  await push(chatRef, { username, message, ts: Date.now() });
  document.getElementById('message').value = "";
};

onChildAdded(chatRef, (snapshot) => {
  const msg = snapshot.val();
  const box = document.getElementById('chat-box');
  if (!box) return;
  const div = document.createElement("div");
  div.className = "msg";
  const time = new Date(msg.ts || Date.now()).toLocaleString();
  div.innerHTML = `<span class="u">${msg.username}</span><small class="muted">(${time})</small><br>${msg.message}`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
});

// --- Notices ---
const noticeRef = ref(db, "notices");

window.addNotice = async function () {
  const title = document.getElementById('notice-title').value.trim();
  const content = document.getElementById('notice-content').value.trim();
  if (!title || !content) return alert("Fill title and content");
  await push(noticeRef, { title, content, date: new Date().toLocaleString() });
  document.getElementById('notice-title').value = "";
  document.getElementById('notice-content').value = "";
};

onChildAdded(noticeRef, (snapshot) => {
  const data = snapshot.val();
  const id = snapshot.key;

  const board = document.getElementById("notice-board");
  if (board) {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${data.title}</strong> — <small class="muted">${data.date}</small><br>${data.content}`;
    board.appendChild(li);
  }

  const list = document.getElementById("notice-list");
  if (list) {
    const li = document.createElement("li");
    li.className = "card";
    li.innerHTML = `
      <div class="grid">
        <div>
          <strong>${data.title}</strong><br>
          <small class="muted">${data.date}</small>
          <p>${data.content}</p>
        </div>
        <div style="align-self:center;">
          <button onclick="deleteNotice('${id}')">Delete</button>
        </div>
      </div>`;
    list.appendChild(li);
  }
});

window.deleteNotice = async function (id) {
  await remove(ref(db, `notices/${id}`));
  location.reload();
};

// --- Uploads ---
const uploadsRef = ref(db, "uploads");

window.uploadFile = function () {
  const fileInput = document.getElementById('fileInput');
  const status = document.getElementById('upload-status');
  const file = fileInput?.files?.[0];
  const user = auth.currentUser;
  if (!file) return alert("Please choose a file");
  if (!user) return alert("Login required");

  const path = `assignments/${user.uid}/${Date.now()}_${file.name}`;
  const storageRef = sRef(storage, path);
  const task = uploadBytesResumable(storageRef, file);

  task.on("state_changed", (snap) => {
    const pct = (snap.bytesTransferred / snap.totalBytes) * 100;
    if (status) status.textContent = `Uploading: ${pct.toFixed(1)}%`;
  }, (err) => {
    alert("Upload failed: " + err.message);
  }, async () => {
    const url = await getDownloadURL(task.snapshot.ref);
    await push(uploadsRef, {
      name: file.name, url, user: user.email, uid: user.uid, date: new Date().toLocaleString()
    });
    if (status) status.textContent = "Upload complete!";
    fileInput.value = "";
  });
};

onChildAdded(uploadsRef, (snapshot) => {
  const v = snapshot.val();
  const id = snapshot.key;
  const list = document.getElementById("file-list");
  const mine = document.getElementById("my-file-list");

  // Admin list
  if (list) {
    const li = document.createElement("li");
    li.className = "card";
    li.innerHTML = `
      <div class="grid">
        <div>
          <strong>${v.name}</strong><br>
          <small class="muted">${v.user} — ${v.date}</small>
        </div>
        <div style="align-self:center; text-align:right;">
          <a href="${v.url}" target="_blank"><button>Download</button></a>
          <button onclick="deleteFile('${id}', '${v.url}')">Delete</button>
        </div>
      </div>`;
    list.appendChild(li);
  }

  // Student personal uploads (if page has it)
  if (mine) {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${v.name}</strong> — <a href="${v.url}" target="_blank">Open</a> <small class="muted">(${v.date})</small>`;
    mine.appendChild(li);
  }
});

window.deleteFile = async function (fileId, fileURL) {
  try {
    const refUrl = refFromURL(fileURL);
    await deleteObject(refUrl);
    await remove(ref(db, `uploads/${fileId}`));
    alert("File deleted");
    location.reload();
  } catch (e) { alert("Delete failed: " + e.message); }
};
