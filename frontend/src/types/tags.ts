/**
 * Approved Tag System - Matches TAGGING_SYSTEM_PRD.md
 * 
 * This file contains the complete approved tag set following the umbrella → specific → context hierarchy.
 * All tags use kebab-case format (lowercase, words separated by hyphens).
 */

// Umbrella Tags - Top-level categories that enable roll-ups
export const UMBRELLA_TAGS = [
  'health',
  'food', 
  'home',
  'transportation'
] as const;

// Complete Approved Tag Set organized by umbrella
export const APPROVED_TAGS = {
  // Health umbrella - physical & mental health
  health: [
    'health',        // umbrella
    'exercise',      // any workout activity  
    'workout'        // specific gym/workout session
  ],
  
  // Food umbrella - nutrition-related actions
  food: [
    'food',          // umbrella
    'cooking',       // cooking single meals
    'meal-prep',     // cooking/prepping for multiple days
    'meal',          // eating meals (at home or out)
    'takeout',       // ordering or picking up prepared food
    'grocery',       // grocery shopping (Trader Joe's, Safeway, etc.)
    'restock'        // replenishing household consumables
  ],
  
  // Home umbrella - household tasks
  home: [
    'home',          // umbrella
    'cleaning',      // generic cleaning (house, kitchen, etc.)
    'laundry',       // washing/folding clothes
    'bathroom'       // cleaning bathroom specifically
  ],
  
  // Transportation umbrella - mobility actions
  transportation: [
    'transportation',    // umbrella
    'public-transit',    // bus, BART, train, ferry
    'walking-errand',    // walking as primary means for an errand
    'rideshare',         // Uber/Lyft (costly option)
    'cost-saving'        // intentional substitution of costly transport with cheaper option
  ]
} as const;

// Flat list of all approved tags
export const ALL_APPROVED_TAGS = Object.values(APPROVED_TAGS).flat() as readonly string[];

// Contextual tags that can cross umbrellas
export const CONTEXTUAL_TAGS = [
  'cost-saving',       // intentional money-saving choice
  'restock'            // replenishing supplies/consumables
] as const;

// Tag hierarchy definitions for validation and auto-complete
export const TAG_HIERARCHY = {
  umbrellas: UMBRELLA_TAGS,
  specific: {
    health: ['exercise', 'workout'],
    food: ['cooking', 'meal-prep', 'meal', 'takeout', 'grocery'],
    home: ['cleaning', 'laundry', 'bathroom'],
    transportation: ['public-transit', 'walking-errand', 'rideshare']
  },
  contextual: CONTEXTUAL_TAGS
} as const;

// Type definitions for type safety
export type UmbrellaTag = typeof UMBRELLA_TAGS[number];
export type ApprovedTag = typeof ALL_APPROVED_TAGS[number];
export type ContextualTag = typeof CONTEXTUAL_TAGS[number];

// Tag validation utilities
export const TagValidation = {
  /**
   * Validates if a tag follows kebab-case format
   */
  isKebabCase: (tag: string): boolean => {
    return /^[a-z]+(-[a-z]+)*$/.test(tag);
  },

  /**
   * Validates if a tag is in the approved tag set
   */
  isApproved: (tag: string): boolean => {
    return ALL_APPROVED_TAGS.includes(tag as ApprovedTag);
  },

  /**
   * Checks if tag set includes at least one umbrella tag
   */
  hasUmbrellaTag: (tags: string[]): boolean => {
    return tags.some(tag => UMBRELLA_TAGS.includes(tag as UmbrellaTag));
  },

  /**
   * Gets the umbrella tag for a specific tag
   */
  getUmbrellaForTag: (tag: string): UmbrellaTag | null => {
    for (const [umbrella, specificTags] of Object.entries(APPROVED_TAGS)) {
      if ((specificTags as readonly string[]).includes(tag)) {
        return umbrella as UmbrellaTag;
      }
    }
    return null;
  },

  /**
   * Validates a complete tag set against PRD rules
   */
  validateTagSet: (tags: string[]): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  } => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check kebab-case format
    const invalidFormat = tags.filter(tag => !TagValidation.isKebabCase(tag));
    if (invalidFormat.length > 0) {
      errors.push(`Tags must use kebab-case format: ${invalidFormat.join(', ')}`);
    }

    // Check approved tag usage
    const unapproved = tags.filter(tag => !TagValidation.isApproved(tag));
    if (unapproved.length > 0) {
      warnings.push(`Unapproved tags detected: ${unapproved.join(', ')}`);
    }

    // Check umbrella tag requirement
    if (!TagValidation.hasUmbrellaTag(tags)) {
      errors.push('At least one umbrella tag is required (health, food, home, transportation)');
      
      // Suggest umbrella tags based on specific tags
      const specificTags = tags.filter(tag => 
        Object.values(APPROVED_TAGS).some(umbrellaSet => 
          (umbrellaSet as readonly string[]).includes(tag) && !(UMBRELLA_TAGS as readonly string[]).includes(tag)
        )
      );
      
      specificTags.forEach(tag => {
        const umbrella = TagValidation.getUmbrellaForTag(tag);
        if (umbrella) {
          suggestions.push(`Consider adding '${umbrella}' umbrella tag for '${tag}'`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  },

  /**
   * Auto-suggests tags based on partial input
   */
  suggestTags: (partial: string, existingTags: string[] = []): string[] => {
    const lowerPartial = partial.toLowerCase();
    
    // Filter approved tags that match the partial input and aren't already selected
    return ALL_APPROVED_TAGS
      .filter(tag => 
        tag.includes(lowerPartial) && 
        !existingTags.includes(tag)
      )
      .sort((a, b) => {
        // Prioritize exact matches and umbrella tags
        const aIsUmbrella = UMBRELLA_TAGS.includes(a as UmbrellaTag);
        const bIsUmbrella = UMBRELLA_TAGS.includes(b as UmbrellaTag);
        const aStartsWithPartial = a.startsWith(lowerPartial);
        const bStartsWithPartial = b.startsWith(lowerPartial);
        
        if (aStartsWithPartial && !bStartsWithPartial) return -1;
        if (!aStartsWithPartial && bStartsWithPartial) return 1;
        if (aIsUmbrella && !bIsUmbrella) return -1;
        if (!aIsUmbrella && bIsUmbrella) return 1;
        
        return a.localeCompare(b);
      });
  }
};

// Example habit patterns for reference
export const TAG_EXAMPLES = {
  'Workout (Gym)': ['health', 'exercise', 'workout'],
  'AC Transit (to SF)': ['transportation', 'public-transit', 'cost-saving'],
  'Food Pickup': ['food', 'takeout'],
  'Cook Dinner': ['food', 'cooking', 'meal'],
  'Meal Prep (3 days)': ['food', 'cooking', 'meal-prep', 'restock', 'cost-saving'],
  'Trader Joe\'s': ['food', 'grocery', 'restock', 'cost-saving'],
  'Laundry': ['home', 'laundry', 'cleaning'],
  'Bathroom Cleaning': ['home', 'bathroom', 'cleaning'],
  'Walked for Errand': ['transportation', 'walking-errand', 'cost-saving']
} as const;