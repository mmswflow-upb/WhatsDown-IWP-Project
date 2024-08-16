let currUser = "";

//A method used to send http requests to the server side php scripts
function sendHttpRequest(method, url, data) {
  const promise = new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onload = () => {
      resolve(xhr.response);
    };
    xhr.send(JSON.stringify(data));
    xhr.onerror = () => {
      reject("Couldn't Access Users DataBase");
    };
  });

  return promise;
}

//Check if user has already been logged in. If not, they will be redirected to index.html (login page)
let path1 = "http://localhost/WhatsDown-IWP-Project/main_accounts.php";
function redirect() {
  sendHttpRequest("GET", path1).then((responseData) => {
    responseData = JSON.parse(responseData);

    if (responseData === "denied") {
      window.open("index.html", "_self");
    } else {
      currUser = responseData["username"];

      document.getElementById("pageTitle").innerHTML =
        "WhatsDown - " + responseData["username"];
      document.getElementById("currentUsername").innerHTML =
        "Hello '" + responseData["username"] + "'!";

      document.getElementById("pfpMenu").src = "images/pfpDefault.jpg";
      document.getElementById("pfpMenu").src = responseData["image"];

      pfpSelector.src = responseData["image"];

      let checkbox = document.getElementById("checkbox");

      if (responseData["theme"] === "dark") {
        checkbox.checked = true;
        document.body.classList.toggle("dark-mode", checkbox.checked);
      } else {
        checkbox.checked = false;
        document.body.classList.toggle("dark-mode", checkbox.checked);
      }

      bioContainer.value = "";
      bioContainer.placeholder = responseData["bio"];

      if (responseData["back_color"] !== "default") {
        chatContainer.style.backgroundColor = responseData["back_color"];
        messageForm.style.backgroundColor = responseData["back_color"];
      } else {
        chatContainer.style.backgroundColor = "white";
        messageForm.style.backgroundColor = "white";
      }

      chatContainer.style.backgroundImage =
        "url(" + responseData["back_image"].trim() + ")";
      wallpaperSelector.src = responseData["back_image"].trim();
    }
  });
}

redirect();

//Log out button, we delete the cookie from the server side.
let logout_btn = document.getElementById("logout");
logout_btn.addEventListener("click", () => {
  sendHttpRequest("POST", path1).then((responseData) => {
    redirect();
  });
});

//Search in history to open an old chat or search for a new user to create a new chat with them
let historyBar = document.getElementById("chatHistorySearch"),
  historyList = document.getElementById("chatsHistoryList"),
  searchBar = document.getElementById("searchUser");
(searchList = document.getElementById("searchList")),
  (searchWarningNoResult = document.getElementById("searchWarningNoResult")),
  (warningChatsHistory = document.getElementById("warningChatsHistory")),
  (originalSearchListElem = document.getElementById("originalSearchListElem")),
  (originalHistoryListElem = document.getElementById(
    "originalHistoryListElem"
  )),
  (historyListElems = document.getElementsByClassName("chatHistoryListElem")),
  (searchListElems = document.getElementsByClassName("searchListElem")),
  (path2 = "http://localhost/WhatsDown-IWP-Project/add_search_users.php"),
  (historyTable_FromServer = []);

//Remove all history results (divs)
function removeHistoryResults() {
  for (let i = 0; i < historyListElems.length; i++) {
    let temp = historyListElems[i];
    if (temp.style.display === "block") {
      i--;
      temp.remove();
    }
  }
}

