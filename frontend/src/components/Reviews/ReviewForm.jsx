import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createReview } from '../../store/reviews';


const ReviewForm = ({ spotId, onClose }) => {
    const dispatch = useDispatch();
    const [review, setReview] = useState('');
    const [stars, setStars] = useState(5);
    const [errors, setErrors] = useState([]);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setErrors([]);
  
      const payload = { review, stars };
  
      try {
        await dispatch(createReview(spotId, payload));
        onClose(); 
      } catch (res) {
        const data = await res.json();
        if (data && data.errors) setErrors(data.errors);
      }
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <ul>
          {errors.map((err, idx) => <li key={idx}>{err}</li>)}
        </ul>
        <textarea
          placeholder="Leave your review here..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
          required
        />
        <label>
          Stars:
          <input
            type="number"
            min="1"
            max="5"
            value={stars}
            onChange={(e) => setStars(Number(e.target.value))}
            required
          />
        </label>
        <button type="submit">Submit Review</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    );
  };
  
  export default ReviewForm;