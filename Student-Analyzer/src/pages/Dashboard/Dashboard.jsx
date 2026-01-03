import { useState, useEffect } from "react";
import {
  FiHome,
  FiUsers,
  FiBarChart2,
  FiFileText,
  FiSettings,
  FiSearch,
  FiBell,
  FiUser,
  FiMessageSquare,
  FiPlus,
  FiDownload,
  FiCheck,
  FiCalendar,
  FiChevronDown,
  FiMenu,
  FiRefreshCw,
  FiAlertCircle,
  FiX,
  FiEdit3,
  FiSave,
  FiAward,
  // Added new icons for the profile modal
  FiCpu,
  FiLayout,
  FiTool
} from "react-icons/fi";
import style from "../Dashboard/Dashboard.module.css";
import AddStudentModal from "./AddStudentModal.jsx";
import { getAuth } from "firebase/auth";
import { doc, getDoc, getDocs, collection, updateDoc } from "firebase/firestore";
import {
  app,
  analytics,
  auth,
  db,
  storage,
} from "../../Firebase_Config/firebaseConfig";
import { useNavigate } from "react-router-dom";

// --- UPDATED STUDENT PROFILE MODAL (Displays ALL Scores) ---
const StudentProfileModal = ({ student, isOpen, onClose }) => {
  // Helper to extract latest score safely from arrays
  const getLatest = (arr) => {
    if (arr && Array.isArray(arr) && arr.length > 0) {
      return arr[arr.length - 1].score;
    }
    return null;
  };

  // Helper for UI Tools which has a tool name
  const getLatestTool = (arr) => {
    if (arr && Array.isArray(arr) && arr.length > 0) {
      const last = arr[arr.length - 1];
      return `${last.tool}: ${last.score}`;
    }
    return null;
  };

  if (!isOpen || !student) return null;

  // Extract Scores (Checks both array format and legacy single point format)
  const dsaScore = getLatest(student.dsaScores) ?? student.dsaPoints ?? null;
  const daaScore = getLatest(student.daaScores) ?? student.daaPoints ?? null;
  const aptitudeScore = getLatest(student.aptitudeScores);
  const uiScore = getLatest(student.uiScores) ?? student.uiPoints ?? null;
  const uiToolScore = getLatestTool(student.uiToolScores);

  const getBadgeColor = (score) => {
    if (score === null) return style.badgeGray;
    const numScore = typeof score === 'string' ? parseInt(score.split(': ')[1]) : score;
    if (numScore >= 80) return style.badgeGreen;
    if (numScore >= 60) return style.badgeBlue;
    return style.badgeOrange;
  };

  return (
    <div className={style.modalOverlay} onClick={onClose}>
      <div className={style.studentModalContent} onClick={(e) => e.stopPropagation()}>
        
        {/* Header with Gradient */}
        <div className={style.profileModalHeader}>
          <div className={style.profileAvatarLarge}>
            {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className={style.profileHeaderText}>
            <h2>{student.name || 'Unknown'}</h2>
            <p>{student.email} • ID: {student.studentId}</p>
          </div>
          <button className={style.closeButtonWhite} onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <div className={style.modalBody}>
          {/* Personal Info Grid */}
          <div className={style.infoSection}>
            <h4 className={style.sectionLabel}>Student Details</h4>
            <div className={style.infoGrid}>
              <div className={style.infoItem}>
                <span className={style.label}>Class</span>
                <span className={style.value}>{student.class || 'N/A'}</span>
              </div>
              <div className={style.infoItem}>
                <span className={style.label}>Phone</span>
                <span className={style.value}>{student.phone || 'N/A'}</span>
              </div>
              <div className={style.infoItem}>
                <span className={style.label}>Guardian</span>
                <span className={style.value}>{student.parentName || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Academic Scores Section */}
          <div className={style.scoresSection}>
            <h4 className={style.sectionLabel}>Skill Assessment Scores</h4>
            <div className={style.scoresGrid}>
              
              {/* DSA */}
              <div className={style.scoreCardModern}>
                <div className={style.scoreIconBox} style={{background: 'rgba(67, 97, 238, 0.1)', color: '#4361ee'}}>
                  <FiCpu />
                </div>
                <div className={style.scoreDetails}>
                  <span>DSA</span>
                  <strong>{dsaScore !== null ? dsaScore + '/100' : 'Not Taken'}</strong>
                </div>
                <div className={`${style.scoreIndicator} ${getBadgeColor(dsaScore)}`}></div>
              </div>

              {/* DAA */}
              <div className={style.scoreCardModern}>
                <div className={style.scoreIconBox} style={{background: 'rgba(247, 37, 133, 0.1)', color: '#f72585'}}>
                  <FiAward />
                </div>
                <div className={style.scoreDetails}>
                  <span>DAA</span>
                  <strong>{daaScore !== null ? daaScore + '/100' : 'Not Taken'}</strong>
                </div>
                <div className={`${style.scoreIndicator} ${getBadgeColor(daaScore)}`}></div>
              </div>

              {/* Aptitude */}
              <div className={style.scoreCardModern}>
                <div className={style.scoreIconBox} style={{background: 'rgba(76, 201, 240, 0.1)', color: '#4cc9f0'}}>
                  <FiBarChart2 />
                </div>
                <div className={style.scoreDetails}>
                  <span>Aptitude</span>
                  <strong>{aptitudeScore !== null ? aptitudeScore + '/100' : 'Not Taken'}</strong>
                </div>
                <div className={`${style.scoreIndicator} ${getBadgeColor(aptitudeScore)}`}></div>
              </div>

              {/* UI Design */}
              <div className={style.scoreCardModern}>
                <div className={style.scoreIconBox} style={{background: 'rgba(255, 107, 107, 0.1)', color: '#ff6b6b'}}>
                  <FiLayout />
                </div>
                <div className={style.scoreDetails}>
                  <span>UI Design</span>
                  <strong>{uiScore !== null ? uiScore + '/100' : 'Not Taken'}</strong>
                </div>
                <div className={`${style.scoreIndicator} ${getBadgeColor(uiScore)}`}></div>
              </div>

              {/* UI Tools */}
              <div className={style.scoreCardModern}>
                <div className={style.scoreIconBox} style={{background: 'rgba(32, 201, 151, 0.1)', color: '#20c997'}}>
                  <FiTool />
                </div>
                <div className={style.scoreDetails}>
                  <span>UI Tools</span>
                  <strong>{uiToolScore !== null ? uiToolScore : 'Not Taken'}</strong>
                </div>
                <div className={`${style.scoreIndicator} ${uiToolScore ? style.badgeGreen : style.badgeGray}`}></div>
              </div>

            </div>
          </div>

          {/* Bio */}
          {student.bio && (
            <div className={style.infoSection}>
              <h4 className={style.sectionLabel}>About</h4>
              <p className={style.bioText}>{student.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Dashboard Home Component
const DashboardHome = ({
  quickStats,
  recentActivities,
  friendsList,
  onAddStudentClick,
}) => (
  <div className={style.subcontent}>
    <div className={style.leftBox}>
      <div className={style.welcome}>
        <h2>Welcome back, Rajdeep!</h2>
        <p>Here's what's happening with your students today</p>
        <div className={style.actionButtons}>
          <button className={style.btnPrimary} onClick={onAddStudentClick}>
            <FiPlus size={16} /> Add Student
          </button>
          <button className={style.btnOutline}>
            <FiDownload size={16} /> Import Data
          </button>
        </div>
      </div>

      <div className={style.statsOverview}>
        <h3>Quick Stats</h3>
        <div className={style.statsGrid}>
          {quickStats.map((stat, i) => (
            <div className={style.statCard} key={i}>
              <div className={style.statHeader}>
                <h4>{stat.label}</h4>
                <span className={style.trend}>{stat.trend}</span>
              </div>
              <div className={style.statValue}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={style.performanceChart}>
        <div className={style.chartHeader}>
          <h3>Performance Overview</h3>
          <div className={style.timeFilter}>
            <span>Last 7 days</span>
            <FiChevronDown size={16} />
          </div>
        </div>
        <div className={style.chartPlaceholder}>
          [Performance Chart Visualization]
        </div>
      </div>
    </div>

    <div className={style.rightBox}>
      <div className={style.recentActivity}>
        <h3>Recent Activity</h3>
        <div className={style.activityList}>
          {recentActivities.map((activity) => (
            <div key={activity.id} className={style.activityItem}>
              <div className={style.activityCourse}>{activity.course}</div>
              <div className={style.activityAction}>{activity.action}</div>
              <div className={style.activityTime}>{activity.time}</div>
            </div>
          ))}
        </div>
        <button className={style.viewAll}>View All Activity</button>
      </div>

      <div className={style.friendsList}>
        <h3>Your Network</h3>
        <div className={style.friendsContainer}>
          {friendsList.map((friend, i) => (
            <div key={i} className={style.friendItem}>
              <div className={style.friendAvatar}>
                <div
                  className={`${style.status} ${
                    style[friend.status.toLowerCase()]
                  }`}
                ></div>
              </div>
              <div className={style.friendInfo}>
                <div className={style.friendName}>{friend.name}</div>
                <div className={style.friendCourse}>{friend.course}</div>
              </div>
              <button className={style.messageBtn}>
                <FiMessageSquare size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={style.upcomingTasks}>
        <h3>Upcoming Tasks</h3>
        <div className={style.taskList}>
          <div className={style.taskItem}>
            <div className={style.checkbox}>
              <input type="checkbox" id="task1" />
              <label htmlFor="task1">
                <FiCheck className={style.checkIcon} size={14} />
              </label>
            </div>
            <label className={style.taskLabel} htmlFor="task1">
              Grade Math assignments
            </label>
            <span className={style.taskDue}>
              <FiCalendar size={14} /> Today
            </span>
          </div>
          <div className={style.taskItem}>
            <div className={style.checkbox}>
              <input type="checkbox" id="task2" />
              <label htmlFor="task2">
                <FiCheck className={style.checkIcon} size={14} />
              </label>
            </div>
            <label className={style.taskLabel} htmlFor="task2">
              Prepare Physics lecture
            </label>
            <span className={style.taskDue}>
              <FiCalendar size={14} /> Tomorrow
            </span>
          </div>
          <div className={style.taskItem}>
            <div className={style.checkbox}>
              <input type="checkbox" id="task3" />
              <label htmlFor="task3">
                <FiCheck className={style.checkIcon} size={14} />
              </label>
            </div>
            <label className={style.taskLabel} htmlFor="task3">
              Meet with student advisor
            </label>
            <span className={style.taskDue}>
              <FiCalendar size={14} /> Jul 15
            </span>
          </div>
        </div>
        <button className={style.addTask}>
          <FiPlus size={16} /> Add Task
        </button>
      </div>
    </div>
  </div>
);

// Students List Component
const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const tid = auth.currentUser ? auth.currentUser.uid : null;
  const docRef = doc(db, "teachers", tid);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    // Filter students based on search term
    const filtered = students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  async function fetchStudents() {
    try {
      setLoading(true);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        setError("Teacher document not found");
        setLoading(false);
        return;
      }
      
      const sids = docSnap.data().sids || [];
      console.log("Student IDs:", sids);

      const studentsSnapshot = await getDocs(collection(db, "students"));
      const studentData = [];

      studentsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (sids.includes(data.studentId)) {
          studentData.push({
            id: doc.id,
            ...data
          });
        }
      });

      setStudents(studentData);
      setFilteredStudents(studentData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to load students. Please try again.");
      setLoading(false);
    }
  }

  const handleRefresh = () => {
    fetchStudents();
  };

  const handleViewProfile = (student) => {
    setSelectedStudent(student);
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedStudent(null);
  };

  // Helper to extract score for list view badges
  const getScoreValue = (student, type) => {
    // Try array first (e.g., dsaScores)
    const arr = student[`${type}Scores`];
    if (arr && Array.isArray(arr) && arr.length > 0) {
      return arr[arr.length - 1].score;
    }
    // Fallback to legacy singular point
    return student[`${type}Points`];
  };

  if (loading) {
    return (
      <div className={style.pageContent}>
        <div className={style.sectionHeader}>
          <h1>Manage Students</h1>
          <button className={style.refreshButton} onClick={handleRefresh} disabled>
            <FiRefreshCw size={16} /> Refreshing...
          </button>
        </div>
        <div className={style.loadingState}>
          <div className={style.spinner}></div>
          <p>Loading student data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={style.pageContent}>
        <div className={style.sectionHeader}>
          <h1>Manage Students</h1>
          <button className={style.refreshButton} onClick={handleRefresh}>
            <FiRefreshCw size={16} /> Try Again
          </button>
        </div>
        <div className={style.errorState}>
          <FiAlertCircle size={48} className={style.errorIcon} />
          <h3>Something went wrong</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={style.pageContent}>
      <div className={style.sectionHeader}>
        <h1>Manage Students</h1>
        <button className={style.refreshButton} onClick={handleRefresh}>
          <FiRefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className={style.studentsContainer}>
        <div className={style.controls}>
          <div className={style.searchBox}>
            <FiSearch className={style.searchIcon} size={18} />
            <input
              type="text"
              placeholder="Search students by name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={style.searchInput}
            />
          </div>
          <div className={style.stats}>
            <span className={style.statBadge}>
              {filteredStudents.length} {filteredStudents.length === 1 ? 'Student' : 'Students'}
            </span>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className={style.emptyState}>
            {searchTerm ? (
              <>
                <FiSearch size={48} className={style.emptyIcon} />
                <h3>No students found</h3>
                <p>No students match your search for "{searchTerm}"</p>
                <button 
                  className={style.clearSearchButton}
                  onClick={() => setSearchTerm("")}
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <FiUsers size={48} className={style.emptyIcon} />
                <h3>No students yet</h3>
                <p>You haven't added any students to your class yet.</p>
              </>
            )}
          </div>
        ) : (
          <div className={style.studentsGrid}>
            {filteredStudents.map((student) => (
              <div key={student.id} className={style.studentCard}>
                <div className={style.studentAvatar}>
                  {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div className={style.studentInfo}>
                  <h3 className={style.studentName}>{student.name || 'Unknown Student'}</h3>
                  <p className={style.studentId}>ID: {student.studentId}</p>
                  <p className={style.studentEmail}>{student.email}</p>
                  <div className={style.scoreBadges}>
                    {getScoreValue(student, 'dsa') !== undefined && (
                      <span className={style.dsaBadge}>
                        DSA: {getScoreValue(student, 'dsa')}/100
                      </span>
                    )}
                    {getScoreValue(student, 'daa') !== undefined && (
                      <span className={style.daaBadge}>
                        DAA: {getScoreValue(student, 'daa')}/100
                      </span>
                    )}
                  </div>
                </div>
                <div className={style.studentActions}>
                  <button 
                    className={style.actionButton} 
                    title="View Profile"
                    onClick={() => handleViewProfile(student)}
                  >
                    <FiUser size={16} />
                  </button>
                  <button className={style.actionButton} title="Send Message">
                    <FiMessageSquare size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modern Student Profile Modal */}
      <StudentProfileModal
        student={selectedStudent}
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfileModal}
      />
    </div>
  );
};

const Analytics = () => (
  <div className={style.pageContent}>
    <h1>Student Analytics</h1>
    <p>
      Detailed charts and data visualizations on student performance will be
      here.
    </p>
  </div>
);

const Reports = () => (
  <div className={style.pageContent}>
    <h1>Generate Reports</h1>
    <p>Create and download custom reports for attendance, grades, and more.</p>
  </div>
);

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className={style.pageContent}>
      <div className={style.profileSection}>
        <h2>Settings</h2>
        <div className={style.settingsContainer}>
          <button
            className={style.logoutButton}
            onClick={() => auth.signOut().then(() => navigate("/"))}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

function Dashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // This function is passed to the modal to update local state if needed
  const handleAddStudent = (studentId) => {
    console.log(`Student added: ${studentId}`);
    // You could trigger a refresh here if you lifted the state up, 
    // but the modal handles the logic internally for now.
  };

  const sidebarItems = [
    { icon: <FiHome size={20} />, label: "Dashboard" },
    { icon: <FiUsers size={20} />, label: "Students" },
    { icon: <FiBarChart2 size={20} />, label: "Analytics" },
    { icon: <FiFileText size={20} />, label: "Reports" },
    { icon: <FiSettings size={20} />, label: "Settings" },
  ];

  const quickStats = [
    { label: "Attendance", value: "92%", trend: "↑2%" },
    { label: "Grades", value: "B+", trend: "↑0.5" },
    { label: "Activities", value: "8", trend: "New" },
    { label: "Goals", value: "3/5", trend: "1 Complete" },
    { label: "Alerts", value: "2", trend: "Urgent" },
  ];

  const recentActivities = [
    {
      id: 1,
      course: "Mathematics",
      action: "Assignment Submitted",
      time: "2h ago",
    },
    { id: 2, course: "Physics", action: "Grade Updated", time: "1d ago" },
    { id: 3, course: "Chemistry", action: "Attendance Marked", time: "2d ago" },
  ];

  const friendsList = [
    { name: "Alex Johnson", status: "Online", course: "Computer Science" },
    { name: "Maria Garcia", status: "Offline", course: "Physics" },
    { name: "James Wilson", status: "Online", course: "Mathematics" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <DashboardHome
            quickStats={quickStats}
            recentActivities={recentActivities}
            friendsList={friendsList}
            onAddStudentClick={handleOpenModal}
          />
        );
      case 1:
        return <Students />;
      case 2:
        return <Analytics />;
      case 3:
        return <Reports />;
      case 4:
        return <Settings />;
      default:
        return (
          <DashboardHome
            quickStats={quickStats}
            recentActivities={recentActivities}
            friendsList={friendsList}
            onAddStudentClick={handleOpenModal}
          />
        );
    }
  };

  return (
    <div className={style.container}>
      {isModalOpen && <div className={style.modalOverlay}></div>}
      <div
        className={`${style.sidebar} ${
          !isSidebarExpanded ? style.collapsed : ""
        }`}
      >
        <button className={style.menuButton} onClick={toggleSidebar}>
          <FiMenu size={22} />
        </button>
        {sidebarItems.map((item, i) => (
          <div
            key={i}
            className={`${style.menuItem} ${
              activeTab === i ? style.active : ""
            }`}
            onClick={() => setActiveTab(i)}
            title={item.label}
          >
            {item.icon}
            <span className={style.tooltip}>{item.label}</span>
          </div>
        ))}
      </div>

      <div className={style.content}>
        <div className={style.header}>
          <div className={style.searchBox}>
            <FiSearch className={style.searchIcon} size={18} />
            <input
              className={style.search}
              type="text"
              placeholder="Search students, courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={style.sett}>
            <FiSettings className={style.gear} size={22} />
            <div className={style.notificationBadge}>
              <FiBell className={style.bell} size={22} />
              <span className={style.badge}>3</span>
            </div>
            <div className={style.profile}>
              <div className={style.profileIcon}>
                <FiUser size={20} />
              </div>
              <span>Rajdeep Das</span>
            </div>
          </div>
        </div>

        {renderContent()}
      </div>

      <AddStudentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddStudent={handleAddStudent}
      />
    </div>
  );
}

export default Dashboard;