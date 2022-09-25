/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable array-callback-return */
/* eslint-disable no-undef */
// initialize database
const db = firebase.database();

const getCurrentUserName = async () => new Promise((resolve) => {
    if (Modernizr.localstorage && localStorage.username) {
        resolve(localStorage.username);
        $(".loader").css("display", "flex");
        return;
    }

    $(".loader").hide();
    $("#inputUsername").show();

    $(document).on("submit", "#inputUsername", (e) => {
        e.preventDefault();
        const username = $("#inputUsername input[type=\"text\"]").val();

        resolve(username);

        $("#inputUsername").hide();
        $(".loader").css("display", "flex");

        if (Modernizr.localstorage) {
            localStorage.username = username;
        }
    });
});

const getCurrentCountry = async () => new Promise((resolve) => {
    if (Modernizr.localstorage && localStorage.country) {
        resolve(localStorage.country);
        return;
    }

    $.ajax({
        url: "https://ipinfo.io/json?token=57cb832fc1de92",
        type: "GET",
        dataType: "json",
        success(res) {
            const { country } = res;
            resolve(country);

            if (Modernizr.localstorage) localStorage.country = country;
        },
        error: () => {
            resolve("US");
        },
    });
});

const hideWelcomeScreen = () => new Promise((resolve) => {
    const timeLine = gsap.timeline();
    timeLine.to(".welcomePage", {
        left: "100%",
        duration: 1.5,
        ease: "bounce",
    });
    timeLine.to(".welcomePage", {
        display: "none",
        onComplete: resolve,
    });
});

const toogleChat = () => {
    const opts = {
        duration: 1.5,
        ease: "bounce",
    };

    if (gsap.getProperty(".onlineUsersPage", "left") !== 0) {
        gsap.to(".onlineUsersPage", {
            left: "0%",
            ...opts,
        });

        return;
    }
    gsap.to(".onlineUsersPage", {
        left: "-100%",
        ...opts,
    });
};

const appendMessage = (key, messagesData) => {
    if ($(`#${key}`).length === 1) return;

    try {
        const name = messagesData.username;

        const message = spamFilter(linkifyStr(filterXSS(messagesData.message)));
        const type = window.currentUserName.toLowerCase() === name.toLowerCase() ? "send" : "receive";

        const timestamp = messagesData.serverTimestamp;
        const sendingTime = moment(timestamp).format(
            "DD MMMM YYYY, h:mm:ss a",
        );
        const countryName = "IN" || countryFlags[messagesData.country].name;
        const countryEmoji = "x" || countryFlags[messagesData.country].emoji;

        $(".chats").append(`
        <div class="message ${type}" id="${key}">
            <p class="username">${name} </p>
            <p class="country">from ${countryName} ${countryEmoji} 🇪🇬</p>
            <p class="text">${message}</p>
            <p class="time">${sendingTime}</p>
        </div>
    `);

        window.location.href = `#${key}`;
    } catch (error) {
        console.log(error);
    }
};

const submitMessage = (message) => {
    db.ref("messages").push({
        username: currentUserName,
        message,
        country: currentCountry,
        serverTimestamp: firebase.database.ServerValue.TIMESTAMP,
    });
};

const checkNewMsg = () => {
    db.ref("messages").limitToLast(1).on("child_added", (data) => {
        try {
            appendMessage(data.key, data.val());
        } catch (error) {
            console.log(error);
        }
    });
};

const checkFormSubmit = () => {
    $(document).on("submit", "#msgForm", (e) => {
        e.preventDefault();
        submitMessage($("#inputmsg").val());
        $("#inputmsg").val("");
    });
};

// eslint-disable-next-line no-async-promise-executor
const loadOldChat = async (count = 100) => new Promise(async (resolve) => {
    const data = await db.ref("messages").limitToLast(count).once("value");
    const snapshots = data.val();
    if (snapshots) Object.keys(snapshots).forEach((key) => { appendMessage(key, snapshots[key]); });

    resolve();
});

const checkOnlineUsers = () => {
    const onlineUsers = db.ref("onlineUsers/");
    const currentOnlineUser = db.ref(`onlineUsers/${currentUserName}`);

    currentOnlineUser.set({
        status: "online",
        lastSeen: 2000000000000,
    });

    currentOnlineUser.onDisconnect().set({
        status: "offline",
        lastSeen: firebase.database.ServerValue.TIMESTAMP,
    });

    onlineUsers
        .limitToLast(50)
        .orderByChild("lastSeen")
        .on("value", (snapshot) => {
            $(".onlineUsers-container").html("");

            const userObj = snapshot.val();

            let usersArr = Object.keys(userObj).map((key) => ({
                key,
                status: userObj[key].status,
                lastSeen: userObj[key].lastSeen === 2000000000000 ? "Online" : moment(userObj[key].lastSeen).format("Do MMMM YYYY, h:mm:ss a"),
            }));

            usersArr = _.orderBy(usersArr, ["lastSeen"], ["desc"]);

            usersArr.map((user) => {
                const { key, lastSeen, status } = user;
                $(".onlineUsers-container").append(`
                <div class="onlineUser">
                   <div class="details">
                       <p class="name">${key}</p>
                       <p class="lastSeen"><b>Last Seen </b><span>${lastSeen}</span></p>
                   </div>
                   <i class="status ${status}"> </i>
               </div>
               `);
            });

            console.table(usersArr);
            $(".onlineCount").text($(".status.online").length);
        });
};

const debounce = (func, wait, immediate) => {
    let timeout;
    return function () {
        const context = this;
        const args = arguments;
        const later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

const ckeckTyping = () => {
    const typingStatus = db.ref("typingStatus");

    const resetTyping = debounce(() => {
        typingStatus.update({
            status: 0,
            name: currentUserName,
        });
    }, 1500);

    const startTyping = () => {
        typingStatus.update({
            status: 1,
            name: currentUserName,
        });
        resetTyping();
    };

    typingStatus.on("value", (snapshot) => {
        const { status, name } = snapshot.val();
        if (status > 0) {
            console.log(`${name} Typing....`);
            $(".typingStatus p").html(`${name} is typing...`);
            gsap.to(".typingStatus", {
                top: "4.5em",
                ease: "elastic",
                duration: 0.5,
            });
        } else {
            gsap.to(".typingStatus", {
                top: "3em",
                ease: "elastic",
                duration: 0.5,
            });
        }
    });

    $("#inputmsg").keyup(startTyping);
};

window.addEventListener("load", async () => {
    window.currentUserName = await getCurrentUserName();
    window.currentCountry = await getCurrentCountry();

    await loadOldChat();
    await hideWelcomeScreen();

    checkNewMsg();
    checkFormSubmit();
    checkOnlineUsers();
    ckeckTyping();
});

if ($(window).width() < 600) $(".status-container").on("click", toogleChat);
