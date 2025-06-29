import { useState, useEffect } from 'react';
import { User, Users, BookOpen, Settings, Download, Lock, BarChart3, Calendar, Edit3, Check, X, Search } from 'lucide-react';
import LogoutButton from '../components/LogoutButton';
import { useAuth } from '../contexts/AuthContext';
import { useStudents } from '../hooks/useStudents';
import { useLecturers } from '../hooks/useLecturers';
import { useNominations } from '../hooks/useNominations';
import { usePostponements } from '../hooks/usePostponements';

const ProgramCoordinator = () => {
  const [currentPage, setCurrentPage] = useState('students');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);
  const [lockedStatus, setLockedStatus] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProgram, setFilterProgram] = useState('all');
  const { user } = useAuth();

  // Use hooks to get data from backend
  const { students, loading: studentsLoading, error: studentsError, updateStudent } = useStudents();
  const { lecturers } = useLecturers();
  const { nominations, updateNomination } = useNominations();
  const { postponements, updatePostponement } = usePostponements();

  // Available chairpersons - Based on real data from Excel
  const chairpersons = [
    'PM DR. ROZANA ZAKARIA',
    'PM DR. WAN NORMEZA BINTI WAN ZAKARIA',
    'PROF. Ts. DR. KHAIRUR RIJAL BIN JAMALUDIN',
    'PM Sr DR. SITI UZAIRIAH BINTI MOHD TOBI',
    'PM DR. RUDZIDATUL AKMAM BT DZIYAUDDIN',
    'PM Ts. DR. ROSLINA BINTI MOHAMMAD',
    'PM Ts. DR. MOHD KHAIRI BIN ABU HUSSAIN',
    'PROF. DR. AHMAD KAMIL MAHMOOD',
    'PM DR. NURULHUDA FIRDAUS BINTI MOHD. AZMI',
    'DR. RAHMAN KASSIM'
  ];

  // Enrich students data with nomination information
  const enrichedStudents = students.map(student => {
    const nomination = nominations.find(nom => nom.student.id === student.id);
    const studentPostponements = postponements.filter(post => post.student.id === student.id);
    
    return {
      ...student,
      examiner1: nomination?.examiner1?.name || nomination?.examiner1_name || '',
      examiner2: nomination?.examiner2?.name || nomination?.examiner2_name || '',
      examiner3: nomination?.examiner3?.name || nomination?.examiner3_name || '',
      chairperson: nomination?.chairperson || '', // This field may need to be added to Nomination model
      status: nomination ? 'Examiners Nominated' : (student.research_title ? 'Title Submitted' : 'Pending Title'),
      postponements: studentPostponements,
      nomination: nomination
    };
  });

  // Filter students for program coordinator's department (this would need to be handled by backend filtering)
  const departmentStudents = enrichedStudents;

  // Modal handlers
  const handleAssignChair = (student) => {
    setEditingStudent(student);
    setModalType('assign');
    setShowModal(true);
  };

  const handleAutoAssign = async () => {
    try {
      // Auto-assignment logic
      for (const student of departmentStudents) {
        if (!student.chairperson && student.nomination) {
          // Simple auto-assignment logic - assign available chairperson
          const assignedChairs = departmentStudents
            .filter(s => s.chairperson)
            .map(s => s.chairperson);
          
          const availableChairs = chairpersons.filter(chair => 
            !assignedChairs.includes(chair)
          );
          
          if (availableChairs.length > 0) {
            // Update the nomination with chairperson
            const updatedNominationData = {
              ...student.nomination,
              chairperson: availableChairs[0] // This field may need to be added to backend
            };
            
            await updateNomination(student.nomination.id, updatedNominationData);
          }
        }
      }
      alert('Auto-assignment completed!');
    } catch (error) {
      console.error('Error in auto-assignment:', error);
      alert('Error in auto-assignment. Please try again.');
    }
  };

  const handleSubmitAssignment = async (studentId, chairperson) => {
    try {
      const student = departmentStudents.find(s => s.id === studentId);
      if (student && student.nomination) {
        const updatedNominationData = {
          ...student.nomination,
          chairperson: chairperson // This field may need to be added to backend
        };
        
        const result = await updateNomination(student.nomination.id, updatedNominationData);
        if (result.success) {
          alert('Chairperson assigned successfully!');
          setShowModal(false);
          setEditingStudent(null);
        } else {
          alert('Error assigning chairperson: ' + result.error);
        }
      }
    } catch (error) {
      console.error('Error assigning chairperson:', error);
      alert('Error assigning chairperson. Please try again.');
    }
  };

  const handleLockNominations = () => {
    setLockedStatus(true);
    alert('Nominations have been locked. Supervisors can no longer make changes.');
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

  // Filter logic
  const filteredStudents = departmentStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.research_title && student.research_title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || student.status.toLowerCase().includes(filterStatus.toLowerCase());
    const matchesProgram = filterProgram === 'all' || student.program === filterProgram;
    
    return matchesSearch && matchesStatus && matchesProgram;
  });

  const uniquePrograms = [...new Set(students.map(s => s.program))];

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
              <h1 className="text-2xl font-bold text-burgundy-700">FSES - Program Coordinator</h1>
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
              Student Management
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
              Postponement Requests
            </button>
            <button
              onClick={() => setCurrentPage('reports')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                currentPage === 'reports'
                  ? 'border-white text-white'
                  : 'border-transparent text-burgundy-200 hover:text-white hover:border-burgundy-300'
              }`}
            >
              <BarChart3 className="inline mr-2" size={20} />
              Reports
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {currentPage === 'students' && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
              <div className="flex space-x-3">
                <button
                  onClick={handleAutoAssign}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  disabled={lockedStatus}
                >
                  <Settings size={20} />
                  <span>Auto-Assign Chairs</span>
                </button>
                <button
                  onClick={handleLockNominations}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
                  disabled={lockedStatus}
                >
                  <Lock size={20} />
                  <span>{lockedStatus ? 'Nominations Locked' : 'Lock Nominations'}</span>
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
                  <Download size={20} />
                  <span>Export List</span>
                </button>
              </div>
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-burgundy-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Title</option>
                <option value="title">Title Submitted</option>
                <option value="nominated">Examiners Nominated</option>
                <option value="assigned">Chair Assigned</option>
              </select>
              <select
                value={filterProgram}
                onChange={(e) => setFilterProgram(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-burgundy-500"
              >
                <option value="all">All Programs</option>
                {uniquePrograms.map(program => (
                  <option key={program} value={program}>{program}</option>
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
                      Program Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Examiners
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chairperson
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
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
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
                        <div className="text-sm text-gray-500">{student.evaluation_type}</div>
                        <div className="text-sm text-gray-500">
                          Supervisor: {typeof student.supervisor === 'object' ? student.supervisor.name : student.supervisor}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs space-y-1">
                          <div>Ex1: {student.examiner1 || 'Not assigned'}</div>
                          <div>Ex2: {student.examiner2 || 'Not assigned'}</div>
                          <div>Ex3: {student.examiner3 || 'Not assigned'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {student.chairperson || 'Not assigned'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          student.chairperson ? 'bg-green-100 text-green-800' :
                          student.examiner1 ? 'bg-yellow-100 text-yellow-800' :
                          student.research_title ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {student.chairperson ? 'Chair Assigned' :
                           student.examiner1 ? 'Examiners Nominated' :
                           student.research_title ? 'Title Submitted' :
                           'Pending Title'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {student.examiner1 && !student.chairperson && (
                          <button
                            onClick={() => handleAssignChair(student)}
                            className="text-burgundy-600 hover:text-burgundy-900 mr-3"
                            disabled={lockedStatus}
                          >
                            <Edit3 size={16} className="inline mr-1" />
                            Assign Chair
                          </button>
                        )}
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
                              <Check size={16} className="inline mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleApprovePostponement(postponement.id, false)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <X size={16} className="inline mr-1" />
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

        {currentPage === 'reports' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Students</p>
                    <p className="text-2xl font-semibold text-gray-900">{students.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Chair Assigned</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {enrichedStudents.filter(s => s.chairperson).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending Title</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {students.filter(s => !s.research_title).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Postponements</p>
                    <p className="text-2xl font-semibold text-gray-900">{postponements.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Assignment Modal */}
      {showModal && modalType === 'assign' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Assign Chairperson for {editingStudent?.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Chairperson
                  </label>
                  <select
                    defaultValue={editingStudent?.chairperson || ''}
                    onChange={(e) => setEditingStudent({...editingStudent, chairperson: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-burgundy-500"
                  >
                    <option value="">Select Chairperson</option>
                    {chairpersons.map(chair => (
                      <option key={chair} value={chair}>{chair}</option>
                    ))}
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
                  onClick={() => handleSubmitAssignment(editingStudent.id, editingStudent.chairperson)}
                  className="px-4 py-2 text-sm font-medium text-white bg-burgundy-700 rounded-md hover:bg-burgundy-800"
                  disabled={!editingStudent?.chairperson}
                >
                  Assign Chairperson
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
style.sheet.insertRule(`
  .bg-burgundy-100 {
    background-color: #fdf2f8;
  }
`);
style.sheet.insertRule(`
  .hover\\:bg-burgundy-200:hover {
    background-color: #fce7f3;
    .uppercase-text {
    text-transform: uppercase;
  }
`);

export default ProgramCoordinator;