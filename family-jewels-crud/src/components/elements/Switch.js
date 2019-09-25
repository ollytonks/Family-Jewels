import React from 'react';
import './Switch.css';

/* This is a simple class for a switch which can be used on any page
  It uses isOn to check its state, handled in the parent component.
  handleToggle is a lambda function in parent component.
  */

const Switch = ( {isOn, handleToggle, isArchiveBackground} ) => {

  return (
    <div
        className={isArchiveBackground ? 'background-archive' : 'background-classic'}>
      <input
        checked={isOn}
        onChange={handleToggle}
        className="react-switch-checkbox"
        id={`react-switch-new`}
        type="checkbox"
      />
      <label
        text = {isOn ? "Archived" : ""}
        style={{ background: isOn ? '#57496A' :'#FEBD59'}}
        className="react-switch-label"
        htmlFor={`react-switch-new`}
      >
        <span className={`react-switch-button`} />
      </label>
      </div>
  );
};

export default Switch;
