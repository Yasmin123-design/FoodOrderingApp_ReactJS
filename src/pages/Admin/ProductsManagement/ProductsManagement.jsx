import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, createProduct, updateProduct, deleteProduct, resetActionStatus } from '../../../redux/slices/productSlice';
import { fetchCategories } from '../../../redux/slices/categorySlice';
import AdminSidebar from '../../../components/AdminSidebar/AdminSidebar';
import Modal from '../../../components/Modal/Modal';
import './ProductsManagement.css';

const ProductsManagement = () => {
  const dispatch = useDispatch();
  const { items: products, status: productStatus, actionStatus } = useSelector((state) => state.products);
  const { items: categories, status: categoryStatus } = useSelector((state) => state.categories);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    nameEn: '',
    nameAr: '',
    descriptionEn: '',
    descriptionAr: '',
    price: '',
    categoryId: '',
    file: null
  });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (productStatus === 'idle') dispatch(fetchProducts());
    if (categoryStatus === 'idle') dispatch(fetchCategories());
  }, [productStatus, categoryStatus, dispatch]);

  // Close modals on successful create/update/delete
  useEffect(() => {
    if (actionStatus === 'succeeded') {
      setIsFormModalOpen(false);
      setIsDeleteModalOpen(false);
      dispatch(resetActionStatus());
    }
  }, [actionStatus, dispatch]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file' && files[0]) {
      setFormData(prev => ({ ...prev, file: files[0] }));
      setPreviewImage(URL.createObjectURL(files[0]));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOpenAddForm = useCallback(() => {
    setCurrentProduct(null);
    setFormData({
      nameEn: '', nameAr: '', descriptionEn: '', descriptionAr: '', price: '', categoryId: '', file: null
    });
    setPreviewImage(null);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenEditForm = useCallback((product) => {
    setCurrentProduct(product);
    setFormData({
      nameEn: product.nameEn,
      nameAr: product.nameAr,
      descriptionEn: product.descriptionEn,
      descriptionAr: product.descriptionAr,
      price: product.price,
      categoryId: product.categoryId,
      file: null
    });
    setPreviewImage(product.image);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenDeleteConfirm = useCallback((product) => {
    setCurrentProduct(product);
    setIsDeleteModalOpen(true);
  }, []);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('nameEn', formData.nameEn);
    data.append('nameAr', formData.nameAr);
    data.append('descriptionEn', formData.descriptionEn);
    data.append('descriptionAr', formData.descriptionAr);
    data.append('price', formData.price);
    data.append('categoryId', formData.categoryId);
    if (formData.file) {
      data.append('file', formData.file);
    }

    if (currentProduct) {
      dispatch(updateProduct({ id: currentProduct.id, formData: data }));
    } else {
      dispatch(createProduct(data));
    }
  };

  const handleDeleteConfirm = () => {
    if (currentProduct) {
      dispatch(deleteProduct(currentProduct.id));
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            product.nameAr.includes(searchTerm);
      const matchesCategory = categoryFilter ? product.categoryId === categoryFilter : true;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  const getCategoryName = (id) => {
    const cat = categories.find(c => c.id === id);
    return cat ? `${cat.nameEn} (${cat.nameAr})` : 'Unknown';
  };

  return (
    <div className="admin-layout" dir="ltr">
      <AdminSidebar />
      <div className="admin-content">
        <div className="products-header">
          <div>
            <h2>Products Management</h2>
            <p>Manage your food inventory, prices, and descriptions.</p>
          </div>
          <button className="add-product-btn" onClick={handleOpenAddForm}>
            <span className="icon">+</span> Add New Product
          </button>
        </div>

        {/* Filters and Table */}
        <div className="products-main-card">
          <div className="table-controls">
            <div className="search-bar">
              <span className="icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search by product name (En/Ar)..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-wrapper">
              <span className="icon">🏷️</span>
              <select 
                className="category-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nameEn} - {cat.nameAr}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="products-table-wrapper">
            <table className="products-table">
              <thead>
              <tr>
                <th>Product</th>
                <th>Name (En)</th>
                <th>Name (Ar)</th>
                <th>Category</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {productStatus === 'loading' && <tr><td colSpan="6" className="empty-table-cell">Loading products...</td></tr>}
              {productStatus === 'succeeded' && filteredProducts.length === 0 && (
                <tr><td colSpan="6" className="empty-table-cell">No products found.</td></tr>
              )}
              
              {filteredProducts.map(product => (
                <tr key={product.id}>
                  <td>
                    <div className="product-thumbnail" style={{ backgroundImage: `url(${product.image})` }}></div>
                  </td>
                  <td className="product-name-en">
                    {product.nameEn}
                    <div className="product-desc-tooltip">{product.descriptionEn?.substring(0,30)}...</div>
                  </td>
                  <td className="product-name-ar" dir="rtl">{product.nameAr}</td>
                  <td>
                    <span className="category-badge">
                      {getCategoryName(product.categoryId)}
                    </span>
                  </td>
                  <td className="product-price">${product.price}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit" onClick={() => handleOpenEditForm(product)}>✏️</button>
                      <button className="action-btn delete" onClick={() => handleOpenDeleteConfirm(product)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
          <div className="table-footer">
            <p>Showing {filteredProducts.length} products</p>
          </div>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={currentProduct ? "Edit Product" : "Add New Product"}
        maxWidth="800px"
      >
        <form className="product-form" onSubmit={handleFormSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Name (English)</label>
              <input type="text" name="nameEn" value={formData.nameEn} onChange={handleInputChange} required />
            </div>
            <div className="form-group" dir="rtl">
              <label>الاسم (عربي)</label>
              <input type="text" name="nameAr" value={formData.nameAr} onChange={handleInputChange} required />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Description (English)</label>
              <textarea name="descriptionEn" value={formData.descriptionEn} onChange={handleInputChange} required rows="3"></textarea>
            </div>
            <div className="form-group" dir="rtl">
              <label>الوصف (عربي)</label>
              <textarea name="descriptionAr" value={formData.descriptionAr} onChange={handleInputChange} required rows="3"></textarea>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (USD)</label>
              <input type="number" name="price" value={formData.price} onChange={handleInputChange} required min="0" step="0.01" />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} required>
                <option value="" disabled>Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nameEn} ({cat.nameAr})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group image-upload-group">
            <label>Product Image</label>
            <div className="file-input-wrapper">
              <input type="file" name="file" onChange={handleInputChange} accept="image/*" />
              {previewImage && (
                <div className="image-preview" style={{ backgroundImage: `url(${previewImage})` }}></div>
              )}
              {!previewImage && <div className="placeholder-box">Upload Image</div>}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={() => setIsFormModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-save" disabled={actionStatus === 'loading'}>
              {actionStatus === 'loading' ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="delete-confirm-body">
          <p>Are you sure you want to delete the product <strong>{currentProduct?.nameEn}</strong>?</p>
          <p className="warning-text">This action cannot be undone.</p>
          <div className="modal-actions">
            <button className="btn-cancel" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
            <button className="btn-delete" onClick={handleDeleteConfirm} disabled={actionStatus === 'loading'}>
              {actionStatus === 'loading' ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductsManagement;
