import React, { useState } from 'react';

const values = ['Value 1', 'Value 2', 'Value 3', 'Value 4'];

const MULTI = () => {
  const [selectedValue, setSelectedValue] = useState('');

  const handleClick = (value) => {
    setSelectedValue(value);
  };

  return (
    <div>
      <h1>Button Value Selector</h1>
      {values.map((value, index) => (
        <button key={index} onClick={() => handleClick(value)}>
          Button {index + 1}
        </button>
      ))}
      <p>Selected Value: {selectedValue}</p>
    </div>
  );
};

export default MULTI;