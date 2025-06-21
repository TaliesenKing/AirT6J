import { useModal } from '../../context/Modal';
import ReviewForm from './ReviewForm';

function ReviewFormModal({ spotId, refresh }) {
  const { closeModal } = useModal();

  return (
    <ReviewForm
      spotId={spotId}
      onClose={closeModal}
      refresh={refresh}
    />
  );
}

export default ReviewFormModal;