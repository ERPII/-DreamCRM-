import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- הגדרות ה-Firebase שלך (חובה להעתיק מה-Console) ---
const firebaseConfig = {
    apiKey: "AIzaSy...", // העתק מה-Project Settings ב-Firebase Console
    authDomain: "dreamcrm-2d69d.firebaseapp.com",
    projectId: "dreamcrm-2d69d",
    storageBucket: "dreamcrm-2d69d.appspot.com",
    messagingSenderId: "YOUR_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- 1. מערכת שמירת נתונים (לכל הדפים) ---

// שמירת לקוח (customers.html / dashboard.html)
window.saveCustomerData = async () => {
    try {
        const name = document.getElementById('editName')?.value || document.getElementById('q_name')?.value;
        const phone = document.getElementById('editPhone')?.value || document.getElementById('q_phone')?.value;

        if (!name) return alert("נא למלא שם לקוח");

        await addDoc(collection(db, "customers"), {
            fullName: name,
            phone: phone || "לא הוזן",
            type: "VIP",
            createdAt: serverTimestamp()
        });
        alert("הלקוח נשמר בשרת בהצלחה!");
        location.reload();
    } catch (e) { console.error("שגיאת שמירה:", e); }
};

// שמירת ליד (leads.html)
window.saveLead = async () => {
    try {
        const name = document.getElementById('leadName')?.value;
        await addDoc(collection(db, "leads"), {
            name: name,
            source: document.getElementById('leadSource')?.value || "אורגני",
            status: "חדש",
            timestamp: serverTimestamp()
        });
        alert("ליד חדש התווסף!");
        location.reload();
    } catch (e) { console.error(e); }
};

// שמירת קריאת שירות (service.html)
window.saveTicket = async () => {
    try {
        const cust = document.getElementById('t_cust')?.value || document.getElementById('q_cust')?.value;
        const desc = document.getElementById('t_desc')?.value || document.getElementById('q_issue')?.value;

        if (!cust || !desc) return alert("מלא פרטי קריאה");

        await addDoc(collection(db, "service_tickets"), {
            customer: cust,
            description: desc,
            status: "בטיפול פעיל",
            ticketId: "SR-" + Math.floor(1000 + Math.random() * 9000),
            createdAt: serverTimestamp()
        });
        alert("קריאת השירות נפתחה!");
        location.reload();
    } catch (e) { console.error(e); }
};

// שמירת תנועה כספית (finance.html)
window.saveTransaction = async () => {
    try {
        const amount = document.getElementById('f_amount')?.value;
        await addDoc(collection(db, "finance"), {
            amount: parseFloat(amount),
            type: document.getElementById('f_type')?.value,
            description: document.getElementById('f_desc')?.value,
            date: serverTimestamp()
        });
        alert("התנועה הכספית עודכנה!");
        location.reload();
    } catch (e) { console.error(e); }
};

// --- 2. ניהול כניסה והרשאות ---

// בדיקת אדמין (לדפי כספים וניהול צוות)
export async function checkAdminStatus() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                resolve(userDoc.exists() && userDoc.data().role === 'admin');
            } else { resolve(false); }
        });
    });
}

// ניהול התנתקות
window.logout = () => signOut(auth).then(() => window.location.href = 'index.html');

// הצגת שם המשתמש ב-Header
onAuthStateChanged(auth, (user) => {
    if (user) {
        const nameEl = document.getElementById('navUserName');
        if (nameEl) nameEl.innerText = user.email.split('@')[0].toUpperCase();
    }
});
