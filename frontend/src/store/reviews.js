//polya:
//1: imports
//2: action types
//3: action creator
//4: thunk
//5: reducer
//6: export
import { csrfFetch } from './csrf';

const LOAD_SPOT_REVIEWS = 'reviews/loadSpotReviews';


const loadSpotReviews = (reviews) => ({
    type: LOAD_SPOT_REVIEWS,
    reviews
  });


export const createReview = (spotId, reviewData) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${spotId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
  
    if (response.ok) {
      const newReview = await response.json();
      dispatch(fetchSpotReviews(spotId)); // Refresh list after creation
      return newReview;
    } else {
      throw response;
    }
  };

export const fetchSpotReviews = (spotId) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${spotId}/reviews`);
    if (response.ok) {
      const data = await response.json();
      dispatch(loadSpotReviews(data.Reviews));
    }
  };



  export const updateReview = (reviewId, updatedReview, spotId) => async (dispatch) => {
    const response = await csrfFetch(`/api/reviews/${reviewId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedReview),
    });
  
    if (response.ok) {
      dispatch(fetchSpotReviews(spotId)); // Refresh the review list
      return response;
    } else {
      throw response;
    }
  };

  

export const deleteReview = (reviewId, spotId) => async (dispatch) => {
    const response = await csrfFetch(`/api/reviews/${reviewId}`, {
      method: 'DELETE'
    });
  
    if (response.ok) {
      dispatch(fetchSpotReviews(spotId)); 
    } else {
      throw response;
    }
  };


  const reviewsReducer = (state = {}, action) => {
    switch (action.type) {
  case LOAD_SPOT_REVIEWS: {
    const newState = {};
    action.reviews.forEach(review => {
      newState[review.id] = review;
    });
    return newState;
  }

  default:
    return state;
    }
  };




export default reviewsReducer;