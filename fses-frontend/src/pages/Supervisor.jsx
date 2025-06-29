import { useState, useEffect } from 'react';
import { Search, BookOpen, Users, Clock, FileText, Edit, Eye, Calendar, AlertTriangle, CheckCircle, XCircle, User, LogOut } from 'lucide-react';
import LogoutButton from '../components/LogoutButton';
import { useAuth } from '../contexts/AuthContext';
import { useStudents } from '../hooks/useStudents';
import { useLecturers } from '../hooks/useLecturers';
import { useNominations } from '../hooks/useNominations';
import { usePostponements } from '../hooks/usePostponements';

const Supervisor = () => {
  const [currentPage, setCurrentPage] = useState('students');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  // Use hooks to get data from backend
  const { students, loading: studentsLoading, error: studentsError, updateStudent } = useStudents();
  const { lecturers, loading: lecturersLoading } = useLecturers();
  const { nominations, loading: nominationsLoading, createNomination, updateNomination } = useNominations();
  const { postponements, loading: postponementsLoading, createPostponement } = usePostponements();

  // Filter students based on supervisor (assuming the backend handles this filtering based on authenticated user)
  const supervisorStudents = students.filter(student => 
    student.supervisor && 
    (typeof student.supervisor === 'object' ? 
      student.supervisor.name.toLowerCase().includes(user.username.toLowerCase()) :
      student.supervisor.toLowerCase().includes(user.username.toLowerCase())
    )
  );

  // Filter examiners (lecturers who can be examiners)
  const examiners = lecturers.map(lecturer => ({
    id: lecturer.id,
    name: lecturer.name,
    department: lecturer.department?.name || lecturer.department,
    university: lecturer.university,
    type: lecturer.university === 'UTM' ? 'internal' : 'external'
  }));

  const [formData, setFormData] = useState({
    researchTitle: '',
    examiner1: '',
    examiner2: '',
    examiner3: '',
    examiner1Name: '',
    examiner1Email: '',
    examiner1University: '',
    examiner2Name: '',
    examiner2Email: '',
    examiner2University: '',
    postponementReason: '',
    postponementType: '',
    postponementDate: '',
    comments: ''
  });

  const openModal = (type, student = null) => {
    setModalType(type);
    setSelectedStudent(student);
    if (student && type === 'title') {
      setFormData({ ...formData, researchTitle: student.research_title || '' });
    } else if (type === 'postponement') {
      setFormData({
        ...formData,
        postponementReason: '',
        postponementType: '',
        postponementDate: '',
        comments: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
    setFormData({
      researchTitle: '',
      examiner1: '',
      examiner2: '',
      examiner3: '',
      examiner1Name: '',
      examiner1Email: '',
      examiner1University: '',
      examiner2Name: '',
      examiner2Email: '',
      examiner2University: '',
      postponementReason: '',
      postponementType: '',
      postponementDate: '',
      comments: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (modalType === 'title') {
        const result = await updateStudent(selectedStudent.id, { 
          research_title: formData.researchTitle 
        });
        if (result.success) {
          alert('Research title updated successfully!');
          closeModal();
        } else {
          alert('Error updating title: ' + result.error);
        }
      } else if (modalType === 'examiners') {
        const nominationData = {
          student_id: selectedStudent.id,
          examiner1_id: formData.examiner1 || null,
          examiner2_id: formData.examiner2 || null,
          examiner3_id: formData.examiner3 || null,
          examiner1_name: formData.examiner1Name,
          examiner1_email: formData.examiner1Email,
          examiner1_university: formData.examiner1University,
          examiner2_name: formData.examiner2Name,
          examiner2_email: formData.examiner2Email,
          examiner2_university: formData.examiner2University,
        };

        // Check if nomination already exists for this student
        const existingNomination = nominations.find(nom => nom.student.id === selectedStudent.id);
        
        let result;
        if (existingNomination) {
          result = await updateNomination(existingNomination.id, nominationData);
        } else {
          result = await createNomination(nominationData);
        }

        if (result.success) {
          alert('Examiners nominated successfully!');
          closeModal();
        } else {
          alert('Error nominating examiners: ' + result.error);
        }
      } else if (modalType === 'postponement') {
        const postponementData = {
          student_id: selectedStudent.id,
          reason: formData.postponementReason,
          type: formData.postponementType,
          requested_date: formData.postponementDate,
          comments: formData.comments,
          approved: false
        };

        const result = await createPostponement(postponementData);
        if (result.success) {
          alert('Postponement request submitted successfully!');
          closeModal();
        } else {
          alert('Error submitting postponement: ' + result.error);
        }
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const filteredStudents = supervisorStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.research_title && student.research_title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (studentsLoading || lecturersLoading || nominationsLoading || postponementsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-burgundy-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  if (studentsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading data: {studentsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-burgundy-700 mr-3" />
              <h1 className="text-2xl font-bold text-burgundy-700">FSES - Supervisor Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <User size={20} />
                <span>Welcome, {user?.username}</span>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-burgundy-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentPage('students')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                currentPage === 'students'
                  ? 'border-white text-white'
                  : 'border-transparent text-burgundy-200 hover:text-white hover:border-burgundy-300'
              }`}
            >
              <Users className="inline mr-2" size={20} />
              My Students
            </button>
            <button
              onClick={() => setCurrentPage('postponements')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                currentPage === 'postponements'
                  ? 'border-white text-white'
                  : 'border-transparent text-burgundy-200 hover:text-white hover:border-burgundy-300'
              }`}
            >
              <Clock className="inline mr-2" size={20} />
              Postponement Requests
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {currentPage === 'students' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">My Students</h2>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-burgundy-500"
                />
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Research Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => {
                    const studentNomination = nominations.find(nom => nom.student.id === student.id);
                    const hasNomination = !!studentNomination;
                    const hasTitle = !!(student.research_title && student.research_title.trim());
                    
                    return (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">
                              {student.department?.name || student.department}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.program}</div>
                          <div className="text-sm text-gray-500">{student.evaluation_type}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {student.research_title || 'Not submitted'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            hasNomination && hasTitle
                              ? 'bg-green-100 text-green-800'
                              : hasTitle
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {hasNomination && hasTitle
                              ? 'Ready for Evaluation'
                              : hasTitle
                              ? 'Title Submitted'
                              : 'Pending Title'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => openModal('title', student)}
                            className="text-burgundy-600 hover:text-burgundy-900"
                          >
                            <Edit size={16} className="inline mr-1" />
                            {hasTitle ? 'Edit Title' : 'Submit Title'}
                          </button>
                          <button
                            onClick={() => openModal('examiners', student)}
                            className="text-blue-600 hover:text-blue-900"
                            disabled={!hasTitle}
                          >
                            <Users size={16} className="inline mr-1" />
                            {hasNomination ? 'Edit Examiners' : 'Nominate Examiners'}
                          </button>
                          <button
                            onClick={() => openModal('postponement', student)}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            <Calendar size={16} className="inline mr-1" />
                            Request Postponement
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentPage === 'postponements' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Postponement Requests</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {postponements.map((postponement) => (
                    <tr key={postponement.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {postponement.student.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {postponement.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{postponement.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(postponement.requested_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          postponement.approved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {postponement.approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {modalType === 'title' && 'Submit/Edit Research Title'}
                {modalType === 'examiners' && 'Nominate Examiners'}
                {modalType === 'postponement' && 'Request Postponement'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {modalType === 'title' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Research Title
                    </label>
                    <textarea
                      value={formData.researchTitle}
                      onChange={(e) => setFormData({...formData, researchTitle: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-burgundy-500"
                      rows="3"
                      required
                    />
                  </div>
                )}

                {modalType === 'examiners' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Examiner 1 (Internal)
                      </label>
                      <select
                        value={formData.examiner1}
                        onChange={(e) => setFormData({...formData, examiner1: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-burgundy-500"
                      >
                        <option value="">Select Internal Examiner</option>
                        {examiners.filter(e => e.type === 'internal').map(examiner => (
                          <option key={examiner.id} value={examiner.id}>
                            {examiner.name} - {examiner.department}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Examiner 2 (Internal)
                      </label>
                      <select
                        value={formData.examiner2}
                        onChange={(e) => setFormData({...formData, examiner2: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-burgundy-500"
                      >
                        <option value="">Select Internal Examiner</option>
                        {examiners.filter(e => e.type === 'internal' && e.id !== parseInt(formData.examiner1)).map(examiner => (
                          <option key={examiner.id} value={examiner.id}>
                            {examiner.name} - {examiner.department}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">External Examiner Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={formData.examiner1Name}
                            onChange={(e) => setFormData({...formData, examiner1Name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-burgundy-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={formData.examiner1Email}
                            onChange={(e) => setFormData({...formData, examiner1Email: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-burgundy-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            University
                          </label>
                          <input
                            type="text"
                            value={formData.examiner1University}
                            onChange={(e) => setFormData({...formData, examiner1University: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-burgundy-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {modalType === 'postponement' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Postponement
                      </label>
                      <textarea
                        value={formData.postponementReason}
                        onChange={(e) => setFormData({...formData, postponementReason: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-burgundy-500"
                        rows="3"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <select
                        value={formData.postponementType}
                        onChange={(e) => setFormData({...formData, postponementType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-burgundy-500"
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="MEDICAL">Medical</option>
                        <option value="PERSONAL">Personal</option>
                        <option value="ACADEMIC">Academic</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Requested Date
                      </label>
                      <input
                        type="date"
                        value={formData.postponementDate}
                        onChange={(e) => setFormData({...formData, postponementDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-burgundy-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Comments
                      </label>
                      <textarea
                        value={formData.comments}
                        onChange={(e) => setFormData({...formData, comments: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-burgundy-500"
                        rows="2"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-burgundy-700 rounded-md hover:bg-burgundy-800"
                  >
                    {modalType === 'title' ? 'Save Title' : 
                     modalType === 'examiners' ? 'Submit Nomination' : 
                     'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Custom styles for UTM burgundy color
const style = document.createElement('style');
document.head.appendChild(style);
style.sheet.insertRule(`
  .text-burgundy-700 {
    color: #8E2246;
  }
`);
style.sheet.insertRule(`
  .bg-burgundy-700 {
    background-color: #8E2246;
  }
`);
style.sheet.insertRule(`
  .bg-burgundy-800 {
    background-color: #7D1D3F;
  }
`);
style.sheet.insertRule(`
  .hover\\:bg-burgundy-800:hover {
    background-color: #7D1D3F;
  }
`);
style.sheet.insertRule(`
  .border-burgundy-500 {
    border-color: #A52A5A;
  }
`);
style.sheet.insertRule(`
  .focus\\:ring-burgundy-500:focus {
    --tw-ring-color: rgba(165, 42, 90, 0.5);
  }
`);

export default Supervisor;