//Update the list of recent conversations on the client side
function updateHistoryList_client() {
  let receiver_username = historyBar.value;

  if (currUser === "" || currUser.length === 0) {
    //If page still didn't fully load, return

    return;
  }

  //Send a request to the server to search for our given input in the chats table of the current user
  sendHttpRequest("POST", path2, [receiver_username, currUser, 2]).then(
    (response) => {
      response = JSON.parse(response);

      if (response === "empty") {
        //We don't have any recent activity available.

        removeHistoryResults();
        warningChatsHistory.style.display = "block";
        historyTable_FromServer = [];
        return;
      } else {
        //We have recent activity and we must display it

        if (response.toString() === historyTable_FromServer.toString()) {
          //If the current results match the new ones, don't remove and add again

          return;
        }

        //We first remove all history results, then we start creating divs for the new results coming from the server
        removeHistoryResults();
        historyTable_FromServer = response;
        warningChatsHistory.style.display = "none";

        //Duplicate the original history list element to display the chats from recent activity
        for (let i = 0; i < response.length; i++) {
          let temp = response[i];

          let clone = originalHistoryListElem.cloneNode(true);

          clone.id = temp["username"];
          historyList.appendChild(clone);
          clone.style.display = "block";

          clone.innerHTML +=
            "<div onclick = 'displayChat(this)' id = '" +
            temp["chat_name"] +
            "'><img src='" +
            temp["image"] +
            "'> <label>" +
            temp["username"] +
            "</label></div>";
        }
      }
    }
  );
}

//Change from history search to user search and vice versa
let history_mode = document.getElementById("history_mode"),
  search_mode = document.getElementById("search_mode");
chatsHistory = document.getElementById("chatsHistory");
(usersSearch = document.getElementById("usersSearch")),
  (updateHistoryInterval = setInterval(updateHistoryList_client, 900));

//Change to history mode, turning on the interval of the history updating fucntion
history_mode.addEventListener("click", () => {
  settingsContent.style.display = "none";
  usersSearch.style.display = "none";
  chatsHistory.style.display = "block";
  removeSearchResults();
  clearInterval(updateHistoryInterval);
  historyTable_FromServer = [];
  updateHistoryList_client();
  updateHistoryInterval = setInterval(updateHistoryList_client, 900);
});

//Change to search users mode, turning off the interval of the history updating function
search_mode.addEventListener("click", () => {
  settingsContent.style.display = "none";
  usersSearch.style.display = "block";
  chatsHistory.style.display = "none";
  removeHistoryResults();
  historyTable_FromServer = [];
  clearInterval(updateHistoryInterval);
});

//Live search bar for recent activity chats
historyBar.addEventListener("keyup", () => {
  clearInterval(updateHistoryInterval);
  updateHistoryList_client();
  if (historyBar.value === "" || historyBar.value.length === 0) {
    setTimeout(() => {
      updateHistoryInterval = setInterval(updateHistoryList_client, 900);
    });
    return;
  }
  setTimeout(() => {}, 100);
});

//A function that removes all search results divs.
function removeSearchResults() {
  for (let i = 0; i < searchListElems.length; i++) {
    let temp = searchListElems[i];
    if (temp.style.display === "block") {
      i--;
      temp.remove();
    }
  }
}

//Live search bar for users to open chats with them
searchBar.addEventListener("keyup", () => {
  removeSearchResults();

  if (searchBar.value.length === 0 || searchBar.value === "") {
    searchWarningNoResult.style.display = "block";
    return;
  }

  sendHttpRequest("POST", path2, [searchBar.value, currUser, 0]).then(
    (response) => {
      if (response.trim() === "no result") {
        searchWarningNoResult.style.display = "block";
      } else {
        let tableResult = JSON.parse(response);

        //Display all search results as divs
        for (let i = 0; i < tableResult.length; i++) {
          let temp = tableResult[i];

          searchWarningNoResult.style.display = "none";
          let clone = originalSearchListElem.cloneNode(false);

          clone.id = temp["username"];
          searchList.appendChild(clone);
          clone.style.display = "block";

          let label = document.createElement("label"),
            image = document.createElement("img");

          image.src = temp["image"];
          label.innerHTML = temp["username"];

          clone.appendChild(image);
          clone.appendChild(label);
        }
      }
    }
  );
  setTimeout(() => {}, 100);
});

//Clicking on results from user search will save the chat
function saveChat(userListElem) {
  let receiverName = userListElem.id;

  //Remove previous results of search
  removeSearchResults();
  searchBar.value = "";
  searchWarningNoResult.style.display = "block";

  //send http request to save it in chats table of current user
  //or to display it in recent activity since it might have been invisible
  sendHttpRequest("POST", path2, [receiverName, currUser, 1, 1]).then(
    (response) => {
      updateHistoryList_client();
      history_mode.click();
    }
  );
}

