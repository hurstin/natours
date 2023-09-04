import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51NlCZZFLPvxpiwpDaWulgKSfyykLZFE2WUJCAzWYhiIkmLvocBUkeqZiqIn7gBQsUV3nlGD3lsv2mMeW9QKK8Mvg00uvMYwhNl',
);

export const bookTour = async (tourId) => {
  try {
    // 1. get checkout session from Api
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
    );
    //  2. create checkout form +charge card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
