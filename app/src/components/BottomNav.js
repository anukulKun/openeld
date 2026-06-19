import React from 'react';

const items = [
  ['planner', 'Plan Trip', 'Plan'],
  ['dashboard', 'My Hours', 'Time'],
  ['history', 'Logs', 'Logs'],
];

function BottomNav({ currentPage, onPageChange, onAuthClick, user }) {
  return (
    <nav className="bottom-nav" aria-label="Mobile primary views">
      {items.map(([id, label, icon]) => (
        <button key={id} className={currentPage === id ? 'bottom-nav-item active' : 'bottom-nav-item'} type="button" onClick={() => onPageChange(id)}>
          <span>{icon}</span>
          <b>{label}</b>
        </button>
      ))}
      <button className="bottom-nav-item auth" type="button" onClick={onAuthClick}>
        <span>{user ? 'Out' : 'In'}</span>
        <b>{user ? 'Sign Out' : 'Sign In'}</b>
      </button>
    </nav>
  );
}

export default BottomNav;

