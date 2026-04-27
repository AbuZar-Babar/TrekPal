import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Lock, MapPin, FileText, Image as ImageIcon, Upload } from 'lucide-react';
import styles from './Signup.module.css';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
  });

  const [files, setFiles] = useState<{ docs: File | null; image: File | null }>({
    docs: null,
    image: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'docs' | 'image') => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [type]: e.target.files[0] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Signup data:', formData, files);
    // TODO: Implement actual signup logic with FormData
  };

  return (
    <div className={styles.signupContainer}>
      <div className={styles.signupCard}>
        <div className={styles.header}>
          <h1>Partner with TrekPal</h1>
          <p>Register your hotel and reach thousands of travelers</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="name">Hotel Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Grand Continental Hotel"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="manager@hotel.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="location">Location (City, Area)</label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="Mall Road, Murree"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.fileGrid}>
            <label className={`${styles.fileInput} ${files.docs ? styles.hasFile : ''}`} htmlFor="docs">
              <FileText size={20} />
              <span>{files.docs ? files.docs.name : 'Business Docs'}</span>
              <input 
                type="file" 
                style={{ display: 'none' }} 
                id="docs" 
                onChange={(e) => handleFileChange(e, 'docs')}
                accept=".pdf,.doc,.docx,image/*"
              />
            </label>
            <label className={`${styles.fileInput} ${files.image ? styles.hasFile : ''}`} htmlFor="image">
              <ImageIcon size={20} />
              <span>{files.image ? files.image.name : 'Location Image'}</span>
              <input 
                type="file" 
                style={{ display: 'none' }} 
                id="image" 
                onChange={(e) => handleFileChange(e, 'image')}
                accept="image/*"
              />
            </label>
          </div>

          <button type="submit" className={styles.submitBtn}>
            Create Account
          </button>
        </form>

        <div className={styles.footer}>
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
