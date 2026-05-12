import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, createCategory, updateCategory, deleteCategory, resetActionStatus } from '../../../redux/slices/categorySlice';
import AdminSidebar from '../../../components/AdminSidebar/AdminSidebar';
import CategoryForm from '../../../components/CategoryForm/CategoryForm';
import CategoryCard from '../../../components/CategoryCard/CategoryCard';
import Modal from '../../../components/Modal/Modal';
import './CategoryManagement.css';

const CategoryManagement = () => {
  const dispatch = useDispatch();
  const { items, status, actionStatus, actionError } = useSelector((state) => state.categories);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCategories());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (actionStatus === 'succeeded') {
      setIsEditModalOpen(false);
      setIsDeleteModalOpen(false);
      dispatch(resetActionStatus());
    }
  }, [actionStatus, dispatch]);

  const handleCreate = useCallback((formData) => {
    dispatch(createCategory(formData));
  }, [dispatch]);

  const handleEditClick = useCallback((category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  }, []);

  const handleUpdate = useCallback((formData) => {
    dispatch(updateCategory({ id: selectedCategory.id, formData }));
  }, [dispatch, selectedCategory]);

  const handleDeleteClick = useCallback((category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    dispatch(deleteCategory(selectedCategory.id));
  }, [dispatch, selectedCategory]);

  return (
    <div className="admin-layout" dir="ltr">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-header">
          <h2>Category Management</h2>
          <p>Organize your menu structure and storefront collections.</p>
        </div>

        <div className="category-container">
          <div className="category-add-section">
            <div className="add-card">
              <h3>Add New Category</h3>
              {actionError && <div className="error-message">{actionError}</div>}
              <CategoryForm onSubmit={handleCreate} isLoading={actionStatus === 'loading'} buttonText="Create Category" isSuccess={actionStatus === 'succeeded'} />
            </div>
          </div>

          <div className="category-list-section">
            <div className="category-grid">
              {items.map(category => (
                <CategoryCard 
                  key={category.id} 
                  category={category} 
                  onEdit={handleEditClick} 
                  onDelete={handleDeleteClick} 
                />
              ))}
            </div>
            {items.length === 0 && status !== 'loading' && <p>No categories found.</p>}
            {status === 'loading' && <p>Loading categories...</p>}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="Edit Category"
      >
        {actionError && <div className="error-message">{actionError}</div>}
        <CategoryForm 
          initialData={selectedCategory} 
          onSubmit={handleUpdate} 
          isLoading={actionStatus === 'loading'} 
          buttonText="Update Category" 
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Confirm Deletion"
        footer={
          <>
            <button className="modal-btn cancel" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
            <button className="modal-btn danger" onClick={confirmDelete}>Yes, Delete</button>
          </>
        }
      >
        <p>Are you sure you want to delete the category <strong>{selectedCategory?.nameEn}</strong>?</p>
        <p>This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default CategoryManagement;
