import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { csrfFetch } from '../../store/csrf';
import ReviewList from '../Reviews/ReviewList';
import ReviewForm from '../Reviews/ReviewForm';
import './SpotDetails.css';

function SpotDetails() {
  const { spotId } = useParams();
  const [spot, setSpot] = useState(null);
  const sessionUser = useSelector(state => state.session.user);
  const navigate = useNavigate();
  const [showReviewForm, setShowReviewForm] = useState(false);




  useEffect(() => {
    const fetchSpot = async () => {
        try {
            const res = await fetch(`/api/spots/${spotId}`);
            console.log('Response:', res); 
      
            if (res.ok) {
              const data = await res.json();
              console.log('Spot data:', data); 
              setSpot(data);
            } else {
              console.error('Failed to fetch spot:', res.status);
            }
          } catch (err) {
            console.error('Error fetching spot:', err);
          }
    };

    fetchSpot();
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

  return (
    <div>
      <h1>{spot.name}</h1>
      <p>{spot.city}, {spot.state}, {spot.country}</p>
      <img src={spot.SpotImages?.[0]?.url} alt={spot.name} width="400" />
      <p>Hosted by {spot.Owner?.firstName}, {spot.Owner?.lastName}</p>
      <p>{spot.description}</p>
      <p><strong>${spot.price}</strong> / night</p>
      <p>★ {spot.avgStarRating || "New"}</p>
  
      {sessionUser?.id === spot.ownerId && (
  <button onClick={handleDelete} className="delete-spot-button">
    Delete Spot
  </button>
)}
      <ReviewList spotId={spot.id} />
      {sessionUser && sessionUser.id !== spot.ownerId && (
  <button onClick={() => setShowReviewForm(true)}>Write a Review</button>
)}
{showReviewForm && (
  <ReviewForm spotId={spot.id} onClose={() => setShowReviewForm(false)} />
)}
    </div>
  );
}

export default SpotDetails;