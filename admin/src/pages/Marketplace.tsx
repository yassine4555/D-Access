import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, Search, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const Marketplace: React.FC = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    productUrl: '',
    description: '',
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/admin/marketplace?limit=100');
      const data = Array.isArray(res?.data) ? res.data : [];
      setProducts(data);
      setFilteredProducts(data);
    } catch (err: any) {
      toast(err.message || 'Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const lower = searchQuery.toLowerCase();
    setFilteredProducts(
      products.filter(p =>
        p.name.toLowerCase().includes(lower) ||
        (p.description || '').toLowerCase().includes(lower)
      )
    );
  }, [searchQuery, products]);

  const openModal = (product?: any) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '',
        productUrl: product.productUrl,
        description: product.description || '',
        isActive: product.inStock !== false,
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', price: '', image: '', productUrl: '', description: '', isActive: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const dto = {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      images: [formData.image.trim()].filter(Boolean),
      productUrl: formData.productUrl.trim(),
      description: formData.description.trim(),
      inStock: formData.isActive,
      category: 'other',
    };

    try {
      if (editingId) {
        const updated = await api.patch(`/admin/marketplace/${editingId}`, dto);
        setProducts(products.map(p => p.id === editingId ? updated : p));
        toast('Product updated', 'success');
      } else {
        const created: any = await api.post('/admin/marketplace', dto);
        setProducts([created, ...products]);
        toast('Product added', 'success');
      }
      closeModal();
    } catch (err: any) {
      toast(err.message || 'Error saving product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/marketplace/${id}`);
      setProducts(products.filter(p => p.id !== id));
      toast('Product deleted', 'success');
    } catch (err: any) {
      toast(err.message || 'Error deleting product', 'error');
    }
  };

  return (
    <div>
      <div className="mp-toolbar">
        <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-3)' }} />
          <input
            type="text"
            className="search-input"
            style={{ paddingLeft: '32px', width: '100%' }}
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="empty-state"><span className="spinner"></span></div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <p>No products found.</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map(p => {
            const imageUrl = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '';
            return (
              <div className="product-card" key={p.id}>
                <div className="product-img-wrap">
                  <img
                    src={imageUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23334155"/><text x="50" y="55" text-anchor="middle" font-size="30" fill="%2364748b">🖼</text></svg>'}
                    alt={p.name}
                    className="product-img"
                    onError={(e: any) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23334155"/><text x="50" y="55" text-anchor="middle" font-size="30" fill="%2364748b">🖼</text></svg>'; }}
                  />
                  <div className="product-status">
                    {p.inStock ? (
                      <span className="badge badge-verified" style={{ fontSize: '.7rem' }}>Active</span>
                    ) : (
                      <span className="badge badge-rejected" style={{ fontSize: '.7rem' }}>Hidden</span>
                    )}
                  </div>
                </div>
                <div className="product-body">
                  <div className="product-name">{p.name}</div>
                  <div className="product-price">${Number(p.price).toFixed(2)}</div>
                  {p.description && <div className="product-desc">{p.description}</div>}
                </div>
                <div className="product-actions">
                  <a href={p.productUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <ExternalLink size={14} /> Shop
                  </a>
                  <button className="btn btn-sm btn-ghost" onClick={() => openModal(p)} style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <Edit2 size={14} /> Edit
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id, p.name)} style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <Trash2 size={14} /> Del
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Product' : 'Add Product'}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Price ($)</label>
                  <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Image URL</label>
                  <input type="url" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} required />
                  {formData.image && (
                    <div style={{ marginTop: '10px', background: 'var(--surface2)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                      <img src={formData.image} alt="Preview" style={{ maxHeight: '150px', maxWidth: '100%', borderRadius: '4px' }} onError={(e: any) => e.target.style.display = 'none'} />
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Shop URL</label>
                  <input type="url" value={formData.productUrl} onChange={e => setFormData({ ...formData, productUrl: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Description (optional)</label>
                  <textarea
                    className="reason-input"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                  <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} style={{ width: 'auto' }} />
                  <label htmlFor="isActive" style={{ margin: 0, cursor: 'pointer' }}>Active (Show in app)</label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal} style={{ marginRight: '10px' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
