import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import CreateSpotForm from './CreateSpotForm';
import './CreateSpotModal.css';

function CreateSpotModal() {
  const navigate = useNavigate();

 
  const handleClose = () => {
    navigate(-1); 
  };

 
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
//to do: fix linter error, low priority

  return (
    <div className="modal-background" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <CreateSpotForm onSuccess={() => navigate('/spots/current')} />
      </div>
    </div>
  );
} 


export default CreateSpotModal;
