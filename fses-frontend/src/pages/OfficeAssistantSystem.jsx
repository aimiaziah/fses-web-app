import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Users, GraduationCap, User, Download, Filter, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useStudents } from '../hooks/useStudents';
import { useLecturers } from '../hooks/useLecturers';
import { useDepartments } from '../hooks/useDepartments';
import { useAuth } from '../contexts/AuthContext';
import LogoutButton from '../components/LogoutButton';

const OfficeAssistantSystem = () => {
  const [currentTab, setCurrentTab] = useState('students');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { students, loading: studentsLoading, error: studentsError, createStudent, updateStudent, deleteStudent } = useStudents();
  const { lecturers, loading: lecturersLoading, error: lecturersError, createLecturer, updateLecturer, deleteLecturer } = useLecturers();
  const { departments, loading: departmentsLoading } = useDepartments();
  const { user } = useAuth();
  
  
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    supervisor: '',
    co_supervisor: '',
    program: '',
    evaluation_type: '',
    university: '',
    research_title: '',
  });

  const programs = ['PHD', 'MPHIL', 'DSE'];
  const evaluationTypes = ['FIRST_EVALUATION', 'RE_EVALUATION'];
  const lecturerTitles = [
    { value: 1, label: 'Professor' },
    { value: 2, label: 'Associate Professor' },
    { value: 3, label: 'Doctor' }
  ];

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedStudent(item);
    if (item) {
      setFormData({
        name: item.name || '',
        department: item.department || '',
        supervisor: item.supervisor || '',
        co_supervisor: item.co_supervisor || '',
        program: item.program || '',
        evaluation_type: item.evaluation_type || '',
        university: item.university || '',
        research_title: item.research_title || '',
      });
    } else {
      setFormData({
        name: '',
        department: '',
        supervisor: '',
        co_supervisor: '',
        program: '',
        evaluation_type: '',
        university: '',
        research_title: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
    setFormData({
      name: '',
      department: '',
      supervisor: '',
      co_supervisor: '',
      program: '',
      evaluation_type: '',
      university: '',
      research_title: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Format the data properly before sending
      const dataToSend = {
        ...formData,
        // Convert string IDs to numbers where needed
        department: parseInt(formData.department),
        supervisor: formData.supervisor ? parseInt(formData.supervisor) : null,
        // Convert co-supervisors array of strings to array of numbers
        co_supervisor: formData.co_supervisor ? parseInt(formData.co_supervisor) : null,
      };
      
      let result;
      if (modalType === 'student') {
        if (selectedStudent) {
          result = await updateStudent(selectedStudent.id, dataToSend);
        } else {
          result = await createStudent(dataToSend);
        }
      } else if (modalType === 'lecturer') {
        if (selectedStudent) {
          result = await updateLecturer(selectedStudent.id, dataToSend);
        } else {
          result = await createLecturer(dataToSend);
        }
      }

      if (result.success) {
        closeModal();
      } else {
        // More detailed error message
        alert(`Error: ${result.error || 'Unknown error occurred'}`);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      alert(`An error occurred: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (type, id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      let result;
      if (type === 'student') {
        result = await deleteStudent(id);
      } else if (type === 'lecturer') {
        result = await deleteLecturer(id);
      }

      if (!result.success) {
        alert(result.error);
      }
    }
  };

  const filteredStudents = students.filter((student) => {
    const lowerSearch = searchTerm.toLowerCase();

    const departmentName = departments.find(
      (dept) => dept.id === student.department
    )?.name?.toLowerCase();

    const supervisorName = lecturers.find(
      (sup) => sup.id === student.supervisor
    )?.name?.toLowerCase(); // Only if you also have a supervisors list

    return (
      student.name?.toLowerCase().includes(lowerSearch) ||
      departmentName?.includes(lowerSearch) ||
      supervisorName?.includes(lowerSearch)
   );
});

  const filteredLecturers = lecturers.filter(lecturer => {
    const lowerSearch = searchTerm.toLowerCase();

    const nameMatch = lecturer.name?.toLowerCase().includes(lowerSearch);

    const departmentName = departments.find(dep => dep.id === lecturer.department)?.name || '';
    const departmentMatch = departmentName.toLowerCase().includes(lowerSearch);

    const universityMatch =
      typeof lecturer.university === 'string' &&
      lecturer.university.toLowerCase().includes(lowerSearch);

    return nameMatch || departmentMatch || universityMatch;
  });

  const StudentManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-burgundy-700">Student Management</h2>
        <button
          onClick={() => openModal('student')}
          className="bg-burgundy-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-burgundy-800"
        >
          <Plus size={20} />
          <span>Add Student</span>
        </button>
      </div>

      {studentsError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {studentsError}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:border-burgundy-500"
            />
          </div>
        </div>

        {studentsLoading ? (
          <div className="p-8 text-center">Loading students...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supervisor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evaluation Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {departments.find(dep => dep.id === student.department)?.name || student.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lecturers.find(lect => lect.id === student.supervisor)?.name || student.supervisor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{student.program}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{student.evaluation_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal('student', student)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete('student', student.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const LecturerManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-burgundy-700">Lecturer Management</h2>
        <button
          onClick={() => openModal('lecturer')}
          className="bg-burgundy-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-burgundy-800"
        >
          <Plus size={20} />
          <span>Add Lecturer</span>
        </button>
      </div>

      {lecturersError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {lecturersError}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search lecturers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:border-burgundy-500"
            />
          </div>
        </div>

        {lecturersLoading ? (
          <div className="p-8 text-center">Loading lecturers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLecturers.map((lecturer) => (
                  <tr key={lecturer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{lecturer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lecturerTitles.find(t => t.value === lecturer.title)?.label || lecturer.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {departments.find(dep => dep.id === lecturer.department)?.name || lecturer.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{lecturer.university}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal('lecturer', lecturer)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete('lecturer', lecturer.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const Modal = () => (
    showModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <h3 className="text-lg font-semibold mb-4">
            {selectedStudent ? 'Edit' : 'Add'} {modalType === 'student' ? 'Student' : 'Lecturer'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
                required
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            {modalType === 'student' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor</label>
                  <select
                    value={formData.supervisor}
                    onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
                  >
                    <option value="">Select Supervisor</option>
                    {lecturers.map(lecturer => (
                      <option key={lecturer.id} value={lecturer.id}>{lecturer.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Co-Supervisor</label>
                  <select
                    value={formData.co_supervisor}
                    onChange={(e) => setFormData({ ...formData, co_supervisor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
                  >
                    <option value="">Select Co-Supervisor</option>
                    {lecturers.map(lecturer => (
                      <option key={lecturer.id} value={lecturer.id}>{lecturer.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                  <select
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
                    required
                  >
                    <option value="">Select Program</option>
                    {programs.map(program => (
                      <option key={program} value={program}>{program}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Evaluation Type</label>
                  <select
                    value={formData.evaluation_type}
                    onChange={(e) => setFormData({ ...formData, evaluation_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
                    required
                  >
                    <option value="">Select Evaluation Type</option>
                    {evaluationTypes.map(type => (
                      <option key={type} value={type}>{type.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <select
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
                    required
                  >
                    <option value="">Select Title</option>
                    {lecturerTitles.map(title => (
                      <option key={title.value} value={title.value}>{title.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                  <input
                    type="text"
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
                    required
                  />
                </div>
              </>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-burgundy-700 text-white rounded-md hover:bg-burgundy-800"
              >
                {selectedStudent ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-burgundy-700 flex items-center justify-center">
                <div className="text-yellow-400 text-sm font-bold">UTM</div>
              </div>
              <h1 className="ml-3 text-xl font-bold text-burgundy-700">Office Assistant Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user?.username || 'Office Staff'}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setCurrentTab('students')}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                currentTab === 'students'
                  ? 'border-burgundy-500 text-burgundy-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <GraduationCap size={16} />
              <span>Students</span>
            </button>
            <button
              onClick={() => setCurrentTab('lecturers')}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                currentTab === 'lecturers'
                  ? 'border-burgundy-500 text-burgundy-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users size={16} />
              <span>Lecturers</span>
            </button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'students' ? <StudentManagement /> : <LecturerManagement />}
      </div>

      <Modal />
    </div>
  );
};

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
  .text-burgundy-600 {
    color: #A52A5A;
  }
`);
style.sheet.insertRule(`
  .focus\\:ring-burgundy-500:focus {
    --tw-ring-color: rgba(165, 42, 90, 0.5);
  }
`);

export default OfficeAssistantSystem;