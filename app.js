import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, 
    sendPasswordResetEmail, signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ה-Config המעודכן שלך
const firebaseConfig = {
  apiKey: "AIzaSyDV-ncOuncy-7HZZJnCMe4uis9ZV2QczYw",
  authDomain: "dreamcrm-2d69d.firebaseapp.com",
  databaseURL: "https://dreamcrm-2d69d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "dreamcrm-2d69d",
  storageBucket: "dreamcrm-2d69d.firebasestorage.app",
  messagingSenderId: "124987219085",
  appId: "1:124987219085:web:87edf1c9024a82950ad6c4",
  measurementId: "G-KCVYGGLE0F"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// --- מנגנון אבטחה: אישור ונעילה ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // 1. בדיקה אם המשתמש ננעל
            if (userData.status === "locked") {
                alert("גישה נדחתה: המשתמש שלך ננעל על ידי אדמין.");
                signOut(auth);
                window.location.href = 'index.html';
                return;
            }
            
            // 2. בדיקה אם המשתמש מאושר
            if (userData.approved !== true) {
                alert("החשבון ממתין לאישור מנהל המערכת.");
                signOut(auth);
                window.location.href = 'index.html';
                return;
            }
            
            // הצגת שם המשתמש ב-Header אם הכל תקין
            const nameEl = document.getElementById('navUserName');
            if (nameEl) nameEl.innerText = userData.name || user.displayName;

        } else {
            // יצירת רשומה חדשה למשתמש שטרם נרשם (ממתין לאישור)
            await setDoc(userRef, {
                email: user.email,
                name: user.displayName || "משתמש חדש",
                role: "user",
                approved: false, // חייב אישור אדמין
                status: "active",
                createdAt: serverTimestamp()
            });
            alert("נרשמת בהצלחה! פנה למנהל המערכת כדי שיאשר את כניסתך.");
            signOut(auth);
            window.location.href = 'index.html';
        }
    }
});

// --- פונקציות התחברות ---
window.loginWithGoogle = async () => {
    try {
        await signInWithPopup(auth, googleProvider);
        // הניתוב יתבצע אוטומטית על ידי onAuthStateChanged
    } catch (e) {
        alert("שגיאה בהתחברות גוגל: " + e.message);
    }
};

window.resetPassword = async () => {
    const email = document.getElementById('loginEmail')?.value;
    if (!email) return alert("אנא הזן אימייל לשחזור");
    try {
        await sendPasswordResetEmail(auth, email);
        alert("נשלח אימייל לאיפוס סיסמה.");
    } catch (e) { alert(e.message); }
};

// --- פונקציות ניהול (עבור users.html) ---
window.approveUser = async (uid) => {
    await updateDoc(doc(db, "users", uid), { approved: true });
    alert("המשתמש אושר!");
    location.reload();
};

window.toggleLock = async (uid, currentStatus) => {
    const newStatus = currentStatus === "active" ? "locked" : "active";
    await updateDoc(doc(db, "users", uid), { status: newStatus });
    alert("סטטוס עודכן!");
    location.reload();
};

window.logout = () => signOut(auth).then(() => window.location.href = 'index.html');

export { auth, db };
