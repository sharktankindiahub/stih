// ═══════════════════════════════════════════════════════════════
// Forms Component - Input/textarea handling
// ═══════════════════════════════════════════════════════════════

const forms = {
  // Get form values
  getFormValues(selector) {
    const form = document.querySelector(selector);
    if (!form) return {};

    const formData = new FormData(form);
    const values = {};

    for (let [key, value] of formData.entries()) {
      values[key] = value;
    }

    return values;
  },

  // Set form values
  setFormValues(selector, values) {
    const form = document.querySelector(selector);
    if (!form) return;

    Object.entries(values).forEach(([key, value]) => {
      const field = form.querySelector(`[name="${key}"]`);
      if (field) {
        field.value = value;
      }
    });
  },

  // Reset form
  resetForm(selector) {
    const form = document.querySelector(selector);
    if (form) form.reset();
  },

  // Clear form
  clearForm(selector) {
    const form = document.querySelector(selector);
    if (!form) return;

    form.querySelectorAll('input, textarea').forEach(field => {
      field.value = '';
    });
  },

  // Add validation
  validate(selector, rules) {
    const form = document.querySelector(selector);
    if (!form) return { valid: false, errors: {} };

    const values = this.getFormValues(selector);
    const errors = {};

    Object.entries(rules).forEach(([field, fieldRules]) => {
      const value = values[field];

      if (fieldRules.required && !value) {
        errors[field] = `${field} is required`;
      }

      if (fieldRules.minLength && value && value.length < fieldRules.minLength) {
        errors[field] = `${field} must be at least ${fieldRules.minLength} characters`;
      }

      if (fieldRules.pattern && value && !fieldRules.pattern.test(value)) {
        errors[field] = fieldRules.message || `${field} is invalid`;
      }
    });

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  },
};
