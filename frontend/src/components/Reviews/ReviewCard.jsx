import { useDispatch, useSelector } from 'react-redux';
import { deleteReview, updateReview } from '../../store/reviews';
import { useState } from 'react';

const ReviewCard = ({ review, spotId }) => {
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const [isEditing, setIsEditing] = useState(false);
  const [editedReview, setEditedReview] = useState(review.review);
  const [stars, setStars] = useState(review.stars);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await dispatch(deleteReview(review.id, spotId));
      } catch (err) {
        console.error("Failed to delete review", err);
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateReview(review.id, { review: editedReview, stars }, spotId));
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update review", err);
    }
  };

  return (
    <div className="review-card">
      <p><strong>{review.User?.firstName}</strong></p>
      <p>{review.createdAt?.slice(0, 10)}</p>

      {isEditing ? (
        <form onSubmit={handleUpdate}>
          <textarea
            value={editedReview}
            onChange={(e) => setEditedReview(e.target.value)}
            required
          />
          <input
            type="number"
            min="1"
            max="5"
            value={stars}
            onChange={(e) => setStars(e.target.value)}
            required
          />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
      ) : (
        <>
          <p>{review.review}</p>
          <p>⭐ {review.stars}</p>
        </>
      )}

      {sessionUser?.id === review.userId && !isEditing && (
        <>
          <button onClick={() => setIsEditing(true)}>Edit</button>
          <button onClick={handleDelete}>Delete</button>
        </>
      )}
    </div>
  );
};

export default ReviewCard;