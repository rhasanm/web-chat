import { Firestore } from "./firebase.js";

const messageDates = new Map();
let newDate = null, dateChanged = null, firsDateSlot = true;

class User {
    constructor(type, phone) {
        this.type = type;
        this.phone = phone;
    }
}

class Order{
    constructor(orderNumber) {
        this.orderNumber = orderNumber;
    }
}

const sender = new User("rider", "01819666555");
const receiver = new User("client", "01844555666");
const order = new Order("dt-1234");

jQuery(async function($) {
    const firestore = new Firestore(order.orderNumber);

    const messengerBody = $('.messenger__body');
    const chatBox = $('#message');
    const crossBar = $('#crossbar');
    const messageSendButton = $(".message__send");
    const chatButton = $(".btn-primary");
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
    crossBar.click(async function() {
        messenger.animate({
            opacity: 0.25,
            bottom: "-=500",
            left: "-=10",
            height: "toggle",
            width: "toggle"
        }, 1000, function() {});
        firestore.unsubscribe();
    });
    messageSendButton.click(async function() {
        try {
            const text = chatBox.val();
            chatBox.val('');
            // if (firestore.unsubscribeListener == null) {
            //     console.log("unsubscribed")
            //     return;
            // }
            await firestore.storeMessage(text, sender);
            messengerBody.animate({ scrollTop: messengerBody[0].scrollHeight + 1000 }, 50);
        } catch(err) {
            console.log(err)
        }
    });
    chatButton.click(function() {
        try {
            const opacity = messenger.css("opacity");
            // console.log(opacity)
            if (opacity < 1) {
                messenger.animate({
                    opacity: "1",
                    bottom: "+=500",
                    left: "+=10",
                    height: "toggle",
                    width: "toggle"
                });
            } else {
                messenger.css("display", "block");
            }
            messengerBody.animate({ scrollTop: $('.messenger__body')[0].scrollHeight + 1000 }, 3000);
            // if (firestore.unsubscribeListener == null) {
                // clearScreen();
                // firestore.subscribe();
                // firestore.unsubscribeListener = true;
            // }
        } catch(err) {
            console.log(err);
        }
    })
});

export function clearScreen() {
    $(".conversation__date").empty();
}

export function displayMessage(content) {
    try {
        if (content.sender !== sender.phone && content.sender !== receiver.phone) {
            return;
        }
        const messengerBody = $('.messenger__body');
        const sentBy = content.sender == sender.phone ? "sender" : "receiver";
        const timestamp = new Date(content.timestamp) == "Invalid Date" 
                        ? new Date(content.timestamp.seconds*1000) : new Date(content.timestamp);
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
        console.log(err)
    }
}
function newTimestamp(timestamp) {
    const date = $(`<div class="conversation__date"></div>`);
    const divider = !firsDateSlot 
        ? $(`<div class="divider"><span class="date"> ${timestamp} </span></div>`)
        : $(`<div class="divider"><span class="date" id="divider__top" style="opacity: 0;"> ${timestamp} </span></div>`)
    firsDateSlot = false;
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
