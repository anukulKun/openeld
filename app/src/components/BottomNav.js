import React from 'react';

const items = [
  ['planner', 'Plan Trip', 'Plan'],
  ['dashboard', 'My Hours', 'Time'],
  ['history', 'Log History', 'Log'],
];

function BottomNav({ currentPage, onPageChange }) {
  return (
    <nav className="bottom-nav" aria-label="Mobile primary views">
      {items.map(([id, label, icon]) => (
        <button key={id} className={currentPage === id ? 'bottom-nav-item active' : 'bottom-nav-item'} type="button" onClick={() => onPageChange(id)}>
          <span>{icon}</span>
          <b>{label}</b>
        </button>
      ))}
    </nav>
  );
}

export default BottomNav;

