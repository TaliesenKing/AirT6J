const LOAD_SPOTS = 'spots/LOAD_SPOTS';



const loadSpots = (spots) => ({
    type: LOAD_SPOTS,
    spots
  });
  

  export const fetchSpots = () => async (dispatch) => {
    const response = await fetch('/api/spots');
    
    if (response.ok) {
      const { Spots } = await response.json();
      dispatch(loadSpots(Spots)); 
    }
  };

  const initialState = {};

  export default function spotsReducer(state = initialState, action) {
    switch (action.type) {
      case LOAD_SPOTS: {
        const spotsState = {};
        action.spots.forEach(spot => {
          spotsState[spot.id] = spot;
        });
        return spotsState;
      }
      default:
        return state;
  }
}
