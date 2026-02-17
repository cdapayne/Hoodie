import { useState, useEffect } from 'react';
import axios from 'axios';
import './MarketingManager.css';

const API_URL = 'http://localhost:3001/api';

function MarketingManager() {
  const [marketing, setMarketing] = useState({
    announcements: [],
    hero: {},
    countdownTimer: {}
  });
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMarketing();
    fetchUploads();
  }, []);

  const fetchMarketing = async () => {
    try {
      const response = await axios.get(`${API_URL}/marketing`);
      setMarketing(response.data);
    } catch (error) {
      console.error('Error fetching marketing:', error);
    }
  };

  const fetchUploads = async () => {
    try {
      const response = await axios.get(`${API_URL}/uploads`);
      setUploadedFiles(response.data.files || []);
    } catch (error) {
      console.error('Error fetching uploads:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    if (files.length === 1) {
      formData.append('file', files[0]);
      try {
        const response = await axios.post(`${API_URL}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert(`File uploaded: ${response.data.url}`);
        fetchUploads();
      } catch (error) {
        alert('Upload failed: ' + (error.response?.data?.error || error.message));
      }
    } else {
      for (let file of files) {
        formData.append('files', file);
      }
      try {
        const response = await axios.post(`${API_URL}/upload-multiple`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert(`${response.data.files.length} files uploaded`);
        fetchUploads();
      } catch (error) {
        alert('Upload failed: ' + (error.response?.data?.error || error.message));
      }
    }
    
    setUploading(false);
    e.target.value = '';
  };

  const deleteFile = async (filename) => {
    if (!confirm(`Delete ${filename}?`)) return;
    try {
      await axios.delete(`${API_URL}/uploads/${filename}`);
      alert('File deleted');
      fetchUploads();
    } catch (error) {
      alert('Delete failed: ' + (error.response?.data?.error || error.message));
    }
  };

  const copyUrl = (url) => {
    const fullUrl = `http://localhost:3001${url}`;
    navigator.clipboard.writeText(fullUrl);
    alert('URL copied to clipboard!');
  };

  const saveMarketing = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/marketing`, marketing);
      alert('Marketing content saved successfully!');
    } catch (error) {
      alert('Save failed: ' + (error.response?.data?.error || error.message));
    }
    setSaving(false);
  };

  const updateAnnouncement = (index, value) => {
    const newAnnouncements = [...(marketing.announcements || [])];
    newAnnouncements[index] = value;
    setMarketing({ ...marketing, announcements: newAnnouncements });
  };

  const addAnnouncement = () => {
    setMarketing({
      ...marketing,
      announcements: [...(marketing.announcements || []), '']
    });
  };

  const removeAnnouncement = (index) => {
    const newAnnouncements = (marketing.announcements || []).filter((_, i) => i !== index);
    setMarketing({ ...marketing, announcements: newAnnouncements });
  };

  const updateHero = (field, value) => {
    setMarketing({
      ...marketing,
      hero: { ...(marketing.hero || {}), [field]: value }
    });
  };

  const updateCountdown = (field, value) => {
    setMarketing({
      ...marketing,
      countdownTimer: { ...(marketing.countdownTimer || {}), [field]: value }
    });
  };

  return (
    <div className="marketing-manager">
      <h2>Marketing Content Manager</h2>

      {/* File Upload Section */}
      <section className="mm-section">
        <h3>📁 Media Library</h3>
        <div className="upload-area">
          <input
            type="file"
            id="file-upload"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label htmlFor="file-upload" className="upload-btn">
            {uploading ? 'Uploading...' : '📤 Upload Images/Videos'}
          </label>
          <p className="upload-hint">Supports: JPG, PNG, GIF, WebP, MP4, MOV (Max 10MB each)</p>
        </div>

        <div className="files-grid">
          {uploadedFiles.length === 0 ? (
            <p className="no-files">No files uploaded yet</p>
          ) : (
            uploadedFiles.map(file => (
              <div key={file.filename} className="file-card">
                {file.filename.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img src={`http://localhost:3001${file.url}`} alt={file.filename} />
                ) : (
                  <div className="file-icon">🎥</div>
                )}
                <div className="file-info">
                  <p className="file-name">{file.filename}</p>
                  <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
                  <div className="file-actions">
                    <button onClick={() => copyUrl(file.url)} className="btn-copy">📋 Copy URL</button>
                    <button onClick={() => deleteFile(file.filename)} className="btn-delete">🗑️ Delete</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Announcement Bar */}
      <section className="mm-section">
        <h3>📢 Announcement Bar Messages</h3>
        <p className="section-desc">These messages rotate in the top announcement bar</p>
        <div className="announcements-list">
          {(marketing.announcements || []).map((announcement, index) => (
            <div key={index} className="announcement-item">
              <input
                type="text"
                value={announcement}
                onChange={(e) => updateAnnouncement(index, e.target.value)}
                placeholder="Enter announcement message"
              />
              <button onClick={() => removeAnnouncement(index)} className="btn-remove">×</button>
            </div>
          ))}
        </div>
        <button onClick={addAnnouncement} className="btn btn-secondary">+ Add Announcement</button>
      </section>

      {/* Hero Section */}
      <section className="mm-section">
        <h3>🎯 Hero Section</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Eyebrow Text</label>
            <input
              type="text"
              value={marketing.hero?.eyebrow || ''}
              onChange={(e) => updateHero('eyebrow', e.target.value)}
              placeholder="Pop-Up Exclusive"
            />
          </div>
          <div className="form-group">
            <label>Main Title</label>
            <input
              type="text"
              value={marketing.hero?.title || ''}
              onChange={(e) => updateHero('title', e.target.value)}
              placeholder="LIMITED EDITION"
            />
          </div>
          <div className="form-group">
            <label>Subtitle</label>
            <input
              type="text"
              value={marketing.hero?.subtitle || ''}
              onChange={(e) => updateHero('subtitle', e.target.value)}
              placeholder="Exclusive Pop-Up Collection"
            />
          </div>
          <div className="form-group">
            <label>Tagline</label>
            <input
              type="text"
              value={marketing.hero?.tagline || ''}
              onChange={(e) => updateHero('tagline', e.target.value)}
              placeholder="High fashion, accessible to all"
            />
          </div>
          <div className="form-group">
            <label>CTA Button Text</label>
            <input
              type="text"
              value={marketing.hero?.ctaText || ''}
              onChange={(e) => updateHero('ctaText', e.target.value)}
              placeholder="Shop the Collection"
            />
          </div>
          <div className="form-group">
            <label>CTA Button Link</label>
            <input
              type="text"
              value={marketing.hero?.ctaLink || ''}
              onChange={(e) => updateHero('ctaLink', e.target.value)}
              placeholder="#products"
            />
          </div>
        </div>
      </section>

      {/* Countdown Timer */}
      <section className="mm-section">
        <h3>⏰ Countdown Timer</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Timer Label</label>
            <input
              type="text"
              value={marketing.countdownTimer?.label || ''}
              onChange={(e) => updateCountdown('label', e.target.value)}
              placeholder="Pop-Up Sale Ends In"
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={marketing.countdownTimer?.enabled !== false}
                onChange={(e) => updateCountdown('enabled', e.target.checked)}
                style={{ width: 'auto', marginRight: '0.5rem' }}
              />
              Enable Countdown Timer
            </label>
          </div>
        </div>
      </section>

      <div className="mm-actions">
        <button onClick={saveMarketing} disabled={saving} className="btn btn-primary btn-large">
          {saving ? 'Saving...' : '💾 Save All Marketing Content'}
        </button>
      </div>
    </div>
  );
}

export default MarketingManager;
