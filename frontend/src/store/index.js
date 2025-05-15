import { configureStore } from '@reduxjs/toolkit';
import spotsReducer from './spots';
import sessionReducer from './session';



export const store = configureStore({
    reducer: {
      spots: spotsReducer,
      session: sessionReducer
    }
  });



  export default store;
  export * from './csrf';
  export * from './session';