//The chat that was clicked from the history list will be opened on the right side (chat side)
let chatSuggestion = document.getElementById("chatSuggestion"),
  chatInfoBar = document.getElementById("chatInfoBar"),
  chatContainer = document.getElementById("chatContainer"),
  messageForm = document.getElementById("messageForm"),
  currentChatTableName = "",
  lastDate = "",
  updateChatMessagesInterval = setInterval(updateChat, 300);
(receiverImage_chatSide = document.getElementById("receiverImage_chatSide")),
  (receiverName_chatSide = document.getElementById("receiverName_chatSide")),
  (fileSelector_chatSide = document.getElementById("fileSelector_chatSide")),
  (messageBar = document.getElementById("messageBar_chatSide")),
  (receiverBio = document.getElementById("receiverBio")),
  (sendMessage_chatSide = document.getElementById("sendMessage_chatSide")),
  (messages_receiverUser = document.getElementsByClassName(
    "message_receiverUser"
  )),
  (messages_currUser = document.getElementsByClassName("message_currUser")),
  (spoilerTag = document.getElementById("spoilerTag")),
  (path3 = "http://localhost/WhatsDown-IWP-Project/messages_retriever.php"),
  (path4 = "http://localhost/WhatsDown-IWP-Project/sendMessages.php"),
  (path5 = "http://localhost/WhatsDown-IWP-Project/saveFiles.php"),
  (currentChatTableData = []);

clearInterval(updateChatMessagesInterval);

//Remove all messages from current chat
function removeChatMessages() {
  chatContainer.innerHTML = "";
  (messages_receiverUser = document.getElementsByClassName(
    "message_receiverUser"
  )),
    (messages_currUser = document.getElementsByClassName("message_currUser"));

  for (let i = 0; i < messages_receiverUser.length; i++) {
    messages_receiverUser[i].remove();
    i--;
  }
  for (let i = 0; i < messages_currUser.length; i++) {
    messages_currUser[i].remove();
    i--;
  }
}

//A method that displays divs corresponding to messages retrieved from the server
function updateChat() {
  if (currentChatTableName !== "") {
    //We don't accidently run this function to call the server to retrieve new messages

    //We send the request to the server
    sendHttpRequest("POST", path3, [
      currUser,
      currentChatTableName,
      lastDate,
    ]).then((response) => {
      response = JSON.parse(response);

      if (response !== "empty") {
        if (currentChatTableData !== response) {
          //We don't change anything if the data is still the same

          currentChatTableData = response;

          if (response["receiverName"] !== receiverName_chatSide.innerHTML) {
            //A new receiver, we must change the displayed name
            receiverName_chatSide.innerHTML = response["receiverName"];
          }

          if (response["receiverImage"] !== receiverImage_chatSide.src) {
            //a new receiver image, we must change it

            receiverImage_chatSide.src = response["receiverImage"];
          }

          if (response["bio"] !== receiverBio.innerHTML) {
            receiverBio.innerHTML = response["bio"];
          }

          if (response["lastDate"] !== lastDate) {
            //We might have new messages, we must display them

            if (
              response["lastDate"] === "" ||
              response["lastDate"].length === 0
            ) {
              //The server couldn't find any new messages.

              return;
            }

            //We actually have new messages to be displayed.
            lastDate = response["lastDate"];

            let messages = response["messagesTable"];

            //Create a div for every new message

            for (let i = 0; i < messages.length; i++) {
              let message = messages[i];
              let msgClass = ""; //Is it from current user or from receiver user

              if (message["username"].trim() === currUser) {
                //The current message was sent by the current user.

                msgClass = "message_currUser";
              } else {
                //The current message was sent by the other user

                msgClass = "message_receiverUser";
              }
              if (message["type"].trim() === "text") {
                //message is text

                if (message["spoiler"].trim() === "0") {
                  //Message is not a spoiler / NSFW

                  chatContainer.innerHTML =
                    chatContainer.innerHTML +
                    "<div  class = '" +
                    msgClass +
                    "' id ='" +
                    JSON.stringify(message) +
                    "'><label>" +
                    message["message"] +
                    "</label></div>";
                } else {
                  //Message is a spoiler/ NSFW
                  chatContainer.innerHTML =
                    chatContainer.innerHTML +
                    "<div class = '" +
                    msgClass +
                    " spoilerTextMessage hiddenTextMessage'  id='" +
                    JSON.stringify(message) +
                    "'>HIDDEN</div>";
                }
              } else {
                //Message is image/file

                if (message["spoiler"] === "0") {
                  //Image is not a spoiler /NSFW

                  chatContainer.innerHTML +=
                    "<div class = '" +
                    msgClass +
                    " imgMessage' id = '" +
                    JSON.stringify(message) +
                    "'><img src = '" +
                    message["message"] +
                    "'></div>";
                } else {
                  //Image is a spoiler /NSFW

                  chatContainer.innerHTML +=
                    "<div class = '" +
                    msgClass +
                    " imgMessage spoilerImage hiddenImage' id = '" +
                    JSON.stringify(message) +
                    "'><img src = 'images/hidden.png'></div>";
                }
              }
            }
            addELS();
          }
        }
      }
    });

    setTimeout(() => {}, 5);
  }
}

