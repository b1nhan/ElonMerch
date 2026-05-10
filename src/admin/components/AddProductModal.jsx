import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AddProductModal = ({ isOpen, product, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    colors: '["Đen", "Trắng"]',
    sizes: '["S", "M", "L", "XL"]',
    image: '',
    sku: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        colors: JSON.stringify(product.colors || ["Đen"]),
        sizes: JSON.stringify(product.sizes || []),
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        colors: '["Đen", "Trắng"]',
        sizes: '["S", "M", "L", "XL"]',
        image: '',
        sku: '',
      });
    }
    setErrors({});
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        colors: JSON.parse(formData.colors),
        sizes: JSON.parse(formData.sizes),
      };
      onSave(dataToSave);
    } catch (error) {
      setErrors({ colors: 'Invalid JSON format for colors/sizes' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {product?.id ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Áo Thun Soobin"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.name ? 'border-red-500' : 'border-slate-200'
              } bg-[#F8FAFF] focus:outline-none focus:border-[#4054B2] transition`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Product description..."
              rows="3"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#F8FAFF] focus:outline-none focus:border-[#4054B2] transition resize-none"
            />
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Price *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.price ? 'border-red-500' : 'border-slate-200'
                } bg-[#F8FAFF] focus:outline-none focus:border-[#4054B2] transition`}
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.category ? 'border-red-500' : 'border-slate-200'
                } bg-[#F8FAFF] focus:outline-none focus:border-[#4054B2] transition`}
              >
                <option value="">Select category...</option>
                <option value="Áo">Áo</option>
                <option value="Phụ kiện">Phụ kiện</option>
                <option value="Túi">Túi</option>
                <option value="Mũ">Mũ</option>
                <option value="Combo">Combo</option>
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>
          </div>

          {/* Stock & SKU */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#F8FAFF] focus:outline-none focus:border-[#4054B2] transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g., SHIRT-SOOBIN-001"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#F8FAFF] focus:outline-none focus:border-[#4054B2] transition"
              />
            </div>
          </div>

          {/* Colors (JSON) */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Colors (JSON Array)
            </label>
            <textarea
              name="colors"
              value={formData.colors}
              onChange={handleChange}
              placeholder='["Đen", "Trắng", "Xanh"]'
              rows="2"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.colors ? 'border-red-500' : 'border-slate-200'
              } bg-[#F8FAFF] focus:outline-none focus:border-[#4054B2] transition resize-none font-mono text-sm`}
            />
            {errors.colors && <p className="text-red-500 text-sm mt-1">{errors.colors}</p>}
          </div>

          {/* Sizes (JSON) */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Sizes (JSON Array)
            </label>
            <textarea
              name="sizes"
              value={formData.sizes}
              onChange={handleChange}
              placeholder='["S", "M", "L", "XL"]'
              rows="2"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#F8FAFF] focus:outline-none focus:border-[#4054B2] transition resize-none font-mono text-sm"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Image URL
            </label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="/merch/image.jpg"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#F8FAFF] focus:outline-none focus:border-[#4054B2] transition"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-900 rounded-2xl hover:bg-slate-200 transition font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-[#4054B2] text-white rounded-2xl hover:bg-[#3548a1] transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                product?.id ? 'Update Product' : 'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
