import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.4/firebase-app.js";
import * as rtdb from "https://www.gstatic.com/firebasejs/9.9.4/firebase-database.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyC4Y2ohIgciuRSJoKzGL0ZL4tIhJh3sd1M",
    authDomain: "cpeg470-9-12.firebaseapp.com",
    databaseURL: "https://cpeg470-9-12-default-rtdb.firebaseio.com",
    projectId: "cpeg470-9-12",
    storageBucket: "cpeg470-9-12.appspot.com",
    messagingSenderId: "115637995879",
    appId: "1:115637995879:web:da55bf4cfd47d377b3c7c2"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
//const app = initializeApp(firebaseConfig);
//let db = rtdb.getDatabase(app);

let tweetJSON = {
  "bodytext": "Example text to test if code works.",
  "likes": 10,
  "retweets": 25,
  "timestamp": 1665048158868,
  "userposting": {
    "user": "Noel",
    "pfp": "https://img1.ak.crunchyroll.com/i/spire2/0153b6dfac8fa252df994af8c85c92e21640186978_large.jpg"
   }
};

let renderSignOut = ()=>{
  $("#signout").html(`
    <button style="background-color:black" id="SignOutButton" href="#" class="btn btn-primary SignOut button" class="align-right">Sign Out</button>
  `)
  $("#SignOutButton").on("click", (evt)=>{
    firebase.auth().signOut();
  });
}

let createtweet = ()=>{
  $("#createtweet").html(`
    <button style="background-color:black" id="CreateTweet" href="#" class="btn btn-primary CreateTweet button" class="align-right">New Tweet</button>
  `)
  $("#CreateTweet").on("click", (evt)=>{
    let tweetRef = firebase.database().ref("/tweets");
    var googleinfo = firebase.auth().currentUser;
    var bodyinfo = $("#inputtext").val();
    var tweets = {
      bodytext: bodyinfo,
      likes: 0,
      retweets: 0,
      timestamp: new Date().getTime(),
      userposting: {
          pfp: googleinfo.photoURL,
          user: googleinfo.displayName,
      }
    }
    let firebasepost = tweetRef.push();
    firebasepost.set(tweets);
  });
}

let renderTweet = (tObj, uuid)=>{
  $("#alltweets").prepend(`
  <div class="card text-white bg-dark mb-3" style="max-width: 540px;">
    <div class="card-body">
      <h5 class="card-title">${tObj.userposting.user}</h5>
      <p class="card-text">${tObj.bodytext}</p>
      <p class="card-text"><small class="text-muted">Tweeted at ${new Date(tObj.timestamp).toLocaleString()}</small></p>
    </div>
    <img src="${tObj.userposting.pfp}" class="card-img-bottom" alt="...">
    <p class="card-text like-button" data-tweetid="${uuid}">Likes ${tObj.likes}</p>
    <p class="card-text retweet-button" data-tweetid="${uuid}">Retweets ${tObj.retweets}</p>
  </div>
  `);
  firebase.database().ref("/tweets").child(uuid).child("likes").on("value", ss=>{
    $(`.like-button[data-tweetid=${uuid}]`).html(`${ss.val() || 0} Likes`);
  });
  firebase.database().ref("/tweets").child(uuid).child("retweets").on("value", ss=>{
    $(`.retweet-button[data-tweetid=${uuid}]`).html(`${ss.val() || 0} Retweets`);
  });
}

//renderTweet(tweetJSON);

let renderLogin = ()=>{
  $("#loginbutton").html(`<button style="background-color:black" id="login" href="#" class="btn btn-primary login button" class="align-right">LOGIN</button>`);
  $("#login").on("click", ()=>{
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
  });
  $("#alltweets").hide();
  $("#loginbutton").show();
  $("#signout").hide();
  $("#createtweet").hide();
  $("#inputtext").hide();
}

let renderPage = (loggedIn)=>{
  //$("body").html(`<div id="alltweets"></div>`)
  $("#loginbutton").hide();
  $("#alltweets").show();
  $("#signout").show();
  $("#createtweet").show();
  $("#inputtext").show();
  let tweetRef = firebase.database().ref("/tweets");
  renderSignOut();
  createtweet();
  let myuid = loggedIn.uid;
  tweetRef.on("child_added", (ss)=>{
    const user = firebase.auth().currentUser;
    let tObj = ss.val();
    renderTweet(tObj, ss.key);
    $(".like-button").off("click");
    $(".like-button").on("click", (evt)=>{
      //alert(ss.key);
      let clickedTweet = $(evt.currentTarget).attr("data-tweetid");
      let likesRef = firebase.database().ref("/tweets").child(clickedTweet);
      toggleLike(likesRef, myuid);
    });
    $(".retweet-button").off("click");
    $(".retweet-button").on("click", (evt)=>{
      //alert(ss.key);
      let clickedTweet = $(evt.currentTarget).attr("data-tweetid");
      let retweetsRef = firebase.database().ref("/tweets").child(clickedTweet);
      toggleRetweet(retweetsRef, myuid);
    });
  });
}

let toggleLike = (tweetRef, uid)=>{
  tweetRef.transaction((tObj) => {
    if (!tObj) {
      tObj = {likes: 0};
    }
    if (tObj.likes && tObj.likes_by_user[uid]) {
      tObj.likes--;
      tObj.likes_by_user[uid] = null;
    } else {
      tObj.likes++;
      if (!tObj.likes_by_user) {
        tObj.likes_by_user = {};
      }
      tObj.likes_by_user[uid] = true;
    }
    return tObj;
  });
}

let toggleRetweet = (tweetRef, uid)=>{
  tweetRef.transaction((tObj) => {
    if (!tObj) {
      tObj = {retweets: 0};
    }
    if (tObj.retweets && tObj.retweets_by_user[uid]) {
      tObj.retweets--;
      tObj.retweets_by_user[uid] = null;
    } else {
      tObj.retweets++;
      if (!tObj.retweets_by_user) {
        tObj.retweets_by_user = {};
      }
      tObj.retweets_by_user[uid] = true;
    }
    return tObj;
  });
}

firebase.auth().onAuthStateChanged(user=>{
  if (!user){
    renderLogin();
  } else {
    renderPage(user);
  }
});

/*let tweetRef = rtdb.ref(db, "/tweets");
rtdb.onChildAdded(tweetRef, ss=>{
  let tObj = ss.val();
  renderTweet(tObj);
});*/

/*$(".tweet").on("click", (evt)=>{
  $(evt.currentTarget).addClass("clicked");
  //$(evt.currentTarget).addClass("hidden");
})*/