import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-app.js";
import { connectFirestoreEmulator, getFirestore, collection, doc, getDocs, setDoc, onSnapshot, query, Timestamp, orderBy, addDoc } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-firestore.js";
import { initializeAppCheck, getToken } from "https://cdnjs.cloudflare.com/ajax/libs/firebase/9.9.2/firebase-app-check.min.js";

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

export class History {
    constructor(receiverName, senderName, msg, seenStatus, datetime) {
        this.receiverName = receiverName 
        this.senderName = senderName
        this.msg = msg
        this.seenStatus = seenStatus
        this.datetime = datetime
    }
    toString() {
        return this.id + `(profile: ${this.profile})` + ' sent ' + this.message + `(type: ${this.type})` + ' at ' + this.date;
    }
}
const historyConverter = {
    toFirestore: (content) => {
        return {
            receiverName: content.receiverName,
            senderName: content.senderName,
            msg: content.msg,
            seenStatus: content.seenStatus,
            datetime: content.datetime
        };
    },
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        return new History(data.receiverName, data.senderName, data.msg, data.seenStatus, data.datetime);
    }
}

export class Firestore {
    #firebaseConfig = {
        apiKey: "AIzaSyCXpbTwk85O8WdHnMDy6BlQYY_8hZhi8xI",
        authDomain: "dt-chat-382db.firebaseapp.com",
        databaseURL: "https://dt-chat-382db-default-rtdb.asia-southeast1.firebasedatabase.app",
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
        
        this.merchantHistoryCollection = collection(this.db, chat.history + `/merchant/${chat.user2.id}`)
        this.merchantHistoryDoc = doc(this.db, chat.history + `/merchant/${chat.user2.id}`, chat.user1.id)

        this.clientHistoryCollection = collection(this.db, chat.history + `/client/${chat.user1.id}`)
        this.clientHistoryDoc = doc(this.db, chat.history + `/client/${chat.user1.id}`, chat.user2.id)
        // this.appCheck();
        // this.setupEmulator();
        
        this.unsubscribeListener = null;
        this.subscribe();
    }
    appCheck() {
        const appCheck = initializeAppCheck(
            this.app, { provider: ReCaptchaV3Provider } // ReCaptchaV3Provider or CustomProvider
        );
    }
    setupEmulator() {
        connectFirestoreEmulator(this.db, 'localhost', 8080);
    }
    async storeMessage(data) {
        try {
            const ref = this.doc.withConverter(messageConverter);
            const merchantHistoryRef = this.merchantHistoryDoc.withConverter(historyConverter)
            const clientHistoryRef = this.clientHistoryDoc.withConverter(historyConverter)

            await addDoc(this.collection, messageConverter.toFirestore(data));
            await setDoc(merchantHistoryRef, new History(this.chat.user1.id, this.chat.user2.id, data.message, 0, data.date), {merge: true})
            await setDoc(clientHistoryRef, new History(this.chat.user2.id, this.chat.user1.id, data.message, 1, data.date), {merge: true})
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
