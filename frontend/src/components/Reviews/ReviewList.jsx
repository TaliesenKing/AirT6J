import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSpotReviews } from '../../store/reviews';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';

const ReviewList = ({ spotId }) => {
  const dispatch = useDispatch();
  const reviews = useSelector((state) => Object.values(state.reviews));
  const sessionUser = useSelector((state) => state.session.user);

  useEffect(() => {
    dispatch(fetchSpotReviews(spotId));
  }, [dispatch, spotId]);

  return (
    <div>
      <h2>Reviews</h2>
      {sessionUser && <ReviewForm spotId={spotId} onClose={() => {}} />}
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} spotId={spotId} />
      ))}
    </div>
  );
};

export default ReviewList;