import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Plus } from "lucide-react";

interface Option {
    id: string;
    name: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (id: string) => void;
    placeholder?: string;
    onAddNew?: () => void;
    addNewLabel?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = "Select...",
    onAddNew,
    addNewLabel = "Add New",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.id === value);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const filteredOptions = options.filter((opt) =>
        opt.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
        <div className="relative" ref={wrapperRef}>
            <div
                className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm flex items-center justify-between h-[38px]"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span
                    className={`block truncate ${!selectedOption ? "text-gray-500" : "text-gray-900"}`}
                >
                    {selectedOption ? selectedOption.name : placeholder}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-hidden sm:text-sm">
                    <div className="sticky top-0 z-10 bg-white px-2 py-1.5 border-b">
                        <div className="relative">
                            <Search className="absolute left-2 top-1.5 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                className="w-full pl-8 pr-3 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="max-h-48 overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                            <div className="text-gray-500 px-3 py-2 text-center text-sm">
                                No results found
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.id}
                                    className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-brand-50 ${
                                        option.id === value
                                            ? "bg-brand-50 text-brand-700 font-medium"
                                            : "text-gray-900"
                                    }`}
                                    onClick={() => {
                                        onChange(option.id);
                                        setIsOpen(false);
                                        setSearchTerm("");
                                    }}
                                >
                                    {option.name}
                                </div>
                            ))
                        )}
                    </div>

                    {onAddNew && (
                        <div
                            className="border-t border-gray-100 cursor-pointer select-none relative py-2 pl-3 pr-9 text-brand-600 hover:bg-gray-50 font-medium flex items-center gap-2 sticky bottom-0 bg-white"
                            onClick={() => {
                                onAddNew();
                                setIsOpen(false);
                            }}
                        >
                            <Plus className="w-4 h-4" />
                            {addNewLabel}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
