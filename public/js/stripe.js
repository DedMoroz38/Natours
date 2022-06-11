import axios from "axios";
import {showAlert} from 'alerts';
const stripe = Stripe("pk_test_51L8USXGeQbmtkKIdCgrjwteiVT7DIVEVK552zq99m5h4CC47XBm8veOMATU240vQOUEDc3LT60UosocytwCP7vEA00aLZYcu9s");

export const bookTour = async tourId => {
  try {
    const session = await axios(`http://localhost:9000/api/v1/booking/checkout-session/${tourId}`);
    location.replace(`${session.data.session.url}`)
    console.log(session.data.session.url);
  }catch(err){
    console.log(err);
    showAlert("error", err);
  }
}