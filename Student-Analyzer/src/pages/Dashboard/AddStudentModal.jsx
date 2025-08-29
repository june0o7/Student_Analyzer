import { useState } from "react";
import style from "./Dashboard.module.css";
import { FiX } from "react-icons/fi";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../Firebase_Config/firebaseConfig";
import { getAuth } from "firebase/auth";

const AddStudentModal = ({ isOpen, onClose, onAddStudent }) => {
  const [studentId, setStudentId] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser ? auth.currentUser.uid : null;

  if (!isOpen) {
    return null;
  }

  // Function to check if student ID exists in Firebase
  const checkStudentIdExists = async (id) => {
    try {
      const querySnapshot = await getDocs(collection(db, "students"));
      const students = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Check if any student has the matching ID
      return students.some((student) => student.studentId === id);
    } catch (error) {
      console.error("Error checking student ID:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!studentId.trim()) {
      alert("Please enter a student ID.");
      return;
    }

    setIsChecking(true);

    try {
      // Check if student ID already exists

      const idExists = await checkStudentIdExists(studentId);

      if (idExists) {
        alert("Student ID already exists in the database.");

        const docRef = doc(db, "teachers", user);
        const docSnap = await getDoc(docRef);
        console.log("Document data:", docSnap.data().sids);

        try {
          await updateDoc(doc(db, "teachers", user), {
            sids: [...docSnap.data().sids, studentId],
          });
        } catch (error) {
          console.error("Error updating document: ", error);

          alert(
            `Failed to link student ID (${studentId}) to teacher ID (${user}). Please try again.`
          );

          return;
        }
        setIsChecking(false);
        onAddStudent(studentId);
        setStudentId("");
        onClose();
        return;
      } else {
        alert("Student ID is not available.");
        onClose();
      }

      onClose();
    } catch (error) {
      console.error("Error:", error);
      alert(
        "An error occurred while checking the student ID. Please try again."
      );
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className={style.modalBackdrop} onClick={onClose}>
      <div className={style.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={style.modalHeader}>
          <h2>Add New Student</h2>
          <button onClick={onClose} className={style.closeButton}>
            <FiX size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className={style.modalBody}>
          <div className={style.formGroup}>
            <label htmlFor="studentId">Student ID</label>
            <input
              type="text"
              id="studentId"
              className={style.modalInput}
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter student's unique ID"
              autoFocus
              disabled={isChecking}
            />
          </div>
          <div className={style.modalActions}>
            <button
              type="button"
              className={style.btnOutline}
              onClick={onClose}
              disabled={isChecking}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={style.btnPrimary}
              disabled={isChecking}
            >
              {isChecking ? "Checking..." : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;
