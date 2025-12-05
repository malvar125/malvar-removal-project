import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

export default function ProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', description: '', category: '', price: '', quantity: '' });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (id) loadProduct(id);
    }, [id]);

    function loadProduct(pid) {
        setLoading(true);
        window.axios.get('/api/products/' + pid)
                .then(res => {
                const p = res.data;
                setForm({ name: p.name || '', description: p.description || '', category: p.category || '', price: String(p.price), quantity: String(p.quantity) });
            })
            .catch(() => toast.error('Failed to load product'))
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
        if (err) return toast.warn(err);

        const payload = { name: form.name, description: form.description, category: form.category, price: parseFloat(form.price), quantity: parseInt(form.quantity, 10) };
        setSaving(true);

        const request = id ? window.axios.put('/api/products/' + id, payload) : window.axios.post('/api/products', payload);

        request.then(() => {
            toast.success(id ? 'Product updated' : 'Product added');
            navigate('/');
        }).catch(() => toast.error('Save failed'))
          .finally(() => setSaving(false));
    }

    return (
        <div className="card">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="card-title m-0">{id ? 'Edit Product' : 'Add Product'}</h2>
                    <div>
                        <button className="btn btn-secondary" onClick={() => navigate('/')}>Back to list</button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-4">Loading...</div>
                ) : (
                    <form onSubmit={submit}>
                        <div className="row g-2">
                            <div className="col-md-6">
                                <input className="form-control" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div className="col-md-4">
                                <input className="form-control" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div className="col-md-2">
                                <input className="form-control" placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                            </div>
                            <div className="col-md-3">
                                <input className="form-control" placeholder="Price" type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                            </div>
                            <div className="col-md-3">
                                <input className="form-control" placeholder="Quantity" type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required />
                            </div>
                            <div className="col-12 d-flex gap-2 mt-3">
                                <button className="btn btn-primary me-2" type="submit" disabled={saving}>{saving ? 'Saving...' : (id ? 'Update Product' : 'Add Product')}</button>
                                <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/')}>Cancel</button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
            <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} closeOnClick pauseOnHover />
        </div>
    );
}
