import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import AddProductModal from '../components/AddProductModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Notification from '../components/Notification';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/api';

const AdminMerchandise = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiGet('/products', { per_page: 100 });
      setProducts(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingProduct(null);
    setShowAddModal(true);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const handleSaveProduct = async (formData) => {
    try {
      setModalLoading(true);

      if (editingProduct?.id) {
        await apiPut(`/products/${editingProduct.id}`, formData);
        setNotification({ type: 'success', message: 'Product updated successfully!' });
      } else {
        await apiPost('/products', formData);
        setNotification({ type: 'success', message: 'Product created successfully!' });
      }

      setShowAddModal(false);
      setEditingProduct(null);
      await fetchProducts();
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to save product' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteClick = (product) => {
    setDeleteConfirm(product);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm?.id) return;

    try {
      setModalLoading(true);
      await apiDelete(`/products/${deleteConfirm.id}`);
      setNotification({ type: 'success', message: 'Product deleted successfully!' });
      setDeleteConfirm(null);
      await fetchProducts();
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to delete product' });
    } finally {
      setModalLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { bg: 'bg-red-100', text: 'text-red-700', label: 'Out of Stock' };
    if (stock < 10) return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Low Stock' };
    return { bg: 'bg-green-100', text: 'text-green-700', label: 'In Stock' };
  };

  return (
    <AdminLayout>
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Merchandise Management</h1>
          <p className="text-slate-500 mt-2">Create and manage your product inventory</p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-6 py-3 bg-[#4054B2] text-white rounded-2xl hover:bg-[#3548a1] transition font-medium"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-red-800">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-slate-200 h-48 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 text-center">
          <p className="text-slate-500 mb-4">No products found. Create your first product!</p>
          <button
            onClick={handleAddClick}
            className="px-6 py-3 bg-[#4054B2] text-white rounded-2xl hover:bg-[#3548a1] transition font-medium"
          >
            Add Product
          </button>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const stockStatus = getStockStatus(product.stock || 0);
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition overflow-hidden flex flex-col"
              >
                {/* Image Placeholder */}
                <div className="w-full h-40 bg-gradient-to-br from-[#F8FAFF] to-[#F0F5FF] flex items-center justify-center">
                  <span className="text-4xl">📦</span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  {/* Name & Category */}
                  <h3 className="font-bold text-slate-900 mb-1">{product.name}</h3>
                  <p className="text-xs text-slate-500 mb-3">{product.category}</p>

                  {/* Price */}
                  <p className="text-lg font-bold text-[#4054B2] mb-3">
                    {formatPrice(product.price)}
                  </p>

                  {/* Stock Status */}
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.text} mb-3 w-fit`}>
                    {stockStatus.label} ({product.stock})
                  </div>

                  {/* Colors & Sizes */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-slate-500 mb-1">Colors:</p>
                      <div className="flex gap-1">
                        {product.colors.slice(0, 3).map((color, idx) => (
                          <span key={idx} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg">
                            {color}
                          </span>
                        ))}
                        {product.colors.length > 3 && (
                          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg">
                            +{product.colors.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleEditClick(product)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#F8FAFF] text-[#4054B2] rounded-lg hover:bg-[#E8EDFF] transition font-medium text-sm"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(product)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium text-sm"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AddProductModal
        isOpen={showAddModal}
        product={editingProduct}
        onClose={() => {
          setShowAddModal(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        isLoading={modalLoading}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteConfirm}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        isLoading={modalLoading}
      />
    </AdminLayout>
  );
};

export default AdminMerchandise;
