"use client";

import React from "react";

const TasksSkeleton = () => {
  return (
    <div className="flex flex-col w-full px-20">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="bg-white shadow rounded-lg p-4 mb-4 animate-pulse flex justify-between items-start"
        >
          <div className="flex flex-col gap-2 w-full">
            <div className="h-5 bg-gray-300 rounded w-1/3"></div>
            <div className="h-3 bg-gray-300 rounded w-2/3"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-gray-300 rounded"></div>
            <div className="h-6 w-10 bg-gray-300 rounded"></div>
            <div className="h-6 w-10 bg-gray-300 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TasksSkeleton;
