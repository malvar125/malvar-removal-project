import React, { useEffect, useState, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';

export default function ProductManager() {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({ id: null, name: '', description: '', price: '', quantity: '' });
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [toDelete, setToDelete] = useState(null);

    const searchTimeout = useRef(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        // debounce search
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => fetchProducts(query), 350);
        return () => clearTimeout(searchTimeout.current);
    }, [query]);

    function fetchProducts(q = '') {
        setLoading(true);
        const url = '/api/products' + (q ? '?q=' + encodeURIComponent(q) : '');
        window.axios.get(url)
            .then(res => setProducts(res.data))
            .catch(err => toast.error('Failed to load products'))
            .finally(() => setLoading(false));
    }

    function validate() {
        if (!form.name || form.name.trim().length === 0) return 'Name is required';
        if (form.price === '' || isNaN(Number(form.price))) return 'Valid price is required';
        if (form.quantity === '' || !Number.isInteger(Number(form.quantity))) return 'Valid quantity is required';
        return null;
    }

    function submit(e) {
        e.preventDefault();
        const err = validate();
        if (err) {
            toast.warn(err);
            return;
        }

        const payload = { name: form.name, description: form.description, price: parseFloat(form.price), quantity: parseInt(form.quantity, 10) };
        setSaving(true);

        const request = form.id
            ? window.axios.put('/api/products/' + form.id, payload)
            : window.axios.post('/api/products', payload);

        request.then(res => {
            toast.success(form.id ? 'Product updated' : 'Product added');
            setForm({ id: null, name: '', description: '', price: '', quantity: '' });
            fetchProducts(query);
        }).catch(err => {
            toast.error('Save failed');
        }).finally(() => setSaving(false));
    }

    function edit(p) {
        setForm({ id: p.id, name: p.name, description: p.description || '', price: String(p.price), quantity: String(p.quantity) });
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    return (
        <div className="card">
            <div className="card-body">
                <h2 className="card-title">Product Inventory Manager</h2>

                <form onSubmit={submit} className="mb-4">
                    <div className="row g-2">
                        <div className="col-md-6">
                            <input className="form-control" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                        </div>
                        <div className="col-md-6">
                            <input className="form-control" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div className="col-md-3">
                            <input className="form-control" placeholder="Price" type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                        </div>
                        <div className="col-md-3">
                            <input className="form-control" placeholder="Quantity" type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required />
                        </div>
                        <div className="col-md-6 d-flex gap-2">
                            <button className="btn btn-primary me-2" type="submit" disabled={saving}>{saving ? 'Saving...' : (form.id ? 'Update Product' : 'Add Product')}</button>
                            <button type="button" className="btn btn-outline-secondary" onClick={() => setForm({ id: null, name: '', description: '', price: '', quantity: '' })}>Clear</button>
                        </div>
                    </div>
                </form>

                <div className="mb-3 d-flex">
                    <input className="form-control me-2" placeholder="Filter by name" value={query} onChange={e => setQuery(e.target.value)} />
                    <button className="btn btn-outline-secondary" onClick={() => { setQuery(''); fetchProducts(''); }}>Reset</button>
                </div>

                <div>
                    {loading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.length === 0 && (
                                        <tr><td colSpan="4" className="text-center">No products found</td></tr>
                                    )}
                                    {products.map(p => (
                                        <tr key={p.id}>
                                            <td>{p.name}</td>
                                            <td>${Number(p.price).toFixed(2)}</td>
                                            <td>{p.quantity}</td>
                                            <td className="text-end">
                                                <button className="btn btn-sm btn-outline-warning me-2" onClick={() => edit(p)}>Edit</button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => confirmDelete(p.id)} disabled={deletingId === p.id}>{deletingId === p.id ? 'Deleting...' : 'Delete'}</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
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

