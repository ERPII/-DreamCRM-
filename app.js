import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, collection, addDoc, getDocs, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import * as XLSX from 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';

const firebaseConfig = {
  apiKey: "AIzaSyDV-ncOuncy-7HZZJnCMe4uis9ZV2QczYw",
  authDomain: "dreamcrm-2d69d.firebaseapp.com",
  projectId: "dreamcrm-2d69d",
  storageBucket: "dreamcrm-2d69d.firebasestorage.app",
  appId: "1:124987219085:web:87edf1c9024a82950ad6c4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const DreamCRM = {
    // מנגנון חיפוש חכם רב-שדתי
    filter(data, term) {
        if (!term) return data;
        const s = term.toLowerCase();
        return data.filter(i => 
            (i.name?.toLowerCase().includes(s)) || 
            (i.phone?.includes(s)) || 
            (i.email?.toLowerCase().includes(s)) || 
            (i.businessName?.toLowerCase().includes(s))
        );
    },

    // אתחול ממשק המשתמש וסנכרון ה-Header
    initUI() {
        onAuthStateChanged(auth, async (u) => {
            // אם המשתמש לא מחובר והוא לא בדף הלוגין - שלח אותו ללוגין
            if (!u && !window.location.pathname.endsWith('index.html') && window.location.pathname !== '/-DreamCRM-/') {
                window.location.href = 'index.html';
                return;
            }
            if (u) {
                const d = await getDoc(doc(db, "users", u.uid));
                const data = d.exists() ? d.data() : { name: u.displayName || "משתמש", role: "עובד" };
                
                if (document.getElementById('navUserName')) document.getElementById('navUserName').innerText = data.name;
                if (document.getElementById('navUserRole')) document.getElementById('navUserRole').innerText = data.role === 'admin' ? 'מנהל מערכת' : 'צוות';
                if (document.getElementById('navAvatar')) document.getElementById('navAvatar').innerText = data.name.charAt(0);
                if (data.role === 'admin' && document.getElementById('adminLink')) document.getElementById('adminLink').classList.remove('hidden');
            }
        });
    },

    async login(e, p) { 
        try { await signInWithEmailAndPassword(auth, e, p); return {success:true}; } 
        catch(err) { return {success:false, error: "פרטים שגויים"}; }
    },
    
    async logout() { await signOut(auth); window.location.href = 'index.html'; }
};

window.DreamCRM = DreamCRM; window.db = db; window.auth = auth;
window.addEventListener('DOMContentLoaded', DreamCRM.initUI);
