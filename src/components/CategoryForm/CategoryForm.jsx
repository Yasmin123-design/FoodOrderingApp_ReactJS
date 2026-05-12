import React, { useState, useCallback, useEffect } from 'react';

const CategoryForm = React.memo(({ initialData, onSubmit, isLoading, buttonText, isSuccess }) => {
  const [formData, setFormData] = useState({
    nameEn: '',
    nameAr: '',
    file: null,
  });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nameEn: initialData.nameEn || '',
        nameAr: initialData.nameAr || '',
        file: null, // Keep null for file input unless they change it
      });
      setPreviewImage(initialData.image || null);
    }
  }, [initialData]);

  useEffect(() => {
    if (isSuccess && !initialData) {
      setFormData({ nameEn: '', nameAr: '', file: null });
      setPreviewImage(null);
    }
  }, [isSuccess, initialData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, file }));
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setPreviewImage(null);
    }
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('nameEn', formData.nameEn);
    data.append('nameAr', formData.nameAr);
    if (formData.file) {
      data.append('file', formData.file);
    }
    onSubmit(data);
  }, [formData, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className="category-form">
      <div className="input-group">
        <label>Category Name (English)</label>
        <input
          type="text"
          name="nameEn"
          placeholder="e.g. Italian Delights"
          value={formData.nameEn}
          onChange={handleChange}
          required
        />
      </div>
      <div className="input-group">
        <label>Category Name (Arabic)</label>
        <input
          type="text"
          name="nameAr"
          placeholder="مثال: المأكولات الإيطالية"
          value={formData.nameAr}
          onChange={handleChange}
          required
          dir="rtl"
        />
      </div>
      <div className="input-group">
        <label>Upload Image</label>
        <div className="file-upload-box">
           <input
             type="file"
             accept="image/png, image/jpeg, image/webp"
             onChange={handleFileChange}
             required={!initialData && !previewImage} // Required only for create and if no preview
           />
           {previewImage ? (
             <div className="upload-placeholder" style={{backgroundImage: `url(${previewImage})`, backgroundSize: 'cover', backgroundPosition: 'center', height: '100px', borderRadius: '8px'}}>
               {/* Image is showing in background */}
             </div>
           ) : (
             <div className="upload-placeholder">
               <span>☁️</span>
               <p>Click to upload image<br/>PNG, JPG up to 10MB (4:3 ratio)</p>
             </div>
           )}
        </div>
      </div>
      <button type="submit" className="auth-btn" disabled={isLoading}>
        {isLoading ? 'Processing...' : buttonText}
      </button>
    </form>
  );
});

export default CategoryForm;
