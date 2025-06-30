import { useState, useEffect } from 'react';
import { User, BarChart3, BookOpen, Users, Calendar, Eye, Download, Filter, Search, LogOut, Edit, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';
import { useStudents } from '../hooks/useStudents';
import { useLecturers } from '../hooks/useLecturers';
import { useNominations } from '../hooks/useNominations';
import { useDepartments } from '../hooks/useDepartments';

const PGAM = () => {
  const [currentPage, setCurrentPage] = useState('overview');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const [editingStudent, setEditingStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  // Use hooks to get data from backend
  const { students, loading: studentsLoading } = useStudents();
  const { lecturers } = useLecturers();
  const { nominations, updateNomination } = useNominations();
  const { departments } = useDepartments();

  // Available examiners and chairpersons
  const availableExaminers = lecturers.filter(l => l.university === 'UTM').map(l => l.name.toUpperCase());
  const availableChairpersons = lecturers.filter(l => l.university === 'UTM' && l.title === 1).map(l => l.name.toUpperCase());

  // Process students data with nominations
  const allStudents = students.map(student => {
    const nomination = nominations.find(nom => nom.student && nom.student.id === student.id);
    
    const supervisorName = typeof student.supervisor === 'object' 
      ? student.supervisor.name 
      : lecturers.find(l => l.id === student.supervisor)?.name || '';
    
    const coSupervisorName = typeof student.co_supervisor === 'object'
      ? student.co_supervisor?.name || ''
      : lecturers.find(l => l.id === student.co_supervisor)?.name || '';
    
    const departmentInfo = typeof student.department === 'object'
      ? student.department
      : departments.find(d => d.id === student.department) || {};
    
    return {
      id: student.id,
      name: student.name?.toUpperCase() || '',
      matrikNo: student.matrik_no || `STD${student.id}`,
      program: student.program || '',
      department: departmentInfo.name || departmentInfo.code || 'N/A',
      evaluationType: student.evaluation_type === 'FIRST_EVALUATION' ? 'First Evaluation' : 'Re-Evaluation',
      semester: student.semester || 1,
      mainSupervisor: supervisorName.toUpperCase(),
      coSupervisor: coSupervisorName.toUpperCase(),
      researchTitle: student.research_title?.toUpperCase() || '',
      examiner1: nomination?.examiner1?.name?.toUpperCase() || '',
      examiner2: nomination?.examiner2?.name?.toUpperCase() || '',
      examiner3: nomination?.examiner3?.name?.toUpperCase() || '',
      chairperson: nomination?.chairperson?.toUpperCase() || '',
      status: nomination ? (nomination.chairperson ? 'Chair Assigned' : 'Pending Chair Assignment') : 'Pending Examiner Nomination',
      coordinator: 'PROGRAM COORDINATOR' // This could be enhanced to show actual coordinator
    };
  });

  // Calculate comprehensive statistics
  const stats = {
    total: allStudents.length,
    byDepartment: departments.reduce((acc, dept) => {
      acc[dept.name] = allStudents.filter(s => s.department === dept.name).length;
      return acc;
    }, {}),
    byStatus: {
      'Chair Assigned': allStudents.filter(s => s.status === 'Chair Assigned').length,
      'Pending Chair Assignment': allStudents.filter(s => s.status === 'Pending Chair Assignment').length,
      'Pending Examiner Nomination': allStudents.filter(s => s.status === 'Pending Examiner Nomination').length
    },
    byProgram: {
      'PHD': allStudents.filter(s => s.program === 'PHD').length,
      'MPHIL': allStudents.filter(s => s.program === 'MPHIL').length,
      'DSE': allStudents.filter(s => s.program === 'DSE').length
    }
  };

  // Examiner workload analysis
  const examinerWorkload = {};
  allStudents.forEach(student => {
    [student.examiner1, student.examiner2, student.examiner3].forEach(examiner => {
      if (examiner && examiner.trim()) {
        examinerWorkload[examiner] = (examinerWorkload[examiner] || 0) + 1;
      }
    });
  });

  // Chairperson workload analysis
  const chairpersonWorkload = {};
  allStudents.forEach(student => {
    if (student.chairperson && student.chairperson.trim()) {
      chairpersonWorkload[student.chairperson] = (chairpersonWorkload[student.chairperson] || 0) + 1;
    }
  });

  // Filter students based on search and department
  const filteredStudents = allStudents.filter(student => {
    const matchesDepartment = filterDepartment === 'all' || student.department === filterDepartment;
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.researchTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.mainSupervisor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDepartment && matchesSearch;
  });

  // Modal handlers for editing
  const openEditModal = (student, type) => {
    setEditingStudent({...student});
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStudent(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingStudent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    const nomination = nominations.find(nom => nom.student && nom.student.id === editingStudent.id);
    
    if (nomination) {
      const examiner1 = lecturers.find(l => l.name.toUpperCase() === editingStudent.examiner1);
      const examiner2 = lecturers.find(l => l.name.toUpperCase() === editingStudent.examiner2);
      const examiner3 = lecturers.find(l => l.name.toUpperCase() === editingStudent.examiner3);
      
      const updateData = {
        ...nomination,
        examiner1: examiner1?.id || nomination.examiner1,
        examiner2: examiner2?.id || nomination.examiner2,
        examiner3: examiner3?.id || nomination.examiner3,
        chairperson: editingStudent.chairperson
      };
      
      const result = await updateNomination(nomination.id, updateData);
      
      if (result.success) {
        closeModal();
      } else {
        alert('Failed to update: ' + result.error);
      }
    }
  };

  const OverviewPage = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Students</div>
            </div>
            <BookOpen className="h-8 w-8 text-burgundy-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.byStatus['Chair Assigned']}</div>
              <div className="text-sm text-gray-500">Chair Assigned</div>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-600">{stats.byStatus['Pending Chair Assignment']}</div>
              <div className="text-sm text-gray-500">Pending Chair</div>
            </div>
            <Calendar className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.byStatus['Pending Examiner Nomination']}</div>
              <div className="text-sm text-gray-500">No Examiners</div>
            </div>
            <Eye className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Department Statistics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Students by Department</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats.byDepartment).map(([dept, count]) => (
            <div key={dept} className="text-center">
              <div className="text-2xl font-bold text-burgundy-600">{count}</div>
              <div className="text-sm text-gray-500">{dept}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Program Distribution */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Program Distribution</h3>
        <div className="space-y-3">
          {Object.entries(stats.byProgram).map(([program, count]) => (
            <div key={program} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{program}</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className="bg-burgundy-600 h-2 rounded-full" 
                    style={{ width: `${(count / stats.total) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const StudentsPage = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-burgundy-500"
                placeholder="Search students, research titles..."
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button className="bg-burgundy-700 text-white px-4 py-2 rounded-md hover:bg-burgundy-800 flex items-center space-x-2">
              <Download size={16} />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supervisor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Research Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Examiners</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chairperson</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    <div className="text-sm text-gray-500">{student.program} - Semester {student.semester}</div>
                    <div className="text-xs text-blue-600">{student.evaluationType}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {student.department}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{student.mainSupervisor}</div>
                  {student.coSupervisor && (
                    <div className="text-xs text-gray-500">Co: {student.coSupervisor}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 line-clamp-2">{student.researchTitle}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs space-y-1">
                    <div>{student.examiner1 || <span className="text-gray-400">Pending</span>}</div>
                    <div>{student.examiner2 || <span className="text-gray-400">Pending</span>}</div>
                    <div>{student.examiner3 || <span className="text-gray-400">Pending</span>}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {student.chairperson || <span className="text-gray-400">Not Assigned</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    student.status === 'Chair Assigned'
                      ? 'bg-green-100 text-green-800'
                      : student.status === 'Pending Chair Assignment'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.coordinator}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => openEditModal(student, 'examiners')}
                    className="text-indigo-600 hover:text-indigo-900 mr-2"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => openEditModal(student, 'chairperson')}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Edit size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const WorkloadPage = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Examiner Workload */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Examiner Workload</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {Object.entries(examinerWorkload)
              .sort(([,a], [,b]) => b - a)
              .map(([examiner, count]) => (
                <div key={examiner} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-700 truncate">{examiner}</span>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full ml-2">
                    {count} session{count !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Chairperson Workload */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Chairperson Workload</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {Object.entries(chairpersonWorkload)
              .sort(([,a], [,b]) => b - a)
              .map(([chairperson, count]) => (
                <div key={chairperson} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-700 truncate">{chairperson}</span>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full ml-2">
                    {count} session{count !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Workload Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{Object.keys(examinerWorkload).length}</div>
            <div className="text-sm text-gray-500">Total Examiners</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{Object.keys(chairpersonWorkload).length}</div>
            <div className="text-sm text-gray-500">Total Chairpersons</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(Object.values(examinerWorkload).reduce((a, b) => a + b, 0) / Math.max(Object.keys(examinerWorkload).length, 1) * 100) / 100}
            </div>
            <div className="text-sm text-gray-500">Avg. Sessions per Examiner</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-burgundy-700 flex items-center justify-center">
                <div className="text-yellow-400 text-sm font-bold">UTM</div>
              </div>
              <h1 className="ml-3 text-xl font-bold text-burgundy-700">PGAM Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{user?.username || 'PGAM Admin'}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setCurrentPage('overview')}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                currentPage === 'overview'
                  ? 'border-burgundy-500 text-burgundy-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 size={16} />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setCurrentPage('students')}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                currentPage === 'students'
                  ? 'border-burgundy-500 text-burgundy-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BookOpen size={16} />
              <span>All Students</span>
            </button>
            <button
              onClick={() => setCurrentPage('workload')}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                currentPage === 'workload'
                  ? 'border-burgundy-500 text-burgundy-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users size={16} />
              <span>Workload Analysis</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {studentsLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading data...</div>
          </div>
        ) : (
          <>
            {currentPage === 'overview' && <OverviewPage />}
            {currentPage === 'students' && <StudentsPage />}
            {currentPage === 'workload' && <WorkloadPage />}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && editingStudent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {modalType === 'examiners' ? 'Edit Examiners' : 'Edit Chairperson'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Student: {editingStudent.name}</p>
              <p className="text-sm text-gray-600 mb-4">Research: {editingStudent.researchTitle}</p>
            </div>

            {modalType === 'examiners' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Examiner 1</label>
                  <select
                    name="examiner1"
                    value={editingStudent.examiner1}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
                  >
                    <option value="">Select Examiner 1</option>
                    {availableExaminers.map(examiner => (
                      <option key={`ex1-${examiner}`} value={examiner}>{examiner}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Examiner 2</label>
                  <select
                    name="examiner2"
                    value={editingStudent.examiner2}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
                  >
                    <option value="">Select Examiner 2</option>
                    {availableExaminers.map(examiner => (
                      <option key={`ex2-${examiner}`} value={examiner}>{examiner}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Examiner 3</label>
                  <select
                    name="examiner3"
                    value={editingStudent.examiner3}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
                  >
                    <option value="">Select Examiner 3</option>
                    {availableExaminers.map(examiner => (
                      <option key={`ex3-${examiner}`} value={examiner}>{examiner}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chairperson</label>
                <select
                  name="chairperson"
                  value={editingStudent.chairperson}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
                >
                  <option value="">Select Chairperson</option>
                  {availableChairpersons.map(chair => (
                    <option key={chair} value={chair}>{chair}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-burgundy-700 text-white rounded-md hover:bg-burgundy-800 flex items-center space-x-2"
              >
                <Save size={16} />
                <span>Save Changes</span>
              </button>
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
  .text-burgundy-600 {
    color: #A52A5A;
  }
`);
style.sheet.insertRule(`
  .focus\\:ring-burgundy-500:focus {
    --tw-ring-color: rgba(165, 42, 90, 0.5);
  }
`);

export default PGAM;