/**
 * TagAutoComplete Component
 * 
 * Advanced tag input component with auto-complete, validation, and hierarchy visualization.
 * Implements Phase 1 enhancements from TAGGING_SYSTEM_PRD.md:
 * - Tag auto-complete dropdown with existing tag suggestions
 * - Tag validation to enforce kebab-case format  
 * - Visual hierarchy showing umbrella → specific relationships
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  TagIcon, 
  XMarkIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { HabitAPI } from '../services/api';
import { UMBRELLA_TAGS, TagValidation } from '../types/tags';

interface TagAutoCompleteProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  habitName?: string; // Used for smart suggestions
}

interface ApprovedTagsData {
  umbrella_tags: string[];
  all_approved_tags: string[];
  tag_hierarchy: Record<string, string[]>;
  contextual_tags: string[];
}

export const TagAutoComplete: React.FC<TagAutoCompleteProps> = ({
  selectedTags,
  onTagsChange,
  placeholder = "Add tags...",
  className = "",
  habitName
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [approvedTags, setApprovedTags] = useState<ApprovedTagsData | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load approved tags on component mount
  useEffect(() => {
    const loadApprovedTags = async () => {
      try {
        const data = await HabitAPI.getApprovedTags();
        setApprovedTags(data);
      } catch (error) {
        console.error('Failed to load approved tags:', error);
      }
    };
    
    loadApprovedTags();
  }, []);

  // Get smart suggestions based on habit name
  useEffect(() => {
    if (habitName && habitName.trim()) {
      const loadSmartSuggestions = async () => {
        try {
          const result = await HabitAPI.suggestTags(habitName, 5);
          setSmartSuggestions(result.suggested_tags);
        } catch (error) {
          console.error('Failed to get smart suggestions:', error);
        }
      };
      
      loadSmartSuggestions();
    }
  }, [habitName]);

  // Validate tags whenever they change
  useEffect(() => {
    if (selectedTags.length > 0) {
      const result = TagValidation.validateTagSet(selectedTags);
      setValidationResult(result);
    } else {
      setValidationResult(null);
    }
  }, [selectedTags]);

  // Filter suggestions based on input
  useEffect(() => {
    if (!approvedTags || !inputValue.trim()) {
      setSuggestions([]);
      return;
    }

    const filtered = TagValidation.suggestTags(inputValue, selectedTags)
      .slice(0, 10); // Limit to 10 suggestions
    
    setSuggestions(filtered);
  }, [inputValue, approvedTags, selectedTags]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowDropdown(value.trim().length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  const addTag = (tag: string) => {
    // Simple normalization to kebab-case for now
    const normalizedTag = tag.toLowerCase().trim().replace(/\s+/g, '-');
    
    if (normalizedTag && !selectedTags.includes(normalizedTag)) {
      onTagsChange([...selectedTags, normalizedTag]);
    }
    
    setInputValue('');
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion);
  };

  // Get tag display color based on type (umbrella, specific, contextual)
  const getTagTypeColor = (tag: string): string => {
    if (UMBRELLA_TAGS.includes(tag as any)) {
      return 'from-blue-500 to-blue-600'; // Umbrella tags - blue
    } else if (approvedTags?.contextual_tags.includes(tag)) {
      return 'from-purple-500 to-purple-600'; // Contextual tags - purple
    } else {
      return 'from-green-500 to-green-600'; // Specific tags - green
    }
  };

  // Get tag type label for hierarchy display
  const getTagTypeLabel = (tag: string): string => {
    if (UMBRELLA_TAGS.includes(tag as any)) return 'umbrella';
    if (approvedTags?.contextual_tags.includes(tag)) return 'contextual';
    return 'specific';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Selected Tags Display */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r ${getTagTypeColor(tag)} text-white shadow-sm hover:shadow-md transition-all`}
          >
            <TagIcon className="h-3 w-3 mr-1.5" />
            <span>{tag}</span>
            <span className="ml-1 text-xs opacity-75">({getTagTypeLabel(tag)})</span>
            <button
              onClick={() => removeTag(tag)}
              className="ml-2 hover:text-red-200 transition-colors"
              title={`Remove ${tag} tag`}
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Smart Suggestions from Habit Name */}
      {smartSuggestions.length > 0 && (
        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center mb-2">
            <CheckCircleIcon className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-800">Suggested tags for "{habitName}":</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {smartSuggestions
              .filter(tag => !selectedTags.includes(tag))
              .map((tag) => (
                <button
                  key={tag}
                  onClick={() => addTag(tag)}
                  className={`px-2 py-1 rounded text-xs bg-gradient-to-r ${getTagTypeColor(tag)} text-white hover:shadow-md transition-all`}
                >
                  <PlusIcon className="h-3 w-3 inline mr-1" />
                  {tag}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Tag Input with Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowDropdown(inputValue.trim().length > 0)}
            placeholder={placeholder}
            className="w-full px-4 py-2 pl-10 bg-card border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-accent-blue transition-all"
          />
          <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
        </div>

        {/* Auto-complete Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => {
              const isUmbrella = UMBRELLA_TAGS.includes(suggestion as any);
              const isContextual = approvedTags?.contextual_tags.includes(suggestion);
              
              return (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-hover transition-colors border-b border-border last:border-b-0 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <TagIcon className="h-3 w-3 mr-2 text-muted" />
                    <span className="text-foreground">{suggestion}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isUmbrella 
                        ? 'bg-blue-100 text-blue-800' 
                        : isContextual 
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {isUmbrella ? 'umbrella' : isContextual ? 'contextual' : 'specific'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Validation Feedback */}
      {validationResult && (
        <div className="mt-3 space-y-2">
          {/* Errors */}
          {validationResult.errors.length > 0 && (
            <div className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Tag Validation Errors:</p>
                <ul className="text-sm text-red-700 mt-1 space-y-1">
                  {validationResult.errors.map((error: string, index: number) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Warnings */}
          {validationResult.warnings.length > 0 && (
            <div className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Warnings:</p>
                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                  {validationResult.warnings.map((warning: string, index: number) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {validationResult.suggestions.length > 0 && (
            <div className="flex items-start p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <CheckCircleIcon className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">Suggestions:</p>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  {validationResult.suggestions.map((suggestion: string, index: number) => (
                    <li key={index}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Success state */}
          {validationResult.is_valid && validationResult.errors.length === 0 && (
            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">
                ✅ Tag set follows PRD requirements
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tag Hierarchy Guide */}
      {approvedTags && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">Tag Hierarchy Guide:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {Object.entries(approvedTags.tag_hierarchy).map(([umbrella, specificTags]) => (
              <div key={umbrella} className="space-y-1">
                <div className="flex items-center">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-medium">
                    {umbrella}
                  </span>
                  <span className="text-gray-500 ml-2">(umbrella)</span>
                </div>
                <div className="ml-4 flex flex-wrap gap-1">
                  {specificTags.map((specific) => (
                    <button
                      key={specific}
                      onClick={() => addTag(specific)}
                      className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors cursor-pointer"
                      title={`Add ${specific} tag`}
                    >
                      {specific}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Contextual Tags */}
          {approvedTags.contextual_tags.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Contextual Tags:</span>
                <span className="text-xs text-gray-500 ml-2">(can be used across umbrellas)</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {approvedTags.contextual_tags.map((contextual) => (
                  <button
                    key={contextual}
                    onClick={() => addTag(contextual)}
                    className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs hover:bg-purple-200 transition-colors cursor-pointer"
                    title={`Add ${contextual} contextual tag`}
                  >
                    {contextual}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TagAutoComplete;