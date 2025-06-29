// src/hooks/useLecturers.js
import { useState, useEffect } from 'react';
import { lecturerAPI } from '../services/api';

export const useLecturers = () => {
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLecturers = async () => {
    try {
      setLoading(true);
      const response = await lecturerAPI.getAll();
      setLecturers(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch lecturers');
    } finally {
      setLoading(false);
    }
  };

  const createLecturer = async (lecturerData) => {
    try {
      const response = await lecturerAPI.create(lecturerData);
      setLecturers(prev => [...prev, response.data]);
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to create lecturer' 
      };
    }
  };

  const updateLecturer = async (id, lecturerData) => {
    try {
      const response = await lecturerAPI.update(id, lecturerData);
      setLecturers(prev => 
        prev.map(lecturer => 
          lecturer.id === id ? response.data : lecturer
        )
      );
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to update lecturer' 
      };
    }
  };

  const deleteLecturer = async (id) => {
    try {
      await lecturerAPI.delete(id);
      setLecturers(prev => prev.filter(lecturer => lecturer.id !== id));
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to delete lecturer' 
      };
    }
  };

  useEffect(() => {
    fetchLecturers();
  }, []);

  return {
    lecturers,
    loading,
    error,
    fetchLecturers,
    createLecturer,
    updateLecturer,
    deleteLecturer,
  };
};
