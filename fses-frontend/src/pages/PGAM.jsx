import { useState, useEffect } from 'react';
import { User, BarChart3, BookOpen, Users, Calendar, Eye, Download, Filter, Search, LogOut, Edit, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';
import { useStudents } from '../hooks/useStudents';
import { useLecturers } from '../hooks/useLecturers';
import { useDepartments } from '../hooks/useDepartments';
import { useNominations } from '../hooks/useNominations';
import { usePostponements } from '../hooks/usePostponements';

const PGAM = () => {
  const [currentPage, setCurrentPage] = useState('overview');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const [editingStudent, setEditingStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  // Use hooks to get data from backend
  const { students, loading: studentsLoading, error: studentsError, updateStudent } = useStudents();
  const { lecturers } = useLecturers();
  const { departments } = useDepartments();
  const { nominations, updateNomination } = useNominations();
  const { postponements, updatePostponement } = usePostponements();

  // Enrich students data with nomination and department information
  const allStudents = students.map(student => {
    const nomination = nominations.find(nom => nom.student.id === student.id);
    const department = departments.find(dept => dept.id === (
      typeof student.department === 'object' ? student.department.id : student.department
    ));
    const studentPostponements = postponements.filter(post => post.student.id === student.id);
    
    // Find coordinator for department (this would need to be added to the backend data)
    const coordinator = lecturers.find(lec => 
      lec.department && typeof lec.department === 'object' 
        ? lec.department.id === department?.id 
        : lec.department === department?.id
    );
    
    return {
      ...student,
      department: department?.name || student.department?.name || student.department,
      departmentId: department?.id,
      mainSupervisor: typeof student.supervisor === 'object' ? student.supervisor.name : student.supervisor,
      coSupervisor: '', // This field may need to be added to Student model
      examiner1: nomination?.examiner1?.name || nomination?.examiner1_name || '',
      examiner2: nomination?.examiner2?.name || nomination?.examiner2_name || '',
      examiner3: nomination?.examiner3?.name || nomination?.examiner3_name || '',
      chairperson: nomination?.chairperson || '', // This field may need to be added to Nomination model
      status: nomination?.chairperson ? 'Chair Assigned' : 
              nomination ? 'Examiners Nominated' : 
              student.research_title ? 'Title Submitted' : 'Pending Title',
      coordinator: coordinator?.name || 'Not Assigned',
      postponements: studentPostponements,
      nomination: nomination
    };
  });

  // Department statistics
  const departmentStats = departments.map(dept => {
    const deptStudents = allStudents.filter(s => s.departmentId === dept.id);
    return {
      name: dept.name,
      total: deptStudents.length,
      chairAssigned: deptStudents.filter(s => s.chairperson).length,
      examinersNominated: deptStudents.filter(s => s.examiner1).length,
      titleSubmitted: deptStudents.filter(s => s.research_title).length,
      pending: deptStudents.filter(s => !s.research_title).length
    };
  });

  // Program statistics
  const programStats = {
    PhD: allStudents.filter(s => s.program === 'PHD' || s.program === 'PhD').length,
    MPhil: allStudents.filter(s => s.program === 'MPHIL' || s.program === 'MPhil').length,
    DSE: allStudents.filter(s => s.program === 'DSE').length
  };

  // Filter logic
  const filteredStudents = allStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.research_title && student.research_title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = filterDepartment === 'all' || student.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setModalType('edit');
    setShowModal(true);
  };

  const handleSaveEdit = async () => {
    if (editingStudent) {
      try {
        const result = await updateStudent(editingStudent.id, {
          research_title: editingStudent.research_title,
          program: editingStudent.program,
          evaluation_type: editingStudent.evaluation_type
        });
        
        if (result.success) {
          alert('Student information updated successfully!');
          setShowModal(false);
          setEditingStudent(null);
        } else {
          alert('Error updating student: ' + result.error);
        }
      } catch (error) {
        console.error('Error updating student:', error);
        alert('Error updating student. Please try again.');
      }
    }
  };

  const handleApprovePostponement = async (postponementId, approved) => {
    try {
      const postponement = postponements.find(p => p.id === postponementId);
      if (postponement) {
        const result = await updatePostponement(postponementId, {
          ...postponement,
          approved: approved
        });
        
        if (result.success) {
          alert(`Postponement ${approved ? 'approved' : 'rejected'} successfully!`);
        } else {
          alert('Error updating postponement: ' + result.error);
        }
      }
    } catch (error) {
      console.error('Error updating postponement:', error);
      alert('Error updating postponement. Please try again.');
    }
  };

  if (studentsLoading) {
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
              <h1 className="text-2xl font-bold text-burgundy-700">FSES - PGAM Dashboard</h1>
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
              onClick={() => setCurrentPage('overview')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                currentPage === 'overview'
                  ? 'border-white text-white'
                  : 'border-transparent text-burgundy-200 hover:text-white hover:border-burgundy-300'
              }`}
            >
              <BarChart3 className="inline mr-2" size={20} />
              Overview
            </button>
            <button
              onClick={() => setCurrentPage('students')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                currentPage === 'students'
                  ? 'border-white text-white'
                  : 'border-transparent text-burgundy-200 hover:text-white hover:border-burgundy-300'
              }`}
            >
              <Users className="inline mr-2" size={20} />
              All Students
            </button>
            <button
              onClick={() => setCurrentPage('departments')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                currentPage === 'departments'
                  ? 'border-white text-white'
                  : 'border-transparent text-burgundy-200 hover:text-white hover:border-burgundy-300'
              }`}
            >
              <BookOpen className="inline mr-2" size={20} />
              Departments
            </button>
            <button
              onClick={() => setCurrentPage('postponements')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                currentPage === 'postponements'
                  ? 'border-white text-white'
                  : 'border-transparent text-burgundy-200 hover:text-white hover:border-burgundy-300'
              }`}
            >
              <Calendar className="inline mr-2" size={20} />
              Postponements
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {currentPage === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">University Overview</h2>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Students</p>
                    <p className="text-2xl font-semibold text-gray-900">{allStudents.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Departments</p>
                    <p className="text-2xl font-semibold text-gray-900">{departments.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending Evaluations</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {allStudents.filter(s => !s.chairperson).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <User className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Postponements</p>
                    <p className="text-2xl font-semibold text-gray-900">{postponements.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Program Distribution */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Program Distribution</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{programStats.PhD}</div>
                  <div className="text-sm text-gray-500">PhD Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{programStats.MPhil}</div>
                  <div className="text-sm text-gray-500">MPhil Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{programStats.DSE}</div>
                  <div className="text-sm text-gray-500">DSE Students</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'students' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">All Students</h2>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
                <Download size={20} />
                <span>Export Report</span>
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:border-burgundy-500"
                  />
                </div>
              </div>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-burgundy-500"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
            </div>

            {/* Students Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program & Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supervisors
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coordinator
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.id}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {student.research_title || 'No title submitted'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.program}</div>
                        <div className="text-sm text-gray-500">{student.department}</div>
                        <div className="text-sm text-gray-500">{student.evaluation_type}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">Main: {student.mainSupervisor}</div>
                        {student.coSupervisor && (
                          <div className="text-sm text-gray-500">Co: {student.coSupervisor}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          student.chairperson ? 'bg-green-100 text-green-800' :
                          student.examiner1 ? 'bg-yellow-100 text-yellow-800' :
                          student.research_title ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.coordinator}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="text-burgundy-600 hover:text-burgundy-900"
                        >
                          <Edit size={16} className="inline mr-1" />
                          Edit
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye size={16} className="inline mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentPage === 'departments' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Department Statistics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {departmentStats.map((dept) => (
                <div key={dept.name} className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{dept.name}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Total Students:</span>
                      <span className="text-sm font-medium text-gray-900">{dept.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Chair Assigned:</span>
                      <span className="text-sm font-medium text-green-600">{dept.chairAssigned}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Examiners Nominated:</span>
                      <span className="text-sm font-medium text-yellow-600">{dept.examinersNominated}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Title Submitted:</span>
                      <span className="text-sm font-medium text-blue-600">{dept.titleSubmitted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Pending:</span>
                      <span className="text-sm font-medium text-red-600">{dept.pending}</span>
                    </div>
                  </div>
                  <div className="mt-4 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(dept.chairAssigned / dept.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {dept.total > 0 ? Math.round((dept.chairAssigned / dept.total) * 100) : 0}% Complete
                  </div>
                </div>
              ))}
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
                      Department
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {postponement.student.department?.name || postponement.student.department}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {postponement.reason}
                        </div>
                        {postponement.comments && (
                          <div className="text-xs text-gray-500 mt-1">
                            {postponement.comments}
                          </div>
                        )}
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
                          postponement.approved === true ? 'bg-green-100 text-green-800' :
                          postponement.approved === false ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {postponement.approved === true ? 'Approved' :
                           postponement.approved === false ? 'Rejected' :
                           'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {postponement.approved === null && (
                          <>
                            <button
                              onClick={() => handleApprovePostponement(postponement.id, true)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleApprovePostponement(postponement.id, false)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Edit Student Modal */}
      {showModal && modalType === 'edit' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit Student: {editingStudent?.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Research Title
                  </label>
                  <textarea
                    value={editingStudent?.research_title || ''}
                    onChange={(e) => setEditingStudent({...editingStudent, research_title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-burgundy-500"
                    rows="3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program
                  </label>
                  <select
                    value={editingStudent?.program || ''}
                    onChange={(e) => setEditingStudent({...editingStudent, program: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-burgundy-500"
                  >
                    <option value="PHD">PhD</option>
                    <option value="MPHIL">MPhil</option>
                    <option value="DSE">DSE</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Evaluation Type
                  </label>
                  <select
                    value={editingStudent?.evaluation_type || ''}
                    onChange={(e) => setEditingStudent({...editingStudent, evaluation_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-burgundy-500"
                  >
                    <option value="FIRST_EVALUATION">First Evaluation</option>
                    <option value="RE_EVALUATION">Re-Evaluation</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 text-sm font-medium text-white bg-burgundy-700 rounded-md hover:bg-burgundy-800"
                >
                  Save Changes
                </button>
              </div>
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