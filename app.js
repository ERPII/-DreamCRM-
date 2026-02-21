import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. הגדרות Firebase (וודא שהן תואמות לפרויקט dreamcrm-2d69d)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY", 
    authDomain: "dreamcrm-2d69d.firebaseapp.com",
    projectId: "dreamcrm-2d69d",
    storageBucket: "dreamcrm-2d69d.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- פונקציות שמירה אוניברסליות (עובדות בכל הדפים) ---

// 2. שמירת לקוח חדש (כולל מוצרים ומשימות התחלתיות)
window.saveCustomerData = async () => {
    const name = document.getElementById('editName')?.value || document.getElementById('q_name')?.value;
    const phone = document.getElementById('editPhone')?.value || document.getElementById('q_phone')?.value;

    if (!name || !phone) return alert("נא למלא שם וטלפון");

    try {
        const docRef = await addDoc(collection(db, "customers"), {
            fullName: name,
            phone: phone,
            type: "VIP",
            tasks: [],
            products: [],
            createdAt: serverTimestamp()
        });
        alert("הלקוח נשמר בהצלחה!");
        location.reload();
    } catch (e) { console.error("Error:", e); }
};

// 3. שמירת ליד חדש (מיועד לדף leads.html)
window.saveLead = async () => {
    const name = document.getElementById('leadName')?.value;
    const source = document.getElementById('leadSource')?.value;

    try {
        await addDoc(collection(db, "leads"), {
            name: name,
            source: source,
            status: "חדש",
            timestamp: serverTimestamp()
        });
        alert("ליד נשמר במערכת!");
        location.reload();
    } catch (e) { console.error(e); }
};

// 4. פתיחת קריאת שירות (מיועד לדף service.html)
window.saveTicket = async () => {
    const cust = document.getElementById('t_cust')?.value || document.getElementById('q_cust')?.value;
    const desc = document.getElementById('t_desc')?.value || document.getElementById('q_issue')?.value;

    if (!cust || !desc) return alert("מלא פרטי קריאה");

    try {
        await addDoc(collection(db, "service_tickets"), {
            customer: cust,
            description: desc,
            status: "open",
            ticketId: "SR-" + Math.floor(1000 + Math.random() * 9000),
            createdAt: serverTimestamp()
        });
        alert("קריאת שירות נפתחה!");
        location.reload();
    } catch (e) { console.error(e); }
};

// 5. שמירת משימה ללקוח קיים (מיועד למודל עריכת לקוח)
window.addTaskToCustomer = async (customerId) => {
    const taskText = document.getElementById('newTask')?.value;
    if (!taskText) return;

    try {
        const custRef = doc(db, "customers", customerId);
        await updateDoc(custRef, {
            tasks: arrayUnion({
                text: taskText,
                completed: false,
                date: new Date().toISOString()
            })
        });
        alert("משימה נוספה ללקוח");
    } catch (e) { console.error(e); }
};

// 6. שמירת תנועה כספית (מיועד לדף finance.html)
window.saveTransaction = async () => {
    const amount = document.getElementById('f_amount')?.value;
    const type = document.getElementById('f_type')?.value;

    try {
        await addDoc(collection(db, "finance"), {
            amount: parseFloat(amount),
            type: type, // income / expense
            description: document.getElementById('f_desc')?.value,
            date: serverTimestamp()
        });
        alert("תנועה כספית נרשמה!");
        location.reload();
    } catch (e) { console.error(e); }
};

// --- אבטחה וניהול משתמשים ---

// 7. בדיקת אדמין (חסימת דפים)
export async function checkAdminStatus() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                const isAdmin = userDoc.exists() && userDoc.data().role === 'admin';
                resolve(isAdmin);
            } else {
                resolve(false);
            }
        });
    });
}

// 8. עדכון פרטי APII ב-Header מתוך ה-Auth
onAuthStateChanged(auth, (user) => {
    if (user) {
        const nameDisplay = document.getElementById('navUserName');
        if (nameDisplay) nameDisplay.innerText = user.displayName || "APII Admin";
    } else {
        if (!window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        }
    }
});

window.logout = () => signOut(auth).then(() => window.location.href = 'index.html');
