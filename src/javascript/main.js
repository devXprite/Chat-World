// initialize database
const db = firebase.database();
const audio = new Audio('./src/sound/Pop Up Sms Tone.mp3');

// moment.tz.setDefault("Asia/Kolkata");

var showLastMsg = 200;
var username = 'user';

scrollToBottom = () => {
  $('body').scrollTo('100%', { interrupt: true, duration: 1000, queue: true })
}

document.getElementById("message-form").addEventListener("submit", sendMessage);

// send message to db
function sendMessage(e) {
  e.preventDefault();

  // get values to be submitted
  var localTimestamp = moment.tz("Asia/Taipei").format("x");

  var message = $('#message-input').val();
  console.log(message);
  scrollToBottom();


  document
    .getElementById("message-input")
    .scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });

  db.ref("messages/" + localTimestamp).set({
    username,
    message,
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

  console.log('new msg recived');
  hideLoader();
  audio.play();

  try {

    let messagesData = data.val();

    let senderName = messagesData.username;
    let senderMessage = messagesData.message;
    let type = (username.toLowerCase() === senderName.toLowerCase() ? "send" : "receive");

    let sendingTimeLocal = messagesData.localTimestamp;
    let sendingTimeServer = messagesData.serverTimestamp;
    // let relativeSendingTime = moment(sendingTime, "x").fromNow();
    let relativeSendingTime = moment(sendingTimeServer).format('MMMM Do YYYY, h:mm:ss a');


    const message = `
      <div class="message ${type}" data-aos="zoom-in" data-aos-anchor-placement="bottom">
          <p class="username">${senderName}</p>
          <p class="msg-text">${senderMessage}</p>
          <p class="msg-time">${relativeSendingTime}</p>
      </div>
  `;

    document.querySelector('.message-container').innerHTML += message;
  } catch (error) {
    console.log(error);
  }

});


//Cookies System

if (Cookies.get('username')) {

  username = Cookies.get('username');
  alert(`Welcome Back ${username}`);

} else {
  setUsername()
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

function capitalizeFirstLetter(str) {
  const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
  return capitalized;
}

hideLoader = () => {

  if (($(".loader").css('display')) != 'none') {
    $(".loader").hide();
  }

}

setTimeout(() => {
  scrollToBottom();
  $('#message-input').attr('placeholder', `Send message as ${username}`);
}, 4000);