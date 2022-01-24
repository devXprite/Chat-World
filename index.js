// Your web app's Firebase configuration
 const firebaseConfig = {
    apiKey: "AIzaSyDA5x4V7gR8wB-Vli4ZsW2dJApHulVAYf0",
    authDomain: "chat-app-ae863.firebaseapp.com",
    databaseURL: "https://chat-app-ae863-default-rtdb.firebaseio.com",
    projectId: "chat-app-ae863",
    storageBucket: "chat-app-ae863.appspot.com",
    messagingSenderId: "683119932272",
    appId: "1:683119932272:web:e41451152ac2c0b2f515b5",
    measurementId: "G-TJL5GDYXCL"
  };
  
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// initialize database
const db = firebase.database();

// get user's data
const username = prompt("Please Tell Us Your Name");

// submit form
// listen for submit event on the form and call the postChat function
document.getElementById("message-form").addEventListener("submit", sendMessage);

// send message to db
function sendMessage(e) {
  e.preventDefault();

  // get values to be submitted
  const timestamp = Date.now();
  const messageInput = document.getElementById("message-input");
  const message = messageInput.value;

  // clear the input box
  messageInput.value = "";

  //auto scroll to bottom
  document
    .getElementById("messages")
    .scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });

  // create db collection and send in the data
  db.ref("messages/" + timestamp).set({
    username,
    message,
  });
}

// display the messages
// reference the collection created earlier
const fetchChat = db.ref("messages/");

// check for new messages using the onChildAdded event listener
fetchChat.on("child_added", function (snapshot) {
  const messages = snapshot.val();
  const message = `<li class=${
    username === messages.username ? "sent" : "receive"
  }><span>${messages.username}: </span>${messages.message}</li>`;
  // append the message on the page
  document.getElementById("messages").innerHTML += message;
});
