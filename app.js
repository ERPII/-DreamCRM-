// app.js - הליבה של DreamCRM
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// הגדרות ה-Firebase שלך (וודא שהן תואמות לפרויקט dreamcrm-2d69d)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY", // החלף ב-API Key האמיתי שלך
    authDomain: "dreamcrm-2d69d.firebaseapp.com",
    projectId: "dreamcrm-2d69d",
    storageBucket: "dreamcrm-2d69d.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
    databaseURL: "https://dreamcrm-2d69d-default-rtdb.europe-west1.firebasedatabase.app"
};

// אתחול Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- ניהול אבטחה והרשאות ---

/**
 * בודק האם המשתמש המחובר הוא אדמין
 * מבוסס על שדה 'role' באוסף 'users' ב-Firestore
 */
export async function checkAdminStatus() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists() && userDoc.data().role === 'admin') {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                } catch (error) {
                    console.error("שגיאה בבדיקת הרשאות:", error);
                    resolve(false);
                }
            } else {
                // אם המשתמש לא מחובר בכלל, הפנה אותו לדף ההתחברות
                if (!window.location.pathname.includes('index.html')) {
                    window.location.href = 'index.html';
                }
                resolve(false);
            }
        });
    });
}

// --- פונקציות גלובליות לשימוש בכל הדפים ---

/**
 * התנתקות מהמערכת
 */
window.logout = () => {
    signOut(auth).then(() => {
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error("שגיאה בהתנתקות:", error);
    });
};

/**
 * הוספת לקוח חדש למערכת
 * @param {Object} customerData - פרטי הלקוח
 */
window.addNewCustomer = async (customerData) => {
    try {
        const docRef = await addDoc(collection(db, "customers"), {
            ...customerData,
            createdAt: serverTimestamp(),
            createdBy: auth.currentUser.uid
        });
        console.log("לקוח נוסף עם מזהה:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("שגיאה בשמירת לקוח:", error);
        throw error;
    }
};

/**
 * פתיחת קריאת שירות חדשה
 */
window.createServiceTicket = async (ticketData) => {
    try {
        const ticketId = "SR-" + Math.floor(1000 + Math.random() * 9000); // יצירת ID ייחודי
        await setDoc(doc(db, "tickets", ticketId), {
            ...ticketData,
            ticketId: ticketId,
            timestamp: serverTimestamp(),
            status: "open"
        });
        return ticketId;
    } catch (error) {
        console.error("שגיאה בפתיחת קריאה:", error);
        throw error;
    }
};

// --- ניהול ממשק משתמש (UI) ---

// עדכון שעון ותאריך (לדאשבורד)
function initLiveClock() {
    const clockEl = document.getElementById('liveClock');
    const dateEl = document.getElementById('liveDate');
    
    if (clockEl && dateEl) {
        const update = () => {
            const now = new Date();
            clockEl.innerText = now.toLocaleTimeString('he-IL', { hour12: false });
            dateEl.innerText = now.toLocaleDateString('he-IL', { 
                day: 'numeric', month: 'long', year: 'numeric' 
            }).toUpperCase();
        };
        setInterval(update, 1000);
        update();
    }
}

// הפעלה ראשונית
document.addEventListener('DOMContentLoaded', () => {
    initLiveClock();
    
    // בדיקה אם המשתמש מחובר ועדכון פרטי ה-Header
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const nameEl = document.getElementById('navUserName');
            const roleEl = document.getElementById('navUserRole');
            
            // נסיון למשוך פרטים מה-Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                if (nameEl) nameEl.innerText = userDoc.data().name || "APII";
                if (roleEl) roleEl.innerText = userDoc.data().role || "User";
            }
        }
    });
});

export { auth, db };
