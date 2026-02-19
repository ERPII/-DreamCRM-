import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, updateDoc, query, orderBy } 
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged, signOut, createUserWithEmailAndPassword } 
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDV-ncOuncy-7HZZJnCMe4uis9ZV2QczYw",
  authDomain: "dreamcrm-2d69d.firebaseapp.com",
  projectId: "dreamcrm-2d69d",
  storageBucket: "dreamcrm-2d69d.firebasestorage.app",
  messagingSenderId: "124987219085",
  appId: "1:124987219085:web:87edf1c9024a82950ad6c4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const DreamCRM = {
    // שחזור סיסמה
    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (e) { return { success: false, error: e.message }; }
    },

    // עדכון מידע/הערות (פיצ'ר ה-CRM המרכזי)
    async updateInfo(collectionName, id, text) {
        try {
            const docRef = doc(db, collectionName, id);
            await updateDoc(docRef, { notes: text, lastUpdate: new Date() });
            return true;
        } catch (e) { console.error(e); return false; }
    },

    // הרשמה (עובד חדש)
    async registerUser(email, password, fullName, role) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, "users", userCredential.user.uid), {
                name: fullName, email, role, notes: "", createdAt: new Date()
            });
            return { success: true };
        } catch (e) { return { success: false, error: e.message }; }
    },

    // התחברות
    async login(email, password) {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (e) { return { success: false, error: e.message }; }
    },

    logout() { return signOut(auth); }
};

window.DreamCRM = DreamCRM;
window.db = db; // לשימוש גלובלי בדפים
