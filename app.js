import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, updateDoc, query, where, arrayUnion } 
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } 
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import * as XLSX from 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';

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
    // חיפוש חכם גלובלי
    filterData(data, searchTerm) {
        if (!searchTerm) return data;
        const s = searchTerm.toLowerCase();
        return data.filter(item => 
            (item.name && item.name.toLowerCase().includes(s)) ||
            (item.phone && item.phone.includes(s)) ||
            (item.email && item.email.toLowerCase().includes(s)) ||
            (item.businessName && item.businessName.toLowerCase().includes(s))
        );
    },

    async updateInfo(col, id, note) {
        await updateDoc(doc(db, col, id), { notes: note, lastUpdate: new Date() });
    },

    async importLeadsFromExcel(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
                const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
                for (let row of data) {
                    await addDoc(collection(db, "leads"), {
                        name: row.name || row['שם'] || 'ללא שם',
                        phone: row.phone || row['טלפון'] || '',
                        businessName: row.business || row['עסק'] || '',
                        updates: ["ייבוא מאקסל"], timestamp: new Date()
                    });
                }
                resolve(data.length);
            };
            reader.readAsArrayBuffer(file);
        });
    },

    checkUserStatus(callback) {
        onAuthStateChanged(auth, async (u) => {
            if (u) {
                const d = await getDoc(doc(db, "users", u.uid));
                callback(d.exists() ? { uid: u.uid, ...d.data() } : null);
            } else callback(null);
        });
    },

    async logout() { await signOut(auth); location.href = 'index.html'; }
};

window.DreamCRM = DreamCRM; window.db = db;
