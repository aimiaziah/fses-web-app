// src/hooks/useDepartments.js
import { useState, useEffect } from 'react';
import { departmentAPI } from '../services/api';

export const useDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentAPI.getAll();
      setDepartments(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const createDepartment = async (departmentData) => {
    try {
      const response = await departmentAPI.create(departmentData);
      setDepartments(prev => [...prev, response.data]);
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to create department' 
      };
    }
  };

  const updateDepartment = async (id, departmentData) => {
    try {
      const response = await departmentAPI.update(id, departmentData);
      setDepartments(prev => 
        prev.map(department => 
          department.id === id ? response.data : department
        )
      );
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to update department' 
      };
    }
  };

  const deleteDepartment = async (id) => {
    try {
      await departmentAPI.delete(id);
      setDepartments(prev => prev.filter(department => department.id !== id));
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to delete department' 
      };
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return {
    departments,
    loading,
    error,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };
};