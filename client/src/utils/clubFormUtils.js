/**
 * Shared utility functions for club form handling
 */

// Reusable form field renderer
export const renderFormField = (formData, handleInputChange, handleNestedChange, label, name, type = 'text', required = false, placeholder = '', options = null, isNested = false, objectName = '', fieldName = '') => {
  const commonClasses = "w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-red focus:border-primary-red text-sm";

  if (type === 'select' && options) {
    return (
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
        <select
          name={name}
          value={isNested ? formData[objectName]?.[fieldName] || '' : formData[name] || ''}
          onChange={isNested ? (e) => handleNestedChange(objectName, fieldName, e.target.value) : handleInputChange}
          required={required}
          className={commonClasses}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
    );
  }

  if (type === 'textarea') {
    return (
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
        <textarea
          name={name}
          value={isNested ? formData[objectName]?.[fieldName] || '' : formData[name] || ''}
          onChange={isNested ? (e) => handleNestedChange(objectName, fieldName, e.target.value) : handleInputChange}
          required={required}
          placeholder={placeholder}
          rows="4"
          className={commonClasses}
        />
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-medium mb-2">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      <input
        type={type}
        name={name}
        value={isNested ? formData[objectName]?.[fieldName] || '' : formData[name] || ''}
        onChange={isNested ? (e) => handleNestedChange(objectName, fieldName, e.target.value) : handleInputChange}
        required={required}
        placeholder={placeholder}
        className={commonClasses}
      />
    </div>
  );
};

// Mentor management functions
export const handleMentorChange = (mentorFields, setMentorFields, index, field, value) => {
  const updatedFields = [...mentorFields];
  updatedFields[index][field] = value;
  setMentorFields(updatedFields);
};

export const addMentorField = (mentorFields, setMentorFields) => {
  setMentorFields([...mentorFields, { name: '', department: '', email: '' }]);
};

export const removeMentorField = (mentorFields, setMentorFields, index) => {
  const updatedFields = [...mentorFields];
  updatedFields.splice(index, 1);
  setMentorFields(updatedFields);
};

// Club data normalization function
export const normalizeClubData = (formData) => {
  // Ensure consistent structure for club data
  return {
    name: formData.clubName || formData.name,
    description: formData.clubDescription || formData.description,
    category: formData.clubCategory || formData.category,
    email: formData.clubEmail || formData.email,
    location: formData.clubLocation || formData.location,
    // Add other fields with consistent naming
  };
};
