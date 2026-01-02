import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiAward, FiBarChart2, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import styles from './AptitudeReport.module.css';
import { auth, db } from '../../Firebase_Config/firebaseConfig';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useState } from 'react';

const AptitudeReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const score = location.state?.score || 0;
  const [saving, setSaving] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const saveScoreToFirestore = async () => {
    if (!auth.currentUser) {
      alert("You must be logged in to save your results.");
      return;
    }
    setSaving(true);
    try {
      const studentRef = doc(db, "students", auth.currentUser.uid);
      await updateDoc(studentRef, {
        aptitudeScores: arrayUnion({
          score: score,
          date: new Date().toISOString()
        })
      });
      console.log("Aptitude score uploaded successfully");
    } catch (err) {
      console.error("Error uploading aptitude score:", err);
      alert("Failed to save score.");
    } finally {
      setSaving(false);
    }
  };

  const handleGoHome = async () => {
    await saveScoreToFirestore();
    navigate("/student-dashboard");
  };

  const getPerformanceMessage = (score) => {
    if (score >= 90) return "Excellent! You have exceptional aptitude skills.";
    if (score >= 70) return "Good job! You have strong analytical abilities.";
    if (score >= 50) return "Fair performance. Keep practicing aptitude questions.";
    return "You need to work on your quantitative and reasoning skills.";
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
          <h1>Aptitude & Reasoning Results</h1>
          <p>Your quantitative and logical reasoning assessment report</p>
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
            <h3>Quantitative Aptitude</h3>
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
                <span>8/10 questions correct</span>
              </div>
              <div className={styles.incorrectAnswers}>
                <FiXCircle className={styles.incorrectIcon} />
                <span>2/10 questions incorrect</span>
              </div>
            </div>
          </div>

          <div className={styles.resultCard}>
            <h3>Logical Reasoning</h3>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${score - 5}%`, backgroundColor: getPerformanceColor(score - 5) }}
              ></div>
            </div>
            <div className={styles.sectionScore}>{score - 5}% Correct</div>
            
            <div className={styles.questionAnalysis}>
              <div className={styles.correctAnswers}>
                <FiCheckCircle className={styles.correctIcon} />
                <span>7/10 questions correct</span>
              </div>
              <div className={styles.incorrectAnswers}>
                <FiXCircle className={styles.incorrectIcon} />
                <span>3/10 questions incorrect</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.recommendations}>
          <h2>Recommendations</h2>
          <ul>
            <li>Practice more quantitative problems involving percentages and ratios</li>
            <li>Work on speed calculation and time management</li>
            <li>Study logical reasoning patterns and series completion</li>
            <li>Practice data interpretation from charts and graphs</li>
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

export default AptitudeReport;