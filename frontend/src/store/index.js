import { configureStore } from '@reduxjs/toolkit';
import spotsReducer from './spots';
import sessionReducer from './session';
import reviewsReducer from './reviews';



export const store = configureStore({
    reducer: {
      spots: spotsReducer,
      session: sessionReducer,
      reviews: reviewsReducer,
    }
  });



  export default store;
  export * from './csrf';
  export * from './session';