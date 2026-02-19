import React, { useState } from 'react';
import FormControl from '@mui/material/FormControl';
import { styled } from '@mui/material/styles';

const useStyles = styled({
  optgroup: {
    cursor: 'pointer',
  },
});

const SelectOption = ({ label, children }) => {
  const classes = useStyles();
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <FormControl>
      <div className={classes.optgroup} onClick={toggleExpanded}>
        {label}
      </div>
      {expanded && children}
    </FormControl>
  );
};

export default SelectOption;
