// initialize database
const db = firebase.database();
const audio = new Audio('./src/sound/Pop Up Sms Tone.mp3');

var showLastMsg = 100;
var username = 'user';
var country = 'IN';

scrollToBottom = () => {
  $('body').scrollTo('100%', { duration: 1000 })
}

AOS.init({
  mirror: true
});


$.ajax({
  url: "https://ipinfo.io/json",
  type: 'GET',
  dataType: 'json',
  success: function (res) {
    country = res.country;
  }
});

document.getElementById("message-form").addEventListener("submit", sendMessage);

// send message to db
function sendMessage(e) {
  e.preventDefault();

  // get values to be submitted
  var localTimestamp = moment.tz("Asia/Kolkata").format("x");

  var message = $('#message-input').val();
  // console.log(message);
  scrollToBottom();

  db.ref("messages/" + localTimestamp).set({
    username,
    message,
    country,
    localTimestamp,
    serverTimestamp: firebase.database.ServerValue.TIMESTAMP
  });

  $('#message-input').val('');
}



// display the messages
// reference the collection created earlier
const fetchChat = db.ref("messages/");

// check for new messages using the onChildAdded event listener
fetchChat.limitToLast(showLastMsg).on("child_added", function (data) {

  // console.log('new msg recived');
  hideLoader();
  audio.play();

  try {

    let messagesData = data.val();

    let senderName = filterXSS(messagesData.username);
    let senderMessage = spamFilter(linkifyStr(filterXSS(messagesData.message)));
    let type = (username.toLowerCase() === senderName.toLowerCase() ? "send" : "receive");

    let sendingTimeLocal = messagesData.localTimestamp;
    let sendingTimeServer = messagesData.serverTimestamp;
    // let relativeSendingTime = moment(sendingTime, "x").fromNow();
    let relativeSendingTime = moment(sendingTimeServer).format('MMMM Do YYYY, h:mm:ss a');
    let countryName = countryFlags[messagesData.country].name;
    let countryEmoji = countryFlags[messagesData.country].emoji;


    const message = `
      <div class="message ${type}" >
          <p class="username">${senderName} <spam class ="county">from ${countryName + " " + countryEmoji}</spam> </p>
          <p class="msg-text">${senderMessage}</p>
          <p class="msg-time">${relativeSendingTime}</p>
      </div>
  `;

    document.querySelector('.message-container').innerHTML += message;
  } catch (error) {
    // console.log(error);
  }

});

db.ref("totalHits").on("value", (snapshot) => {
  $("#ttl-view").html(snapshot.val());
});

db.ref("totalHits").transaction(
  (totalHits) => totalHits + 1,
  (error) => {
    if (error) {
      console.log(error);
    }
  }
);

db.ref("/messages").on("value", function (data) {
  $("#ttl-msg").html(data.numChildren());
});


//Cookies System

if (Modernizr.cookies) {
  if (Cookies.get('username')) {
    username = Cookies.get('username');
    alert(`Welcome Back ${username}`);
  } else {
    setUsername();
  }
} else {
  alert("Cookies are blocked or not supported by your browser!");
  setUsernameWithoutCokies();
}

function setUsername() {
  username = prompt("Enter Your Name");
  try {
    if (username == null) {
      alert("Please to fill your name");
      setUsername();
    } else if (username.length > 3) {
      Cookies.set('username', capitalizeFirstLetter(username), { expires: 365 })
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

hideLoader = () => {
  if (($(".loader").css('display')) != 'none') {
    $(".loader").hide();
  }
}

signOut = () => {
  if (confirm('Do your really want to change name?')) {
    (Modernizr.cookies) ? Cookies.remove('username') : location.reload();
    location.reload();
  }
}

setTimeout(() => {
  scrollToBottom();
  $('#message-input').attr('placeholder', `Send message as ${username}`);
  $("#your-name").html(username);
  $("#your-country").html(countryFlags[country].name + ' ' + countryFlags[country].emoji);
  // scrollBarAnimation();
}, 3000);

setInterval(() => {
  $("#crt-time").html(moment().format('HH : mm : ss '))
}, 1000);

scrollBarAnimation = () => {
  gsap.to('.scrollbar', {
    scrollTrigger: {
      trigger: '#chat',
      start: "top 0px",
      end: "bottom 100%",
      markers: false,
      scrub: true
    },
    // ease: 'none',
    width: '100%'
  });
}

toogleInfo = () => {

  if (($("#info").css('left')) == '0px') {
    gsap.to('#info', {
      ease: 'bounce',
      left: '100%',
      duration: 1.5
    });
    gsap.to('nav i', {
      ease: 'bounce',
      color: 'orange',
      rotate: 0,
      duration: 1.5
    });
  } else {
    gsap.to('#info', {
      ease: 'bounce',
      left: '0%',
      duration: 1.5
    });
    gsap.to('nav i', {
      ease: 'bounce',
      color: 'lime',
      rotate: 180,
      duration: 1.5
    });
  }
}

(Modernizr.cookies) ? $("#check-cookies").html("Enabled").addClass("supported") : $("#check-cookies").html("Disabled").addClass("notsupported");
(Modernizr.emoji) ? $("#check-emoji").html("Supported").addClass("supported") : $("#check-emoji").html("Not Supported").addClass("notsupported");
(Modernizr.unicode) ? $("#check-unicode").html("Supported").addClass("supported") : $("#check-unicode").html("Not Supported").addClass("notsupported");
(Modernizr.webaudio) ? $("#check-audio").html("Supported").addClass("supported") : $("#check-audio").html("Not Supported").addClass("notsupported");
