// initialize database
const db = firebase.database();
const audio = new Audio('./src/sound/Pop Up Sms Tone.mp3');

var showLastMsg = 200;
var username;

// submit form
// listen for submit event on the form and call the postChat function
document.getElementById("message-form").addEventListener("submit", sendMessage);

// send message to db
function sendMessage(e) {
  e.preventDefault();

  // get values to be submitted
  var timestamp = Date.now();

  var message = $('#message-input').val();
  console.log(message);

  document
    .getElementById("message-input")
    .scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });

  // create db collection and send in the data
  db.ref("messages/" + timestamp).set({
    username,
    message,
    timestamp
  });

  $('#message-input').val('');
}

// display the messages
// reference the collection created earlier
const fetchChat = db.ref("messages/");

// check for new messages using the onChildAdded event listener
fetchChat.limitToLast(showLastMsg).on("child_added", function (data) {

  console.log('new msg recived');
  audio.play();

  let messagesData = data.val();

  let senderName = messagesData.username;
  let senderMessage = messagesData.message;
  let type = (username.toLowerCase() === senderName.toLowerCase() ? "send" : "receive");

  let sendingTime = messagesData.timestamp;
  let relativeSendingTime = moment(sendingTime, "x").fromNow();


  const message = `
      <div class="message ${type}" data-aos="zoom-in">
          <p class="username">${senderName}</p>
          <p class="msg-text">${senderMessage}</p>
          <p class="msg-time">${relativeSendingTime}</p>
      </div>
  `

  document.querySelector('.message-container').innerHTML += message;
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

  if (username == null) {
    alert("Please to fill your name");
    setUsername();
  } else if (username.length > 3) {
    Cookies.set('username', capitalizeFirstLetter(username), { expires: 365 })
  } else {
    alert("Please enter real Name.");
    setUsername();
  }
}

function capitalizeFirstLetter(str) {
  const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
  return capitalized;
}