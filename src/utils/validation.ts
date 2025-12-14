/**
 * Form Validation Utilities for CoreIDPin
 * Reusable validation functions for consistent form validation across the app
 */

// ==================== STRING VALIDATIONS ====================

export const validators = {
  /**
   * Check if required field is filled
   */
  required: (value: any, fieldName: string): string | null => {
    if (value === null || value === undefined || value === '') {
      return `${fieldName} is required`;
    }
    if (typeof value === 'string' && !value.trim()) {
      return `${fieldName} cannot be empty`;
    }
    return null;
  },

  /**
   * Validate string length
   */
  stringLength: (
    value: string, 
    min: number, 
    max: number, 
    fieldName: string
  ): string | null => {
    if (!value) return null; // Allow empty for optional fields
    
    const trimmed = value.trim();
    if (trimmed.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    if (trimmed.length > max) {
      return `${fieldName} must not exceed ${max} characters`;
    }
    return null;
  },

  /**
   * Validate email format
   */
  email: (value: string): string | null => {
    if (!value) return null; // Allow empty for optional fields
    
    // RFC 5322 simplified regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  /**
   * Validate URL format
   */
  url: (value: string, fieldName: string = 'URL'): string | null => {
    if (!value) return null; // Allow empty for optional fields
    
    try {
      const url = new URL(value);
      // Ensure it's http or https
      if (!['http:', 'https:'].includes(url.protocol)) {
        return `${fieldName} must start with http:// or https://`;
      }
      return null;
    } catch {
      return `${fieldName} must be a valid URL`;
    }
  },

  /**
   * Validate LinkedIn URL
   */
  linkedinUrl: (value: string): string | null => {
    if (!value) return null;
    
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/([\w-]+)\/?$/;
    if (!linkedinRegex.test(value)) {
      return 'LinkedIn URL must be in format: https://linkedin.com/in/yourprofile';
    }
    return null;
  },

  /**
   * Validate GitHub URL
   */
  githubUrl: (value: string): string | null => {
    if (!value) return null;
    
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/([\w-]+)\/?$/;
    if (!githubRegex.test(value)) {
      return 'GitHub URL must be in format: https://github.com/yourusername';
    }
    return null;
  },

  /**
   * Validate phone number (Nigeria E.164 format)
   */
  phone: (value: string): string | null => {
    if (!value) return null;
    
    // Nigeria phone format: +234XXXXXXXXXX (11 digits after +234)
    const phoneRegex = /^\+234[789]\d{9}$/;
    if (!phoneRegex.test(value)) {
      return 'Phone must be in format: +234XXXXXXXXXX';
    }
    return null;
  },

  // ==================== DATE VALIDATIONS ====================

  date: {
    /**
     * Check if valid date
     */
    valid: (value: string, fieldName: string = 'Date'): string | null => {
      if (!value) return null;
      
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return `${fieldName} must be a valid date`;
      }
      return null;
    },

    /**
     * Check if date is not in the future
     */
    notFuture: (value: string, fieldName: string = 'Date'): string | null => {
      if (!value) return null;
      
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset to start of day
      
      if (date > today) {
        return `${fieldName} cannot be in the future`;
      }
      return null;
    },

    /**
     * Check if end date is after start date
     */
    isAfter: (
      startDate: string, 
      endDate: string, 
      startLabel: string = 'Start date',
      endLabel: string = 'End date'
    ): string | null => {
      if (!startDate || !endDate) return null;
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (end < start) {
        return `${endLabel} must be after ${startLabel.toLowerCase()}`;
      }
      return null;
    },

    /**
     * Check if user is at least 18 years old
     */
    age18Plus: (dob: string): string | null => {
      if (!dob) return null;
      
      const birthDate = new Date(dob);
      const today = new Date();
      const age = (today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      
      if (age < 18) {
        return 'You must be at least 18 years old';
      }
      return null;
    },

    /**
     * Check if date is within reasonable work history range (not more than 70 years ago)
     */
    workHistoryRange: (value: string, fieldName: string = 'Date'): string | null => {
      if (!value) return null;
      
      const date = new Date(value);
      const seventyYearsAgo = new Date();
      seventyYearsAgo.setFullYear(seventyYearsAgo.getFullYear() - 70);
      
      if (date < seventyYearsAgo) {
        return `${fieldName} seems too far in the past`;
      }
      return null;
    }
  },

  // ==================== NUMBER VALIDATIONS ====================

  number: {
    /**
     * Validate number is within range
     */
    range: (
      value: number, 
      min: number, 
      max: number, 
      fieldName: string = 'Value'
    ): string | null => {
      if (value === null || value === undefined) return null;
      
      if (value < min) {
        return `${fieldName} must be at least ${min}`;
      }
      if (value > max) {
        return `${fieldName} must not exceed ${max}`;
      }
      return null;
    },

    /**
     * Validate number is positive
     */
    positive: (value: number, fieldName: string = 'Value'): string | null => {
      if (value === null || value === undefined) return null;
      
      if (value <= 0) {
        return `${fieldName} must be a positive number`;
      }
      return null;
    },

    /**
     * Validate number is an integer
     */
    integer: (value: number, fieldName: string = 'Value'): string | null => {
      if (value === null || value === undefined) return null;
      
      if (!Number.isInteger(value)) {
        return `${fieldName} must be a whole number`;
      }
      return null;
    }
  },

  // ==================== ARRAY VALIDATIONS ====================

  array: {
    /**
     * Validate array max length
     */
    maxLength: (arr: any[], max: number, fieldName: string = 'Items'): string | null => {
      if (!arr || arr.length === 0) return null;
      
      if (arr.length > max) {
        return `${fieldName} can have at most ${max} items`;
      }
      return null;
    },

    /**
     * Validate array min length
     */
    minLength: (arr: any[], min: number, fieldName: string = 'Items'): string | null => {
      if (!arr) return `${fieldName} must have at least ${min} items`;
      
      if (arr.length < min) {
        return `${fieldName} must have at least ${min} items`;
      }
      return null;
    }
  },

  // ==================== NIGERIAN-SPECIFIC VALIDATIONS ====================

  nigeria: {
    /**
     * Validate BVN (Bank Verification Number)
     */
    bvn: (value: string): string | null => {
      if (!value) return null;
      
      if (!/^\d{11}$/.test(value)) {
        return 'BVN must be exactly 11 digits';
      }
      return null;
    },

    /**
     * Validate NIN (National Identification Number)
     */
    nin: (value: string): string | null => {
      if (!value) return null;
      
      if (!/^\d{11}$/.test(value)) {
        return 'NIN must be exactly 11 digits';
      }
      return null;
    },

    /**
     * Validate TIN (Tax Identification Number)
     */
    tin: (value: string): string | null => {
      if (!value) return null;
      
      if (!/^\d{10,12}$/.test(value)) {
        return 'TIN must be 10-12 digits';
      }
      return null;
    }
  },

  // ==================== BUSINESS LOGIC VALIDATIONS ====================

  /**
   * Validate work experience dates logic
   */
 workExperience: {
    /**
     * Validate current role cannot have end date
     */
    currentRoleEndDate: (isCurrent: boolean, endDate: string): string | null => {
      if (isCurrent && endDate && endDate.trim()) {
        return 'Current role cannot have an end date';
      }
      return null;
    },

    /**
     * Validate non-current role should have end date
     */
    nonCurrentRoleEndDate: (isCurrent: boolean, endDate: string): string | null => {
      // This is a warning, not an error - some people might still be employed but have a planned end date
      if (!isCurrent && (!endDate || !endDate.trim())) {
        return null; // Optional - return null to make it non-blocking
      }
      return null;
    },

    /**
     * Comprehensive work experience validation
     */
    validateDates: (
      startDate: string,
      endDate: string,
      isCurrent: boolean
    ): string | null => {
      // If current, end date should be empty
      const currentCheck = validators.workExperience.currentRoleEndDate(isCurrent, endDate);
      if (currentCheck) return currentCheck;

      // If not current and end date provided, validate it's after start
      if (!isCurrent && endDate && startDate) {
        return validators.date.isAfter(startDate, endDate, 'Start date', 'End date');
      }

      return null;
    }
  },

  /**
   * Validate file upload
   */
  file: {
    /**
     * Validate file size
     */
    maxSize: (file: File, maxSizeMB: number): string | null => {
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        return `File size must not exceed ${maxSizeMB}MB`;
      }
      return null;
    },

    /**
     * Validate file type
     */
    allowedTypes: (file: File, allowedTypes: string[]): string | null => {
      const fileType = file.type.toLowerCase();
      const fileName = file.name.toLowerCase();
      
      // Check MIME type
      const isAllowed = allowedTypes.some(type => {
        if (type.includes('*')) {
          // Handle wildcards like image/*
          const prefix = type.split('/')[0];
          return fileType.startsWith(prefix + '/');
        }
        return fileType === type;
      });
      
      // Also check file extension as fallback
      const extension = fileName.split('.').pop() || '';
      const extensionAllowed = allowedTypes.some(type => 
        type.endsWith(extension)
      );
      
      if (!isAllowed && !extensionAllowed) {
        return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
      }
      return null;
    }
  }
};

/**
 * Combine multiple validation errors
 */
 export function combineValidation(...validations: (string | null)[]): string | null {
  const errors = validations.filter(err => err !== null);
  return errors.length > 0 ? errors[0] : null; // Return first error
}

/**
 * Validate multiple fields and return error object
 */
export function validateFields(
  validations: Record<string, () => string | null>
): Record<string, string> {
  const errors: Record<string, string> = {};
  
  Object.entries(validations).forEach(([field, validate]) => {
    const error = validate();
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
}

/**
 * Check if errors object is empty
 */
export function hasErrors(errors: Record<string, string>): boolean {
  return Object.keys(errors).length > 0;
}
