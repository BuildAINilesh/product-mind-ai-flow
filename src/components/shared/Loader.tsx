import React from "react";

interface LoaderProps {
  size?: "small" | "medium" | "large";
}

const Loader: React.FC<LoaderProps> = ({ size = "medium" }) => {
  const getSizeClass = () => {
    switch (size) {
      case "small":
        return "w-4 h-4";
      case "large":
        return "w-8 h-8";
      case "medium":
      default:
        return "w-6 h-6";
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${getSizeClass()} border-2 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin`}
      ></div>
    </div>
  );
};

export default Loader;
