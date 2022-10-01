/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable array-callback-return */
/* eslint-disable no-undef */
const db = firebase.database();
const popUp = new Audio("../sound/popUp.mp3");

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

const toogleOnlineUsersPage = () => {
    const opts = {
        duration: 1.5,
        ease: "bounce",
    };

    if (gsap.getProperty(".settingsPage", "left") === 0) {
        gsap.to(".settingsPage", {
            left: "100%",
            ...opts,
        });
    }

    if (gsap.getProperty(".onlineUsersPage", "left") !== 0) {
        gsap.to(".onlineUsersPage", {
            left: "0%",
            ...opts,
        });

        return;
    }

    if ($(window).width() > 600) {
        gsap.to(".onlineUsersPage", {
            left: "-20%",
            ...opts,
        });
        return;
    }

    gsap.to(".onlineUsersPage", {
        left: "-100%",
        ...opts,
    });
};

const toogleSettingPage = () => {
    const opts = {
        duration: 1.5,
        ease: "bounce",
    };

    if ($(window).width() > 600) {
        if (gsap.getProperty(".settingsPage", "left") !== 100) {
            gsap.to(".settingsPage", {
                left: "100%",
                ...opts,
            });
        } else {
            gsap.to(".settingsPage", {
                left: "80%",
                ...opts,
            });
        }
        return;
    }

    if (gsap.getProperty(".onlineUsersPage", "left") === 0) {
        gsap.to(".onlineUsersPage", {
            left: "-100%",
            ...opts,
        });
    }

    if (gsap.getProperty(".settingsPage", "left") !== 0) {
        gsap.to(".settingsPage", {
            left: "0%",
            ...opts,
        });

        return;
    }
    gsap.to(".settingsPage", {
        left: "100%",
        ...opts,
    });
};

const appendMessage = (key, messagesData) => {
    if ($(`#${key}`).length === 1) return;

    try {
        const name = filterXSS(messagesData.username);

        const message = spamFilter(linkifyStr(filterXSS(messagesData.message)));
        const type = window.currentUserName === name ? "send" : "receive";

        const timestamp = messagesData.serverTimestamp;
        const sendingTime = moment(timestamp).format(
            "DD MMMM YYYY, h:mm a",
        );
        const countryName = countryFlags[messagesData.country].name;
        const countryEmoji = countryFlags[messagesData.country].emoji;

        $(".chats").append(`
        <div class="message ${type}" id="${key}">
            <p class="username">${name} </p>
            <p class="country">from ${countryName} ${countryEmoji}</p>
            <p class="text">${message}</p>
            <p class="time">${sendingTime}</p>
        </div>
    `);

        if (autoScroll) $(`#${key}`).get(0).scrollIntoView();
        if (sound) popUp.play();
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

const newMsgListener = () => {
    db.ref("messages").limitToLast(1).on("child_added", (data) => {
        try {
            appendMessage(data.key, data.val());
        } catch (error) {
            console.log(error);
        }
    });
};

const formSubmitListener = () => {
    $(document).on("submit", "#msgForm", (e) => {
        e.preventDefault();
        submitMessage($("#inputmsg").val());
        $("#inputmsg").val("");
    });
};

// eslint-disable-next-line no-async-promise-executor
const loadOldChat = async (count = 120) => new Promise(async (resolve) => {
    const data = await db.ref("messages").limitToLast(count).once("value");
    const snapshots = data.val();
    if (snapshots) Object.keys(snapshots).forEach((key) => { appendMessage(key, snapshots[key]); });

    resolve();
});

const debounce = (func, wait, immediate) => {
    let timeout;
    return function () {
        // eslint-disable-next-line unicorn/no-this-assignment
        const context = this;
        // eslint-disable-next-line prefer-rest-params
        const args = arguments;
        const later = () => {
            timeout = undefined;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

const onlineUsersListener = () => {
    const onlineUsers = db.ref("onlineUsers/");
    const currentOnlineUser = db.ref(`onlineUsers/${currentUserName}`);

    currentOnlineUser.set({
        isOnline: true,
        lastSeen: 2000000000000,
    });

    currentOnlineUser.onDisconnect().set({
        isOnline:false,
        lastSeen: firebase.database.ServerValue.TIMESTAMP,
    });

    onlineUsers
        .orderByChild("lastSeen")
        .limitToLast(20)
        .on("value", (snapshot) => {
            $(".onlineUsers-container").html("");

            const userObj = snapshot.val();

            let usersArr = Object.keys(userObj).map((key) => ({
                key,
                status: userObj[key].isOnline ? "online" : "offline",
                lastSeen: userObj[key].lastSeen ,
            }));

            const onlineUsersCount = usersArr.filter((user) => user.status === "online").length;

            usersArr = _.orderBy(usersArr, ["lastSeen"], ["desc"]);

            usersArr.map((user) => {
                const { key, lastSeen, status } = user;

                $(".onlineUsers-container").append(`
                <div class="onlineUser">
                   <div class="details">
                       <p class="name">${filterXSS(key)}</p>
                       <p class="lastSeen"><b>Last Seen: </b><span>${lastSeen === 2000000000000 ? "Online" : moment(lastSeen).format("Do MMMM YYYY, h:mm a")}</span></p>
                   </div>
                   <i class="status ${status}"> </i>
               </div>
               `);
            });

            $(".onlineCount").text(onlineUsersCount <= 9 ? `0${onlineUsersCount}` : onlineUsersCount);
            if (sound) popUp.play();
        });
};

const typingListener = () => {
    const typingStatus = db.ref("typingStatus");

    const resetTyping = debounce(() => {
        typingStatus.update({
            isTyping: false,
            username: currentUserName,
        });
    }, 1000);

    const startTyping = () => {
        typingStatus.update({
            isTyping: true,
            username: currentUserName,
        });
        resetTyping();
    };

    typingStatus.onDisconnect().remove()

    typingStatus.on("value", (snapshot) => {
        const { isTyping, username } = snapshot.val();
        if (isTyping) {
            $(".typingStatus p").text(`${username} is typing...`);
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

const toogleSound = () => {
    if (window.sound) {
        $("button.sound").text("Turn On Sound");
        window.sound = false;
        return;
    }

    window.sound = true;
    $("button.sound").text("Turn Off Sound");
};

const toogleScroll = () => {
    if (window.autoScroll) {
        $("button.scroll").text("Turn On AutoScroll");
        window.autoScroll = false;
        return;
    }

    window.autoScroll = true;
    $("button.scroll").text("Turn Off AutoScroll");
};

const logOut = () => {
    if (Modernizr.localstorage) localStorage.clear();
    window.location.reload();
};

const viewSource = () =>{
    window.location.href = 'https://github.com/devXprite/realtime-chat-app';
}

const bugReport = () =>{
    window.location.href = `https://github.com/devXprite/world-chatapp/issues/new?labels=bug&title=New+bug&body=Describe+the+problem`
}

window.addEventListener("load", async () => {
    window.currentUserName = await getCurrentUserName();
    window.currentCountry = await getCurrentCountry();
    window.sound = true;
    window.autoScroll = true;

    await loadOldChat();
    await hideWelcomeScreen();

    newMsgListener();
    formSubmitListener();
    onlineUsersListener();
    typingListener();

    
    $(".status-container").on("click", toogleOnlineUsersPage);
    $(".settingIcon").on("click", toogleSettingPage);
    $("button.sound").on("click", toogleSound);
    $("button.scroll").on("click", toogleScroll);
    $("button.logout").on("click", logOut);
    $("button.viewSource").on("click", viewSource);
    $("button.bugReport").on("click", bugReport);

});
