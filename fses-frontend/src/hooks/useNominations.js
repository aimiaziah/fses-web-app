// src/hooks/useNominations.js
import { useState, useEffect } from 'react';
import { nominationAPI } from '../services/api';

export const useNominations = () => {
  const [nominations, setNominations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNominations = async () => {
    try {
      setLoading(true);
      const response = await nominationAPI.getAll();
      setNominations(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch nominations');
    } finally {
      setLoading(false);
    }
  };

  const createNomination = async (nominationData) => {
    try {
      const response = await nominationAPI.create(nominationData);
      setNominations(prev => [...prev, response.data]);
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to create nomination' 
      };
    }
  };

  const updateNomination = async (id, nominationData) => {
    try {
      const response = await nominationAPI.update(id, nominationData);
      setNominations(prev => 
        prev.map(nomination => 
          nomination.id === id ? response.data : nomination
        )
      );
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to update nomination' 
      };
    }
  };

  const deleteNomination = async (id) => {
    try {
      await nominationAPI.delete(id);
      setNominations(prev => prev.filter(nomination => nomination.id !== id));
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to delete nomination' 
      };
    }
  };

  useEffect(() => {
    fetchNominations();
  }, []);

  return {
    nominations,
    loading,
    error,
    fetchNominations,
    createNomination,
    updateNomination,
    deleteNomination,
  };
};