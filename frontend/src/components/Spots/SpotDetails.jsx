import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { csrfFetch } from '../../store/csrf';
import ReviewList from '../Reviews/ReviewList';
import ReviewFormModal from '../Reviews/ReviewFormModal';
import OpenModalButton from '../OpenModalButton';
import './SpotDetails.css';

function SpotDetails() {
  const { spotId } = useParams();
  const [spot, setSpot] = useState(null);
  const sessionUser = useSelector(state => state.session.user);
  const navigate = useNavigate();

const fetchSpotAndReviews = async () => {
    try {
      const [spotRes, reviewsRes] = await Promise.all([
        fetch(`/api/spots/${spotId}`),
        fetch(`/api/spots/${spotId}/reviews`)
      ]);

      if (spotRes.ok && reviewsRes.ok) {
        const spotData = await spotRes.json();
        const reviewsData = await reviewsRes.json();

        setSpot({ ...spotData, Reviews: reviewsData.Reviews });
      } else {
        console.error("Failed to fetch spot or reviews");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };


  useEffect(() => {
  fetchSpotAndReviews();
}, [spotId]);


  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this spot?');
    if (!confirmDelete) return;
  
    try {
      const res = await csrfFetch(`/api/spots/${spot.id}`, {
        method: 'DELETE'
      });
  
      if (res.ok) {
        navigate('/spots/current');
      }
    } catch (err) {
      console.error('Error deleting spot:', err);
    }
  };



  if (!spot) return <h2>Loading spot details...</h2>;

  const userOwnsSpot = sessionUser && sessionUser.id === spot.ownerId;
const userHasReviewed = sessionUser && spot.Reviews?.some(
  (review) => review.userId === sessionUser.id
);

const showReviewButton = sessionUser && !userOwnsSpot && !userHasReviewed;

  return (
    <div>
      <h1>{spot.name}</h1>
      <p>{spot.city}, {spot.state}, {spot.country}</p>
      <img src={spot.SpotImages?.[0]?.url} alt={spot.name} width="400" />
      <p>Hosted by {spot.Owner?.firstName}, {spot.Owner?.lastName}</p>
      <p>{spot.description}</p>
      <p><strong>${spot.price}</strong> / night</p>
      <p>
  ★ {spot.avgStarRating || "New"} · {spot.Reviews?.length || 0} review{spot.Reviews?.length === 1 ? '' : 's'}
</p>
  
      {sessionUser?.id === spot.ownerId && (
  <button onClick={handleDelete} className="delete-spot-button">
    Delete Spot
  </button>
)}
      <ReviewList spotId={spot.id} />
     {showReviewButton && (
  <OpenModalButton
  buttonText="Post Your Review"
  modalComponent={
    <ReviewFormModal
      spotId={spot.id}
      refresh={fetchSpotAndReviews}
    />
  }
/>
)}
    </div>
  );
}

export default SpotDetails;