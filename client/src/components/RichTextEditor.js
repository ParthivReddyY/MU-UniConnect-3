import React, { useState, useEffect, lazy, Suspense } from 'react';
import { renderHTML } from '../utils/editorUtils';

// Try to dynamically import ReactQuill with error handling
const ReactQuillLoader = lazy(() => {
  return import('react-quill')
    .then(module => {
      // Also import the required CSS
      import('react-quill/dist/quill.snow.css');
      return { default: module.default };
    })
    .catch(error => {
      console.warn('Failed to load ReactQuill:', error);
      return { 
        default: props => <FallbackEditor {...props} />
      };
    });
});

// Fallback editor component when ReactQuill is not available
const FallbackEditor = ({ value, onChange, placeholder, style }) => {
  return (
    <div className="fallback-editor">
      <textarea
        value={value || ''}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
        style={{ ...style, minHeight: '200px' }}
      />
      <p className="text-xs text-gray-500 mt-1">
        Basic editor mode active. Rich formatting is not available.
      </p>
    </div>
  );
};

const RichTextEditor = ({ value, onChange, readOnly = false, height = 400, placeholder = '' }) => {
  const [editorValue, setEditorValue] = useState(value || '');
  const [quillAvailable, setQuillAvailable] = useState(true);

  // Detect if ReactQuill is available
  useEffect(() => {
    try {
      require('react-quill');
    } catch (e) {
      setQuillAvailable(false);
    }
  }, []);

  // Update editor when external value changes
  useEffect(() => {
    if (value !== editorValue) {
      setEditorValue(value || '');
    }
  }, [value, editorValue]);

  // Handle Quill text change
  const handleChange = (content) => {
    setEditorValue(content);
    if (onChange) {
      onChange(content);
    }
  };

  // Define Quill modules/formats
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image'],
      [{ 'align': [] }],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
    clipboard: {
      // Preserve formatting when pasting
      matchVisual: false
    }
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link', 'image',
    'align', 'color', 'background',
  ];

  // If in read-only mode, just render the HTML content
  if (readOnly) {
    return (
      <div className="rich-text-editor">
        <div className="prose max-w-none ql-content" dangerouslySetInnerHTML={renderHTML(value || '')}></div>
      </div>
    );
  }

  // If ReactQuill is not available or we're in fallback mode
  if (!quillAvailable) {
    return <FallbackEditor 
      value={editorValue} 
      onChange={handleChange}
      placeholder={placeholder}
      style={{ height }}
    />;
  }

  // Render ReactQuill with Suspense fallback
  return (
    <div className="rich-text-editor">
      <Suspense fallback={<FallbackEditor 
        value={editorValue}
        onChange={handleChange}
        placeholder={placeholder}
        style={{ height }}
      />}>
        <ReactQuillLoader
          theme="snow"
          value={editorValue}
          onChange={handleChange}
          placeholder={placeholder}
          modules={modules}
          formats={formats}
          style={{ height, marginBottom: '3rem' }}
          preserveWhitespace={true}
        />
      </Suspense>
      <style jsx global>{`
        /* Ensure list bullets show up in the editor view too */
        .ql-editor ul > li {
          list-style-type: disc;
          padding-left: 0;
          margin-left: 1.5em;
        }
        .ql-editor ol > li {
          list-style-type: decimal;
          padding-left: 0;
          margin-left: 1.5em;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
