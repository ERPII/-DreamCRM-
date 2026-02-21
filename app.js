import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, onAuthStateChanged, signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, 
    sendPasswordResetEmail, signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, serverTimestamp, getDocs 
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

// בדיקת סטטוס משתמש והגנה על דפים
onAuthStateChanged(auth, async (user) => {
    const isLoginPage = window.location.pathname.includes('index.html') || window.location.pathname === '/';
    
    if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.status === "locked") {
                alert("החשבון ננעל.");
                signOut(auth);
                if (!isLoginPage) window.location.href = 'index.html';
                return;
            }
            if (userData.approved !== true) {
                alert("ממתין לאישור מנהל.");
                signOut(auth);
                if (!isLoginPage) window.location.href = 'index.html';
                return;
            }
            // אם מאושר ונמצא בדף לוגין - העבר לדאשבורד
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
            alert("נרשמת! המתן לאישור מנהל.");
            signOut(auth);
        }
    } else {
        if (!isLoginPage) window.location.href = 'index.html';
    }
});

// פונקציות גלובליות לחלוטין
window.loginEmail = async () => {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (e) {
        if (e.code === 'auth/user-not-found') {
            await createUserWithEmailAndPassword(auth, email, pass);
        } else { alert("שגיאה: " + e.message); }
    }
};

window.loginWithGoogle = () => signInWithPopup(auth, googleProvider);
window.resetPassword = () => {
    const email = document.getElementById('loginEmail').value;
    if (email) sendPasswordResetEmail(auth, email).then(() => alert("נשלח אימייל!"));
};
window.logout = () => signOut(auth);

// ייצוא לצורך שימוש בדפים אחרים
export { db, auth };