//A function that displays a conversation on the right side after selecting one from the recent activity list
function displayChat(chatToBeDisplayed) {
  clearInterval(updateChatMessagesInterval);
  currentChatTableName = chatToBeDisplayed.id;
  currentChatTableData = [];
  lastDate = "";
  chatContainer.style.display = "block";
  messageForm.style.display = "block";
  chatInfoBar.style.display = "block";
  chatSuggestion.style.display = "none";

  removeChatMessages();
  updateChat();
  setTimeout(() => {
    updateChatMessagesInterval = setInterval(updateChat, 900);
  }, 100);
}

//The chat which was clicked from the history list will be hidden
function hideChat(chatCloseElem) {
  let receiverName = chatCloseElem.parentNode.id;

  //Make chat invisible, the list will be updated automatically.
  sendHttpRequest("POST", path2, [receiverName, currUser, 1, 0]).then(
    (response) => {
      //ADD HERE CODE LATER FOR THE CHAT SIDE.
      if (receiverName_chatSide.innerHTML === receiverName) {
        //Current Receiver was in the chat that was hidden

        chatContainer.style.display = "none";
        chatInfoBar.style.display = "none";
        messageForm.style.display = "none";
        messageBar.value = "";
        currentChatTableName = "";
        currentChatTableData = [];
        chatSuggestion.style.display = "flex";
        historyTable_FromServer = [];
        clearInterval(updateChatMessagesInterval);
        removeChatMessages();
      }
      historyTable_FromServer = [];
      updateHistoryList_client();
    }
  );

  setTimeout(() => {}, 100);
}

function saveFiles(givenPath, formData) {
  const promise = new Promise((resolve, reject) => {
    const xml = new XMLHttpRequest();
    xml.open("POST", givenPath, true);
    //  xml.setRequestHeader("Multi-Content", );
    xml.onload = () => {
      resolve(xml.response);
    };

    xml.send(formData);

    xml.onerror = () => {
      reject("Couldn't Save File");
    };
  });

  return promise;
}

