import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, onAuthStateChanged, signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, 
    sendPasswordResetEmail, signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, doc, getDoc, setDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ה-Config המדויק מהקובץ שלך
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

// --- ניהול כניסה, רישום ואבטחה ---

onAuthStateChanged(auth, async (user) => {
    const isLoginPage = window.location.pathname.includes('index.html') || window.location.pathname === '/';
    
    if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // בדיקת חסימה
            if (userData.status === "locked") {
                showMsg("גישה נדחתה: החשבון שלך ננעל.");
                signOut(auth);
                return;
            }
            
            // בדיקת אישור מנהל
            if (userData.approved !== true) {
                showMsg("החשבון ממתין לאישור מנהל המערכת.");
                signOut(auth);
                return;
            }

            // כניסה מאושרת - העברה לדאשבורד
            if (isLoginPage) window.location.href = 'dashboard.html';
        } else {
            // יצירת משתמש חדש ב-Firestore (ממתין לאישור)
            await setDoc(userRef, {
                email: user.email,
                name: user.displayName || "משתמש חדש",
                role: "user",
                approved: false, 
                status: "active",
                createdAt: serverTimestamp()
            });
            showMsg("נרשמת בהצלחה! המתן לאישור אדמין.");
            signOut(auth);
        }
    } else {
        // אם לא מחובר ומנסה להיכנס לדפים פנימיים
        if (!isLoginPage) window.location.href = 'index.html';
    }
});

// פונקציית התחברות
window.loginEmail = async () => {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;
    if (!email || !pass) return alert("נא למלא את כל השדות");

    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (e) {
        alert("שגיאה בהתחברות: " + e.message);
    }
};

// פונקציית רישום חשבון חדש
window.registerEmail = async () => {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;
    if (!email || pass.length < 6) return alert("הזן אימייל וסיסמה (לפחות 6 תווים)");

    try {
        await createUserWithEmailAndPassword(auth, email, pass);
    } catch (e) {
        alert("שגיאה ברישום: " + e.message);
    }
};

// התחברות גוגל
window.loginWithGoogle = () => signInWithPopup(auth, googleProvider);

// שחזור סיסמה
window.resetPassword = () => {
    const email = document.getElementById('loginEmail').value;
    if (!email) return alert("הזן אימייל לשחזור");
    sendPasswordResetEmail(auth, email).then(() => alert("אימייל לשחזור נשלח!"));
};

// פונקציית עזר להודעות
function showMsg(text) {
    const msgEl = document.getElementById('statusMsg');
    if (msgEl) {
        msgEl.innerText = text;
        msgEl.classList.remove('hidden');
    }
}

window.logout = () => signOut(auth).then(() => window.location.href = 'index.html');
export { auth, db };
