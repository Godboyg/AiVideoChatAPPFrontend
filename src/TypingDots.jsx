import React from "react";

const TypingDots = () => {
  return (
    <div className="flex items-center justify-center h-6 pl-2">
      <div className="flex gap-1 bg-white rounded-md">
        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0s]"></span>
        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
      </div>
    </div>
  );
};

export default TypingDots;
