//things to add
//highlight your score if it makes the top 10
//Add icons
//light mode
//Column spacing

//firebase
var db = firebase.firestore();
if (location.hostname === "localhost") {
  db.useEmulator("localhost", 8080);
}

//firebase auth
firebase
  .auth()
  .signInAnonymously()
  .catch(function (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorCode, errorMessage);
  });

//if signed in successfully
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in.
    var isAnonymous = user.isAnonymous;
    var uid = user.uid;
    // ...
  } else {
    // User is signed out.
    // ...
  }
  // ...
});

//stopwatch code https://tinloof.com/blog/how-to-build-a-stopwatch-with-html-css-js-react-part-2/
// Convert time to a format of hours, minutes, seconds, and milliseconds

function timeToString(time) {
  let diffInHrs = time / 3600000;
  let hh = Math.floor(diffInHrs);

  let diffInMin = (diffInHrs - hh) * 60;
  let mm = Math.floor(diffInMin);

  let diffInSec = (diffInMin - mm) * 60;
  let ss = Math.floor(diffInSec);

  let diffInMs = (diffInSec - ss) * 1000;
  let ms = Math.floor(diffInMs);

  let formattedMM = mm.toString().padStart(2, "0");
  let formattedSS = ss.toString().padStart(2, "0");
  let formattedMS = ms.toString().padStart(3, "0");

  return `${formattedSS}.${formattedMS}`;
}

// Declare variables to use in our functions below

let startTime;
let elapsedTime = 0;
let timerInterval;
let clickCount = 0;
let finalScore;

// Create function to modify innerHTML

function print(txt) {
  timer.innerHTML = txt + '<span class="white">s</span>';
}

// Create "start", "pause" and "reset" functions

function start() {
  startButton.style.display = "none";
  onButton.style.display = "inline";
  timer.style.display = "block";
  startTime = Date.now() - elapsedTime;
  timerInterval = setInterval(function printTime() {
    elapsedTime = Date.now() - startTime;
    print(timeToString(elapsedTime));
  }, 10);
  addRotation();
}

//Count clicks
function clicking() {
  clickCount++;
  if (clickCount === 30) {
    score.style.display = "block";
    timer.style.display = "none";
    timerFinal.style.display = "block";
    finalScore = timeToString(elapsedTime);
    timerFinal.innerHTML = finalScore + '<span class="white">s</span>';
    score.innerHTML = finalScore + '<span class="black">s</span>';
    onButton.style.display = "none";
    modal.style.display = "flex";
    content.className += "dimmed";
    removeRotation();
  }
}

function addRotation() {
  circle1.classList.add("rotate-left");
  circle2.classList.add("rotate-right");
  circle3.classList.add("rotate-left");
  circle4.classList.add("rotate-right");
}

function removeRotation() {
  circle1.classList.remove("rotate-left");
  circle2.classList.remove("rotate-right");
  circle3.classList.remove("rotate-left");
  circle4.classList.remove("rotate-right");
}

//reset after 30 clicks
function reset() {
  clearInterval(timerInterval);
  clickCount = 0;
  elapsedTime = 0;
  startButton.style.display = "flex";
  timer.style.display = "none";
  score.style.display = "none";
  modal.style.display = "none";
  timerFinal.innerHTML = "";
}

// Create event listeners
let content = document.getElementById("content");
let timer = document.getElementById("timer");
let timerFinal = document.getElementById("timer__final");
let score = document.getElementById("modal__score");
let onButton = document.getElementById("on");
let offButton = document.getElementById("off");
let startButton = document.getElementById("start");
let modal = document.getElementById("modal");
let modalButton = document.getElementById("modal__button");
let results = document.getElementById("results");
let resultsTable = document.getElementById("results__table");
let form = document.getElementById("modal__form");
let input = document.getElementById("modal__form-input");
let startOver = document.getElementById("start-over");
//circles
let circle1 = document.getElementById("circle-1");
let circle2 = document.getElementById("circle-2");
let circle3 = document.getElementById("circle-3");
let circle4 = document.getElementById("circle-4");

//start timer
startButton.addEventListener("click", start, false);

//clicking button
onButton.addEventListener("mousedown", clicking);
onButton.addEventListener("touchstart", clicking);

startOver.addEventListener("click", hideResults);

function hideResults() {
  results.style.display = "none";
  content.className -= "dimmed";
}

var first = 0;
function addEmpty(num) {
  let rank = num + 1;
  for (let i = 0; i < 10 - num; i++) {
    let div = document.createElement("div");
    div.innerHTML =
      "<span>" + rank++ + "</span><span>---</span><span>---</span>";
    div.className += "results__table--empty";
    resultsTable.appendChild(div);
  }
}

function showTable() {
  //Retieves time totals in asc order from the scores collection
  var rank = 0;
  var collection = db
    .collection("scores")
    .orderBy("totalTime", "asc")
    .limit(10);
  var size, newest;

  //Find newest entry
  var scoresRef = db.collection("scores");
  var query = scoresRef.orderBy("createdAt", "desc").limit(1);
  query
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        // doc.data() is never undefined for query doc snapshots
        newest = doc.id;
      });
    })
    .catch(function (error) {
      console.log("Error getting documents: ", error);
    });

  collection.get().then(function (querySnapshot) {
    querySnapshot.forEach(function (doc) {
      rank++;
      let div = document.createElement("div");
      var data = doc.data();
      div.innerHTML =
        "<span>" +
        rank +
        "</span>" +
        "<span> " +
        data.initials +
        "</span><span>" +
        data.totalTime +
        "<span>s</span></span>";
      div.className += "results__table--filled";
      if (newest === doc.id && first > 0) {
        div.className += " results__table--newest";
      }
      resultsTable.appendChild(div);
    });
  });

  var collectionSize = collection.get().then((snap) => {
    size = snap.size;
    addEmpty(size);
  });

  modal.style.display = "none";
}

showTable();

//firestore
// Listen to the form submission
form.addEventListener("submit", (e) => {
  // Prevent the default form redirect
  e.preventDefault();
  // Write a new message to the database collection "guestbook"
  db.collection("scores").add({
    createdAt: firebase.firestore.Timestamp.now(),
    initials: input.value,
    totalTime: parseFloat(finalScore),
    reactionTime: parseFloat(finalScore) / 30,
  });

  resultsTable.innerHTML = "";

  if (window.matchMedia("(max-width: 640px)")) {
    results.style.display = "flex";
  }

  first++;
  content.className -= "dimmed";
  showTable();
  reset();
  // clear message input field
  input.value = "";
  // Return false to avoid redirect
  return false;
});
