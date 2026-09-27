import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const dialog = document.querySelector(".signup-dialog");
const signupForm = document.querySelector(".signup-form");
const loginForm = document.querySelector(".login-form");
const signupName = document.querySelector("#signup-name");
const signupEmail = document.querySelector("#signup-email");
const signupPassword = document.querySelector("#signup-password");
const loginEmail = document.querySelector("#login-email");
const loginPassword = document.querySelector("#login-password");
const status = document.querySelector(".signup-status");
const successPanel = document.querySelector(".signup-success");
const signedInEmail = document.querySelector(".signed-in-email");
const signOutButton = document.querySelector(".sign-out-button");
const authModeButtons = document.querySelectorAll("[data-auth-mode]");

const configReady = Object.values(firebaseConfig).every(
  (value) => value && !value.startsWith("YOUR_"),
);

let auth;

if (configReady) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);

  onAuthStateChanged(auth, (user) => {
    signupForm.hidden = Boolean(user) || loginForm.dataset.mode === "login";
    loginForm.hidden = Boolean(user) || loginForm.dataset.mode !== "login";
    successPanel.hidden = !user;
    if (user) signedInEmail.textContent = user.email ?? "";
  });
}

function setStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle("is-error", isError);
}

function getAuthErrorMessage(error, action) {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "An account already exists for this email. Log in instead.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
      return "Choose a stronger password with at least 6 characters.";
    case "auth/wrong-password":
      return "Incorrect password. Check it and try again.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
      return "Incorrect email or password. Check your details and try again.";
    case "auth/operation-not-allowed":
      return "Email/Password sign-in is disabled. Enable it in Firebase Console under Authentication → Sign-in method.";
    case "auth/unauthorized-domain":
      return `This site domain (${window.location.hostname}) isn’t authorized in Firebase. Add it under Authentication → Settings → Authorized domains.`;
    case "auth/invalid-api-key":
      return "Firebase rejected this API key. Check the web app settings in firebase-config.js.";
    case "auth/network-request-failed":
      return "Couldn’t reach Firebase. Check your internet connection and try again.";
    case "auth/too-many-requests":
      return "Firebase is temporarily limiting sign-in attempts. Wait a little and try again.";
    default:
      console.error(`Firebase ${action} failed.`, error);
      return error.message || `Could not ${action}. Please try again.`;
  }
}

function setAuthMode(mode) {
  loginForm.dataset.mode = mode;
  const isLogin = mode === "login";
  signupForm.hidden = isLogin;
  loginForm.hidden = !isLogin;
  document.querySelector("#signup-title").innerHTML = isLogin
    ? 'Welcome<br><span class="muted">back.</span>'
    : 'Create your<br><span class="muted">account.</span>';
  document.querySelector(".signup-dialog-content > .signup-description").textContent =
    isLogin ? "Log in to your account." : "Create an account to get started.";
  setStatus("");
  (isLogin ? loginEmail : signupName).focus();
}

authModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setAuthMode(button.dataset.authMode);
  });
});

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!configReady) {
    setStatus("Add your Firebase web app settings to firebase-config.js to enable sign-up.", true);
    return;
  }

  const name = signupName.value.trim();
  const email = signupEmail.value.trim();
  const password = signupPassword.value;
  if (!name) {
    setStatus("Enter your name to create an account.", true);
    signupName.focus();
    return;
  }
  if (!signupEmail.validity.valid || !email) {
    setStatus("Enter a valid email address.", true);
    signupEmail.focus();
    return;
  }
  if (password.length < 6) {
    setStatus("Choose a password with at least 6 characters.", true);
    signupPassword.focus();
    return;
  }

  const submitButton = signupForm.querySelector(".auth-submit-button");
  submitButton.disabled = true;
  setStatus("Creating your account…");
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    try {
      await updateProfile(userCredential.user, { displayName: name });
    } catch (profileError) {
      console.error("Account created, but the profile name could not be saved.", profileError);
      setStatus("Your account was created and you’re signed in, but your name couldn’t be saved.", true);
      return;
    }
    signedInEmail.textContent = userCredential.user.email ?? email;
    setStatus("Account created successfully. You’re signed in.");
  } catch (error) {
    setStatus(getAuthErrorMessage(error, "create your account"), true);
  } finally {
    submitButton.disabled = false;
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!configReady) {
    setStatus("Add your Firebase web app settings to firebase-config.js to enable login.", true);
    return;
  }

  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  if (!loginEmail.validity.valid || !email) {
    setStatus("Enter a valid email address.", true);
    loginEmail.focus();
    return;
  }
  if (!password) {
    setStatus("Enter your password.", true);
    loginPassword.focus();
    return;
  }

  const submitButton = loginForm.querySelector(".auth-submit-button");
  submitButton.disabled = true;
  setStatus("Logging in…");
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    signedInEmail.textContent = userCredential.user.email ?? email;
    setStatus("Login successful. You’re signed in.");
  } catch (error) {
    setStatus(getAuthErrorMessage(error, "log in"), true);
  } finally {
    submitButton.disabled = false;
  }
});

signOutButton.addEventListener("click", async () => {
  try {
    await signOut(auth);
    setStatus("You’ve signed out.");
  } catch (error) {
    setStatus(getAuthErrorMessage(error, "sign out"), true);
  }
});

dialog.addEventListener("close", () => {
  setStatus("");
});
