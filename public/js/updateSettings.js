import axios from "axios";
import {showAlert} from "./alerts";

export const updateSettings = async (data, type) => {
  const url = type === "password" ? "updatePassword" : "updateMe";

  axios.patch(`http://localhost:9000/api/v1/users/${url}`, 
    data
  )
  .then(function (res) {
    if(res.data.status === "success") {
          showAlert("success", `${type.toUpperCase()} updated successfully!`);
        }
  })
  .catch(function (err) {
    showAlert("error", err.response.data.message);
  });
}