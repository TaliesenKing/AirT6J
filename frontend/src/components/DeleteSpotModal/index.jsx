import './DeleteSpotModal.css';

function DeleteSpotModal({ onConfirm, onCancel }) {
  return (
    <div className="delete-spot-modal">
      <h2>Confirm Delete</h2>
      <p>Are you sure you want to remove this spot?</p>
      <button className="red" onClick={onConfirm}>
        Yes (Delete Spot)
      </button>
      <button className="dark" onClick={onCancel}>
        No (Keep Spot)
      </button>
    </div>
  );
}

export default DeleteSpotModal;
