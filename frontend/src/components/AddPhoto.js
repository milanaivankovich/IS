import React, { useState } from 'react';
import Cropper from "react-easy-crop";
import getCroppedImg from "../components/ImageCrop";
import './AddPhoto.css';
import axios from 'axios';

const AddPhoto = ({userId}) => {
  

  // Function to toggle the dialog
  const [imagePreview, setImagePreview] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropping, setCropping] = useState(false);

  const [imageSrc, setImageSrc] = useState(null); 
  const [finalImage, setFinalImage] = useState(null); 
  const [selectedImage, setSelectedImage] = useState(null); 
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 50, height: 50 });
  const [zoom, setZoom] = useState(1);
  

  const removeImage = () => {
    setImageSrc(null);
    setSelectedImage(null);
    setFinalImage(null);
    setCropping(false);
  };

   

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCrop(croppedAreaPixels);
  };

  const [formData, setFormData]= useState(null);

  const handlePhotoUpdate = async () => {
    await axios.patch('http://localhost:8000/api/client/'+userId.pk+'/edit/', 
        {profile_picture: formData } , {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((response) => {
        console.log("Data updated successfully:", response.data);
      })
      .catch((error) => {
        console.error("There was an error updating the data:", error);
        alert("Doslo je do greške prilikom ažuriranja...");
      });
  };

  const handleCrop = async () => {
    try {
      const croppedBlob = await getCroppedImg(imageSrc, crop); // imageSrc i crop dolaze iz stanja
      const croppedUrl = URL.createObjectURL(croppedBlob); // Kreira URL za isečenu sliku
      setFinalImage(croppedUrl); 
      setFormData((prevFormData) => ({
        ...prevFormData,
        image: croppedBlob, // Skladišti Blob kao fajl
      }));
      setCropping(false); 
    } catch (error) {
      console.error("Greška pri izrezivanju slike:", error);
    }
  };

  return (
    <div className='dimmer'>
        <div className="add-photo-card">
          <div>
          {!cropping ? (
            <>
            <label htmlFor="profileImage" className="add-photo-title">Dodaj sliku:</label>
            <input
            type="file"
            className="add-photo-browse"
            id="profileImage"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setSelectedImage(file);
                setImageSrc(URL.createObjectURL(file)); // Postavlja URL slike
                setCropping(true); // Aktivira crop funkcionalnost
              }
              }}
              autoFocus
              />
            {finalImage && (
            <div className="add-photo-image-preview-container">
              <img src={finalImage} alt="Preview" className="add-photo-preview-image" />
              <button
                type="button"
                className="add-photo-remove-button"
                onClick={removeImage}
              >
                Ukloni sliku
              </button>
            </div>
            )}
          </>
        ) : (
        <div className="add-photo-crop-container">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1} // Kvadratni odnos širine i visine
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
          <div className="add-photo-crop-buttons">
            <button
              type="button"
              onClick={handleCrop}
              className="add-photo-save-button"
            >
              Sačuvaj izrezanu sliku
            </button>
            <button
              type="button"
              onClick={() => setCropping(false)}
              className="add-photo-cancel-button"
            >
              Otkaži
            </button>
          </div>
        </div>
          )}
        </div>
        {finalImage ? <button className="add-photo-continue-button" onClick={()=>handlePhotoUpdate()}>
              Sačuvaj
        </button> : null }
        </div>
    </div>
  );
};

export default AddPhoto;
