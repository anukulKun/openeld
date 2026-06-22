import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileEditModal from './ProfileEditModal';

export default function ProfileMenu({ user }) {
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const menuRef = useRef(null);

  const [override, setOverride] = useState(null);

  useEffect(() => {
    setImgFailed(false);
  }, [user?.photoURL]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  if (!user) return null;

  const displayName =
    override?.displayName ||
    user.displayName ||
    (user.email ? user.email.split('@')[0] : 'Driver');
  const photoURL = override?.photoURL !== undefined ? override.photoURL : user.photoURL;
  const initial = displayName.charAt(0).toUpperCase();
  const showImage = photoURL && !imgFailed;

  const handleSignOut = async () => {
    setOpen(false);
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        type="button"
        className="profile-menu-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {showImage ? (
          <img
            src={photoURL}
            alt={displayName}
            className="profile-avatar-img"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span className="profile-avatar-fallback">{initial}</span>
        )}
      </button>

      {open && (
        <div className="profile-menu-dropdown" role="menu">
          <div className="profile-menu-header">
            {showImage ? (
              <img
                src={photoURL}
                alt={displayName}
                className="profile-avatar-img profile-avatar-img-lg"
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <span className="profile-avatar-fallback profile-avatar-fallback-lg">
                {initial}
              </span>
            )}
            <div className="profile-menu-identity">
              <span className="profile-menu-name">{displayName}</span>
              {user.email && <span className="profile-menu-email">{user.email}</span>}
            </div>
          </div>

          <div className="profile-menu-divider" />

          <button
            type="button"
            role="menuitem"
            className="profile-menu-item"
            onClick={() => {
              setOpen(false);
              setEditOpen(true);
            }}
          >
            Edit profile
          </button>

          <button
            type="button"
            role="menuitem"
            className="profile-menu-item profile-menu-signout"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      )}

      {editOpen && (
        <ProfileEditModal
          user={user}
          currentDisplayName={displayName}
          currentPhotoURL={showImage ? photoURL : null}
          onClose={() => setEditOpen(false)}
          onSaved={(next) => {
            setOverride(next);
            setImgFailed(false);
            setEditOpen(false);
          }}
        />
      )}
    </div>
  );
}