//Sending messages / images when clicking the send button
function sendMessage(messageType) {
  let spoiler = 0;
  let msgType = messageType;

  if (spoilerTag.checked === true) {
    //Message is tagged as spoiler

    spoiler = 1;
  }

  if (messageType === "text") {
    //Sending text messages

    if (messageBar.value === "" || messageBar.value.length === 0) {
      //Message bar is empty, we're not sending anything
      return;
    }

    //This is specifically for sending text messages
    sendHttpRequest("POST", path4, [
      currentChatTableName,
      currUser,
      messageBar.value,
      "text",
      spoiler,
      receiverName_chatSide.innerHTML,
    ]).then((response) => {
      updateChat();
    });
  } else {
    //Sending files

    let inpTempBtn = document.createElement("input");
    inpTempBtn.type = "file";
    inpTempBtn.accept = ".jpeg, .jpg, .png";

    document.body.appendChild(inpTempBtn);

    inpTempBtn.click();

    inpTempBtn.addEventListener("change", () => {
      const files = inpTempBtn.files;
      if (files.length > 0) {
        const formData = new FormData();
        formData.append("files", files[0]);

        saveFiles(path5, formData).then((newFileName) => {
          sendHttpRequest("POST", path4, [
            currentChatTableName,
            currUser,
            newFileName,
            "image",
            spoiler,
            receiverName_chatSide.innerHTML,
          ]).then((response2) => {
            updateChat();
          });
        });
      }
    });

    inpTempBtn.remove();
  }

  messageBar.value = "";
  setTimeout(() => {}, 100);
}

//Hide / show spoiler tagged messages
function hide_showMessage(messageDiv) {
  if (
    messageDiv.classList.contains("spoilerTextMessage") ||
    messageDiv.classList.contains("spoilerImage")
  ) {
    let messageData = JSON.parse(messageDiv.id);

    if (messageData["type"] === "text") {
      //We have a text message to deal with.

      if (messageDiv.classList.contains("hiddenTextMessage")) {
        //The message is hidden we need to display it

        messageDiv.innerHTML = messageData["message"];
        messageDiv.classList.remove("hiddenTextMessage");
      } else {
        //We must hide the message
        messageDiv.classList.add("hiddenTextMessage");
        messageDiv.innerHTML = "HIDDEN";
      }
    } else {
      //Obviously, we have an image to deal with

      if (messageDiv.classList.contains("hiddenImage")) {
        //We have to display the image (remove blur)

        messageDiv.innerHTML =
          "<img src = '" + JSON.parse(messageDiv.id)["message"] + "'>";
        messageDiv.classList.remove("hiddenImage");
      } else {
        //We have to hide the message
        messageDiv.classList.add("hiddenImage");
        messageDiv.innerHTML = "<img  src = 'images/hidden.png'>";
      }
    }
  }
}

function eventHandler(event) {
  let elem = this;

  event.preventDefault();

  if (event.button === 0) {
    hide_showMessage(elem);
  }
}

//Emojis selector
let emojiContainer = document.getElementById("emojiContainer"),
  emojiSelector = document.getElementById("emojiSelector"),
  emojis = document.getElementsByClassName("emoji");

function emojisHandler(event) {
  event.preventDefault();

  let elem = this;

  messageBar.value += this.innerHTML;

  setTimeout(() => {}, 100);
}

//Remove all old event listeners from all messages.
function removeELS() {
  for (const msg of messages_currUser) {
    msg.removeEventListener("click", eventHandler);
  }

  for (const msg of messages_receiverUser) {
    msg.removeEventListener("click", eventHandler);
  }

  for (const emj of emojis) {
    emj.removeEventListener("click", emojisHandler);
  }
}

//add Event listeners to all messages:
function addELS() {
  removeELS();

  for (const msg of messages_currUser) {
    msg.addEventListener("click", eventHandler);
  }

  for (const msg of messages_receiverUser) {
    msg.addEventListener("click", eventHandler);
  }

  for (const emj of emojis) {
    emj.addEventListener("click", emojisHandler);
  }
}

//When clicking the send message, call the sendMessage function
sendMessage_chatSide.addEventListener("click", () => {
  sendMessage("text");
});

//When pressing enter , we send a text message
messageBar.addEventListener("keyup", (k) => {
  if (k.key === "Enter" || k.keyCode === 13) {
    sendMessage("text");
  }
});

fileSelector_chatSide.addEventListener("click", () => {
  sendMessage("image");
  emojiContainer.style.display = "none";
  emojiSelector.classList.remove("open");
  emojiSelector.classList.add("closed");
});

//Settings tab
let settings_btn = document.getElementById("settings");

