import { csrfFetch } from "./csrf";

//action types:
const LOAD_SPOTS = 'spots/LOAD_SPOTS';
const ADD_SPOT = 'spots/ADD_SPOT';
const UPDATE_SPOT = 'spots/UPDATE_SPOT';
const DELETE_SPOT = 'spots/DELETE_SPOT';

//these are the action creators: 
const initialState = {
    allSpots: {}
  };

const loadSpots = (spots) => ({
    type: LOAD_SPOTS,
    spots
  });
  

  const updateSpot = (spot) => ({
    type: UPDATE_SPOT,
    spot
  });

  const addSpot = (spot) => ({
    type: ADD_SPOT,
    spot
  });

  const removeSpot = (spotId) => ({
    type: DELETE_SPOT,
    spotId
});



  //these are the Thunks

  export const fetchSpots = () => async (dispatch) => {
    const response = await fetch('/api/spots');
    
    if (response.ok) {
      const { Spots } = await response.json();
      dispatch(loadSpots(Spots)); 
    }
  };


  export const createSpot = (spotData) => async (dispatch) => {
    const res = await csrfFetch('/api/spots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(spotData)
    });
  
    if (!res.ok) {
      const errorData = await res.json();
      return { errors: errorData.errors || ['Something went wrong'] };
    }
  
    const newSpot = await res.json();
    dispatch(addSpot(newSpot));
    return newSpot;
  };


  export const addSpotImage = (spotId, imageData) => async () => {
  const res = await csrfFetch(`/api/spots/${spotId}/images`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(imageData)
  });

  if (!res.ok) {
    const errorData = await res.json();
    return { errors: errorData.errors || ['Failed to upload image'] };
  }

  const image = await res.json();
  return image;
};

export const deleteSpot = (spotId) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${spotId}`, {
        method: 'DELETE'
    });

    if (response.ok) {
        dispatch(removeSpot(spotId));
        return true;
    } else {
        const errorData = await response.json();
        return { errors: errorData.errors || ['Failed to delete spot'] };
    }
};


//this is the reducer
export default function spotsReducer(state = initialState, action) {
    switch (action.type) {
      case LOAD_SPOTS: {
        const spotsState = {};
        action.spots.forEach(spot => {
          spotsState[spot.id] = spot;
        });
        return {
          ...state,
          allSpots: spotsState
        };
      }
      case ADD_SPOT: {
        return { ...state, [action.spot.id]: action.spot };
      }
  
      case UPDATE_SPOT: {
        return {
          ...state,
          allSpots: {
            ...state.allSpots,
            [action.spot.id]: action.spot
          }
        };
      }

      case DELETE_SPOT: {
            const newState = { ...state };
            delete newState.allSpots[action.spotId];
            return newState;
        }
  
      default:
        return state;
    }
  }

  export const updateSpotThunk = (spotId, spotData) => async (dispatch) => {
    try {
      const response = await csrfFetch(`/api/spots/${spotId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(spotData)
      });
  
      const updatedSpot = await response.json();
      dispatch(updateSpot(updatedSpot));
      return updatedSpot;
    } catch (err) {
      const errorData = await err.json();
      console.error("❌ Backend returned error: ", JSON.stringify(errorData, null, 2));      throw errorData;
    }
  };
