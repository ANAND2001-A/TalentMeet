import React from 'react';

const CustomButton = ({ type = 'button', disabled = false, text, onClick }) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="
        w-full
        py-2
        text-black
        rounded-lg
        transition
        duration-150
        ease-in-out
        bg-white
        backdrop-blur-md
        border
        border-white/20
        hover:bg-white
        hover:border-white/30
        shadow-md
      "
    >
      {text}
    </button>
  );
};

export default CustomButton;
