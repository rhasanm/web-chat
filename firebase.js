class Message {
    constructor (name, state, country ) {
        this.name = name;
        this.state = state;
        this.country = country;
    }
    toString() {
        return this.name + ', ' + this.state + ', ' + this.country;
    }
}
const messageConverter = {
    toFirestore: (city) => {
        return {
            name: city.name,
            state: city.state,
            country: city.country
        };
    },
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        return new Message(data.name, data.state, data.country);
    }
};

export function sayHello() {
    alert("HELLO")
}

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-app.js";
import { 
    getFirestore,
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    where,
    Timestamp
} from "https://www.gstatic.com/firebasejs/9.9.2/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCXpbTwk85O8WdHnMDy6BlQYY_8hZhi8xI",
  authDomain: "dt-chat-382db.firebaseapp.com",
  projectId: "dt-chat-382db",
  storageBucket: "dt-chat-382db.appspot.com",
  messagingSenderId: "335861675650",
  appId: "1:335861675650:web:0e7699c3d9be6015e4a69b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function readAll() {
    const docRef = doc(db, "cities", "SF");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
    } else {
    // doc.data() will be undefined in this case
        console.log("No such document!");
    }
}
async function subscribe() {
    const unsub = onSnapshot(doc(db, "cities", "SF"), (doc) => {
        console.log("Current data: ", doc.data());
    });
}
async function queryData() {
    const q = query(collection(db, "cities"), where("capital", "==", true));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " => ", doc.data());
    });
}
async function writeMessage() {
    await setDoc(doc(db, "cities", "LA"), {
        name: "Los Angeles",
        state: "CA",
        country: "USA"
      });
      const docData = {
        stringExample: "Hello world!",
        booleanExample: true,
        numberExample: 3.14159265,
        dateExample: Timestamp.fromDate(new Date("December 10, 1815")),
        arrayExample: [5, true, "hello"],
        nullExample: null,
        objectExample: {
            a: 5,
            b: {
                nested: "foo"
            }
        }
    };
    await setDoc(doc(db, "data", "one"), docData);
}
export async function read() {
    const ref = doc(db, "cities", "LA").withConverter(messageConverter);
    const docSnap = await getDoc(ref);
    if (docSnap.exists()) {
        // Convert to City object
        const city = docSnap.data();
        // Use a City instance method
        console.log(city.toString());
        return city;
    } else {
        console.log("No such document!");
    }
}
async function write() {
    try {
        const ref = doc(db, "cities", "LA").withConverter(messageConverter);

        await setDoc(ref, new Message("Dhaka","Bangladesh","Asia"));
        await read();
    } catch(err) {
        console.log(err);
        // throw err;
    }
}
// const q = query(citiesRef, orderBy("name", "desc"), limit(3));

// writeMessage();
// read();
try {
    write();
} catch(err) {
    // alert(err);
    // throw err;
}
// readAll();
// subscribe();
// queryData();