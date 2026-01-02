import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Removed FiCrown from here
import {
  FiBook,
  FiCalendar,
  FiAward,
  FiBarChart2,
  FiClock,
  FiBell,
  FiUser,
  FiUsers,
  FiTrendingUp,
  FiMenu,
  FiSearch,
  FiStar,
  FiTarget,
  FiPlus,
  FiCheck,
  FiX,
  FiMessageSquare,
} from "react-icons/fi";
// Added FaCrown here
import { FaCrown } from "react-icons/fa";
import styles from "./Sdashboard.module.css";
import PerformanceChart from "../Dashboard/performanceChart";
import { auth, db } from "../../Firebase_Config/firebaseConfig";
// ✅ CORRECT
// Import Auth functions from 'firebase/auth'
import { onAuthStateChanged } from "firebase/auth";

// Import Firestore functions from 'firebase/firestore'
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState({
    name: "Student",
    class: "",
    email: "",
    studentId: "",
    attendance: 0,
    gpa: 0,
    recentGrades: [],
    upcomingAssignments: [],
    announcements: [],
    leaderboard: [],
    friends: [], // Will be populated from DB
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [notifications, setNotifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // --- New Friends System States ---
  const [isAddFriendMode, setIsAddFriendMode] = useState(false);
  const [friendSearchInput, setFriendSearchInput] = useState("");
  const [friendSearchResults, setFriendSearchResults] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [requestStatusMsg, setRequestStatusMsg] = useState("");

  // New state for performance rankings
  const [performanceRankings, setPerformanceRankings] = useState({
    dsa: [],
    daa: [],
    aptitude: [],
    overall: [],
  });
  const [currentUserRank, setCurrentUserRank] = useState({
    dsa: { rank: 0, score: 0 },
    daa: { rank: 0, score: 0 },
    aptitude: { rank: 0, score: 0 },
    overall: { rank: 0, score: 0 },
  });
  const [loadingRankings, setLoadingRankings] = useState(true);

  // Leaderboard state
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  // --- Friend System Logic ---

  // 1. Search Users
  const handleSearchUsers = async (e) => {
    e.preventDefault();
    if (!friendSearchInput.trim()) return;

    setSearchLoading(true);
    setFriendSearchResults([]);
    setRequestStatusMsg("");

    try {
      const studentsRef = collection(db, "students");
      // Search by name (simple case-sensitive prefix match for now) or Student ID
      // Note: For robust search, Algolia or ElasticSearch is recommended, but this works for basic usage.

      // Query for matches
      const q = query(studentsRef);
      const querySnapshot = await getDocs(q);

      const results = [];
      const currentUserId = auth.currentUser?.uid;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Exclude current user
        if (doc.id !== currentUserId) {
          const nameMatch =
            data.name &&
            data.name.toLowerCase().includes(friendSearchInput.toLowerCase());
          const idMatch =
            data.studentId && data.studentId.includes(friendSearchInput);

          if (nameMatch || idMatch) {
            results.push({
              id: doc.id,
              name: data.name,
              studentId: data.studentId,
              email: data.email,
              photoUrl: data.photoUrl || "",
            });
          }
        }
      });

      setFriendSearchResults(results);
      if (results.length === 0) setRequestStatusMsg("No students found.");
    } catch (error) {
      console.error("Error searching students:", error);
      setRequestStatusMsg("Error occurred during search.");
    } finally {
      setSearchLoading(false);
    }
  };

  // 2. Send Friend Request
  const sendFriendRequest = async (targetUser) => {
    if (!auth.currentUser) return;

    try {
      // Check if already friends
      const friendsRef = doc(
        db,
        "students",
        auth.currentUser.uid,
        "friends",
        targetUser.id
      );
      const friendSnap = await getDoc(friendsRef);

      if (friendSnap.exists()) {
        setRequestStatusMsg(`You are already friends with ${targetUser.name}`);
        return;
      }

      // Check if request already pending
      const requestsRef = collection(db, "friend_requests");
      const q = query(
        requestsRef,
        where("fromId", "==", auth.currentUser.uid),
        where("toId", "==", targetUser.id),
        where("status", "==", "pending")
      );
      const pendingSnap = await getDocs(q);

      if (!pendingSnap.empty) {
        setRequestStatusMsg("Request already sent!");
        return;
      }

      // Send Request
      await addDoc(collection(db, "friend_requests"), {
        fromId: auth.currentUser.uid,
        fromName: studentData.name,
        toId: targetUser.id,
        toName: targetUser.name,
        status: "pending",
        timestamp: serverTimestamp(),
      });

      setRequestStatusMsg(`Request sent to ${targetUser.name}!`);

      // Remove from search results to prevent double sending in UI
      setFriendSearchResults((prev) =>
        prev.filter((u) => u.id !== targetUser.id)
      );
    } catch (error) {
      console.error("Error sending request:", error);
      setRequestStatusMsg("Failed to send request.");
    }
  };

  // 3. Accept Friend Request
  const acceptRequest = async (request) => {
    try {
      const batch = db; // Using direct writes for simplicity, ideally use runTransaction or writeBatch

      // A. Add to Current User's Friend Subcollection
      await setDoc(
        doc(db, "students", auth.currentUser.uid, "friends", request.fromId),
        {
          name: request.fromName,
          since: serverTimestamp(),
        }
      );

      // B. Add Current User to Sender's Friend Subcollection
      await setDoc(
        doc(db, "students", request.fromId, "friends", auth.currentUser.uid),
        {
          name: studentData.name,
          since: serverTimestamp(),
        }
      );

      // C. Delete the request
      await deleteDoc(doc(db, "friend_requests", request.id));

      // D. Update local state immediately for UI responsiveness
      setIncomingRequests((prev) => prev.filter((r) => r.id !== request.id));
    } catch (error) {
      console.error("Error accepting friend:", error);
    }
  };

  // 4. Decline Request
  const declineRequest = async (requestId) => {
    try {
      await deleteDoc(doc(db, "friend_requests", requestId));
      setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (error) {
      console.error("Error declining:", error);
    }
  };

  // --- Existing Logic ---

  // Fetch all students' exam scores and calculate rankings
  const fetchPerformanceRankings = async (currentUserId) => {
    try {
      const studentsRef = collection(db, "students");
      const querySnapshot = await getDocs(studentsRef);

      const allStudents = [];

      querySnapshot.forEach((doc) => {
        const studentData = doc.data();
        if (studentData.name && studentData.email) {
          const student = {
            id: doc.id,
            name: studentData.name,
            email: studentData.email,
            studentId: studentData.studentId || "",
            class: studentData.class || "N/A",
          };

          // Get latest DSA score
          if (studentData.dsaScores && studentData.dsaScores.length > 0) {
            student.dsaScore =
              studentData.dsaScores[studentData.dsaScores.length - 1].score;
          } else {
            student.dsaScore = 0;
          }

          // Get latest DAA score
          if (studentData.daaScores && studentData.daaScores.length > 0) {
            student.daaScore =
              studentData.daaScores[studentData.daaScores.length - 1].score;
          } else {
            student.daaScore = 0;
          }

          // Get latest Aptitude score
          if (
            studentData.aptitudeScores &&
            studentData.aptitudeScores.length > 0
          ) {
            student.aptitudeScore =
              studentData.aptitudeScores[
                studentData.aptitudeScores.length - 1
              ].score;
          } else {
            student.aptitudeScore = 0;
          }

          // Calculate overall score (average of all exams)
          const scores = [
            student.dsaScore,
            student.daaScore,
            student.aptitudeScore,
          ].filter((score) => score > 0);
          student.overallScore =
            scores.length > 0
              ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
              : 0;

          allStudents.push(student);
        }
      });

      // Sort students by score for each category (descending)
      const dsaRankings = [...allStudents]
        .filter((student) => student.dsaScore > 0)
        .sort((a, b) => b.dsaScore - a.dsaScore)
        .map((student, index) => ({
          ...student,
          rank: index + 1,
        }));

      const daaRankings = [...allStudents]
        .filter((student) => student.daaScore > 0)
        .sort((a, b) => b.daaScore - a.daaScore)
        .map((student, index) => ({
          ...student,
          rank: index + 1,
        }));

      const aptitudeRankings = [...allStudents]
        .filter((student) => student.aptitudeScore > 0)
        .sort((a, b) => b.aptitudeScore - a.aptitudeScore)
        .map((student, index) => ({
          ...student,
          rank: index + 1,
        }));

      const overallRankings = [...allStudents]
        .filter((student) => student.overallScore > 0)
        .sort((a, b) => b.overallScore - a.overallScore)
        .map((student, index) => ({
          ...student,
          rank: index + 1,
        }));

      setPerformanceRankings({
        dsa: dsaRankings,
        daa: daaRankings,
        aptitude: aptitudeRankings,
        overall: overallRankings,
      });

      // Find current user's rank in each category
      const currentUserDSARank = dsaRankings.find(
        (student) => student.id === currentUserId
      );
      const currentUserDAARank = daaRankings.find(
        (student) => student.id === currentUserId
      );
      const currentUserAptitudeRank = aptitudeRankings.find(
        (student) => student.id === currentUserId
      );
      const currentUserOverallRank = overallRankings.find(
        (student) => student.id === currentUserId
      );

      setCurrentUserRank({
        dsa: {
          rank: currentUserDSARank ? currentUserDSARank.rank : 0,
          score: currentUserDSARank ? currentUserDSARank.dsaScore : 0,
        },
        daa: {
          rank: currentUserDAARank ? currentUserDAARank.rank : 0,
          score: currentUserDAARank ? currentUserDAARank.daaScore : 0,
        },
        aptitude: {
          rank: currentUserAptitudeRank ? currentUserAptitudeRank.rank : 0,
          score: currentUserAptitudeRank
            ? currentUserAptitudeRank.aptitudeScore
            : 0,
        },
        overall: {
          rank: currentUserOverallRank ? currentUserOverallRank.rank : 0,
          score: currentUserOverallRank
            ? currentUserOverallRank.overallScore
            : 0,
        },
      });
    } catch (error) {
      console.error("Error fetching performance rankings:", error);
    } finally {
      setLoadingRankings(false);
    }
  };

  // Fetch and calculate leaderboard data
  const fetchLeaderboardData = async (currentUserId) => {
    try {
      setLoadingLeaderboard(true);
      const studentsRef = collection(db, "students");
      const querySnapshot = await getDocs(studentsRef);

      const allStudents = [];

      querySnapshot.forEach((doc) => {
        const studentData = doc.data();
        if (studentData.name && studentData.email) {
          const student = {
            id: doc.id,
            name: studentData.name,
            email: studentData.email,
            studentId: studentData.studentId || "",
            class: studentData.class || "N/A",
          };

          // Calculate scores from exams
          let dsaScore = 0;
          let daaScore = 0;
          let aptitudeScore = 0;

          if (studentData.dsaScores && studentData.dsaScores.length > 0) {
            dsaScore =
              studentData.dsaScores[studentData.dsaScores.length - 1].score;
          }

          if (studentData.daaScores && studentData.daaScores.length > 0) {
            daaScore =
              studentData.daaScores[studentData.daaScores.length - 1].score;
          }

          if (
            studentData.aptitudeScores &&
            studentData.aptitudeScores.length > 0
          ) {
            aptitudeScore =
              studentData.aptitudeScores[studentData.aptitudeScores.length - 1]
                .score;
          }

          // Calculate overall score (average of all exams)
          const scores = [dsaScore, daaScore, aptitudeScore].filter(
            (score) => score > 0
          );
          const overallScore =
            scores.length > 0
              ? scores.reduce((a, b) => a + b, 0) / scores.length
              : 0;

          // Use GPA from database if available, otherwise calculate from overall score
          // Convert score (0-100) to GPA (0-4.0 scale)
          let gpa = studentData.gpa || 0;
          if (gpa === 0 && overallScore > 0) {
            // Convert percentage to GPA: 90-100 = 4.0, 80-89 = 3.0-3.9, etc.
            gpa = Math.min(4.0, (overallScore / 100) * 4.0);
            gpa = Math.round(gpa * 10) / 10; // Round to 1 decimal place
          }

          // Calculate progress (average of all scores, or use attendance if available)
          let progress = studentData.attendance || 0;
          if (progress === 0 && overallScore > 0) {
            progress = Math.round(overallScore);
          }

          // Only include students with some data
          if (gpa > 0 || progress > 0 || overallScore > 0) {
            allStudents.push({
              id: doc.id,
              name: studentData.name,
              email: studentData.email,
              studentId: studentData.studentId || "",
              class: studentData.class || "N/A",
              gpa: gpa,
              progress: Math.min(100, Math.max(0, progress)),
              overallScore: overallScore,
            });
          }
        }
      });

      // Sort by GPA (descending), then by progress, then by overall score
      allStudents.sort((a, b) => {
        if (b.gpa !== a.gpa) return b.gpa - a.gpa;
        if (b.progress !== a.progress) return b.progress - a.progress;
        return b.overallScore - a.overallScore;
      });

      // Add rank to each student
      const rankedStudents = allStudents.map((student, index) => ({
        ...student,
        rank: index + 1,
      }));

      setLeaderboardData(rankedStudents);
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // 1. Fetch Basic Student Data
          const studentDoc = await getDoc(doc(db, "students", user.uid));
          let currentStudentData = {};

          if (studentDoc.exists()) {
            const data = studentDoc.data();
            currentStudentData = {
              name: data.name || "Student",
              email: data.email || "",
              studentId: data.studentId || "",
              class: data.class || "10A",
              attendance: data.attendance || 92,
              gpa: data.gpa || 3.7,
              recentGrades: [
                { subject: "Mathematics", grade: "A", progress: 85 },
                { subject: "Science", grade: "B+", progress: 78 },
                { subject: "English", grade: "A-", progress: 82 },
                { subject: "History", grade: "B", progress: 75 },
              ],
              upcomingAssignments: [
                {
                  subject: "Mathematics",
                  task: "Algebra Homework",
                  due: "Tomorrow",
                },
                { subject: "Science", task: "Lab Report", due: "In 2 days" },
                { subject: "English", task: "Essay Draft", due: "In 3 days" },
              ],
              announcements: [
                {
                  title: "School Holiday",
                  date: "May 15",
                  content: "No classes next Monday due to a public holiday.",
                },
                {
                  title: "Science Fair",
                  date: "May 20",
                  content:
                    "The annual science fair is approaching. Register by Friday to participate.",
                },
              ],
              leaderboard: [
                { rank: 1, name: "Sarah Chen", gpa: 4.0, progress: 95 },
                { rank: 2, name: "James Wilson", gpa: 3.9, progress: 92 },
                { rank: 3, name: data.name || "You", gpa: 3.7, progress: 89 },
                { rank: 4, name: "Maria Garcia", gpa: 3.5, progress: 85 },
                { rank: 5, name: "David Kim", gpa: 3.4, progress: 82 },
              ],
              friends: [], // Initially empty, filled by listener below
            };
            setStudentData(currentStudentData);

            // Fetch performance rankings
            await fetchPerformanceRankings(user.uid);

            // Fetch leaderboard data
            await fetchLeaderboardData(user.uid);
          } else {
            console.log("No student data found");
          }

          // 2. Real-time Listener for Friends List
          const friendsQuery = collection(db, "students", user.uid, "friends");
          const unsubscribeFriends = onSnapshot(friendsQuery, (snapshot) => {
            const friendsList = [];
            snapshot.forEach((doc) => {
              const friendData = doc.data();
              // Randomize progress/status for demo UI since we might not have it in real DB yet
              friendsList.push({
                id: doc.id,
                name: friendData.name || "Unknown",
                status: Math.random() > 0.5 ? "online" : "offline",
                progress: Math.floor(Math.random() * 30) + 70, // Mock progress 70-100
              });
            });
            setStudentData((prev) => ({ ...prev, friends: friendsList }));
          });

          // 3. Real-time Listener for Incoming Friend Requests
          const requestsQuery = query(
            collection(db, "friend_requests"),
            where("toId", "==", user.uid),
            where("status", "==", "pending")
          );

          const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
            const requests = [];
            snapshot.forEach((doc) => {
              requests.push({ id: doc.id, ...doc.data() });
            });
            setIncomingRequests(requests);
            // Update notification badge count (Requests + 3 existing notifications)
            setNotifications(3 + requests.length);
          });

          // Cleanup listeners when component unmounts or user changes
          return () => {
            unsubscribeFriends();
            unsubscribeRequests();
          };
        } catch (error) {
          console.error("Error fetching student data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/student-login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleProfileClick = () => {
    navigate("/student-profile");
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  // Performance Tab Component (Unchanged)
  const PerformanceTabContent = () => {
    const [selectedCategory, setSelectedCategory] = useState("overall");

    const getPerformanceData = () => {
      switch (selectedCategory) {
        case "dsa":
          return performanceRankings.dsa;
        case "daa":
          return performanceRankings.daa;
        case "aptitude":
          return performanceRankings.aptitude;
        default:
          return performanceRankings.overall;
      }
    };

    const getCurrentUserPerformance = () => {
      switch (selectedCategory) {
        case "dsa":
          return currentUserRank.dsa;
        case "daa":
          return currentUserRank.daa;
        case "aptitude":
          return currentUserRank.aptitude;
        default:
          return currentUserRank.overall;
      }
    };

    const getCategoryTitle = () => {
      switch (selectedCategory) {
        case "dsa":
          return "Data Structures & Algorithms";
        case "daa":
          return "Design & Analysis of Algorithms";
        case "aptitude":
          return "Aptitude & Reasoning";
        default:
          return "Overall Performance";
      }
    };

    const getCategoryIcon = () => {
      switch (selectedCategory) {
        case "dsa":
          return <FaCrown className={styles.performanceIcon} />; // Updated to FaCrown
        case "daa":
          return <FiTarget className={styles.performanceIcon} />;
        case "aptitude":
          return <FiStar className={styles.performanceIcon} />;
        default:
          return <FiAward className={styles.performanceIcon} />;
      }
    };

    if (loadingRankings) {
      return (
        <div className={styles.performanceLoading}>
          <p>Loading performance rankings...</p>
        </div>
      );
    }

    const performanceData = getPerformanceData();
    const currentUserPerformance = getCurrentUserPerformance();

    return (
      <div className={styles.performanceTabContent}>
        <div className={styles.performanceHeader}>
          <h2>Performance Rankings</h2>
          <p>See how you rank among your peers in different subjects</p>
        </div>

        {/* Category Selector */}
        <div className={styles.categorySelector}>
          <button
            className={`${styles.categoryButton} ${
              selectedCategory === "overall" ? styles.activeCategory : ""
            }`}
            onClick={() => setSelectedCategory("overall")}
          >
            <FiAward /> Overall
          </button>
          <button
            className={`${styles.categoryButton} ${
              selectedCategory === "dsa" ? styles.activeCategory : ""
            }`}
            onClick={() => setSelectedCategory("dsa")}
          >
            <FaCrown /> DSA {/* Updated to FaCrown */}
          </button>
          <button
            className={`${styles.categoryButton} ${
              selectedCategory === "daa" ? styles.activeCategory : ""
            }`}
            onClick={() => setSelectedCategory("daa")}
          >
            <FiTarget /> DAA
          </button>
          <button
            className={`${styles.categoryButton} ${
              selectedCategory === "aptitude" ? styles.activeCategory : ""
            }`}
            onClick={() => setSelectedCategory("aptitude")}
          >
            <FiStar /> Aptitude
          </button>
        </div>

        {/* Current User Performance Card */}
        <div className={styles.userPerformanceCard}>
          <div className={styles.userPerformanceHeader}>
            {getCategoryIcon()}
            <div>
              <h3>Your {getCategoryTitle()} Ranking</h3>
              <p>Based on latest exam scores</p>
            </div>
          </div>
          <div className={styles.userPerformanceStats}>
            <div className={styles.performanceStat}>
              <span className={styles.statLabel}>Your Rank</span>
              <span
                className={`${styles.statValue} ${
                  currentUserPerformance.rank <= 3 ? styles.topRank : ""
                }`}
              >
                {currentUserPerformance.rank > 0
                  ? `#${currentUserPerformance.rank}`
                  : "Not Ranked"}
                {currentUserPerformance.rank === 1 && (
                  <FaCrown className={styles.crownIcon} />
                )}{" "}
                {/* Updated to FaCrown */}
              </span>
            </div>
            <div className={styles.performanceStat}>
              <span className={styles.statLabel}>Your Score</span>
              <span className={styles.statValue}>
                {currentUserPerformance.score}/100
              </span>
            </div>
            <div className={styles.performanceStat}>
              <span className={styles.statLabel}>Total Students</span>
              <span className={styles.statValue}>{performanceData.length}</span>
            </div>
          </div>
        </div>

        {/* Performance Rankings Table */}
        <div className={styles.rankingsTableContainer}>
          <div className={styles.rankingsHeader}>
            <h3>{getCategoryTitle()} Leaderboard</h3>
            <span className={styles.rankingsSubtitle}>
              Showing top {Math.min(performanceData.length, 10)} out of{" "}
              {performanceData.length} students
            </span>
          </div>

          {performanceData.length > 0 ? (
            <div className={styles.rankingsTable}>
              <div className={styles.tableHeader}>
                <div className={styles.tableCell}>Rank</div>
                <div className={styles.tableCell}>Student Name</div>
                <div className={styles.tableCell}>Student ID</div>
                <div className={styles.tableCell}>Score</div>
                <div className={styles.tableCell}>Status</div>
              </div>

              {performanceData.slice(0, 10).map((student, index) => (
                <div
                  key={student.id}
                  className={`${styles.tableRow} ${
                    student.id === auth.currentUser?.uid
                      ? styles.currentUserRow
                      : ""
                  }`}
                >
                  <div className={styles.tableCell}>
                    <div
                      className={`
                      ${styles.rankBadge} 
                      ${student.rank === 1 ? styles.rank1 : ""}
                      ${student.rank === 2 ? styles.rank2 : ""}
                      ${student.rank === 3 ? styles.rank3 : ""}
                    `}
                    >
                      {student.rank}
                      {student.rank <= 3 && (
                        <FaCrown className={styles.rankIcon} />
                      )}{" "}
                      {/* Updated to FaCrown */}
                    </div>
                  </div>
                  <div className={styles.tableCell}>
                    <div className={styles.studentInfo}>
                      <div className={styles.studentAvatar}>
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className={styles.studentName}>
                          {student.name}
                          {student.id === auth.currentUser?.uid && (
                            <span className={styles.youBadge}>YOU</span>
                          )}
                        </div>
                        <div className={styles.studentEmail}>
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.tableCell}>
                    <span className={styles.studentId}>
                      {student.studentId || "N/A"}
                    </span>
                  </div>
                  <div className={styles.tableCell}>
                    <div className={styles.scoreDisplay}>
                      <div className={styles.scoreValue}>
                        {selectedCategory === "dsa"
                          ? student.dsaScore
                          : selectedCategory === "daa"
                          ? student.daaScore
                          : selectedCategory === "aptitude"
                          ? student.aptitudeScore
                          : student.overallScore}
                        /100
                      </div>
                      <div className={styles.scoreBar}>
                        <div
                          className={styles.scoreFill}
                          style={{
                            width: `${
                              selectedCategory === "dsa"
                                ? student.dsaScore
                                : selectedCategory === "daa"
                                ? student.daaScore
                                : selectedCategory === "aptitude"
                                ? student.aptitudeScore
                                : student.overallScore
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.tableCell}>
                    <span
                      className={`
                      ${styles.statusBadge} 
                      ${
                        (selectedCategory === "dsa"
                          ? student.dsaScore
                          : selectedCategory === "daa"
                          ? student.daaScore
                          : selectedCategory === "aptitude"
                          ? student.aptitudeScore
                          : student.overallScore) >= 80
                          ? styles.excellent
                          : (selectedCategory === "dsa"
                              ? student.dsaScore
                              : selectedCategory === "daa"
                              ? student.daaScore
                              : selectedCategory === "aptitude"
                              ? student.aptitudeScore
                              : student.overallScore) >= 60
                          ? styles.good
                          : styles.average
                      }
                    `}
                    >
                      {(selectedCategory === "dsa"
                        ? student.dsaScore
                        : selectedCategory === "daa"
                        ? student.daaScore
                        : selectedCategory === "aptitude"
                        ? student.aptitudeScore
                        : student.overallScore) >= 80
                        ? "Excellent"
                        : (selectedCategory === "dsa"
                            ? student.dsaScore
                            : selectedCategory === "daa"
                            ? student.daaScore
                            : selectedCategory === "aptitude"
                            ? student.aptitudeScore
                            : student.overallScore) >= 60
                        ? "Good"
                        : "Average"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noRankings}>
              <FiAward size={48} className={styles.noRankingsIcon} />
              <h4>No Rankings Available</h4>
              <p>
                No students have taken the {getCategoryTitle().toLowerCase()}{" "}
                exam yet.
              </p>
              <button
                className={styles.takeExamButton}
                onClick={() => {
                  if (selectedCategory === "dsa") navigate("/DSAexam");
                  else if (selectedCategory === "daa") {
                    // Show DAA exam modal - you'll need to implement this
                    alert("DAA exam feature coming soon!");
                  } else if (selectedCategory === "aptitude")
                    navigate("/aptitude-exam");
                }}
              >
                Be the first to take the exam!
              </button>
            </div>
          )}
        </div>

        {/* Performance Insights */}
        <div className={styles.performanceInsights}>
          <h3>Performance Insights</h3>
          <div className={styles.insightsGrid}>
            <div className={styles.insightCard}>
              <h4>Top Performers</h4>
              <p>The top 3 students in {getCategoryTitle()} are:</p>
              {performanceData.slice(0, 3).map((student, index) => (
                <div key={student.id} className={styles.topPerformer}>
                  <span className={styles.performerRank}>#{student.rank}</span>
                  <span className={styles.performerName}>{student.name}</span>
                  <span className={styles.performerScore}>
                    {selectedCategory === "dsa"
                      ? student.dsaScore
                      : selectedCategory === "daa"
                      ? student.daaScore
                      : selectedCategory === "aptitude"
                      ? student.aptitudeScore
                      : student.overallScore}{" "}
                    points
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.insightCard}>
              <h4>Your Position</h4>
              <p>
                {currentUserPerformance.rank === 1
                  ? "🎉 You're leading the pack! Keep up the excellent work."
                  : currentUserPerformance.rank <= 3
                  ? `You're in the top ${currentUserPerformance.rank} students!`
                  : currentUserPerformance.rank > 0
                  ? `You're currently ranked #${currentUserPerformance.rank} out of ${performanceData.length} students.`
                  : "You haven't taken this exam yet. Take it to get ranked!"}
              </p>
              {currentUserPerformance.rank > 1 &&
                currentUserPerformance.rank > 0 &&
                performanceData.length > 1 && (
                  <div className={styles.improvementTip}>
                    <strong>To move up:</strong> You need{" "}
                    {selectedCategory === "dsa"
                      ? performanceData[currentUserPerformance.rank - 2]
                          .dsaScore -
                        currentUserPerformance.score +
                        1
                      : selectedCategory === "daa"
                      ? performanceData[currentUserPerformance.rank - 2]
                          .daaScore -
                        currentUserPerformance.score +
                        1
                      : selectedCategory === "aptitude"
                      ? performanceData[currentUserPerformance.rank - 2]
                          .aptitudeScore -
                        currentUserPerformance.score +
                        1
                      : performanceData[currentUserPerformance.rank - 2]
                          .overallScore -
                        currentUserPerformance.score +
                        1}{" "}
                    more points to reach rank #{currentUserPerformance.rank - 1}
                  </div>
                )}
            </div>

            <div className={styles.insightCard}>
              <h4>Class Average</h4>
              {performanceData.length > 0 ? (
                <>
                  <div className={styles.averageScore}>
                    {Math.round(
                      performanceData.reduce(
                        (sum, student) =>
                          sum +
                          (selectedCategory === "dsa"
                            ? student.dsaScore
                            : selectedCategory === "daa"
                            ? student.daaScore
                            : selectedCategory === "aptitude"
                            ? student.aptitudeScore
                            : student.overallScore),
                        0
                      ) / performanceData.length
                    )}
                    /100
                  </div>
                  <p>
                    {currentUserPerformance.score > 0
                      ? currentUserPerformance.score >
                        Math.round(
                          performanceData.reduce(
                            (sum, student) =>
                              sum +
                              (selectedCategory === "dsa"
                                ? student.dsaScore
                                : selectedCategory === "daa"
                                ? student.daaScore
                                : selectedCategory === "aptitude"
                                ? student.aptitudeScore
                                : student.overallScore),
                            0
                          ) / performanceData.length
                        )
                        ? "You're performing above class average! 👍"
                        : "You're below class average. Keep practicing! 💪"
                      : "Take the exam to see how you compare to the class average."}
                  </p>
                </>
              ) : (
                <p>No data available for class average calculation.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* Sidebar - unchanged */}
      <aside
        className={`${styles.sidebar} ${
          !isSidebarExpanded ? styles.collapsed : ""
        }`}
      >
        <div className={styles.sidebarHeader}>
          <button className={styles.menuButton} onClick={toggleSidebar}>
            <FiMenu size={22} />
          </button>
        </div>
        <nav>
          <button
            className={`${styles.navButton} ${
              activeTab === "overview" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("overview")}
          >
            <FiBarChart2 size={20} />{" "}
            <span className={styles.navLabel}>Overview</span>
          </button>
          <button
            className={`${styles.navButton} ${
              activeTab === "classes" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("classes")}
          >
            <FiBook size={20} />{" "}
            <span className={styles.navLabel}>Classes</span>
          </button>
          <button
            className={`${styles.navButton} ${
              activeTab === "schedule" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("schedule")}
          >
            <FiCalendar size={20} />{" "}
            <span className={styles.navLabel}>Schedule</span>
          </button>
          <button
            className={`${styles.navButton} ${
              activeTab === "performance" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("performance")}
          >
            <FiAward size={20} />{" "}
            <span className={styles.navLabel}>Performance</span>
          </button>
          <button
            className={`${styles.navButton} ${
              activeTab === "leaderboard" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("leaderboard")}
          >
            <FiTrendingUp size={20} />{" "}
            <span className={styles.navLabel}>Leaderboard</span>
          </button>
          <button
            className={`${styles.navButton} ${
              activeTab === "friends" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("friends")}
          >
            <FiUsers size={20} />{" "}
            <span className={styles.navLabel}>Friends</span>
            {incomingRequests.length > 0 && isSidebarExpanded && (
              <span className={styles.navBadge}>{incomingRequests.length}</span>
            )}
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={styles.content}>
        {/* Header - unchanged */}
        <header className={styles.header}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} size={18} />
            <input
              className={styles.search}
              type="text"
              placeholder="Search courses, assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={styles.headerRight}>
            <div className={styles.notificationIcon}>
              <FiBell size={22} />
              {notifications > 0 && (
                <span className={styles.notificationBadge}>
                  {notifications}
                </span>
              )}
            </div>
            <div className={styles.profile} onClick={handleProfileClick}>
              <div className={styles.profileInitial}>
                {studentData.name.charAt(0)}
              </div>
              <div className={styles.profileInfo}>
                <span className={styles.profileName}>{studentData.name}</span>
                <span className={styles.profileClass}>{studentData.class}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className={styles.pageContainer}>
          {activeTab === "overview" && (
            <>
              <div className={styles.welcomeHeader}>
                <h1>Welcome back, {studentData.name}!</h1>
                <p>Here is your academic snapshot for today.</p>
              </div>
              <div className={styles.overviewGrid}>
                <div className={styles.mainColumn}>
                  <div className={styles.quickStats}>
                    <div className={styles.statCard}>
                      <FiUser />
                      <div>
                        <h3>Attendance</h3>
                        <p>{studentData.attendance}%</p>
                      </div>
                    </div>
                    <div className={styles.statCard}>
                      <FiAward />
                      <div>
                        <h3>GPA</h3>
                        <p>{studentData.gpa}</p>
                      </div>
                    </div>
                    <div className={styles.statCard}>
                      <FiClock />
                      <div>
                        <h3>Upcoming</h3>
                        <p>{studentData.upcomingAssignments.length} tasks</p>
                      </div>
                    </div>
                  </div>
                  <div className={styles.chartContainer}>
                    <h2>Performance Overview</h2>
                    <PerformanceChart data={studentData.recentGrades} />
                  </div>
                  <div className={styles.gradesContainer}>
                    <h2>Recent Grades</h2>
                    <div className={styles.gradesGrid}>
                      {studentData.recentGrades.map((grade, index) => (
                        <div key={index} className={styles.gradeCard}>
                          <h3>{grade.subject}</h3>
                          <div className={styles.gradeBadge}>{grade.grade}</div>
                          <div className={styles.progressBar}>
                            <div
                              className={styles.progressFill}
                              style={{ width: `${grade.progress}%` }}
                            ></div>
                          </div>
                          <p>{grade.progress}% mastery</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.assignmentsContainer}>
                    <h2>Upcoming Assignments</h2>
                    <div className={styles.assignmentsList}>
                      {studentData.upcomingAssignments.map(
                        (assignment, index) => (
                          <div key={index} className={styles.assignmentCard}>
                            <div className={styles.assignmentSubject}>
                              {assignment.subject.substring(0, 1)}
                            </div>
                            <div className={styles.assignmentDetails}>
                              <h3>{assignment.task}</h3>
                              <p>Due: {assignment.due}</p>
                            </div>
                            <button className={styles.assignmentButton}>
                              View
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.sideColumn}>
                  <div className={styles.announcements}>
                    <h2>Announcements</h2>
                    {studentData.announcements.map((ann, i) => (
                      <div key={i} className={styles.announcementCard}>
                        <h3>{ann.title}</h3>
                        <p>{ann.content}</p>
                        <span>{ann.date}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.quickLinks}>
                    <h2>Quick Links</h2>
                    <button className={styles.quickLink}>
                      View Report Card
                    </button>
                    <button className={styles.quickLink}>
                      School Calendar
                    </button>
                    <button className={styles.quickLink}>Resources</button>
                  </div>
                </div>
              </div>
            </>
          )}
          {activeTab === "leaderboard" && (
            <div className={styles.tabContent}>
              <h2>Class Leaderboard</h2>
              {loadingLeaderboard ? (
                <div className={styles.performanceLoading}>
                  <p>Loading leaderboard...</p>
                </div>
              ) : (
                <div className={styles.leaderboardContainer}>
                  <div className={styles.leaderboardHeader}>
                    <span>Rank</span>
                    <span>Name</span>
                    <span>GPA</span>
                    <span>Progress</span>
                  </div>
                  {leaderboardData.length > 0 ? (
                    leaderboardData.map((s) => (
                      <div
                        key={s.id}
                        className={`${styles.leaderboardRow} ${
                          s.id === auth.currentUser?.uid
                            ? styles.currentUser
                            : ""
                        }`}
                      >
                        <span>{s.rank}</span>
                        <span>{s.name}</span>
                        <span>{s.gpa.toFixed(1)}</span>
                        <div className={styles.progressContainer}>
                          <div className={styles.progressBar}>
                            <div
                              className={styles.progressFill}
                              style={{ width: `${s.progress}%` }}
                            ></div>
                          </div>
                          <span>{s.progress}%</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.noRankings}>
                      <FiAward size={48} className={styles.noRankingsIcon} />
                      <h4>No Leaderboard Data Available</h4>
                      <p>No students have completed exams yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* --- MODIFIED FRIENDS TAB --- */}
          {activeTab === "friends" && (
            <div className={styles.tabContent}>
              <div className={styles.friendsHeader}>
                <div>
                  <h2>Your Friends ({studentData.friends.length})</h2>
                  <p>Connect with classmates to see their progress.</p>
                </div>
                <button
                  className={styles.addFriendButton}
                  onClick={() => {
                    setIsAddFriendMode(!isAddFriendMode);
                    setFriendSearchResults([]);
                    setRequestStatusMsg("");
                    setFriendSearchInput("");
                  }}
                >
                  {isAddFriendMode ? <FiX size={18} /> : <FiPlus size={18} />}
                  {isAddFriendMode ? "Close Search" : "Add New Friend"}
                </button>
              </div>

              {/* Incoming Requests Section */}
              {incomingRequests.length > 0 && (
                <div className={styles.requestsSection}>
                  <h3>
                    Incoming Requests{" "}
                    <span className={styles.requestCountBadge}>
                      {incomingRequests.length}
                    </span>
                  </h3>
                  <div className={styles.requestsGrid}>
                    {incomingRequests.map((req) => (
                      <div key={req.id} className={styles.requestCard}>
                        <div className={styles.requestInfo}>
                          <div className={styles.requestAvatar}>
                            {req.fromName.charAt(0)}
                          </div>
                          <div>
                            <span className={styles.requestName}>
                              {req.fromName}
                            </span>
                            <span className={styles.requestSub}>
                              wants to be friends
                            </span>
                          </div>
                        </div>
                        <div className={styles.requestActions}>
                          <button
                            className={styles.acceptBtn}
                            onClick={() => acceptRequest(req)}
                          >
                            <FiCheck size={16} /> Accept
                          </button>
                          <button
                            className={styles.declineBtn}
                            onClick={() => declineRequest(req.id)}
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Friend Search Box */}
              {isAddFriendMode && (
                <div className={styles.addFriendContainer}>
                  <div className={styles.searchContainer}>
                    <form
                      onSubmit={handleSearchUsers}
                      className={styles.friendSearchForm}
                    >
                      <input
                        type="text"
                        placeholder="Search by Name or Student ID..."
                        value={friendSearchInput}
                        onChange={(e) => setFriendSearchInput(e.target.value)}
                        className={styles.friendSearchInput}
                      />
                      <button
                        type="submit"
                        className={styles.friendSearchBtn}
                        disabled={searchLoading}
                      >
                        {searchLoading ? "Searching..." : <FiSearch />}
                      </button>
                    </form>
                    {requestStatusMsg && (
                      <p className={styles.statusMsg}>{requestStatusMsg}</p>
                    )}
                  </div>

                  {friendSearchResults.length > 0 && (
                    <div className={styles.searchResults}>
                      {friendSearchResults.map((user) => (
                        <div key={user.id} className={styles.resultCard}>
                          <div className={styles.resultInfo}>
                            <div className={styles.resultAvatar}>
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className={styles.resultName}>{user.name}</p>
                              <p className={styles.resultId}>
                                {user.studentId || "No ID"}
                              </p>
                            </div>
                          </div>
                          <button
                            className={styles.sendRequestBtn}
                            onClick={() => sendFriendRequest(user)}
                          >
                            Send Request
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Friends List */}
              <div className={styles.friendsContainer}>
                {studentData.friends.length > 0 ? (
                  studentData.friends.map((friend, index) => (
                    <div key={index} className={styles.friendCard}>
                      <div className={styles.friendInfo}>
                        <div className={styles.friendAvatar}>
                          <div
                            className={`${styles.statusIndicator} ${
                              styles[friend.status]
                            }`}
                          ></div>
                          {friend.name.charAt(0)}
                        </div>
                        <div>
                          <h3>{friend.name}</h3>
                          <p>
                            {friend.status === "online" ? "Online" : "Offline"}
                          </p>
                        </div>
                      </div>
                      <div className={styles.friendProgress}>
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressFill}
                            style={{ width: `${friend.progress}%` }}
                          ></div>
                        </div>
                        <span>{friend.progress}%</span>
                      </div>
                      <button className={styles.messageButton}>
                        <FiMessageSquare size={16} /> Message
                      </button>
                    </div>
                  ))
                ) : (
                  <div className={styles.noFriendsState}>
                    <FiUsers size={40} />
                    <p>You haven't added any friends yet.</p>
                    <p>Click "Add New Friend" to find your classmates!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "classes" && (
            <div className={styles.tabContent}>
              <h2>Your Classes</h2>
              <p>Class content would go here.</p>
            </div>
          )}
          {activeTab === "schedule" && (
            <div className={styles.tabContent}>
              <h2>Class Schedule</h2>
              <p>Schedule content would go here.</p>
            </div>
          )}
          {activeTab === "performance" && <PerformanceTabContent />}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
