/**
 * Copyright (c) 2019
 *
 * Loads a pluggable toggle-switch with functions that can be used on any page
 * but must be handled in parent component. IsOn checks its state, handled
 * in parent, and handleToggle is a lambda function in parent.
 *
 * @summary Displays a timeline of heirlooms
 * @author FamilyJewels
 *
 * Created at     : 2019-10-02
 * Last modified  : 2019-10-15
 */

 import React from 'react';
import './Switch.css';

const Switch = ( {isOn, handleToggle, isArchiveBackground} ) => {

    return (
      <div
          className='toggle-box'>
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
