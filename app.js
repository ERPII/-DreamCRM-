import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, onAuthStateChanged, signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, 
    sendPasswordResetEmail, signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, doc, getDoc, setDoc, updateDoc, collection, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ה-Config האמיתי שלך
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

// --- ניהול כניסה ורישום משתמשים ---

// לוגיקת בדיקת סטטוס משתמש (אישור/נעילה)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            
            if (userData.status === "locked") {
                alert("גישה נדחתה: החשבון נעול.");
                signOut(auth);
                return;
            }
            if (userData.approved !== true) {
                alert("חשבון ממתין לאישור מנהל.");
                signOut(auth);
                return;
            }
            // אם הכל תקין, המערכת תישאר מחוברת
        } else {
            // יצירת משתמש חדש ב-Firestore אם הוא לא קיים
            await setDoc(userRef, {
                email: user.email,
                name: user.displayName || "משתמש חדש",
                role: "user",
                approved: false, // ברירת מחדל: דורש אישור
                status: "active",
                createdAt: serverTimestamp()
            });
            alert("נרשמת בהצלחה! המתן לאישור אדמין.");
            signOut(auth);
        }
    }
});

// פונקציית התחברות/רישום עם אימייל
window.loginEmail = async () => {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;
    
    try {
        // ננסה קודם להתחבר
        await signInWithEmailAndPassword(auth, email, pass);
        window.location.href = 'dashboard.html';
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            // אם המשתמש לא קיים, ניצור אותו
            try {
                await createUserWithEmailAndPassword(auth, email, pass);
            } catch (regError) { alert("שגיאה ברישום: " + regError.message); }
        } else {
            alert("שגיאה: " + error.message);
        }
    }
};

// התחברות מהירה עם גוגל
window.loginWithGoogle = async () => {
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (e) { alert("שגיאת גוגל: " + e.message); }
};

window.resetPassword = async () => {
    const email = document.getElementById('loginEmail').value;
    if (!email) return alert("הזן אימייל");
    await sendPasswordResetEmail(auth, email);
    alert("נשלח אימייל לאיפוס סיסמה.");
};

window.logout = () => signOut(auth).then(() => window.location.href = 'index.html');
export { auth, db };
