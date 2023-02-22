import React, { useEffect, useState } from 'react';

const ActionSheet = ({ children }) => {
  const [show, setShow] = useState<boolean>(false);
  const [hide, setHide] = useState<boolean>(false);

  useEffect(() => {
    setShow(true);
  }, []);

  return (
    <div
      id="action_sheet"
      className={`absolute float-left z-10 w-full h-full bg-black bg-opacity-70 ${show && 'animate-fade-in'} ${
        hide && 'animate-fade-out'
      }`}
    >
      <div
        className={`z-20 grid w-full h-full grid-cols-2 gap-4 p-4 mt-10 overflow-x-hidden overflow-y-scroll bg-white rounded-t-md ${
          show && 'animate-slide-up '
        } ${hide && 'animate-slide-down'}`}
      >
        {children}
      </div>
    </div>
  );
};

export default ActionSheet;
