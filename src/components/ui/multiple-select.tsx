import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";

interface MultiSelectProps {
  options?: string[];
  placeholder?: string;
  onChange?: (selectedValues: string[]) => void;
  value?: string[];
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options = [],
  placeholder = "Select options",
  onChange,
  value,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(value || []);
  const [searchTerm, setSearchTerm] = useState("");
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedOptions(value);
    }
  }, [value]);

  const toggleOption = (value: string) => {
    const newSelectedOptions = selectedOptions.includes(value)
      ? selectedOptions.filter((v) => v !== value)
      : [...selectedOptions, value];

    setSelectedOptions(newSelectedOptions);
    onChange?.(newSelectedOptions);
  };

  const removeOption = (value: string) => {
    const newSelectedOptions = selectedOptions.filter((v) => v !== value);
    setSelectedOptions(newSelectedOptions);
    onChange?.(newSelectedOptions);
  };

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={selectRef} className="relative min-w-64 z-10">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-2 border rounded cursor-pointer"
      >
        <div className="flex flex-wrap gap-1 max-h-[50px] max-w-[90%] overflow-y-auto scrollbar-hide">
          {selectedOptions.length === 0 ? (
            <span className="text-gray-500">{placeholder}</span>
          ) : (
            selectedOptions.map((value) => (
              <div
                key={value}
                className="flex items-center bg-blue-100 px-2 py-1 rounded text-sm"
              >
                {value}
                <X
                  size={16}
                  className="ml-1 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOption(value);
                  }}
                />
              </div>
            ))
          )}
        </div>
        <ChevronDown className="w-4 h-4" />
      </div>
      {isOpen && (
        <div className="absolute w-[70%] mt-1 border rounded shadow-lg max-h-60 bg-white min-w-[300px] overflow-hidden">
          <div className="sticky flex justify-between items-center gap-2 top-0 bg-white z-10 border-b">
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              ref={inputRef}
              className="w-full rounded p-2 m-1 focus:outline-none focus:border-blue-500"
            />
            <Button
              type="button"
              onClick={() => {
                setSelectedOptions([...options]);
                onChange?.([...options]);
              }}
              className="text-sm text-black bg-gray-100 hover:bg-gray-200 hover:text-blue-700"
            >
              Select All
            </Button>
            <Button
              type="button"
              onClick={() => {
                setSelectedOptions([]);
                onChange?.([]);
              }}
              className="text-sm text-black bg-gray-100 hover:bg-gray-200 hover:text-blue-700"
            >
              Clear
            </Button>
          </div>

          <div className="overflow-y-auto max-h-52 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  onClick={() => toggleOption(option)}
                  className={`p-2 cursor-pointer hover:bg-gray-100 ${
                    selectedOptions.includes(option)
                      ? "bg-blue-50 text-blue-600"
                      : ""
                  }`}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="p-2 text-gray-500">No options available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
