import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createReview, fetchSpotReviews } from '../../store/reviews';
import './Reviews.css'; 




const ReviewForm = ({ spotId, onClose, refresh }) => {
  const dispatch = useDispatch();
  const [review, setReview] = useState('');
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  const resetForm = () => {
  setReview('');
  setStars(0);
  setErrors([]);
  setHovered(0);
};
  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setErrors([]);

  try {
    await dispatch(createReview(spotId, { review, stars }));
    await dispatch(fetchSpotReviews(spotId));
    await refresh();
    resetForm(); 
    onClose();      
  } catch (res) {
    const data = await res.json();
    if (data?.errors) setErrors(Object.values(data.errors));
  } finally {
    setIsSubmitting(false);
  }
};
  const isDisabled = review.length < 10 || stars < 1;

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h2>How was your stay?</h2>

      {errors.length > 0 && (
        <ul className="review-errors">
          {errors.map((err, idx) => <li key={idx}>{err}</li>)}
        </ul>
      )}

      <textarea
        placeholder="Leave your review here..."
        value={review}
        onChange={(e) => setReview(e.target.value)}
        rows={5}
        className="review-textarea"
      />

      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= (hovered || stars) ? 'filled' : ''}`}
            onClick={() => setStars(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            role="button"
            aria-label={`${star} star`}
          >
            ★
          </span>
        ))}
        <span> Stars</span>
      </div>

      <button type="submit" disabled={isDisabled || isSubmitting}>
        Submit Your Review
      </button>
      <button
       type="button" onClick={() => {
        resetForm(); 
        onClose();
  }}
  className="cancel-button"
>
  Cancel
</button>
    </form>
  );
};

export default ReviewForm;