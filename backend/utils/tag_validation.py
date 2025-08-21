"""
Tag Validation Utilities for Habit Tracker Backend

Implements the tagging system defined in TAGGING_SYSTEM_PRD.md
Provides validation, normalization, and suggestion functionality for tags.
"""

import re
from typing import List, Dict, Set, Tuple, Optional
from dataclasses import dataclass

# Approved tag set from PRD
UMBRELLA_TAGS = {
    'health',
    'food', 
    'home',
    'transportation'
}

APPROVED_TAGS = {
    # Health umbrella
    'health', 'exercise', 'workout',
    
    # Food umbrella  
    'food', 'cooking', 'meal-prep', 'meal', 'takeout', 'grocery', 'restock',
    
    # Home umbrella
    'home', 'cleaning', 'laundry', 'bathroom',
    
    # Transportation umbrella
    'transportation', 'public-transit', 'walking-errand', 'rideshare', 'cost-saving'
}

# Tag hierarchy mapping for validation and suggestions
TAG_HIERARCHY = {
    'health': ['exercise', 'workout'],
    'food': ['cooking', 'meal-prep', 'meal', 'takeout', 'grocery', 'restock'],
    'home': ['cleaning', 'laundry', 'bathroom'],
    'transportation': ['public-transit', 'walking-errand', 'rideshare', 'cost-saving']
}

# Contextual tags that can cross umbrellas
CONTEXTUAL_TAGS = {'cost-saving', 'restock'}

@dataclass
class TagValidationResult:
    """Result of tag validation with detailed feedback"""
    is_valid: bool
    normalized_tags: List[str]
    errors: List[str]
    warnings: List[str] 
    suggestions: List[str]

