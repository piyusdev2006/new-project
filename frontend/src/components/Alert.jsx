import React from 'react';

const Alert = ({ type = 'info', message }) => {
  if (!message) return null;

  const className = `alert alert--${type}`;
  return (
    <div className={className} role="status" aria-live="polite">
      {message}
    </div>
  );
};

export default Alert;

