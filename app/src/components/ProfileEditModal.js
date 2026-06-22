import { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import { updateDriverProfile } from '../api/client';

export default function ProfileEditModal({
  user,
  currentDisplayName,
  currentPhotoURL,
  onClose,
  onSaved,
}) {
  const googlePhotoURL = user.providerData?.find(
    (p) => p.providerId === 'google.com'
  )?.photoURL;

  const [name, setName] = useState(currentDisplayName || '');
  const [photoURL, setPhotoURL] = useState(currentPhotoURL || '');
  const [photoInputError, setPhotoInputError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const initial = (name || 'D').charAt(0).toUpperCase();
  const showPreview = photoURL && !photoInputError;

  const handleUseGooglePhoto = () => {
    if (googlePhotoURL) {
      setPhotoURL(googlePhotoURL);
      setPhotoInputError(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name can\u2019t be empty.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateProfile(auth.currentUser, {
        displayName: name.trim(),
        photoURL: photoURL || null,
      });
      const token = await auth.currentUser.getIdToken();
      await updateDriverProfile(token, { name: name.trim() });
      onSaved({ displayName: name.trim(), photoURL: photoURL || null });
    } catch (err) {
      console.error('Profile update failed:', err);
      setError('Couldn\u2019t save changes. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h3>Edit profile</h3>
          <button
            type="button"
            className="profile-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            {'\u00d7'}
          </button>
        </div>

        <div className="profile-modal-avatar-row">
          {showPreview ? (
            <img
              src={photoURL}
              alt="Profile preview"
              className="profile-modal-avatar-preview"
              referrerPolicy="no-referrer"
              onError={() => setPhotoInputError(true)}
            />
          ) : (
            <span className="profile-modal-avatar-fallback">{initial}</span>
          )}

          <div className="profile-modal-avatar-actions">
            <label className="profile-modal-label">Photo URL</label>
            <input
              type="text"
              className="profile-modal-input"
              placeholder="https://..."
              value={photoURL}
              onChange={(e) => {
                setPhotoURL(e.target.value);
                setPhotoInputError(false);
              }}
            />
            {googlePhotoURL && (
              <button
                type="button"
                className="profile-modal-link-btn"
                onClick={handleUseGooglePhoto}
              >
                Use Google photo
              </button>
            )}
          </div>
        </div>

        <label className="profile-modal-label">Display name</label>
        <input
          type="text"
          className="profile-modal-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />

        {user.email && (
          <>
            <label className="profile-modal-label">Email</label>
            <input
              type="text"
              className="profile-modal-input profile-modal-input-readonly"
              value={user.email}
              readOnly
            />
          </>
        )}

        {error && <p className="profile-modal-error">{error}</p>}

        <div className="profile-modal-actions">
          <button type="button" className="profile-modal-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="profile-modal-btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving\u2026' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
