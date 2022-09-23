// initialize database
const db = firebase.database();
const audio = new Audio("./src/sound/Pop Up Sms Tone.mp3");

// return cuerrent user
const getUsername = () => {
  let username = "";
  if (Modernizr.cookies && Cookies.get("username")) {
    username = Cookies.get("username");
    alert(`Welcome Back ${username}`);
  } else {
    username = prompt("Enter Your Name");
    if (username && username.length > 4) {
      Cookies.set("username", capitalizeFirstLetter(username), {
        expires: 365,
      });
    } else {
      alert("Please enter a valid name.");
      getUsername();
    }
  }

  return username;
}

// return user's country
const getCountry = () => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "https://ipinfo.io/json",
      type: "GET",
      dataType: "json",
      success: function (res) {
        resolve(res.country);
      },
    });
  })
}

let username = getUsername();
let country = "US";

$.ajax({
  url: "https://ipinfo.io/json",
  type: "GET",
  dataType: "json",
  success: function (res) {
    country = res.country;
  },
});

const scrollToBottom = (dur = 1000, interrupt = false) => {
  $("body").scrollTo("100%", {
    duration: dur,
    interrupt: interrupt
  });
};

document.getElementById("message-form").addEventListener("submit", sendMessage);

// send message to db
function sendMessage(e) {
  e.preventDefault();

  var localTimestamp = moment.tz("Asia/Kolkata").format("x");

  var message = $("#message-input").val();

  scrollToBottom();

  db.ref("messages/" + localTimestamp).set({
    username,
    message,
    country,
    localTimestamp,
    serverTimestamp: firebase.database.ServerValue.TIMESTAMP,
  });

  $("#message-input").val("");
}

const fetchChat = db.ref("messages");

// check for new messages using the onChildAdded event listener
fetchChat.limitToLast(60).on("child_added", function (data) {
  console.log('new msg recived');
  hideLoader();
  audio.play();

  try {
    let messagesData = data.val();

    let senderName = filterXSS(messagesData.username);
    let senderMessage = spamFilter(linkifyStr(filterXSS(messagesData.message)));
    let type =
      username.toLowerCase() === senderName.toLowerCase() ? "send" : "receive";

    let sendingTimeLocal = messagesData.localTimestamp;
    let sendingTimeServer = messagesData.serverTimestamp;
    // let relativeSendingTime = moment(sendingTime, "x").fromNow();
    let relativeSendingTime = moment(sendingTimeServer).format(
      "MMMM Do YYYY, h:mm:ss a"
    );
    let countryName = countryFlags[messagesData.country].name;
    let countryEmoji = countryFlags[messagesData.country].emoji;

    const message = `
      <div class="message ${type}" >
          <p class="username">${senderName} <span class ="county">from ${
      countryName + " " + countryEmoji
    }</span> </p>
          <p class="msg-text">${senderMessage}</p>
          <p class="msg-time">${relativeSendingTime}</p>
      </div>
  `;

    document.querySelector(".message-container").innerHTML += message;
  } catch (error) {
    // console.log(error);
  }
});

var onlineUsersFunction = () => {
  const onlineUsers = db.ref("onlineUsers/");
  const currentOnlineUser = db.ref(
    "onlineUsers/" + capitalizeFirstLetter(username)
  );

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
    .on("value", (data) => {
      var data = data.val();
      $("#onlineUsers").html("");

      Object.keys(data).forEach((userData) => {
        let user = userData;
        let status = data[userData]["status"];
        let lastSeenData = data[userData]["lastSeen"];
        let lastSeen =
          lastSeenData == 2000000000000 ?
          "online" :
          moment(lastSeenData).format("MMMM Do YYYY, h:mm:ss a");

        console.log(`${user}:${status}`);

        let onlineUser = `
      <div class="onlineUser">
        <p class="onlineUserName">${user}</p>
        <span class="status ${status}"></span>
        <p class="lastSeen"><b>Last Seen : </b>${lastSeen}</p>
      </div>
      `;
        document.querySelector("#onlineUsers").innerHTML += onlineUser;
        let onlineUsersLenght = $("span.status.online").length;
        $(".onlineUsersCount").html(
          onlineUsersLenght <= 9 ? "0" + onlineUsersLenght : onlineUsersLenght
        );
      });
    });
};

setTimeout(() => {
  onlineUsersFunction();
}, 3000);

const typingStatus = db.ref("typingStatus");

