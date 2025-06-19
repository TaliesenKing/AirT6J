import { useNavigate } from 'react-router-dom';
import { useEffect, useCallback } from 'react';
import CreateSpotForm from './CreateSpotForm';
import './CreateSpotModal.css';

function CreateSpotModal() {
  const navigate = useNavigate();

 
  const handleClose = useCallback(() => {
    navigate(-1); 
  }, [navigate]);

 
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);


  return (
    <div className="modal-background" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <CreateSpotForm onSuccess={() => navigate('/spots/current')} />
      </div>
    </div>
  );
} 


export default CreateSpotModal;
