import { useState } from 'react';
import { User, BarChart3, BookOpen, Users, Calendar, Eye, Download, Filter, Search, LogOut, Edit, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';

const PGAM = () => {
  const [currentPage, setCurrentPage] = useState('overview');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const [editingStudent, setEditingStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  // Sample comprehensive data that PGAM would see
  const [allStudents, setAllStudents] = useState([
     {
      id: 1,
      name: "AHMAD FAIRUZ BIN ALI",
      matrikNo: "PRT203089",
      program: "PhD",
      department: 'SEAT', // You'll need to assign departments
      evaluationType: "First Evaluation",
      semester: 3,
      mainSupervisor: "DR. NORSHALIZA KAMARUDDIN",
      coSupervisor: "DR. HAZLIFAH BINTI MOHD RUSLI",
      researchTitle: "Causal inference in banking sector",
      examiner1: "PM Ts. DR. SITI SOPHIAYATI BINTI YUHANIZ",
      examiner2: "DR. NILAM NUR BINTI AMIR SJARIF",
      examiner3: "DR. AZIZUL BIN AZIZAN",
      chairperson: "PM DR. ROZANA ZAKARIA",
      status: "Chair Assigned",
      coordinator: 'Dr. Rahman Ali' // You'll need to assign coordinators
    },
    {
      id: 2,
      name: "AINUL FARHAH BINTI MOHD FAHIMEY",
      matrikNo: "MRT233008",
      program: "MPhil",
      department: 'II', // Assign appropriate department
      evaluationType: "First Evaluation",
      semester: 2,
      mainSupervisor: "AP. TS. DR. MASLIN BTE MASROM",
      coSupervisor: "",
      researchTitle: "ENHANCING LEARNING MANAGEMENT SYSTEM UTILIZATION FOR VOCATIONAL COLLEGES IN MALAYSIA: A MODEL FOR OPTIMIZATION",
      examiner1: "PM Ts. DR. ASNUL DAHAR BIN MINGHAT (UTM-FSSH)",
      examiner2: "DR. MOHD SYAHID BIN MOHD ANUAR",
      examiner3: "Ts. DR. HASLINA BINTI MD. SARKAN",
      chairperson: "PM DR. WAN NORMEZA BINTI WAN ZAKARIA",
      status: "Chair Assigned",
      coordinator: 'Dr. Fatimah Wong' // Assign appropriate coordinator
    },
    {
      id: 3,
      name: "ANIS AFIQAH BINTI SHARIP",
      matrikNo: "PRT233007",
      program: "PhD",
      department: 'CAI', // Assign appropriate department
      evaluationType: "First Evaluation",
      semester: 3,
      mainSupervisor: "AP. TS. DR. MOHD NAZ'RI BIN MAHRIN",
      coSupervisor: "DR. OTHMAN BIN MOHD YUSOP",
      researchTitle: "Design Thinking Framework for Requirements Elicitation with Cognitive Consideration for Older Adults",
      examiner1: "PROF. DR. SHAMSUL BIN SAHIBUDDIN",
      examiner2: "Ts. DR. HASLINA BINTI MD. SARKAN",
      examiner3: "DR. HAZLIFAH BINTI MOHD RUSLI",
      chairperson: "PROF. Ts. DR. KHAIRUR RIJAL BIN JAMALUDIN",
      status: "Chair Assigned",
      coordinator: 'Dr. Alex Lee' // Assign appropriate coordinator
    },
    {
      id: 4,
      name: "AYMEN YOUSEF AHMED ASHAWESH",
      matrikNo: "PRT213048",
      program: "PhD",
      department: 'BIHG', // Assign appropriate department
      evaluationType: "Re-Evaluation",
      semester: 7,
      mainSupervisor: "TS. DR. SAIFUL ADLI ISMAIL",
      coSupervisor: "TS. DR. NUR AZALIAH ABU BAKAR",
      researchTitle: "TOWARDS THE ADOPTION OF DISTANT LEARNING IN CONFLICT ZONES: CHALLENGES, OPPORTUNITIES, AND AFFECTING FACTORS IN LIBYA",
      examiner1: "PM DR. ROSLINA BINTI IBRAHIM",
      examiner2: "TS. DR. NORZIHA BINTI MEGAT MOHD ZAINUDDIN",
      examiner3: "DR. YAZRIWATI BINTI YAHYA",
      chairperson: "PM Sr DR. SITI UZAIRIAH BINTI MOHD TOBI",
      status: "Chair Assigned",
      coordinator: 'Dr. Kumar Singh' // Assign appropriate coordinator
    },
    {
      id: 5,
      name: "BAHAA SALIM ABDULAMEER ABDULAMEER",
      matrikNo: "PRT223046",
      program: "PhD",
      department: 'CAI', // Assign appropriate department
      evaluationType: "Re-Evaluation",
      semester: 4,
      mainSupervisor: "TS. DR. NORAIMI SHAFIE",
      coSupervisor: "",
      researchTitle: "EXPLAINABLE ARTIFICIAL INTELLIGENCE (XAI) TECHNIQUES IN LUNG DISEASE TO ENHANCE TRUSTWORTHY",
      examiner1: "PM Ts. DR. NORLIZA BINTI MOHAMED",
      examiner2: "PM DR. RUDZIDATUL AKMAM BT DZIYAUDDIN",
      examiner3: "DR. AZIZUL BIN AZIZAN",
      chairperson: "PM Sr DR. SITI UZAIRIAH BINTI MOHD TOBI",
      status: "Chair Assigned",
      coordinator: 'Dr. Alex Lee' // Assign appropriate coordinator
    }
  ].map(student => ({
    ...student,
    name: student.name.toUpperCase(),
    researchTitle: student.researchTitle.toUpperCase(),
    mainSupervisor: student.mainSupervisor.toUpperCase(),
    coSupervisor: student.coSupervisor ? student.coSupervisor.toUpperCase() : '',
    examiner1: student.examiner1.toUpperCase(),
    examiner2: student.examiner2.toUpperCase(),
    examiner3: student.examiner3.toUpperCase(),
    chairperson: student.chairperson ? student.chairperson.toUpperCase() : '',
    coordinator: student.coordinator ? student.coordinator.toUpperCase() : ''
  })));

  // Available examiners and chairpersons
  const availableExaminers = [
    'PROF. DR. SHAMSUL BIN SAHIBUDDIN',
    'PM Ts. DR. SITI SOPHIAYATI BINTI YUHANIZ',
    'DR. NILAM NUR BINTI AMIR SJARIF',
    'DR. AZIZUL BIN AZIZAN',
    'PM DR. ROSLINA BINTI IBRAHIM',
    'TS. DR. NORZIHA BINTI MEGAT MOHD ZAINUDDIN',
    'DR. YAZRIWATI BINTI YAHYA',
    'PM Ts. DR. NORLIZA BINTI MOHAMED',
    'PM DR. RUDZIDATUL AKMAM BT DZIYAUDDIN',
    'Ts. DR. HASLINA BINTI MD. SARKAN',
    'DR. HAZLIFAH BINTI MOHD RUSLI',
    'DR. MOHD SYAHID BIN MOHD ANUAR',
    'PM Ts. DR. ASNUL DAHAR BIN MINGHAT (UTM-FSSH)'
  ];

  const availableChairpersons = [
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

  const departments = ['SEAT', 'II', 'BIHG', 'CAI'];

  // Calculate comprehensive statistics
  const stats = {
    total: allStudents.length,
    byDepartment: departments.reduce((acc, dept) => {
      acc[dept] = allStudents.filter(s => s.department === dept).length;
      return acc;
    }, {}),
    byStatus: {
      'Chair Assigned': allStudents.filter(s => s.status === 'Chair Assigned').length,
      'Pending Chair Assignment': allStudents.filter(s => s.status === 'Pending Chair Assignment').length,
      'Pending Examiner Nomination': allStudents.filter(s => s.status === 'Pending Examiner Nomination').length
    },
    byProgram: {
      'PhD': allStudents.filter(s => s.program === 'PhD').length,
      'MPhil': allStudents.filter(s => s.program === 'MPhil').length,
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

  const handleSaveChanges = () => {
    setAllStudents(prev => 
      prev.map(student => 
        student.id === editingStudent.id ? editingStudent : student
      )
    );
    closeModal();
  };

  const OverviewPage = () => (
    <div className="space-y-6">
      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ready for Evaluation</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.byStatus['Chair Assigned']}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Assignment</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.byStatus['Pending Chair Assignment'] || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Nomination</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.byStatus['Pending Examiner Nomination'] || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Students by Department</h3>
          <div className="space-y-3">
            {departments.map(dept => (
              <div key={dept} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{dept}</span>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {stats.byDepartment[dept]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Students by Program</h3>
          <div className="space-y-3">
            {Object.entries(stats.byProgram).map(([program, count]) => (
              <div key={program} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{program}</span>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process Status Overview */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Evaluation Process Status</h3>
        <div className="space-y-3">
          {Object.entries(stats.byStatus).map(([status, count]) => (
            <div key={status} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium text-gray-700">{status}</span>
              <span className="text-lg font-semibold text-gray-900">{count}</span>
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-500" />
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Search size={16} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search students, titles, supervisors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy-500 w-64"
              />
            </div>
          </div>
          <button
            onClick={() => alert('Downloading comprehensive report...')}
            className="px-4 py-2 bg-burgundy-700 text-white rounded-md hover:bg-burgundy-800 flex items-center space-x-2"
          >
            <Download size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{student.mainSupervisor}</div>
                  {student.coSupervisor && (
                    <div className="text-xs text-gray-500">Co: {student.coSupervisor}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate" title={student.researchTitle}>
                    {student.researchTitle}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs space-y-1">
                    <div>1: {student.examiner1 || 'Not assigned'}</div>
                    <div>2: {student.examiner2 || 'Not assigned'}</div>
                    <div>3: {student.examiner3 || 'Not assigned'}</div>
                  </div>
                  <button 
                    onClick={() => openEditModal(student, 'examiners')}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Edit size={12} className="mr-1" /> Edit Examiners
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {student.chairperson || 'Not assigned'}
                  </div>
                  <button 
                    onClick={() => openEditModal(student, 'chairperson')}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Edit size={12} className="mr-1" /> Edit Chairperson
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
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
              {Math.round(Object.values(examinerWorkload).reduce((a, b) => a + b, 0) / Object.keys(examinerWorkload).length * 100) / 100}
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
        {currentPage === 'overview' && <OverviewPage />}
        {currentPage === 'students' && <StudentsPage />}
        {currentPage === 'workload' && <WorkloadPage />}
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
              <div className="space-y-4">
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