const debounce = (func, wait, immediate) => {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

const resetTyping = debounce(function () {
  typingStatus.update({
    status: 0,
    name: username,
  });
}, 1500);

const typing = () => {
  typingStatus.update({
    status: 1,
    name: username,
  });

  resetTyping();
};

typingStatus.on("value", function (snapshot) {
  if (snapshot.val().status > 0) {
    console.log(snapshot.val().name + " Typing....");
    $(".typing p").html(`${snapshot.val().name} is typing...`);
    gsap.to(".typing", {
      left: "0%",
      ease: "elastic",
      duration: 0.5,
    });
  } else {
    gsap.to(".typing", {
      left: "-50%",
      ease: "elastic",
      duration: 0.5,
    });
  }
});

$("#message-input").keyup(typing);


//Cookies System


function setUsername() {
  username = prompt("Enter Your Name");
  try {
    if (username == null) {
      alert("Please fill your name");
      setUsername();
    } else if (username.length > 3) {
      Cookies.set("username", capitalizeFirstLetter(username), {
        expires: 365,
      });
    } else {
      alert("Please enter real Name.");
      setUsername();
    }
  } catch (error) {
    console.log(error);
  }
}

function setUsernameWithoutCokies() {
  username = prompt("Enter Your Name");

  if (username == null) {
    alert("Please to fill your name");
    setUsername();
  } else if (username.length > 3) {
    // console.log(`Username : ${username}`);
  } else {
    alert("Please enter real Name.");
    setUsername();
  }
}

function capitalizeFirstLetter(str) {
  const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
  return capitalized;
}

const hideLoader = () => {
  if ($(".loader").css("display") != "none") {
    $(".loader").hide();
  }

  if ($(".pleaseWait").css("display") != "none") {
    $(".pleaseWait").hide();
  }
};

signOut = () => {
  if (confirm("Do your really want to change name?")) {
    Modernizr.cookies ? Cookies.remove("username") : location.reload();
    location.reload();
  }
};

setTimeout(() => {
  scrollToBottom();
  // $("#message-input").attr("placeholder", `Send message as ${username}`);
  $("#your-name").html(username);
  $("#your-country").html(
    countryFlags[country].name + " " + countryFlags[country].emoji
  );
  // scrollBarAnimation();
}, 3000);

setInterval(() => {
  $("#crt-time").html(moment().format("HH : mm : ss "));
}, 1000);

gsap.defaults({
  ease: "bounce",
  duration: 1.5,
});

scrollBarAnimation = () => {
  gsap.to(".scrollbar", {
    scrollTrigger: {
      trigger: "#chat",
      start: "top 0px",
      end: "bottom 100%",
      markers: false,
      scrub: true,
    },
    // ease: 'none',
    width: "100%",
  });
};

const toogleInfo = () => {
  if ($("#info").css("left") == "0px") {
    gsap.to("#info", {
      left: "100%",
    });
    gsap.to("nav i.infoIcon", {
      color: "orange",
      rotate: 0,
    });
  } else {
    gsap.to("#info", {
      left: "0%",
    });
    gsap.to("nav i.infoIcon", {
      color: "lime",
      rotate: 180,
    });
    gsap.to("#onlineUsers", {
      right: "100%",
    });
  }
};

const toogleUser = () => {
  if ($("#onlineUsers").css("right") == "0px") {
    gsap.to("#onlineUsers", {
      right: "100%",
    });
  } else {
    gsap.to("#onlineUsers", {
      right: "0%",
    });

    gsap.to("#info", {
      left: "100%",
    });
    $("#onlineUsers").scrollTo("50%", {
      duration: 1000
    });
  }
};

Modernizr.cookies ?
  $("#check-cookies").html("Enabled").addClass("supported") :
  $("#check-cookies").html("Disabled").addClass("notsupported");
Modernizr.emoji ?
  $("#check-emoji").html("Supported").addClass("supported") :
  $("#check-emoji").html("Not Supported").addClass("notsupported");
Modernizr.unicode ?
  $("#check-unicode").html("Supported").addClass("supported") :
  $("#check-unicode").html("Not Supported").addClass("notsupported");
Modernizr.webaudio ?
  $("#check-audio").html("Supported").addClass("supported") :
  $("#check-audio").html("Not Supported").addClass("notsupported");

var timeLeft = 15;

var loaderInterval = setInterval(() => {
  $(".timeLeft").text(timeLeft--);
  if (timeLeft <= 0) {
    $(".pleaseWait").text("it takes more than normal");
    clearInterval(loaderInterval);
  }
}, 1200);

var container = document.querySelector("body");
var listener = SwipeListener(container);
container.addEventListener("swipe", function (e) {
  var directions = e.detail.directions;

  if (directions.left) {
    toogleUser();
    console.log("Swiped left.");
  }

  if (directions.right) {
    toogleUser();
    console.log("Swiped right.");
  }

});

$("textarea")
  .each(function () {
    this.setAttribute(
      "style",
      "height:" + this.scrollHeight + "px;overflow-y:hidden;"
    );
  })
  .on("input", function () {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
  });

var typedStart = new Typed("#message-input", {
  strings: [
    `Hii Prateek`,
    "How are you?",
    "type here your message...^5000",
    "[TIP] swipe right to see online users",
    "type here your message...",
  ],
  typeSpeed: 60,
  backSpeed: 30,
  backDelay: 2000,
  smartBackspace: false,
  cursorChar: "",
  attr: "placeholder",
  bindInputFocusEvents: true,
  loop: false,
});

Offline.options = {
  checks: {
    xhr: {
      url: "https://raw.githubusercontent.com/7ORP3DO/checkProxy/master/proxy.txt",
    },
  },
};

Offline.on("up", onlineUsersFunction, "none");