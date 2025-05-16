import { csrfFetch } from "./csrf";


const LOAD_SPOTS = 'spots/LOAD_SPOTS';


const UPDATE_SPOT = 'spots/UPDATE_SPOT';

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

  export const fetchSpots = () => async (dispatch) => {
    const response = await fetch('/api/spots');
    
    if (response.ok) {
      const { Spots } = await response.json();
      dispatch(loadSpots(Spots)); 
    }
  };

 
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
  
      case UPDATE_SPOT: {
        return {
          ...state,
          allSpots: {
            ...state.allSpots,
            [action.spot.id]: action.spot
          }
        };
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
