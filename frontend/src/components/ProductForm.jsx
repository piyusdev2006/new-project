import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductForm = ({ addProduct, updateProduct, editingProduct, setError, setSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
  });

  const { name, description, price } = formData;

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
      });
    } else {
        setFormData({
            name: '',
            description: '',
            price: '',
        });
    }
  }, [editingProduct]);

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (setError) setError('');
    if (setSuccess) setSuccess('');
    try {
        if (editingProduct) {
            const res = await axios.put(
                `http://localhost:5000/api/v1/products/${editingProduct._id}`,
                formData,
                { headers: { 'x-auth-token': token } }
            );
            updateProduct(res.data);
        } else {
            const res = await axios.post('http://localhost:5000/api/v1/products', formData, {
                headers: { 'x-auth-token': token },
            });
            addProduct(res.data);
        }
    } catch (err) {
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        (Array.isArray(err?.response?.data?.errors)
          ? err.response.data.errors.map((e) => e.msg).join(', ')
          : null) ||
        'Request failed';
      if (setError) setError(msg);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div>
        <input
          type="text"
          placeholder="Name"
          name="name"
          value={name}
          onChange={onChange}
          required
        />
      </div>
      <div>
        <textarea
          placeholder="Description"
          name="description"
          value={description}
          onChange={onChange}
          required
        ></textarea>
      </div>
      <div>
        <input
          type="number"
          placeholder="Price"
          name="price"
          value={price}
          onChange={onChange}
          required
        />
      </div>
      <input type="submit" value={editingProduct ? 'Update Product' : 'Add Product'} />
    </form>
  );
};

export default ProductForm;
