import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Auth.module.css";
import studentData from "../icons_logos/lstudent.json";
import Lottie from "lottie-react";
import { auth, db } from "../../Firebase_Config/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const StudentSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    studentId: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Student signup data:", formData);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const userId = userCredential.user.uid;

      await setDoc(doc(db, "students", userId), {
        name: formData.name,
        email: formData.email,
        studentId: formData.studentId,
        createdAt: new Date(),
        role: "student",
      });
      navigate("/student-login");

    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.backgroundShapes}>
        <div className={styles.shape1}></div>
        <div className={styles.shape2}></div>
        <div className={styles.shape3}></div>
      </div>

      <div className={styles.authCard}>
        <div className={styles.authLeft}>
          <Lottie
            animationData={studentData}
            loop={true}
            className={styles.authAnimation}
          />
          <h2>Join the Network</h2>
          <p>Start your data-driven academic journey</p>
        </div>

        <div className={styles.authRight}>
          <h1>Student Sign Up</h1>

          <form onSubmit={handleSubmit} className={styles.authForm}>
            {error && <div className={styles.authError}>{error}</div>}

            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="studentId">Student ID</label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                required
                placeholder="Enter your student ID"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a password"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              className={styles.authButton}
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>

            <div className={styles.authFooter}>
              Already have an account? <Link to="/student-login">Log in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentSignup;