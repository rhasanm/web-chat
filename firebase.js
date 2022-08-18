class Message {
    constructor(sender, message, timestamp) {
        this.sender = sender;
        this.message = message;
        this.timestamp = timestamp;
    }
    toString() {
        return this.sender + 'sent ' + this.message + ' at ' + this.timestamp;
    }
}
const messageConverter = {
    toFirestore: (content) => {
        return {
            sender: content.sender,
            message: content.message,
            timestamp: content.timestamp
        };
    },
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        return new Message(data.sender, data.message, data.timestamp);
    }
}
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
    addDoc,
    where,
    limit,
    Timestamp,
    orderBy,
    collectionGroup
} from "https://www.gstatic.com/firebasejs/9.9.2/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyCXpbTwk85O8WdHnMDy6BlQYY_8hZhi8xI",
  authDomain: "dt-chat-382db.firebaseapp.com",
  projectId: "dt-chat-382db",
  storageBucket: "dt-chat-382db.appspot.com",
  messagingSenderId: "335861675650",
  appId: "1:335861675650:web:0e7699c3d9be6015e4a69b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function storeMessage(message) {
    try {
        const ref = doc(collection(db, "dt-1234")).withConverter(messageConverter);
        await setDoc(ref, new Message("01844555666", message, Timestamp.now()));
    } catch(err) {
        console.log(err);
    }
}

export async function subscribe() {
    try {
        const recentMessagesQuery = query(collection(db, 'dt-1234'), orderBy("timestamp", "asc"));
        // const recentMessagesQuery = query(collection(db, 'dt-1234'), where('sender', 'in', ['01819666999', '01844555666']));
        const unsubscribe = onSnapshot(recentMessagesQuery.withConverter(messageConverter), function(snapshot) {
            snapshot.docChanges().forEach(function(change) {
                // if (change.type === 'removed') {
                    // deleteMessage(change.doc.id);
                // } else {
                var message = change.doc.data();
                console.log(message);
                displayMessage(message);
                // }
            });
        });
        // console.log(typeof(unsubscribe))
        return unsubscribe;
    } catch(err) {
        console.log(err);
    }
}