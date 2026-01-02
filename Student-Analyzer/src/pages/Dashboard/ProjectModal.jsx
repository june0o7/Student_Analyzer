import { useState, useEffect } from "react";
import styles from "./StudentProfile.module.css";
import { FiX, FiGithub } from "react-icons/fi";

const ProjectModal = ({ isOpen, onClose, onSave, project, mode }) => {
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    githubUrl: "",
    technologies: ""
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (project) {
      setProjectData({
        name: project.name || "",
        description: project.description || "",
        githubUrl: project.githubUrl || "",
        technologies: project.technologies || ""
      });
    } else {
      setProjectData({
        name: "",
        description: "",
        githubUrl: "",
        technologies: ""
      });
    }
    setErrors({});
  }, [project]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!projectData.name.trim()) {
      newErrors.name = "Project name is required";
    }
    
    if (!projectData.githubUrl.trim()) {
      newErrors.githubUrl = "GitHub URL is required";
    } else if (!isValidGitHubUrl(projectData.githubUrl)) {
      newErrors.githubUrl = "Please enter a valid GitHub URL";
    }
    
    return newErrors;
  };

  const isValidGitHubUrl = (url) => {
    const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+\/?$/;
    return githubRegex.test(url);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    onSave(projectData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>{mode === "add" ? "Add New Project" : "Edit Project"}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.projectForm}>
          <div className={styles.formGroup}>
            <label htmlFor="name">
              Project Name *
              {errors.name && <span className={styles.errorText}> - {errors.name}</span>}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={projectData.name}
              onChange={handleChange}
              placeholder="Enter project name"
              className={errors.name ? styles.inputError : ""}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={projectData.description}
              onChange={handleChange}
              placeholder="Brief description of your project..."
              rows="3"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="githubUrl">
              GitHub URL *
              {errors.githubUrl && <span className={styles.errorText}> - {errors.githubUrl}</span>}
            </label>
            <div className={styles.urlInputGroup}>
              <FiGithub className={styles.urlIcon} />
              <input
                type="url"
                id="githubUrl"
                name="githubUrl"
                value={projectData.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/username/repository"
                className={errors.githubUrl ? styles.inputError : ""}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="technologies">Technologies Used</label>
            <input
              type="text"
              id="technologies"
              name="technologies"
              value={projectData.technologies}
              onChange={handleChange}
              placeholder="React, Node.js, MongoDB, etc. (comma separated)"
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton}>
              {mode === "add" ? "Add Project" : "Update Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;