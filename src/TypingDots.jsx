import React from "react";

const TypingDots = () => {
  return (
    <div className="flex items-center justify-center h-6 rounded-md">
      <div className="flex gap-1 bg-gray-200 rounded-md p-2">
        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0s]"></span>
        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
      </div>
    </div>
  );
};

export default TypingDots;
