import { Firestore, Message } from "./firebase.js";

const messageDates = new Map();
let newDate = null, dateChanged = null, firstDateSlot = true;
let notPermitted = false;

class User {
    constructor(id, type, phone, profile, name) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.phone = phone;
        this.profile = profile;
    }
}

class Chat {
    constructor(user1, user2, chatRoom) {
        this.user1 = user1;
        this.user2 = user2;

        // this.room = `/chat/dt-bondhu/room/p2p/${this.user1.id}-${this.user2.id}`;
        this.room = `/chat/dt-bondhu/room/p2p/${chatRoom}`
        this.firestore = new Firestore(this);
    }
    async send(message) {
        try {
            const content = new Message(this.user1.id, message, new Date(), 'asdf', 'msg', 'adsf');
            await this.firestore.storeMessage(content);
        } catch(err) {
            throw err;
        }
    }
    display(content) {
        try {
            if (notPermitted) {
                return;
            }
            // user validation
            const messengerBody = $('.messenger__body');
            const sentBy = this.user1.type == "sender" ? "sender" : "receiver";
            const timestamp = new Date(content.date) == "Invalid Date"
                            ? new Date(content.date.seconds*1000) : new Date(content.date);
            const [day, month, year, hour, minute] = 
                [timestamp.getDay(), timestamp.getMonth(), timestamp.getFullYear(), timestamp.getHours(), timestamp.getMinutes()];
            const today = new Date();
            const date = today.getDay() == day && today.getMonth() == month && today.getFullYear() == year 
                        ? "Today" : (day + '/' + month + '/' + year);
            dateChanged = messageDates.get(date);
            const sentAt = hour > 12 
                ? `${(hour - 12).toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} pm` 
                : `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} am`;
            if (!dateChanged) {
                newDate = newTimestamp(date);
                messengerBody.append(bindNewMessage(sentBy, content.message, newDate, sentAt));
                messageDates.set(date, true);                    
            } else {
                newDate.append(bindNewMessage(sentBy, content.message, null, sentAt))
                messengerBody.append(newDate)
            }
            messengerBody.animate({ scrollTop: messengerBody[0].scrollHeight + 1000 }, 50);
        } catch(err) {
            throw err;
        }
    }
    permissionDenialModal(message) {
        clearScreen();
        $(".messenger__body").append(`<h3 style="text-align: center">${message}<h3>`)
    }
}

jQuery(function($) {
    var chat;
    window.Chat = Chat;
    window.User = User;
    window.LoadChat = (user1, user2, chatRoom) => new Promise(res => {
        if (chat) {
            res(chat);
            return;
        }
        chat = new Chat(
            new User(user1.id, user1.type, user1.phone || null, user1.profile || null, user1.name),
            new User(user2.id, user2.type, user2.phone || null, user2.profile || null, user2.name),
            chatRoom
        );
        const receiverName = $(".receiver-name h4");
        receiverName.text(chat.user1.type == "receiver" ? chat.user1.name : chat.user2.name);
        res(chat);
        return;
    })
    const messengerBody = $('.messenger__body');
    const chatBox = $('#message');
    const crossBar = $('#crossbar');
    const minimizer = $('#minimizer');
    const maximizer = $("#maximizer");
    const messageSendButton = $(".message__send");
    const messengerHeader = $(".messenger__header");
    const chatButton = $(".chat-button");
    const messenger = $(".messenger");

    messengerBody.scroll(function() {
        let currentLabel = null;
        const topLabel = $("#divider__top");
        $(".divider").each(function(_, el) {
            if (messengerBody.scrollTop() >= $(el).offset().top) {
                currentLabel = el;
            }
        });
        if (currentLabel) {
            $(topLabel).css({"opacity": 1});
            topLabel.textContent = $.trim(currentLabel.textContent)
        } else {
            $(topLabel).css("opacity", 0);
        }
    });
    minimizer.click(function() {
        const currentMessengerHeight = parseInt(messenger.css("height"));
        const currentHeaderHeight =  parseInt(messengerHeader.css("height"))
        const bufferHeight = (currentMessengerHeight - currentHeaderHeight) || 440;
        // console.log(messengerHeader.css("height"))
        // console.log(currentMessengerHeight)
        // console.log(`${currentMessengerHeight - currentHeaderHeight}px`);
        messenger.css({"bottom": `-${bufferHeight}px`});
        minimizer.attr('style', 'display: none !important')
        maximizer.attr('style', 'display: block !important')
    });

    maximizer.click(function() {
        messenger.css({"bottom": "0px"});
        maximizer.attr('style', 'display: none !important')
        minimizer.attr('style', 'display: block !important')
    })
    crossBar.click(function() {
        // const currentMessengerHeight = parseInt(messenger.css("height"));
        // const currentHeaderHeight =  parseInt(messengerHeader.css("height"))
        // const bufferHeight = (currentMessengerHeight - currentHeaderHeight) || 500;
        
        messenger.css({"bottom": "-1000px"});
        maximizer.attr('style', 'display: none !important');
        minimizer.attr('style', 'display: block !important');
        chatBox.val('');
    })
    messageSendButton.click(async function() {
        try {
            const text = chatBox.val();
            if (!text) {
                console.log("empty message")
                return;
            }
            chatBox.val('');
            await chat.send(text);
            notPermitted = false;
            messengerBody.animate({ scrollTop: messengerBody[0].scrollHeight + 1000 }, 50);
        } catch(err) {
            notPermitted = true;
            console.log(err)
            chat.permissionDenialModal(err.code.toUpperCase());
        }
    });
    chatButton.click(function() {
        try {
            messenger.attr('style', 'display: block !important');
            maximizer.attr('style', 'display: none !important')
            minimizer.attr('style', 'display: block !important')
            messenger.css({"bottom": "0px"});
            messengerBody.animate({ scrollTop: $('.messenger__body')[0].scrollHeight + 1000 }, 5);
        } catch(err) {
            chat.permissionDenialModal(err.code.toUpperCase());
        }
    })
});

function clearScreen() {
    $(".conversation__date").empty();
}

function newTimestamp(timestamp) {
    const date = $(`<div class="conversation__date"></div>`);
    const divider = !firstDateSlot 
        ? $(`<div class="divider"><span class="date"> ${timestamp} </span></div>`)
        : $(`<div class="divider"><span class="date" id="divider__top" style="opacity: 0;"> ${timestamp} </span></div>`)
    firstDateSlot = false;
    date.append(divider);
    return date;
}
function bindNewMessage(sentBy, message, timestamp = null, sentAt = null) {
    const sender = `<div class="row conversation sender">
        <!-- <div class="col-lg-3 conversation__user">
        </div> -->
        <div class="col-lg-9 col-md-9 col-sm-9 col-xs-9 pull-right conversation__text">
            <span> ${message} </span> 
            <span class="timestamp">${sentAt}</span>
        </div>
        <div class="bubble-arrow alt"></div>
    </div>`;
    const receiver = `<div class="row conversation receiver">
        <div class="col-lg-9 col-md-9 col-sm-9 col-xs-9 conversation__text">
            <span>${message}</span> 
            <span class="timestamp">${sentAt}</span>
        </div>
        <div class="bubble-arrow"></div>
        <!-- <div class="col-lg-3 conversation__user">
        </div> -->
    </div>`;
    if (timestamp) {
        timestamp.append(sentBy == 'receiver' ? receiver : sender)
        return timestamp;
    } else {
        return $(sentBy == 'receiver' ? receiver : sender);
    }
}
