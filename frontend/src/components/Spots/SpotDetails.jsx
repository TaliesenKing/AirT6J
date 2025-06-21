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

  const handleReserve = () => {
    alert('Feature coming soon');
  };

  if (!spot) return <h2>Loading spot details...</h2>;

  const userOwnsSpot = sessionUser && sessionUser.id === spot.ownerId;
  const userHasReviewed = sessionUser && spot.Reviews?.some(
    (review) => review.userId === sessionUser.id
  );
  const showReviewButton = sessionUser && !userOwnsSpot && !userHasReviewed;

  const previewImage = spot.SpotImages?.find(img => img.preview) || spot.SpotImages?.[0];
  const otherImages = spot.SpotImages?.filter(img => !img.preview).slice(0, 4) || [];

  return (
    <div className="spot-details-container">
      <div className="spot-header">
        <h1>{spot.name}</h1>
        <p className="location">Location: {spot.city}, {spot.state}, {spot.country}</p>
      </div>
      <div className="image-grid">
        <div className="main-image-container">
          <img 
            src={previewImage?.url || 'https://via.placeholder.com/800x400'} 
            alt={spot.name} 
            className="main-image"
          />
        </div>
        <div className="thumbnail-container">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="thumbnail-wrapper">
              {otherImages[index] ? (
                <img 
                  src={otherImages[index].url} 
                  alt={`${spot.name} view ${index + 1}`}
                  className="thumbnail"
                />
              ) : (
                <div className="empty-thumbnail"></div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="content-wrapper">
        <div className="spot-info">
          <h2>Hosted by {spot.Owner?.firstName} {spot.Owner?.lastName}</h2>
          <p className="description">{spot.description}</p>
        </div>
        <div className="reservation-box">
          <div className="price-info">
            <span className="price">${spot.price}</span>
            <span className="per-night"> night</span>
          </div>
          <div className="rating-info">
            ★ {spot.avgStarRating ? Number(spot.avgStarRating).toFixed(1) : 'New'}
            {spot.Reviews?.length > 0 && (
              <span> · {spot.Reviews.length} review{spot.Reviews.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          <button 
            onClick={handleReserve}
            className="reserve-button"
          >
            Reserve
          </button>
        </div>
      </div>
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