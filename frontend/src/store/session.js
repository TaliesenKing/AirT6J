//this is for the login form page
//Polya:
//1. we need to add the redux store actions and reducers to this page
//2. we have to add a 'session' reducer to update the current session user's info
//3. we add a thunk action
//4. we export everything

//lets get our imports out of the way
import { csrfFetch } from './csrf';


//first things first lets define our action types
//these will define what our actions do
const SET_USER = 'session/SET_USER';
const REMOVE_USER = 'session/REMOVE_USER';

//now we create our action creator functions
const setUser = (user) => ({
    type: SET_USER,
    payload: user,
  });
  
  const removeUser = () => ({
    type: REMOVE_USER,
  });


//we should make a default state which should have no one logged in:
const initialState = { user: null };


//next lets write the reducer function
//this should update state based on actions
export default function sessionReducer(state = initialState, action) {
    switch (action.type) {
      case SET_USER:
        return { user: action.payload };
      case REMOVE_USER:
        return { user: null };
      default:
        return state;
    }
  }

//now lets add the thunk action

const login = (user) => async (dispatch) => {
    const { credential, password } = user;

    const response = await csrfFetch('/api/session', {
        method: 'POST',
        body: JSON.stringify({ credential, password })
    });

    const data = await response.json();
    dispatch(setUser(data.user));
    return response;
};

//restore session action
export const restoreUser = () => async (dispatch) => {
  const response = await csrfFetch("/api/session");
  const data = await response.json();
  dispatch(setUser(data.user));
  return response;
};

//signup action
export const signup = (user) => async (dispatch) => {
  const { username, firstName, lastName, email, password } = user;
  const response = await csrfFetch("/api/users", {
    method: "POST",
    body: JSON.stringify({
      username,
      firstName,
      lastName,
      email,
      password
    })
  });
  const data = await response.json();
  dispatch(setUser(data.user));
  return response;
};


  //lastly we should export our actions
  export { setUser, removeUser, login };
  //this way other files can call those functions
