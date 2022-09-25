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
    timeLine.to(".welcome", {
        left: "100%",
        duration: 1.5,
        ease: "bounce",
    });
    timeLine.to(".welcome", {
        display: "none",
        onComplete: resolve,
    });
});

const toogleChat = () => {
    const opts = {
        duration: 1.5,
        ease: "bounce",
    };

    if (gsap.getProperty(".onlineUsers", "left") !== 0) {
        gsap.to(".onlineUsers", {
            left: "0%",
            ...opts,
        });

        return;
    }
    gsap.to(".onlineUsers", {
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
            "MMMM Do YYYY, h:mm:ss a",
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

// eslint-disable-next-line no-async-promise-executor
const loadOldChat = async (count = 100) => new Promise(async (resolve) => {
    const data = await db.ref("messages").limitToLast(count).once("value");
    const snapshots = data.val();
    if (snapshots) Object.keys(snapshots).forEach((key) => { appendMessage(key, snapshots[key]); });

    resolve();
});

window.addEventListener("load", async () => {
    window.currentUserName = await getCurrentUserName();
    window.currentCountry = await getCurrentCountry();

    await loadOldChat();
    await hideWelcomeScreen();

    db.ref("messages").limitToLast(1).on("child_added", (data) => {
        try {
            appendMessage(data.key, data.val());
        } catch (error) {
            console.log(error);
        }
    });

    $(document).on("submit", "#msgForm", (e) => {
        e.preventDefault();
        submitMessage($("#inputmsg").val());
        $("#inputmsg").val("");
    });
});

if ($(window).width() < 600) $(".status-container").on("click", toogleChat);
