window.onload = function () {
  let loginForm = document.getElementById("loginForm"),
    signupForm = document.getElementById("signupForm");
  (btn_login = document.getElementById("btn_login")),
    (btn_signup = document.getElementById("btn_signup")),
    (pageTitle = document.getElementById("pageTitle")),
    (switchMode = document.getElementById("switchMode")),
    (mode = 0);
  (visible = 0),
    (serverResponse_signup = document.getElementById("serverResponse_signup")),
    (serverResponse_login = document.getElementById("serverResponse_login")),
    (instruction_signup = document.getElementById("instruction_signup")),
    (instruction_login = document.getElementById("instruction_login")),
    (username_signup = document.getElementById("username_signup")),
    (password_signup = document.getElementById("password_signup")),
    (confirm_password = document.getElementById("confirm_password")),
    (username_login = document.getElementById("username_login")),
    (password_login = document.getElementById("password_login")),
    (bodys = document.querySelector("body"));
  path = "http://localhost/WhatsDown-IWP-Project/login_signup.php";
  function scrollEventHandler() {
    let scrollPosition = window.scrollY || document.documentElement.scrollTop;
    let triggerPosition = 50; // Adjust this value as needed

    if (scrollPosition > triggerPosition) {
      loginForm.style.display = "block";
      loginForm.classList.add("showLoginForm");
      bodys.style.backgroundSize = "100% auto";
    } else {
      loginForm.style.display = "none";
      loginForm.classList.remove("showLoginForm");
      bodys.style.backgroundSize = "70% auto";
    }
  }

  // Replace the existing scroll event listener
  window.addEventListener("scroll", scrollEventHandler);

  setTimeout(() => {
    loginForm.style.display = "block";
    loginForm.classList.add("showLoginForm");
    const scrollTarget = document.getElementById("loginForm");
    scrollTarget.scrollIntoView({ behavior: "smooth" });
  }, 5000);

  function sendHttpRequest(method, url, data) {
    const promise = new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);

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

  //Check if user has already been logged in.
  function redirect() {
    sendHttpRequest("GET", path).then((responseData) => {
      responseData = responseData.trim();
      if (responseData === "denied") {
        window.open("main.html", "_self");
      }
    });
  }

  redirect();

  btn_signup.addEventListener("click", () => {
    if (mode == 1) {
      let data = [
        username_signup.value,
        password_signup.value,
        confirm_password.value,
      ];

      sendHttpRequest("POST", path, data).then((response) => {
        response = response.trim();

        if (response !== "ACCOUNT CREATED SUCCESSFULLY") {
          serverResponse_signup.style.color = "red";
        } else {
          serverResponse_signup.style.color = "#0665fc";
        }

        username_signup.value = "";
        password_signup.value = "";
        confirm_password.value = "";

        instruction_signup.style.display = "none";
        serverResponse_signup.innerHTML = response;

        serverResponse_signup.style.display = "block";

        setTimeout(() => {
          instruction_signup.style.display = "block";
          serverResponse_signup.style.display = "none";
        }, 4 * 1000);
      });
    }
    loginForm.style.display = "none";
    signupForm.style.display = "block";
    pageTitle.innerHTML = "WhatsDown-Sign up";
    mode = 1;
    signupForm.appendChild(switchMode);
    window.removeEventListener("scroll", scrollEventHandler);
  });

  btn_login.addEventListener("click", () => {
    if (mode == 0) {
      let data = [username_login.value, password_login.value];

      sendHttpRequest("POST", path, data).then((response) => {
        response = response.trim();

        if (response === "SUCCESS") {
          serverResponse_login.style.color = "#0665fc";
          redirect();
        } else {
          serverResponse_login.style.color = "red";
        }

        username_login.value = "";
        password_login.value = "";

        instruction_login.style.display = "none";
        serverResponse_login.innerHTML = response;

        serverResponse_login.style.display = "block";

        setTimeout(() => {
          instruction_login.style.display = "block";
          serverResponse_login.style.display = "none";
        }, 4 * 1000);
      });
      return;
    }

    signupForm.style.display = "none";
    loginForm.style.display = "block";
    pageTitle.innerHTML = "WhatsDown-Log in";
    loginForm.appendChild(switchMode);
    mode = 0;
  });
};
