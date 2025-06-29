import { useState, useEffect } from 'react';
import { studentAPI } from '../services/api';
import { authAPI } from '../services/api';

export const useStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getAll();
      setStudents(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError(err.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const createStudent = async (studentData) => {
    try {
      await authAPI.getCSRFToken();

      console.log("Creating student with data:", studentData);
      const response = await studentAPI.create(studentData);
      setStudents([...students, response.data]);
      return { success: true, data: response.data };
    } catch (err) {
      console.error("Error creating student:", err);
      return { 
        success: false, 
        error: err.response?.data?.message || err.message || 'Failed to create student' 
      };
    }
  };

  const updateStudent = async (id, studentData) => {
    try {
      const response = await studentAPI.update(id, studentData);
      setStudents(students.map(student => 
        student.id === id ? response.data : student
      ));
      return { success: true, data: response.data };
    } catch (err) {
      console.error("Error updating student:", err);
      return { 
        success: false, 
        error: err.response?.data?.message || err.message || 'Failed to update student' 
      };
    }
  };

  const deleteStudent = async (id) => {
    try {
      await studentAPI.delete(id);
      setStudents(students.filter(student => student.id !== id));
      return { success: true };
    } catch (err) {
      console.error("Error deleting student:", err);
      return { 
        success: false, 
        error: err.response?.data?.message || err.message || 'Failed to delete student' 
      };
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return {
    students,
    loading,
    error,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    refreshStudents: fetchStudents
  };
};