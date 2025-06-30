import { useState, useEffect } from 'react';
import { User, Users, BookOpen, Settings, Download, Lock, BarChart3, Calendar, Edit3, Check, X, Search } from 'lucide-react';
import LogoutButton from '../components/LogoutButton';
import { useAuth } from '../contexts/AuthContext';
import { useStudents } from '../hooks/useStudents';
import { useLecturers } from '../hooks/useLecturers';
import { useNominations } from '../hooks/useNominations';

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
    
    
    return {
      ...student,
      examiner1: nomination?.examiner1?.name || nomination?.examiner1_name || '',
      examiner2: nomination?.examiner2?.name || nomination?.examiner2_name || '',
      examiner3: nomination?.examiner3?.name || nomination?.examiner3_name || '',
      chairperson: nomination?.chairperson || '', // This field may need to be added to Nomination model
      status: nomination ? 'Examiners Nominated' : (student.research_title ? 'Title Submitted' : 'Pending Title'),
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

  const handleSubmitAssignment = (studentId, chairperson) => {
    const updatedStudents = students.map(student => 
      student.id === studentId 
        ? { ...student, chairperson, status: 'Chair Assigned' }
        : student
    );
    setStudents(updatedStudents);
    setShowModal(false);
    setEditingStudent(null);
  };

  const handleLockNominations = () => {
    setLockedStatus(true);
    alert('Nominations have been locked. Supervisors can no longer make changes.');
  };

  const handleDownloadReport = () => {
    // Create CSV content
    const csvContent = generateCSVReport();
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `First_Stage_Evaluation_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateCSVReport = () => {
    const headers = [
      'Student Name',
      'Program',
      'Semester',
      'Evaluation Type',
      'Main Supervisor',
      'Co-Supervisor',
      'Research Title',
      'Examiner 1',
      'Examiner 2', 
      'Examiner 3',
      'Chairperson',
      'Status'
    ];

    const csvRows = [headers.join(',')];

    students.forEach(student => {
      const row = [
        `"${student.name}"`,
        student.program,
        student.semester,
        `"${student.evaluationType}"`,
        `"${student.mainSupervisor}"`,
        `"${student.coSupervisor || ''}"`,
        `"${student.researchTitle}"`,
        `"${student.examiner1 || ''}"`,
        `"${student.examiner2 || ''}"`,
        `"${student.examiner3 || ''}"`,
        `"${student.chairperson || ''}"`,
        `"${student.status}"`
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  };

  // Statistics calculation with filtered data
  const filteredStudents = students.filter(student => {
    const matchesSearch = searchTerm === '' || 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.researchTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.mainSupervisor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.coSupervisor && student.coSupervisor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      student.examiner1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.examiner2.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.examiner3.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.chairperson && student.chairperson.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    const matchesProgram = filterProgram === 'all' || student.program === filterProgram;
    
    return matchesSearch && matchesStatus && matchesProgram;
  });

  const stats = {
    total: filteredStudents.length,
    pending: filteredStudents.filter(s => s.status === 'Pending Chair Assignment').length,
    assigned: filteredStudents.filter(s => s.status === 'Chair Assigned').length,
    postponed: 0 // Would be calculated from actual data
  };

  const StudentsList = () => (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Bar */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Students
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, research title, supervisor, examiner, or chairperson..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
            >
              <option value="all">All Statuses</option>
              <option value="Chair Assigned">Chair Assigned</option>
              <option value="Pending Chair Assignment">Pending Assignment</option>
            </select>
          </div>

          {/* Program Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Program
            </label>
            <select
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
            >
              <option value="all">All Programs</option>
              <option value="PhD">PhD</option>
              <option value="MPhil">MPhil</option>
              <option value="DSE">DSE</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchTerm || filterStatus !== 'all' || filterProgram !== 'all') && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredStudents.length} of {students.length} students
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterProgram('all');
              }}
              className="text-sm text-burgundy-600 hover:text-burgundy-800 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <button
            onClick={handleAutoAssign}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <Settings size={16} />
            <span>Auto Assign Chairs</span>
          </button>
          <button
            onClick={handleDownloadReport}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
          >
            <Download size={16} />
            <span>Download Report</span>
          </button>
          <button
            onClick={handleLockNominations}
            disabled={lockedStatus}
            className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
              lockedStatus 
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <Lock size={16} />
            <span>{lockedStatus ? 'Nominations Locked' : 'Lock Nominations'}</span>
          </button>
        </div>
      </div>

      {/* Results Summary */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <div className="text-gray-500">
            <Search size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-sm">Try adjusting your search terms or filters</p>
          </div>
        </div>
      ) : (
        <>
          {/* Quick Stats for Filtered Results */}
          {(searchTerm || filterStatus !== 'all' || filterProgram !== 'all') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                <div className="text-sm text-gray-600">Filtered Results</div>
                <div className="text-2xl font-bold text-gray-900">{filteredStudents.length}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                <div className="text-sm text-gray-600">Chair Assigned</div>
                <div className="text-2xl font-bold text-gray-900">{stats.assigned}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
                <div className="text-sm text-gray-600">Pending</div>
                <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
              </div>
            </div>
          )}

          {/* Students Cards Layout */}
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <div key={student.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  
                  {/* Student Info */}
                  <div className="lg:col-span-2">
                    <div className="text-sm font-semibold text-gray-900">{student.name}</div>
                    <div className="text-xs text-gray-600">{student.program} - Sem {student.semester}</div>
                    <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {student.evaluationType}
                    </span>
                  </div>

                  {/* Supervisor Info */}
                  <div className="lg:col-span-2">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Supervisor</div>
                    <div className="text-sm text-gray-900">{student.mainSupervisor}</div>
                    {student.coSupervisor && (
                      <div className="text-xs text-gray-500 mt-1">Co: {student.coSupervisor}</div>
                    )}
                  </div>

                  {/* Research Title */}
                  <div className="lg:col-span-3">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Research Title</div>
                    <div className="text-sm text-gray-900 leading-tight" title={student.researchTitle}>
                      {student.researchTitle.length > 80 ? 
                        `${student.researchTitle.substring(0, 80)}...` : 
                        student.researchTitle
                      }
                    </div>
                  </div>

                  {/* Examiners */}
                  <div className="lg:col-span-2">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Examiners</div>
                    <div className="space-y-1">
                      <div className="text-xs">
                        <span className="font-medium">1:</span> {student.examiner1 || 'Not assigned'}
                      </div>
                      <div className="text-xs">
                        <span className="font-medium">2:</span> {student.examiner2 || 'Not assigned'}
                      </div>
                      <div className="text-xs">
                        <span className="font-medium">3:</span> {student.examiner3 || 'Not assigned'}
                      </div>
                    </div>
                  </div>

                  {/* Chairperson */}
                  <div className="lg:col-span-2">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Chairperson</div>
                    {student.chairperson ? (
                      <div className="flex items-center space-x-2">
                        <Check size={14} className="text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-900">{student.chairperson}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <X size={14} className="text-red-500 flex-shrink-0" />
                        <span className="text-sm text-gray-500">Not Assigned</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="lg:col-span-1 flex justify-end">
                    <button
                      onClick={() => handleAssignChair(student)}
                      disabled={lockedStatus}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        lockedStatus 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-burgundy-100 text-burgundy-700 hover:bg-burgundy-200'
                      }`}
                    >
                      {student.chairperson ? 'Reassign' : 'Assign'}
                    </button>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    student.status === 'Chair Assigned' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {student.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const StatisticsView = () => (
    <div className="space-y-8">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="h-12 w-12 text-blue-500 opacity-80" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Assignment</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <Calendar className="h-12 w-12 text-yellow-500 opacity-80" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chair Assigned</p>
              <p className="text-3xl font-bold text-gray-900">{stats.assigned}</p>
            </div>
            <Check className="h-12 w-12 text-green-500 opacity-80" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Postponed</p>
              <p className="text-3xl font-bold text-gray-900">{stats.postponed}</p>
            </div>
            <X className="h-12 w-12 text-red-500 opacity-80" />
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Assignment Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Completion Rate</span>
              <span>{Math.round((stats.assigned / stats.total) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-500" 
                style={{ width: `${(stats.assigned / stats.total) * 100}%` }}
              ></div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Chair Assigned: {stats.assigned}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Pending: {stats.pending}</span>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Quick Actions Needed</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {stats.pending > 0 && (
                  <li>• {stats.pending} student{stats.pending !== 1 ? 's' : ''} need chairperson assignment</li>
                )}
                {stats.assigned === stats.total && (
                  <li className="text-green-600">• All students have been assigned chairpersons!</li>
                )}
                <li>• {chairpersons.length} chairpersons available</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Bar Chart Section */}
      <div className="bg-white p-8 rounded-lg shadow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Bar Chart */}
          <div className="lg:col-span-2">
            <div className="bg-burgundy-700 text-white p-4 rounded-t-lg">
              <h3 className="text-lg font-bold">First Stage Evaluation Distribution 2024/2025</h3>
            </div>
            
            <div className="border border-gray-200 rounded-b-lg p-6">
              {/* Chart Container */}
              <div className="relative h-80">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-600 pr-2">
                  {[16, 14, 12, 10, 8, 6, 4, 2, 0].map(num => (
                    <span key={num}>{num}</span>
                  ))}
                </div>
                
                {/* Chart area */}
                <div className="ml-8 h-full flex items-end justify-around space-x-4">
                  
                  {/* PhD Bar */}
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full max-w-20 flex flex-col items-end space-y-1">
                      {/* Sem 2 (PhD) */}
                      <div className="w-full relative">
                        <div 
                          className="bg-blue-600 rounded-t transition-all duration-1000 ease-out"
                          style={{ height: `${(0.5 / 16) * 100}%` }}
                        ></div>
                        <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-bold">1</span>
                      </div>
                      
                      {/* Sem 3 (PhD) Sem 2 (MPhil) */}
                      <div className="w-full relative">
                        <div 
                          className="bg-orange-500 transition-all duration-1000 ease-out"
                          style={{ height: `${(1.5 / 16) * 240}px` }}
                        ></div>
                        <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-bold">2</span>
                      </div>
                      
                      {/* Sem 4 (PhD) & Sem 3 (MPhil) */}
                      <div className="w-full relative">
                        <div 
                          className="bg-gray-500 transition-all duration-1000 ease-out"
                          style={{ height: `${(1 / 16) * 240}px` }}
                        ></div>
                        <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-bold">1</span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm font-medium text-gray-700">PhD</div>
                  </div>
                  
                  {/* MPhil Bar */}
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full max-w-20 flex flex-col items-end space-y-1">
                      {/* Sem 3 (MPhil) */}
                      <div className="w-full relative">
                        <div 
                          className="bg-orange-500 rounded-t transition-all duration-1000 ease-out"
                          style={{ height: `${(1 / 16) * 240}px` }}
                        ></div>
                        <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-bold">1</span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm font-medium text-gray-700">MPhil</div>
                  </div>
                  
                  {/* DSE Bar */}
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full max-w-20 flex flex-col items-end space-y-1">
                      {/* Re-Evaluation */}
                      <div className="w-full relative">
                        <div 
                          className="bg-yellow-500 rounded-t transition-all duration-1000 ease-out"
                          style={{ height: `${(1 / 16) * 240}px` }}
                        ></div>
                        <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-bold">1</span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm font-medium text-gray-700">DSE</div>
                  </div>
                </div>
                
                {/* Grid lines */}
                <div className="absolute inset-0 ml-8 pointer-events-none">
                  {[0, 2, 4, 6, 8, 10, 12, 14, 16].map(num => (
                    <div 
                      key={num}
                      className="absolute w-full border-t border-gray-200"
                      style={{ bottom: `${(num / 16) * 100}%` }}
                    ></div>
                  ))}
                </div>
              </div>
              
              {/* Legend */}
              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-600 mr-2"></div>
                  <span>Sem 2 (PhD)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-500 mr-2"></div>
                  <span>Sem 3 (PhD) Sem 2 (MPhil)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-500 mr-2"></div>
                  <span>Sem 4 (PhD) & Sem 3 (MPhil) dan ke atas</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 mr-2"></div>
                  <span>Re-PD</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Summary Statistics */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Total Students :</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>1) PhD –</span>
                  <span className="font-bold">{students.filter(s => s.program === 'PhD').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>2) MPhil –</span>
                  <span className="font-bold">{students.filter(s => s.program === 'MPhil').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>3) DSE –</span>
                  <span className="font-bold">{students.filter(s => s.program === 'DSE').length}</span>
                </div>
              </div>
            </div>
            
           
              </div>
            </div>
          </div>
        </div>
     
  );

  // Modal for assigning chairperson
  const renderModal = () => (
    showModal && modalType === 'assign' && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Assign Chairperson - {editingStudent?.name}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Chairperson
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
                defaultValue={editingStudent?.chairperson || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    handleSubmitAssignment(editingStudent.id, e.target.value);
                  }
                }}
              >
                <option value="">Select a chairperson</option>
                {chairpersons.map(chair => (
                  <option key={chair} value={chair}>{chair}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
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
              <h1 className="ml-3 text-xl font-bold text-burgundy-700">Program Coordinator Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{user?.username || 'Coordinator'}</span>
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
              onClick={() => setCurrentPage('students')}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                currentPage === 'students'
                  ? 'border-burgundy-500 text-burgundy-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BookOpen size={16} />
              <span>Student Evaluations</span>
            </button>
            <button
              onClick={() => setCurrentPage('statistics')}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                currentPage === 'statistics'
                  ? 'border-burgundy-500 text-burgundy-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 size={16} />
              <span>Statistics</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'students' && <StudentsList />}
        {currentPage === 'statistics' && <StatisticsView />}
      </div>

      {/* Modals */}
      {renderModal()}
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