// Get the settings button and the settings content & paths for saving wallpaper, pfp and settings (php scripts)
let settingsBtn = document.getElementById("settings");
let settingsContent = document.getElementById("settingsContent"),
  path7 = "http://localhost/WhatsDown-IWP-Project/settings_manager.php",
  path8 = "http://localhost/WhatsDown-IWP-Project/savePfp.php",
  path9 = "http://localhost/WhatsDown-IWP-Project/saveWallpaper.php";

// Add event listener to the settings button
settingsBtn.addEventListener("click", function () {
  // Toggle the display of the settings content
  if (settingsContent.style.display === "none") {
    usersSearch.style.display = "none";
    chatsHistory.style.display = "none";
    settingsContent.style.display = "block";
  }
});

//Toggle dark/light mode
document.addEventListener("DOMContentLoaded", (event) => {
  const checkbox = document.getElementById("checkbox");
  checkbox.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode", this.checked);

    let themeChange = "light";

    if (this.checked) {
      themeChange = "dark";
    }

    sendHttpRequest("POST", path7, [
      "set",
      currUser,
      "theme",
      themeChange,
    ]).then((response) => {});
  });
});

//A function that saves the selected wallpaper color in the database
function setBackColor(color) {
  sendHttpRequest("POST", path7, ["set", currUser, "back_color", color]).then(
    (response) => {
      redirect();
    }
  );
}

//The wallpaper color selectors
let s1 = document.getElementById("s1");
let s2 = document.getElementById("s2");
let s3 = document.getElementById("s3");
let s4 = document.getElementById("s4");
let s5 = document.getElementById("s5");
let s6 = document.getElementById("s6");
let s7 = document.getElementById("s7");
let s8 = document.getElementById("s8");
let s9 = document.getElementById("s9");
let s10 = document.getElementById("s10");
let s11 = document.getElementById("s11");
let s12 = document.getElementById("s12");

s1.addEventListener("click", () => {
  chatContainer.style.backgroundColor = "#88B04B";
  messageForm.style.backgroundColor = "#88B04B";
  setBackColor("#88B04B");
});

s2.addEventListener("click", () => {
  chatContainer.style.backgroundColor = "#92A8D1";
  messageForm.style.backgroundColor = "#92A8D1";
  setBackColor("#92A8D1");
});

s3.addEventListener("click", () => {
  chatContainer.style.backgroundColor = "#6B5B95";
  messageForm.style.backgroundColor = "#6B5B95";
  setBackColor("#6B5B95");
});

s4.addEventListener("click", () => {
  chatContainer.style.backgroundColor = "#009B77";
  messageForm.style.backgroundColor = "#009B77";
  setBackColor("#009B77");
});

s5.addEventListener("click", () => {
  chatContainer.style.backgroundColor = "#55B4B0";
  messageForm.style.backgroundColor = "#55B4B0";
  setBackColor("#55B4B0");
});

s6.addEventListener("click", () => {
  chatContainer.style.backgroundColor = "#DFCFBE";
  messageForm.style.backgroundColor = "#DFCFBE";
  setBackColor("#DFCFBE");
});

s7.addEventListener("click", () => {
  chatContainer.style.backgroundColor = "#98B4D4";
  messageForm.style.backgroundColor = "#98B4D4";
  setBackColor("#98B4D4");
});

s8.addEventListener("click", () => {
  chatContainer.style.backgroundColor = "yellow";
  messageForm.style.backgroundColor = "yellow";
  setBackColor("yellow");
});

s9.addEventListener("click", () => {
  chatContainer.style.backgroundColor = "#00A170";
  messageForm.style.backgroundColor = "#00A170";
  setBackColor("#00A170");
});

s10.addEventListener("click", () => {
  chatContainer.style.backgroundColor = "#EFE1CE";
  messageForm.style.backgroundColor = "#EFE1CE";
  setBackColor("#EFE1CE");
});

s11.addEventListener("click", () => {
  chatContainer.style.backgroundColor = "#9A8B4F";
  messageForm.style.backgroundColor = "#9A8B4F";
  setBackColor("#9A8B4F");
});

