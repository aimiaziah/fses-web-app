// src/hooks/usePostponements.js
import { useState, useEffect } from 'react';
import { postponementAPI } from '../services/api';

export const usePostponements = () => {
  const [postponements, setPostponements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPostponements = async () => {
    try {
      setLoading(true);
      const response = await postponementAPI.getAll();
      setPostponements(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch postponements');
    } finally {
      setLoading(false);
    }
  };

  const createPostponement = async (postponementData) => {
    try {
      const response = await postponementAPI.create(postponementData);
      setPostponements(prev => [...prev, response.data]);
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to create postponement' 
      };
    }
  };

  const updatePostponement = async (id, postponementData) => {
    try {
      const response = await postponementAPI.update(id, postponementData);
      setPostponements(prev => 
        prev.map(postponement => 
          postponement.id === id ? response.data : postponement
        )
      );
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to update postponement' 
      };
    }
  };

  const deletePostponement = async (id) => {
    try {
      await postponementAPI.delete(id);
      setPostponements(prev => prev.filter(postponement => postponement.id !== id));
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to delete postponement' 
      };
    }
  };

  useEffect(() => {
    fetchPostponements();
  }, []);

  return {
    postponements,
    loading,
    error,
    fetchPostponements,
    createPostponement,
    updatePostponement,
    deletePostponement,
  };
};