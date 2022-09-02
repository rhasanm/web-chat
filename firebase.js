import { clearScreen, displayMessage } from "./messenger.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-app.js";
import { getFirestore, collection, doc, setDoc, onSnapshot, query, Timestamp, orderBy } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-firestore.js";

class Message {
    constructor(sender, message, timestamp) {
        this.sender = sender;
        this.message = message;
        this.timestamp = timestamp;
    }
    toString() {
        return this.sender + ' sent ' + this.message + ' at ' + this.timestamp;
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

export class Firestore {
    #firebaseConfig = {
        apiKey: "AIzaSyAAPZSWpQD6MVKhWGA9ZhuQBHBXlYyrPGI",
        authDomain: "dt-web-chat.firebaseapp.com",
        projectId: "dt-web-chat",
        storageBucket: "dt-web-chat.appspot.com",
        messagingSenderId: "225322971644",
        appId: "1:225322971644:web:c683eb0a362e55f44a8279",
        measurementId: "G-909ZY9T869"
    };
    constructor(collectionName) {
        this.app = initializeApp(this.#firebaseConfig);
        this.db = getFirestore(this.app);
        this.collection = collection(this.db, collectionName);
        this.doc = doc(this.collection);
        
        this.unsubscribeListener = null;
        this.subscribe();
    }
    async storeMessage(message, user) {
        try {
            const ref = this.doc.withConverter(messageConverter);
            await setDoc(ref, new Message(user.phone, message, Timestamp.now()));
        } catch(err) {
            console.log(err);
        }
    }
    subscribe() {
        try {
            // clearScreen();
            const recentMessagesQuery = query(this.collection, orderBy("timestamp", "asc"));
            this.unsubscribeListener = onSnapshot(recentMessagesQuery.withConverter(messageConverter), function(snapshot) {
                snapshot.docChanges().forEach(function(change) {
                    var message = change.doc.data();
                    // console.log(message.toString());
                    displayMessage(message);
                });
            });
        } catch(err) {
            console.log(err);
        }
    }
    unsubscribe() {
        try {
            // this.unsubscribeListener();
            this.unsubscribeListener = null;
        } catch(err) {
            console.log(err);
        }
    }
}
