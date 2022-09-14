import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-auth.js";
import { connectFirestoreEmulator, getFirestore, collection, doc, getDocs, setDoc, onSnapshot, query, Timestamp, orderBy } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-firestore.js";
// import { initializeAppCheck, getToken } from "https://cdnjs.cloudflare.com/ajax/libs/firebase/9.9.2/firebase-app-check.min.js";

export class Message {
    constructor(id, message, date, profile, type, url) {
        this.date = date 
        this.id = id
        this.message = message
        this.profile = profile
        this.type = type
        this.url = url
    }
    toString() {
        return this.id + `(profile: ${this.profile})` + ' sent ' + this.message + `(type: ${this.type})` + ' at ' + this.date;
    }
}
const messageConverter = {
    toFirestore: (content) => {
        return {
            id: content.id,
            date: content.date,
            message: content.message,
            profile: content.profile,
            type: content.type,
            url: content.url
        };
    },
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        return new Message(data.id, data.message, data.date, data.profile, data.type, data.url);
    }
}

export class Firestore {
    #firebaseConfig = {
        // apiKey: "AIzaSyAAPZSWpQD6MVKhWGA9ZhuQBHBXlYyrPGI",
        // authDomain: "dt-web-chat.firebaseapp.com",
        // projectId: "dt-web-chat",
        // storageBucket: "dt-web-chat.appspot.com",
        // messagingSenderId: "225322971644",
        // appId: "1:225322971644:web:c683eb0a362e55f44a8279",
        // measurementId: "G-909ZY9T869"
        apiKey: "AIzaSyCXpbTwk85O8WdHnMDy6BlQYY_8hZhi8xI",
        authDomain: "dt-chat-382db.firebaseapp.com",
        projectId: "dt-chat-382db",
        storageBucket: "dt-chat-382db.appspot.com",
        messagingSenderId: "335861675650",
        appId: "1:335861675650:web:0e7699c3d9be6015e4a69b"
    };
    constructor(chat) {
        this.chat = chat;
        this.app = initializeApp(this.#firebaseConfig);
        this.db = getFirestore(this.app);
        this.collection = collection(this.db, chat.room);
        this.doc = doc(this.collection);
        
        // this.appCheck();
        // this.setupEmulator();
        this.anonymousLogIn();
        
        this.unsubscribeListener = null;
        this.subscribe();
    }
    anonymousLogIn() {
        const auth = getAuth(this.app);
        signInAnonymously(auth)
        .then(() => {
            console.log("User Logged In");
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(error);
        });
        onAuthStateChanged(auth, (user) => {
            if (user) {
                const uid = user.uid;
                console.log(uid);
            } else {
                console.log("User is signed out");
            }
        });
    }
    appCheck() {
        const appCheck = initializeAppCheck(
            this.app, { provider: ReCaptchaV3Provider } // ReCaptchaV3Provider or CustomProvider
        );
    }
    setupEmulator() {
        connectFirestoreEmulator(this.db, 'localhost', 8081);
    }
    async storeMessage(data) {
        try {
            const ref = this.doc.withConverter(messageConverter);
            await setDoc(ref, new Message(data.id, data.message, data.date, data.profile, data.type, data.url));
        } catch(err) {
            console.log(err)
            throw err;
        }
    }
    async readAll() {
        const querySnapshot = await getDocs(this.collection);
        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
        });
    }
    subscribe() {
        const chat = this.chat;
        const recentMessagesQuery = query(this.collection, orderBy("date", "asc"));
        this.unsubscribeListener = onSnapshot(recentMessagesQuery.withConverter(messageConverter), function(snapshot) {
            snapshot.docChanges().forEach(function(change) {
                var message = change.doc.data();
                // console.log(message.toString(), new Date(message.date.seconds*1000));
                // console.log(change.doc._document.readTime.timestamp.seconds)
                // if (!change.doc.metadata.hasPendingWrites) {
                // displayMessage(message);
                // new Chat().display(message)
                chat.display(message);
                // }
            });
        }, function(err) {
            chat.permissionDenialModal(err.code.toUpperCase());
            // console.log(err)
        });
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
