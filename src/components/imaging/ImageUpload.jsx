import React from 'react';

const ImageUpload = () => {
  return (
    <div>
      <h2>Upload Image</h2>
      <input type="file" accept="image/*" />
      <button>Upload</button>
    </div>
  );
};

export default ImageUpload; 