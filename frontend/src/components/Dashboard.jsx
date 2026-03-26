import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductForm from './ProductForm.jsx';
import { jwtDecode } from 'jwt-decode';
import Alert from './Alert.jsx';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');
  const user = token ? jwtDecode(token).user : null;

  const getProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/v1/products', {
        headers: { 'x-auth-token': token },
      });
      setProducts(res.data);
    } catch (err) {
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        'Failed to fetch products';
      setError(msg);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const addProduct = (product) => {
    setProducts([...products, product]);
    setShowForm(false);
    setSuccess('Product created successfully.');
    setError('');
  };

  const updateProduct = (product) => {
    setProducts(
      products.map((p) => (p._id === product._id ? product : p))
    );
    setShowForm(false);
    setEditingProduct(null);
    setSuccess('Product updated successfully.');
    setError('');
  };

  const deleteProduct = async (id) => {
    setError('');
    setSuccess('');
    try {
      await axios.delete(`http://localhost:5000/api/v1/products/${id}`, {
        headers: { 'x-auth-token': token },
      });
      setProducts(products.filter((p) => p._id !== id));
      setSuccess('Product deleted successfully.');
    } catch (err) {
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        'Failed to delete product';
      setError(msg);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <Alert type="error" message={error} />
      <Alert type="success" message={success} />
      {user && user.role === 'admin' && (
        <button onClick={() => {
          setEditingProduct(null);
          setShowForm(!showForm);
        }}>
          {showForm ? 'Close' : 'Add Product'}
        </button>
      )}
      {showForm && (
        <ProductForm
          addProduct={addProduct}
          updateProduct={updateProduct}
          editingProduct={editingProduct}
          setError={setError}
          setSuccess={setSuccess}
        />
      )}
      <div>
        {products.map((product) => (
          <div key={product._id}>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p>${product.price}</p>
            {user && user.role === 'admin' && (
              <>
                <button onClick={() => {
                  setEditingProduct(product);
                  setShowForm(true);
                }}>Edit</button>
                <button onClick={() => deleteProduct(product._id)}>Delete</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
