import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

// Inline styles moved from app.css into JS to avoid external CSS dependency.
const styles = {
    pageContainer: {
        padding: 18,
    },
    statCard: {
        background: '#f7fcfb',
        border: '1px solid #e6f3ef',
        borderRadius: 8,
        padding: 12,
    },
    statValue: {
        margin: 0,
        color: '#0f5132',
        fontSize: '1.25rem',
        fontWeight: 600,
    },
    categoryBadge: {
        display: 'inline-block',
        padding: '6px 10px',
        background: '#e6f7f0',
        color: '#0d6efd',
        borderRadius: 999,
        fontSize: 12,
    },
    actionBtn: {
        minWidth: 78,
        padding: '6px 10px',
        fontSize: '0.9rem',
        borderWidth: '1.5px',
    },
    editBtn: {
        background: '#ffffff',
        color: '#334155',
        borderColor: '#d1d5db',
    },
    deleteBtn: {
        background: '#ffffff',
        color: '#c82333',
        borderColor: '#f5c6cb',
    },
};

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [toDelete, setToDelete] = useState(null);
    const searchTimeout = useRef(null);
    const navigate = useNavigate();

    useEffect(() => fetchProducts(), []);

    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => fetchProducts(query), 350);
        return () => clearTimeout(searchTimeout.current);
    }, [query]);

    function fetchProducts(q = '') {
        setLoading(true);
        const url = '/api/products' + (q ? '?q=' + encodeURIComponent(q) : '');
        window.axios.get(url)
            .then(res => setProducts(res.data))
            .catch(() => toast.error('Failed to load products'))
            .finally(() => setLoading(false));
    }

    function confirmDelete(id) {
        setToDelete(id);
        setShowConfirm(true);
    }

    function doDelete() {
        if (!toDelete) return;
        setDeletingId(toDelete);
        window.axios.delete('/api/products/' + toDelete)
            .then(() => {
                toast.success('Product deleted');
                fetchProducts(query);
            }).catch(() => toast.error('Delete failed'))
            .finally(() => {
                setDeletingId(null);
                setShowConfirm(false);
                setToDelete(null);
            });
    }

    // compute stats
    const totalProducts = products.length;
    const totalValue = products.reduce((s, p) => s + (Number(p.price || 0) * Number(p.quantity || 0)), 0);
    const lowStock = products.filter(p => Number(p.quantity || 0) < 5).length;
    const categories = Array.from(new Set(products.map(p => (p.category || '').toLowerCase()).filter(Boolean))).length;

    return (
        <div style={styles.pageContainer}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <h3 style={{ margin: 0, marginBottom: 4 }}>Product Inventory Manager</h3>
                    <div style={{ color: '#6b7280' }}>Manage your product catalog</div>
                </div>
            </div>

            <div className="row" style={{ marginBottom: 16 }}>
                <div className="col-md-3" style={{ marginBottom: 12 }}>
                    <div style={styles.statCard}>
                        <div style={styles.statValue}>{totalProducts}</div>
                        <div style={{ color: '#6b7280', fontSize: 12 }}>Total Products</div>
                    </div>
                </div>
                <div className="col-md-3" style={{ marginBottom: 12 }}>
                    <div style={styles.statCard}>
                        <div style={styles.statValue}>${totalValue.toFixed(2)}</div>
                        <div style={{ color: '#6b7280', fontSize: 12 }}>Total Value</div>
                    </div>
                </div>
                <div className="col-md-3" style={{ marginBottom: 12 }}>
                    <div style={styles.statCard}>
                        <div style={styles.statValue}>{lowStock}</div>
                        <div style={{ color: '#6b7280', fontSize: 12 }}>Low Stock</div>
                    </div>
                </div>
                <div className="col-md-3" style={{ marginBottom: 12 }}>
                    <div style={styles.statCard}>
                        <div style={styles.statValue}>{categories}</div>
                        <div style={{ color: '#6b7280', fontSize: 12 }}>Categories</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ width: '50%' }}>
                    <input className="form-control" placeholder="Search products by name..." value={query} onChange={e => setQuery(e.target.value)} />
                </div>
                <div>
                    <button className="btn btn-success" onClick={() => navigate('/products/new')}>+ Add Product</button>
                </div>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Name</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.length === 0 && (
                                        <tr><td colSpan="5" className="text-center py-3">No products found</td></tr>
                                    )}
                                    {products.map(p => (
                                        <tr key={p.id}>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{p.name}</div>
                                                <div style={{ color: '#6b7280', fontSize: 13 }}>{p.description || ''}</div>
                                            </td>
                                            <td>
                                                {p.category ? <span style={styles.categoryBadge}>{p.category}</span> : <span style={{ color: '#6b7280', fontSize: 12 }}>—</span>}
                                            </td>
                                            <td>${Number(p.price).toFixed(2)}</td>
                                            <td>{p.quantity}</td>
                                            <td className="text-end">
                                                <div style={{ display: 'inline-flex', gap: 8, justifyContent: 'flex-end' }}>
                                                    <button
                                                        className="btn btn-sm"
                                                        onClick={() => navigate(`/products/${p.id}/edit`)}
                                                        style={{ display: 'inline-block', ...styles.actionBtn, ...styles.editBtn }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-sm"
                                                        onClick={() => confirmDelete(p.id)}
                                                        disabled={deletingId === p.id}
                                                        style={{ display: 'inline-block', ...styles.actionBtn, ...styles.deleteBtn, opacity: deletingId === p.id ? 0.6 : 1 }}
                                                    >
                                                        {deletingId === p.id ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showConfirm && (
                <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card" style={{ width: 420 }}>
                        <div className="card-body">
                            <h5>Confirm delete</h5>
                            <p>Are you sure you want to delete this product?</p>
                            <div className="text-end">
                                <button className="btn btn-secondary me-2" onClick={() => setShowConfirm(false)}>Cancel</button>
                                <button className="btn btn-danger" onClick={doDelete}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} closeOnClick pauseOnHover />
        </div>
    );
}
