import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiAward, FiBarChart2, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import styles from './DSAReport.module.css';
import { auth, db } from '../../Firebase_Config/firebaseConfig';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useEffect, useState } from 'react';

const DSAReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const score = location.state?.score || 0;

  const [saving, setSaving] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  // Function to upload score to Firestore
  const saveScoreToFirestore = async () => {
    if (!auth.currentUser) {
      alert("You must be logged in to save your results.");
      return;
    }
    setSaving(true);
    try {
      const studentRef = doc(db, "students", auth.currentUser.uid);
      await updateDoc(studentRef, {
        dsaScores: arrayUnion({
          score: score,
          date: new Date().toISOString()
        })
      });
      console.log("Score uploaded successfully");
    } catch (err) {
      console.error("Error uploading score:", err);
      alert("Failed to save score.");
    } finally {
      setSaving(false);
    }
  };

  // Function to upload and go home
  const handleGoHome = async () => {
    await saveScoreToFirestore();
    navigate("/student-dashboard");
  };

  const getPerformanceMessage = (score) => {
    if (score >= 90) return "Excellent! You have exceptional DSA knowledge.";
    if (score >= 70) return "Good job! You have solid DSA fundamentals.";
    if (score >= 50) return "Fair performance. Keep practicing DSA concepts.";
    return "You need to work on your DSA skills. Keep learning!";
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return "#28a745";
    if (score >= 70) return "#17a2b8";
    if (score >= 50) return "#ffc107";
    return "#dc3545";
  };

  return (
    <div className={styles.reportContainer}>
      <div className={styles.reportContent}>
        <button className={styles.backButton} onClick={handleBack}>
          <FiArrowLeft size={20} />
        </button>

        <div className={styles.reportHeader}>
          <h1>DSA Exam Results</h1>
          <p>Your Data Structures and Algorithms assessment report</p>
        </div>

        <div className={styles.scoreSection}>
          <div 
            className={styles.scoreCircle}
            style={{ borderColor: getPerformanceColor(score) }}
          >
            <FiAward className={styles.scoreIcon} />
            <div className={styles.scoreValue}>{score}/100</div>
            <div className={styles.scoreLabel}>Overall Score</div>
          </div>
          
          <div 
            className={styles.performanceMessage}
            style={{ color: getPerformanceColor(score) }}
          >
            {getPerformanceMessage(score)}
          </div>
        </div>

        <div className={styles.detailedResults}>
          <h2>Detailed Breakdown</h2>
          
          <div className={styles.resultCard}>
            <h3>MCQ Section</h3>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${score}%`, backgroundColor: getPerformanceColor(score) }}
              ></div>
            </div>
            <div className={styles.sectionScore}>{score}% Correct</div>
            
            <div className={styles.questionAnalysis}>
              <div className={styles.correctAnswers}>
                <FiCheckCircle className={styles.correctIcon} />
                <span>15/20 questions correct</span>
              </div>
              <div className={styles.incorrectAnswers}>
                <FiXCircle className={styles.incorrectIcon} />
                <span>5/20 questions incorrect</span>
              </div>
            </div>
          </div>

          <div className={styles.resultCard}>
            <h3>Coding Section</h3>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${score - 10}%`, backgroundColor: getPerformanceColor(score - 10) }}
              ></div>
            </div>
            <div className={styles.sectionScore}>{score - 10}% Completed</div>
            
            <div className={styles.problemAnalysis}>
              <div className={styles.solvedProblems}>
                <FiCheckCircle className={styles.correctIcon} />
                <span>2/3 problems solved</span>
              </div>
              <div className={styles.unsolvedProblems}>
                <FiXCircle className={styles.incorrectIcon} />
                <span>1/3 problems unsolved</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.recommendations}>
          <h2>Recommendations</h2>
          <ul>
            <li>Practice more array and string manipulation problems</li>
            <li>Study time complexity analysis for different algorithms</li>
            <li>Work on tree and graph traversal techniques</li>
            <li>Review dynamic programming concepts</li>
          </ul>
        </div>

        <div className={styles.actions}>
          <button className={styles.retryButton}>Retry Exam</button>
          <button className={styles.practiceButton}>Practice Problems</button>
          <button 
            className={styles.practiceButton} 
            onClick={handleGoHome}
            disabled={saving}
          >
            {saving ? "Saving..." : "Go to Dashboard"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DSAReport;
