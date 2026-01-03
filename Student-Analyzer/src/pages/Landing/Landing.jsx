import { useState, useEffect } from 'react';
import { FiArrowRight, FiUser, FiBook, FiActivity, FiGlobe, FiAward } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import styles from './Landing.module.css';
import student from '../icons_logos/lstudent.json'; //
import teacher from '../icons_logos/teacher.json'; //
import Lottie from 'lottie-react';
import sa_white from '../icons_logos/Sa_white.png'; //

const Landing = () => {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingIndex, setTypingIndex] = useState(0);
  const navigate = useNavigate();

  const typingSpeed = 80;
  const deletingSpeed = 40;
  const pauseDuration = 2000;

  // Updated phrases with Emojis
  const phrases = [
    "This is EduTrack",
    "Analyze..........💭 ",
    "Improve......💪 ",
    "Excel..........🎉",
    // "The Future is here🧑‍🎓" 
  ];

  useEffect(() => {
    const currentPhrase = phrases[loopNum % phrases.length];
    
    // FIX: Convert string to array to handle Emojis correctly as single characters
    const characters = [...currentPhrase]; 
    const fullLength = characters.length;

    let timer;

    if (isDeleting) {
      if (typingIndex > 0) {
        timer = setTimeout(() => {
          // Slice the array instead of the string
          setDisplayText(characters.slice(0, typingIndex - 1).join(''));
          setTypingIndex(typingIndex - 1);
        }, deletingSpeed);
      } else {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingIndex(0); // Reset index for next phrase
      }
    } else {
      if (typingIndex < fullLength) {
        timer = setTimeout(() => {
          setDisplayText(characters.slice(0, typingIndex + 1).join(''));
          setTypingIndex(typingIndex + 1);
        }, typingSpeed);
      } else {
        timer = setTimeout(() => setIsDeleting(true), pauseDuration);
      }
    }

    return () => clearTimeout(timer);
  }, [typingIndex, isDeleting, loopNum]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className={styles.container}>
      {/* Animated Background Elements */}
      <div className={styles.backgroundShapes}>
        <div className={styles.shape1}></div>
        <div className={styles.shape2}></div>
        <div className={styles.shape3}></div>
      </div>

      <div className={styles.content}>
        {/* Left: Welcome & Hero */}
        <div className={styles.welcomeSection}>
          <div className={styles.logoWrapper}>
            {/* <img src={sa_white} alt="Student Analyzer Logo" className={styles.mainLogo} /> */}
            <span className={styles.logoBadge}>BETA v2.0</span>
          </div>
          
          <div className={styles.heroContent}>
            <h1 className={styles.typewriter}>
              <span className={styles.gradientText}>{displayText}</span>
              <span className={styles.cursor}></span>
            </h1>
            <p className={styles.subtitle}>
              Dive into the universe of educational analytics. 
              Visualize progress, predict outcomes, and master your academic journey with 
              AI-powered insights.
            </p>
            
            <div className={styles.statsRow}>
              <div className={styles.statItem}>
                <h3>10k+</h3>
                <span>Students</span>
              </div>
              <div className={styles.divider}></div>
              <div className={styles.statItem}>
                <h3>98%</h3>
                <span>Success Rate</span>
              </div>
              <div className={styles.divider}></div>
              <div className={styles.statItem}>
                <h3>24/7</h3>
                <span>Analysis</span>
              </div>
            </div>

            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <FiActivity className={styles.featureIcon} />
                <span>Real-time Tracking</span>
              </div>
              <div className={styles.featureCard}>
                <FiGlobe className={styles.featureIcon} />
                <span>Global Standards</span>
              </div>
              <div className={styles.featureCard}>
                <FiAward className={styles.featureIcon} />
                <span>Smart Goals</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Login Portals */}
        <div className={styles.loginSection}>
          <div className={styles.glassPanel}>
            <h2 className={styles.loginTitle}>Choose Your Portal</h2>
            
            {/* Student Card */}
            <div className={`${styles.loginCard} ${styles.studentTheme}`}>
              <div className={styles.cardGlow}></div>
              <div className={styles.cardContent}>
                <div className={styles.cardText}>
                  <div className={styles.cardHeader}>
                    <div className={styles.iconCircle}>
                      <FiUser />
                    </div>
                    <h3>Student Access</h3>
                  </div>
                  <p>View grades, attendance, and personalized analytics.</p>
                  <div className={styles.actionButtons}>
                    <button onClick={() => handleNavigation('/student-login')} className={styles.primaryBtn}>
                      Login <FiArrowRight />
                    </button>
                    <button onClick={() => handleNavigation('/student-signup')} className={styles.secondaryBtn}>
                      Join
                    </button>
                  </div>
                </div>
                <div className={styles.lottieWrapper}>
                  <Lottie animationData={student} loop={true} />
                </div>
              </div>
            </div>

            {/* Teacher Card */}
            <div className={`${styles.loginCard} ${styles.teacherTheme}`}>
              <div className={styles.cardGlow}></div>
              <div className={styles.cardContent}>
                <div className={styles.cardText}>
                  <div className={styles.cardHeader}>
                    <div className={styles.iconCircle}>
                      <FiBook />
                    </div>
                    <h3>Teacher Access</h3>
                  </div>
                  <p>Manage classes, generate reports, and track performance.</p>
                  <div className={styles.actionButtons}>
                    <button onClick={() => handleNavigation('/teacher-login')} className={styles.primaryBtn}>
                      Login <FiArrowRight />
                    </button>
                    <button onClick={() => handleNavigation('/teacher-signup')} className={styles.secondaryBtn}>
                      Join
                    </button>
                  </div>
                </div>
                <div className={styles.lottieWrapper}>
                  <Lottie animationData={teacher} loop={true} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;