class TagValidator:
    """Validates and normalizes tags according to PRD specifications"""
    
    @staticmethod
    def is_kebab_case(tag: str) -> bool:
        """Check if tag follows kebab-case format (lowercase, hyphens only)"""
        return bool(re.match(r'^[a-z]+(-[a-z]+)*$', tag))
    
    @staticmethod
    def normalize_tag(tag: str) -> str:
        """Convert tag to kebab-case format"""
        # Convert to lowercase and replace spaces/underscores with hyphens
        normalized = re.sub(r'[_\s]+', '-', tag.lower().strip())
        # Remove any non-alphanumeric or hyphen characters
        normalized = re.sub(r'[^a-z0-9-]', '', normalized)
        # Remove duplicate hyphens
        normalized = re.sub(r'-+', '-', normalized)
        # Remove leading/trailing hyphens
        return normalized.strip('-')
    
    @staticmethod
    def has_umbrella_tag(tags: List[str]) -> bool:
        """Check if tag set includes at least one umbrella tag"""
        return any(tag in UMBRELLA_TAGS for tag in tags)
    
    @staticmethod
    def get_umbrella_for_tag(tag: str) -> Optional[str]:
        """Find the umbrella tag for a specific tag"""
        for umbrella, specific_tags in TAG_HIERARCHY.items():
            if tag in specific_tags or tag == umbrella:
                return umbrella
        return None
    
    @staticmethod
    def suggest_umbrella_tags(tags: List[str]) -> List[str]:
        """Suggest umbrella tags based on specific tags present"""
        suggestions = set()
        
        for tag in tags:
            umbrella = TagValidator.get_umbrella_for_tag(tag)
            if umbrella and umbrella not in tags:
                suggestions.add(umbrella)
        
        return sorted(list(suggestions))
    
    @staticmethod
    def validate_and_normalize(tags: List[str]) -> TagValidationResult:
        """
        Comprehensive tag validation and normalization
        
        Returns:
            TagValidationResult with validation status, normalized tags, and feedback
        """
        errors = []
        warnings = []
        suggestions = []
        normalized_tags = []
        
        # Step 1: Normalize all tags
        for tag in tags:
            if not tag or not tag.strip():
                continue
                
            normalized = TagValidator.normalize_tag(tag)
            if normalized:
                normalized_tags.append(normalized)
                
                # Check if normalization changed the tag
                if normalized != tag:
                    suggestions.append(f"'{tag}' normalized to '{normalized}'")
        
        # Remove duplicates while preserving order
        seen = set()
        unique_normalized = []
        for tag in normalized_tags:
            if tag not in seen:
                seen.add(tag)
                unique_normalized.append(tag)
        normalized_tags = unique_normalized
        
        # Step 2: Validate kebab-case format
        invalid_format = [tag for tag in normalized_tags if not TagValidator.is_kebab_case(tag)]
        if invalid_format:
            errors.append(f"Tags must use kebab-case format: {', '.join(invalid_format)}")
        
        # Step 3: Check approved tag usage
        unapproved = [tag for tag in normalized_tags if tag not in APPROVED_TAGS]
        if unapproved:
            warnings.append(f"Unapproved tags detected: {', '.join(unapproved)}")
            suggestions.append("Consider using approved tags from the PRD or request new tag approval")
        
        # Step 4: Validate umbrella tag requirement  
        if not TagValidator.has_umbrella_tag(normalized_tags):
            errors.append("At least one umbrella tag is required (health, food, home, transportation)")
            
            # Suggest appropriate umbrella tags
            suggested_umbrellas = TagValidator.suggest_umbrella_tags(normalized_tags)
            if suggested_umbrellas:
                suggestions.append(f"Consider adding umbrella tag(s): {', '.join(suggested_umbrellas)}")
        
        # Step 5: Check for recommended tag combinations
        umbrella_count = sum(1 for tag in normalized_tags if tag in UMBRELLA_TAGS)
        specific_count = len([tag for tag in normalized_tags if tag not in UMBRELLA_TAGS and tag not in CONTEXTUAL_TAGS])
        
        if umbrella_count > 0 and specific_count == 0:
            suggestions.append("Consider adding specific tags to provide more detail about the activity")
        
        return TagValidationResult(
            is_valid=len(errors) == 0,
            normalized_tags=normalized_tags,
            errors=errors,
            warnings=warnings,
            suggestions=suggestions
        )
    
    @staticmethod
    def suggest_tags_for_habit_name(habit_name: str, limit: int = 5) -> List[str]:
        """
        Suggest appropriate tags based on habit name using simple keyword matching
        
        This provides basic AI-like suggestions until Phase 3 smart tagging is implemented
        """
        name_lower = habit_name.lower()
        suggestions = []
        
        # Simple keyword-based suggestions
        keyword_mapping = {
            # Health keywords
            'workout': ['health', 'exercise', 'workout'],
            'gym': ['health', 'exercise', 'workout'],
            'run': ['health', 'exercise'],
            'exercise': ['health', 'exercise'],
            'fitness': ['health', 'exercise'],
            
            # Food keywords  
            'cook': ['food', 'cooking'],
            'meal': ['food', 'cooking', 'meal'],
            'prep': ['food', 'meal-prep'],
            'grocery': ['food', 'grocery', 'restock'],
            'trader': ['food', 'grocery', 'restock'],
            'safeway': ['food', 'grocery', 'restock'],
            'takeout': ['food', 'takeout'],
            'pickup': ['food', 'takeout'],
            'dinner': ['food', 'cooking', 'meal'],
            'lunch': ['food', 'cooking', 'meal'],
            'breakfast': ['food', 'cooking', 'meal'],
            
            # Home keywords
            'clean': ['home', 'cleaning'],
            'laundry': ['home', 'laundry', 'cleaning'],
            'bathroom': ['home', 'bathroom', 'cleaning'],
            'house': ['home', 'cleaning'],
            
            # Transportation keywords
            'bart': ['transportation', 'public-transit'],
            'bus': ['transportation', 'public-transit'],
            'train': ['transportation', 'public-transit'],
            'transit': ['transportation', 'public-transit'],
            'walk': ['transportation', 'walking-errand'],
            'uber': ['transportation', 'rideshare'],
            'lyft': ['transportation', 'rideshare']
        }
        
        # Find matching keywords and collect suggested tags
        suggested_tags = set()
        for keyword, tags in keyword_mapping.items():
            if keyword in name_lower:
                suggested_tags.update(tags)
        
        # Prioritize umbrella tags first, then specific tags
        umbrella_suggestions = [tag for tag in suggested_tags if tag in UMBRELLA_TAGS]
        specific_suggestions = [tag for tag in suggested_tags if tag not in UMBRELLA_TAGS]
        
        # Combine and limit results
        all_suggestions = umbrella_suggestions + specific_suggestions
        return all_suggestions[:limit]

# Convenience functions for common operations
def validate_tags(tags: List[str]) -> TagValidationResult:
    """Quick validation function"""
    return TagValidator.validate_and_normalize(tags)

def normalize_tags(tags: List[str]) -> List[str]:
    """Quick normalization function"""
    result = TagValidator.validate_and_normalize(tags)
    return result.normalized_tags

def suggest_tags(habit_name: str, limit: int = 5) -> List[str]:
    """Quick tag suggestion function"""
    return TagValidator.suggest_tags_for_habit_name(habit_name, limit)