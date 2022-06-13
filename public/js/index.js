import "@babel/polyfill";
import {login, logout} from './login'; 
import {updateSettings} from './updateSettings'; 
import {bookTour} from './stripe'; 
import { showClassName } from "alerts";
import { showAlert } from "./alerts";

const loginForm = document.querySelector(".form--login");
const logOutBtn = document.querySelector(".nav__el--logout");
const settingForm = document.querySelector(".form-user-data");
const passwordForm = document.querySelector(".form-user-password");
const bookBtn = document.getElementById("book-tour");

if (loginForm){
  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
if (settingForm){
  settingForm.addEventListener("submit", async e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById("name").value);
    form.append('email', document.getElementById("login").value);
    form.append('photo', document.getElementById("photo").files[0]);
    await updateSettings(form, 'data');
  });
}
if (passwordForm){
  passwordForm.addEventListener("submit", async e => {
    e.preventDefault();
    const updateButton = document.querySelector(".btn--password-update");
    updateButton.textContent = "Updating...";

    const passwordCurrent = document.getElementById("password-current").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;
    await updateSettings({passwordCurrent, password, passwordConfirm}, 'password');

    updateButton.textContent = "Save password";
    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
  });
}//test1234
if (logOutBtn) logOutBtn.addEventListener("click", logout);

if (bookBtn) {
  bookBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing...';
    const {tourId} = e.target.dataset;
    bookTour(tourId);
  });
}
const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert("success", alertMessage);



