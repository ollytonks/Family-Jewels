import React, { Component, useState } from 'react';
import './Switch.css';

const Switch = ( {isOn, handleToggle, isClassicBackground} ) => {

  return (
    <div
        className={isClassicBackground ? 'background-classic' : 'background-archive'}>
      <input
        checked={isOn}
        onChange={handleToggle}
        className="react-switch-checkbox"
        id={`react-switch-new`}
        type="checkbox"
      />
      <label
        text = {isOn ? "Archive" : ""}
        style={{ background: isOn ? '#8D77AB' :'#FEBD59'}}
        className="react-switch-label"
        htmlFor={`react-switch-new`}
      >
        <span className={`react-switch-button`} />
      </label>
      </div>
  );
};

export default Switch;
