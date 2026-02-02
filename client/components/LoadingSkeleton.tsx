import React from "react";

export function SkeletonCard() {
  return (
    <div className="bg-white border border-[#e5e5e5] rounded-lg p-4 animate-pulse">
      <div className="h-6 bg-[#e5e5e5] rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-[#e5e5e5] rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-[#e5e5e5] rounded w-2/3"></div>
    </div>
  );
}

export function SkeletonLine() {
  return <div className="h-4 bg-[#e5e5e5] rounded animate-pulse mb-2"></div>;
}

export function SkeletonTable() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white border border-[#e5e5e5] rounded-lg p-4 animate-pulse flex justify-between">
          <div className="flex-1">
            <div className="h-4 bg-[#e5e5e5] rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-[#e5e5e5] rounded w-1/4"></div>
          </div>
          <div className="h-4 bg-[#e5e5e5] rounded w-20"></div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-white border border-[#e5e5e5] rounded-lg p-6 animate-pulse">
      <div className="h-6 bg-[#e5e5e5] rounded w-1/4 mb-4"></div>
      <div className="flex items-end justify-around gap-2 h-40">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-[#e5e5e5] rounded" style={{ width: "15%", height: `${Math.random() * 100 + 50}px` }}></div>
        ))}
      </div>
    </div>
  );
}
