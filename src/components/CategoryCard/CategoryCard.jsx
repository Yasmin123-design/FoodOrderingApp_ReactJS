import React from 'react';
import { useSelector } from 'react-redux';
import './CategoryCard.css';

const CategoryCard = React.memo(({ category, onEdit, onDelete }) => {
  const { items: products } = useSelector(state => state.products);
  const itemCount = products.filter(p => p.categoryId === category.id).length;

  return (
    <div className="category-card">
      <div className="category-image" style={{ backgroundImage: `url(${category.image|| 'https://via.placeholder.com/300x200'})` }}>
        <div className="category-overlay">
          <h4>{category.nameEn}</h4>
          <p dir="rtl">{category.nameAr}</p>
        </div>
      </div>
      <div className="category-actions">
        <span className="items-count">{itemCount} Items</span>
        <div className="action-icons">
          <span className="icon edit-icon" onClick={() => onEdit(category)}>✏️</span>
          <span className="icon delete-icon" onClick={() => onDelete(category)}>🗑️</span>
        </div>
      </div>
    </div>
  );
});

export default CategoryCard;
