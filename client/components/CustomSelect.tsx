import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  label,
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<"down" | "up">("down");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (!triggerRef.current || !contentRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentHeight = contentRef.current.scrollHeight;
      const spaceBelow = window.innerHeight - triggerRect.bottom;

      // Only flip to up if there's very little space below (less than content height + margin)
      // Otherwise always drop down
      if (spaceBelow < contentHeight && spaceBelow < 150) {
        setPosition("up");
      } else {
        setPosition("down");
      }
    };

    // Small delay to ensure DOM is rendered
    const timer = setTimeout(updatePosition, 0);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % options.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
        break;
      case "Enter":
        e.preventDefault();
        onChange(options[highlightedIndex].value);
        setIsOpen(false);
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const selectedLabel = options.find((opt) => opt.value === value)?.label || placeholder;

  return (
    <div className="relative w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-[#1a1a1a] mb-2">
          {label}
        </label>
      )}

      <button
        ref={triggerRef}
        id={selectId}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1db584] focus:border-transparent transition text-sm text-left flex items-center justify-between bg-white ${className}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={label || "Select option"}
      >
        <span className="text-[#1a1a1a]">{selectedLabel}</span>
        <ChevronDown
          size={16}
          className={`text-[#666666] transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <>
          {/* Overlay to close dropdown */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown menu */}
          <div
            ref={contentRef}
            role="listbox"
            aria-label={label || "Options"}
            className={`absolute left-0 right-0 z-50 bg-white border border-[#e5e5e5] rounded-lg shadow-lg overflow-hidden ${
              position === "up" ? "bottom-full mb-2" : "top-full mt-2"
            }`}
          >
            <div className="max-h-60 overflow-y-auto">
              {options.map((option, index) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  role="option"
                  aria-selected={value === option.value}
                  className={`w-full px-3 py-2.5 text-left text-sm hover:bg-[#f3f3f3] transition ${
                    value === option.value
                      ? "bg-[#e8f5f0] text-[#1db584] font-medium"
                      : "text-[#1a1a1a]"
                  } ${
                    highlightedIndex === index ? "bg-[#f3f3f3]" : ""
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