s12.addEventListener("click", () => {
  chatContainer.style.backgroundColor = "#282D3C";
  messageForm.style.backgroundColor = "#282D3C";
  setBackColor("#282D3C");
});

//spoiler Tag toggle
const checkbox = document.getElementById("spoilerTag");
const icon = document.getElementById("icon");

//Clicking the toggle will change the picture
checkbox.addEventListener("change", function () {
  emojiContainer.style.dispaly = "none";
  emojiSelector.classList.remove("open");
  emojiSelector.classList.add("closed");

  if (checkbox.checked) {
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
});

//Set Wallpaper image
let pfpSelector = document.getElementById("pfpSelector");
(bioContainer = document.getElementById("bioContainer")),
  (wallpaperSelector = document.getElementById("wallpaperSelector")),
  (resetDefault = document.getElementById("resetDefault"));

//clicking on the current wallpaper image will let user choose a new one
pfpSelector.addEventListener("click", (event) => {
  let inpTempBtn = document.createElement("input");
  inpTempBtn.type = "file";
  inpTempBtn.accept = ".jpeg, .jpg, .png";

  inpTempBtn.click();

  inpTempBtn.addEventListener("change", () => {
    const files = inpTempBtn.files;
    if (files.length > 0) {
      const formData = new FormData();
      formData.append("files", files[0]);

      saveFiles(path8, formData).then((newFileName) => {
        sendHttpRequest("POST", path7, [
          "set",
          currUser,
          "image",
          newFileName,
        ]).then((response2) => {
          redirect();
        });
      });
    }
  });

  inpTempBtn.remove();
});

//Saving the description of user
bioContainer.addEventListener("keyup", (k) => {
  if (k.key === "Enter" || k.keyCode === 13) {
    k.target = "";

    sendHttpRequest("POST", path7, [
      "set",
      currUser,
      "bio",
      bioContainer.value,
    ]).then((response) => {
      redirect();
    });
  }
});

//Saving the wallpaper image
wallpaperSelector.addEventListener("click", (event) => {
  let inpTempBtn = document.createElement("input");
  inpTempBtn.type = "file";
  inpTempBtn.accept = ".jpeg, .jpg, .png";

  inpTempBtn.click();

  inpTempBtn.addEventListener("change", () => {
    const files = inpTempBtn.files;
    if (files.length > 0) {
      const formData = new FormData();
      formData.append("files", files[0]);

      saveFiles(path9, formData).then((newFileName) => {
        sendHttpRequest("POST", path7, [
          "set",
          currUser,
          "back_image",
          newFileName,
        ]).then((response2) => {
          redirect();
        });
      });
    }
  });

  inpTempBtn.remove();
});

//Resetting everything to default
resetDefault.addEventListener("click", (event) => {
  sendHttpRequest("POST", path7, [
    "set",
    currUser,
    "image",
    "images/pfpDefault.jpg",
  ]).then((response1) => {
    sendHttpRequest("POST", path7, [
      "set",
      currUser,
      "back_color",
      "default",
    ]).then((response2) => {
      sendHttpRequest("POST", path7, [
        "set",
        currUser,
        "back_image",
        "images/dam.jpg",
      ]).then((response3) => {
        sendHttpRequest("POST", path7, [
          "set",
          currUser,
          "theme",
          "light",
        ]).then((response4) => {
          sendHttpRequest("POST", path7, [
            "set",
            currUser,
            "bio",
            "Hello There! I am using Whatsdown!",
          ]).then((response4) => {
            redirect();
          });
        });
      });
    });
  });
});

//Clicking on the emoji icon will open up the menu
emojiSelector.addEventListener("click", (event) => {
  if (emojiSelector.classList.contains("open")) {
    emojiContainer.style.display = "none";
    emojiSelector.classList.remove("open");
    emojiSelector.classList.add("closed");
  } else {
    emojiSelector.classList.remove("closed");
    emojiSelector.classList.add("open");
    emojiContainer.style.display = "block";
  }
});
