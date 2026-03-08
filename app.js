import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, onAuthStateChanged, signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, 
    sendPasswordResetEmail, signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, doc, getDoc, setDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// לוגיקת אבטחה וכניסה
onAuthStateChanged(auth, async (user) => {
    const isLoginPage = window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('DreamCRM/');
    const statusEl = document.getElementById('statusMsg');

    if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            
            if (userData.status === "locked") {
                if(statusEl) { statusEl.innerText = "החשבון ננעל על ידי מנהל."; statusEl.classList.remove('hidden'); }
                signOut(auth);
                return;
            }
            
            if (userData.approved !== true) {
                if(statusEl) { statusEl.innerText = "החשבון ממתין לאישור מנהל המערכת."; statusEl.classList.remove('hidden'); }
                // אנחנו לא עושים SignOut כאן כדי לאפשר לאדמין לראות את עצמו, 
                // אבל בדפים פנימיים תהיה חסימה.
                if (!isLoginPage) window.location.href = 'index.html';
                return;
            }

            if (isLoginPage) window.location.href = 'dashboard.html';
        } else {
            // יצירת משתמש חדש
            await setDoc(userRef, {
                email: user.email,
                name: user.displayName || "משתמש חדש",
                role: "user",
                approved: false,
                status: "active",
                createdAt: serverTimestamp()
            });
            if(statusEl) { statusEl.innerText = "נרשמת! המתן לאישור מנהל."; statusEl.classList.remove('hidden'); }
            signOut(auth);
        }
    } else {
        if (!isLoginPage) window.location.href = 'index.html';
    }
});

// הפונקציות שיופעלו מה-HTML
window.loginEmail = async () => {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (e) {
        alert("שגיאה בהתחברות: " + e.message);
    }
};

window.registerEmail = async () => {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;
    if (pass.length < 6) return alert("סיסמה חייבת להיות לפחות 6 תווים");
    try {
        await createUserWithEmailAndPassword(auth, email, pass);
        alert("חשבון נוצר בהצלחה! המתן לאישור.");
    } catch (e) {
        alert("שגיאה ברישום: " + e.message);
    }
};

window.loginWithGoogle = () => signInWithPopup(auth, googleProvider).catch(e => alert(e.message));

window.resetPassword = () => {
    const email = document.getElementById('loginEmail').value;
    if (!email) return alert("הזן אימייל לשחזור");
    sendPasswordResetEmail(auth, email).then(() => alert("נשלח אימייל לאיפוס!"));
};

window.logout = () => signOut(auth);

export { auth, db };
