/* eslint-disable no-undef */

const getCurrentUserName = async () => new Promise((resolve) => {
    if (Modernizr.localstorage && localStorage.username) {
        resolve(localStorage.username);
        $(".loader").css("display", "flex");
        return;
    }

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
            localStorage.country = country;
        },
        error: () => {
            resolve("US");
        },
    });
});

const hideWelcomeScreen = () => {
    const timeLine = gsap.timeline();
    timeLine.to(".welcome", {
        left: "100%",
        duration: 1.5,
        ease: "bounce",
    });
    timeLine.to(".welcome", {
        display: "none",
    });
};

const toogleChat = () => {
    const opts = {
        duration: 1,
        ease: "bounce",
    };
    if (gsap.getProperty(".chat", "left") === 0) {
        gsap.to(".onlineUsers", {
            left: "0%",
            ...opts,
        });

        gsap.to(".chat,form#inputmsg", {
            left: "100%",
            ...opts,
        });

        return;
    }
    gsap.to(".onlineUsers", {
        left: "-100%",
        ...opts,
    });

    gsap.to(".chat,form#inputmsg", {
        left: "0%",
        ...opts,
    });
};

window.addEventListener("load", async () => {
    const currentUserName = await getCurrentUserName();
    const currentCountry = await getCurrentCountry();

    hideWelcomeScreen();

    console.log(currentUserName, currentCountry);
});

$(".status-container").on("click", toogleChat);
