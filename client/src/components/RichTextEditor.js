import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { renderHTML } from '../utils/editorUtils';

const RichTextEditor = ({ value, onChange, readOnly = false, height = 400, placeholder = '' }) => {
  const [editorValue, setEditorValue] = useState(value || '');

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

  return (
    <div className="rich-text-editor">
      <ReactQuill
        theme="snow"
        value={editorValue}
        onChange={handleChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        style={{ height: height, marginBottom: '3rem' }}
        preserveWhitespace={true}
      />
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
