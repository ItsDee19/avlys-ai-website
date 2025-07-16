import React, { useState } from 'react';

const ImageGallery = ({ images = [], title = "AI Generated Images" }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!images || images.length === 0) {
    return (
      <div className="image-gallery">
        <h3 className="gallery-title">{title}</h3>
        <div className="no-images">
          <p>No images generated yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="image-gallery">
      <h3 className="gallery-title">{title}</h3>
      <div className="image-grid">
        {images.map((image, index) => (
          <div 
            key={index} 
            className="image-card"
            onClick={() => setSelectedImage(image)}
          >
            <div className="image-container">
              <img 
                src={image.url} 
                alt={`AI Generated Image ${index + 1}`}
                className="gallery-image"
                loading="lazy"
              />
              <div className="image-overlay">
                <span className="image-number">{index + 1}</span>
                <span className="view-full">Click to view</span>
              </div>
            </div>
            <div className="image-info">
              <p className="image-prompt">{image.prompt}</p>
              <div className="image-meta">
                <span className="provider">{image.provider}</span>
                <span className="model">{image.model}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for full-size image */}
      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setSelectedImage(null)}>
              ×
            </button>
            <img 
              src={selectedImage.url} 
              alt="Full size image"
              className="modal-image"
            />
            <div className="modal-info">
              <h4>Image Details</h4>
              <p><strong>Prompt:</strong> {selectedImage.prompt}</p>
              <p><strong>Provider:</strong> {selectedImage.provider}</p>
              <p><strong>Model:</strong> {selectedImage.model}</p>
              {selectedImage.index && <p><strong>Image:</strong> {selectedImage.index} of {images.length}</p>}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .image-gallery {
          margin: 20px 0;
        }

        .gallery-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 16px;
          color: #1f2937;
        }

        .image-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .image-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
        }

        .image-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .image-container {
          position: relative;
          aspect-ratio: 1;
          overflow: hidden;
        }

        .gallery-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .image-card:hover .gallery-image {
          transform: scale(1.05);
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          color: white;
        }

        .image-card:hover .image-overlay {
          opacity: 1;
        }

        .image-number {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .view-full {
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .image-info {
          padding: 16px;
        }

        .image-prompt {
          font-size: 0.9rem;
          color: #6b7280;
          margin-bottom: 8px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .image-meta {
          display: flex;
          gap: 12px;
          font-size: 0.8rem;
        }

        .provider, .model {
          background: #f3f4f6;
          padding: 4px 8px;
          border-radius: 6px;
          color: #374151;
        }

        .no-images {
          text-align: center;
          padding: 40px;
          color: #6b7280;
          background: #f9fafb;
          border-radius: 12px;
        }

        /* Modal styles */
        .image-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 90vw;
          max-height: 90vh;
          position: relative;
          overflow: hidden;
        }

        .close-button {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          font-size: 24px;
          cursor: pointer;
          z-index: 1001;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-button:hover {
          background: rgba(0, 0, 0, 0.7);
        }

        .modal-image {
          width: 100%;
          height: auto;
          max-height: 70vh;
          object-fit: contain;
        }

        .modal-info {
          padding: 20px;
          background: #f9fafb;
        }

        .modal-info h4 {
          margin: 0 0 16px 0;
          color: #1f2937;
        }

        .modal-info p {
          margin: 8px 0;
          color: #374151;
        }

        @media (max-width: 768px) {
          .image-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
          }

          .modal-content {
            max-width: 95vw;
            max-height: 95vh;
          }
        }
      `}</style>
    </div>
  );
};

export default ImageGallery; 