import axios from "axios";
import {showAlert} from "./alerts";

export const login = async (login, password) => {
  try{
    const res = await axios({
      method: "POST",
      url: "http://localhost:9000/api/v1/users/login",
      data: {
        login,
        password
      }
    });
    if(res.data.status === "success") {
      showAlert("success", "Logged in successfully!");
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
    console.log("here", res);
  } catch (err) {
    showAlert("error", err.response.data);
  }
}
export const logout = async () => {
  try{
    const res = await axios({
      method: "GET",
      url: "http://localhost:9000/api/v1/users/logout"
    });
    if(res.data.status === "success") location.reload(true);
  } catch (err) {
    showAlert("error", "Error with logging out( Try again!");
  }
}
