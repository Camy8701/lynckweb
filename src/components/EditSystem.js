import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Edit3, X, Type, Image as ImageIcon, Move, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import DOMPurify from 'dompurify';

// Context for edit mode state
export const EditContext = React.createContext();

// Main Edit System Provider
export const EditSystemProvider = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingElement, setEditingElement] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerPosition, setColorPickerPosition] = useState({ x: 0, y: 0 });
  const [colorPickerCallback, setColorPickerCallback] = useState(null);
  const [showTextPositioner, setShowTextPositioner] = useState(false);
  const [textPositionerTarget, setTextPositionerTarget] = useState(null);
  const [savedContent, setSavedContent] = useState({});

  // Load saved content on mount
  useEffect(() => {
    loadPageContent();
  }, []);

  const loadPageContent = async () => {
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('*');
      
      if (error) {
        console.error('Error loading content:', error);
        return;
      }
      
      const contentMap = {};
      data?.forEach(item => {
        contentMap[item.element_id] = item;
      });
      setSavedContent(contentMap);
      
      // Apply saved content to DOM
      applySavedContent(contentMap);
    } catch (err) {
      console.error('Failed to load content:', err);
    }
  };

  const applySavedContent = (contentMap) => {
    Object.keys(contentMap).forEach(elementId => {
      const content = contentMap[elementId];
      const element = document.querySelector(`[data-element-id="${elementId}"]`);
      
      if (element) {
        // Apply text content (sanitized)
        if (content.content) {
          element.innerHTML = DOMPurify.sanitize(content.content);
        }
        
        // Apply text positioning
        if (content.text_position) {
          const pos = content.text_position;
          element.style.position = pos.position || 'relative';
          if (pos.top !== undefined) element.style.top = pos.top;
          if (pos.left !== undefined) element.style.left = pos.left;
          if (pos.transform) element.style.transform = pos.transform;
          if (pos.textAlign) element.style.textAlign = pos.textAlign;
        }
        
        // Apply text styles
        if (content.text_styles) {
          Object.assign(element.style, content.text_styles);
        }
      }
      
      // Apply background media to parent card
      if (content.background_media) {
        const cardElement = document.querySelector(`[data-element-id="${elementId}"]`)?.closest('.backdrop-blur-md');
        if (cardElement) {
          applyBackgroundMedia(cardElement, content.background_media, content.media_type);
        }
      }
    });
  };

  const applyBackgroundMedia = (element, mediaUrl, mediaType) => {
    if (mediaType?.startsWith('video/')) {
      // Create video background
      const video = document.createElement('video');
      video.src = mediaUrl;
      video.autoPlay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: -1;
      `;
      element.style.position = 'relative';
      element.appendChild(video);
    } else {
      // Apply image background
      element.style.backgroundImage = `url(${mediaUrl})`;
      element.style.backgroundSize = 'cover';
      element.style.backgroundPosition = 'center';
    }
  };

  const saveContent = async (elementId, updates) => {
    try {
      const { data, error } = await supabase
        .from('page_content')
        .upsert({
          element_id: elementId,
          ...updates,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'element_id'
        });
      
      if (error) {
        console.error('Error saving content:', error);
        return;
      }
      
      // Update local state
      setSavedContent(prev => ({
        ...prev,
        [elementId]: {
          ...prev[elementId],
          ...updates
        }
      }));
    } catch (err) {
      console.error('Failed to save content:', err);
    }
  };

  const value = {
    isEditMode,
    setIsEditMode,
    showUploadModal,
    setShowUploadModal,
    editingElement,
    setEditingElement,
    showColorPicker,
    setShowColorPicker,
    colorPickerPosition,
    setColorPickerPosition,
    colorPickerCallback,
    setColorPickerCallback,
    showTextPositioner,
    setShowTextPositioner,
    textPositionerTarget,
    setTextPositionerTarget,
    savedContent,
    setSavedContent,
    saveContent,
    loadPageContent
  };

  return (
    <EditContext.Provider value={value}>
      {children}
    </EditContext.Provider>
  );
};

// Edit Toggle Button Component
export const EditToggleButton = ({ className = "" }) => {
  const { isEditMode, setIsEditMode } = React.useContext(EditContext);

  return (
    <button
      onClick={() => setIsEditMode(!isEditMode)}
      className={`px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-105 ${
        isEditMode 
          ? 'bg-red-600 hover:bg-red-700' 
          : 'bg-blue-600 hover:bg-blue-700'
      } ${className}`}
    >
      {isEditMode ? (
        <>
          <X className="w-4 h-4 inline mr-2" />
          Exit Edit
        </>
      ) : (
        <>
          <Edit3 className="w-4 h-4 inline mr-2" />
          Edit
        </>
      )}
    </button>
  );
};

// Editable Text Component
export const EditableText = ({ 
  children, 
  className = '', 
  style = {},
  onTextChange,
  elementId
}) => {
  const { isEditMode } = React.useContext(EditContext);
  const [isEditing, setIsEditing] = useState(false);
  const [tempText, setTempText] = useState('');
  const textRef = useRef(null);

  const handleTextClick = () => {
    if (!isEditMode) return;
    
    setIsEditing(true);
    setTempText(DOMPurify.sanitize(textRef.current.innerHTML)); // Store sanitized HTML content to preserve line breaks
    
    // Make text editable and position cursor at click location
    setTimeout(() => {
      if (textRef.current) {
        textRef.current.focus();
        // Don't select all text - let user edit at cursor position
        // The cursor will automatically position where they clicked
      }
    }, 0);
  };

  const handleTextBlur = () => {
    setIsEditing(false);
    
    const newText = DOMPurify.sanitize(textRef.current.innerHTML); // Get sanitized HTML content to preserve line breaks
    if (onTextChange && newText !== tempText) {
      onTextChange(newText);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // Allow Enter to create line breaks
      e.stopPropagation();
      // Insert a line break at cursor position
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const br = document.createElement('br');
      range.deleteContents();
      range.insertNode(br);
      range.setStartAfter(br);
      range.setEndAfter(br);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    if (e.key === 'Escape') {
      textRef.current.innerHTML = tempText;
      textRef.current.blur();
    }
  };

  return (
    <div
      ref={textRef}
      className={`editable-text-element ${className} ${isEditMode ? 'cursor-text hover:outline hover:outline-2 hover:outline-blue-400 hover:outline-offset-2' : ''} ${isEditing ? 'outline outline-2 outline-blue-500 outline-offset-2' : ''}`}
      style={style}
      contentEditable={isEditMode}
      suppressContentEditableWarning={true}
      data-element-id={elementId}
      onClick={handleTextClick}
      onBlur={handleTextBlur}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
};

// Text Positioner Component
export const TextPositioner = ({ target, onClose, onPositionChange }) => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [alignment, setAlignment] = useState('center');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (target) {
      const rect = target.getBoundingClientRect();
      setPosition({
        x: rect.right + 20,
        y: rect.top
      });
      
      // Make the target element draggable
      target.draggable = true;
      target.style.cursor = 'move';
      
      const handleDragStart = (e) => {
        setIsDragging(true);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', target.outerHTML);
        console.log('Text drag started');
      };
      
      const handleDragEnd = (e) => {
        setIsDragging(false);
        console.log('Text drag ended');
      };
      
      // Add dragover and drop listeners to the document
      const handleDocumentDragOver = (e) => {
        e.preventDefault();
      };
      
      const handleDocumentDrop = (e) => {
        e.preventDefault();
        const newX = e.clientX - 50; // Center offset
        const newY = e.clientY - 10;
        
        // Convert to absolute positioning
        target.style.position = 'absolute';
        target.style.left = `${newX}px`;
        target.style.top = `${newY}px`;
        target.style.zIndex = '1000';
        
        console.log(`Text dropped at: ${newX}, ${newY}`);
        
        if (onPositionChange) {
          onPositionChange({
            position: 'absolute',
            left: `${newX}px`,
            top: `${newY}px`,
            textAlign: alignment,
            zIndex: '1000'
          });
        }
      };
      
      target.addEventListener('dragstart', handleDragStart);
      target.addEventListener('dragend', handleDragEnd);
      document.addEventListener('dragover', handleDocumentDragOver);
      document.addEventListener('drop', handleDocumentDrop);
      
      return () => {
        target.removeEventListener('dragstart', handleDragStart);
        target.removeEventListener('dragend', handleDragEnd);
        document.removeEventListener('dragover', handleDocumentDragOver);
        document.removeEventListener('drop', handleDocumentDrop);
        target.draggable = false;
        target.style.cursor = '';
      };
    }
  }, [target, alignment, onPositionChange]);

  const moveText = (direction) => {
    if (!target) return;

    const step = 10; // pixels to move
    const currentStyle = getComputedStyle(target);
    let currentTop = parseInt(currentStyle.top) || 0;
    let currentLeft = parseInt(currentStyle.left) || 0;

    // Make the element absolutely positioned to break out of its container
    if (currentStyle.position === 'static' || currentStyle.position === 'relative') {
      const rect = target.getBoundingClientRect();
      target.style.position = 'absolute';
      target.style.top = `${rect.top + window.scrollY}px`;
      target.style.left = `${rect.left}px`;
      target.style.zIndex = '1000';
      // Update current positions after absolute positioning
      currentTop = parseInt(target.style.top) || 0;
      currentLeft = parseInt(target.style.left) || 0;
    }

    switch (direction) {
      case 'up':
        target.style.top = `${currentTop - step}px`;
        break;
      case 'down':
        target.style.top = `${currentTop + step}px`;
        break;
      case 'left':
        target.style.left = `${currentLeft - step}px`;
        break;
      case 'right':
        target.style.left = `${currentLeft + step}px`;
        break;
    }

    console.log(`Moved ${direction}: top=${target.style.top}, left=${target.style.left}`);

    // Save position changes
    if (onPositionChange) {
      const newPos = {
        position: target.style.position,
        top: target.style.top,
        left: target.style.left,
        textAlign: alignment,
        zIndex: target.style.zIndex
      };
      onPositionChange(newPos);
    }
  };

  const setTextAlignment = (align) => {
    if (!target) return;
    
    setAlignment(align);
    target.style.textAlign = align;
    
    if (onPositionChange) {
      const newPos = {
        position: target.style.position || 'relative',
        top: target.style.top,
        left: target.style.left,
        textAlign: align
      };
      onPositionChange(newPos);
    }
  };

  const resetPosition = () => {
    if (!target) return;
    
    target.style.position = 'static';
    target.style.top = '';
    target.style.left = '';
    target.style.textAlign = '';
    target.style.zIndex = '';
    
    console.log('Position reset to static');
    
    if (onPositionChange) {
      onPositionChange({
        position: 'static',
        top: null,
        left: null,
        textAlign: null,
        zIndex: null
      });
    }
  };

  return (
    <div
      className="fixed bg-zinc-800 rounded-xl shadow-2xl border border-zinc-600 pointer-events-auto p-4 z-[999999]"
      style={{
        left: position.x,
        top: position.y,
        minWidth: '200px'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center">
          <Move className="w-4 h-4 mr-2 text-red-400" />
          Position Text
        </h3>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded hover:bg-zinc-600 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-gray-300" />
        </button>
      </div>

      {/* Movement Controls */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-300 mb-2 block">Move Text</label>
        <div className="grid grid-cols-3 gap-1 w-24 mx-auto">
          <div></div>
          <button
            onClick={() => moveText('up')}
            className="w-8 h-8 bg-zinc-700 hover:bg-zinc-600 rounded flex items-center justify-center transition-colors"
          >
            <ArrowUp className="w-4 h-4 text-white" />
          </button>
          <div></div>
          
          <button
            onClick={() => moveText('left')}
            className="w-8 h-8 bg-zinc-700 hover:bg-zinc-600 rounded flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={resetPosition}
            className="w-8 h-8 bg-red-600 hover:bg-red-700 rounded flex items-center justify-center transition-colors text-xs font-bold text-white"
            title="Reset Position"
          >
            ×
          </button>
          <button
            onClick={() => moveText('right')}
            className="w-8 h-8 bg-zinc-700 hover:bg-zinc-600 rounded flex items-center justify-center transition-colors"
          >
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
          
          <div></div>
          <button
            onClick={() => moveText('down')}
            className="w-8 h-8 bg-zinc-700 hover:bg-zinc-600 rounded flex items-center justify-center transition-colors"
          >
            <ArrowDown className="w-4 h-4 text-white" />
          </button>
          <div></div>
        </div>
      </div>

      {/* Alignment Controls */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-300 mb-2 block">Text Alignment</label>
        <div className="flex space-x-1">
          {['left', 'center', 'right'].map((align) => (
            <button
              key={align}
              onClick={() => setTextAlignment(align)}
              className={`flex-1 px-3 py-2 text-xs rounded transition-colors ${
                alignment === align
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
              }`}
            >
              {align}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-400 text-center">
        Use arrows to fine-tune position
      </div>
    </div>
  );
};

// Color Picker Component
export const ColorPicker = ({ position, onColorSelect, onClose }) => {
  const colors = [
    '#000000', '#1a1a1a', '#333333', '#4a4a4a', '#666666', '#808080', '#999999', '#b3b3b3',
    '#cccccc', '#e6e6e6', '#ffffff', '#ff0000', '#ff4500', '#ff8c00', '#ffd700', '#ffff00',
    '#9acd32', '#32cd32', '#00ff00', '#00ff7f', '#00ffff', '#1e90ff', '#0000ff', '#4169e1',
    '#8a2be2', '#9400d3', '#ff1493', '#ff69b4', '#dc143c', '#b22222', '#8b4513', '#2f4f4f'
  ];

  const [gradientHue, setGradientHue] = useState(0);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pickerPosition, setPickerPosition] = useState(position);

  const handleGradientClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const hue = (x / rect.width) * 360;
    setGradientHue(hue);
    const color = `hsl(${hue}, 100%, 50%)`;
    setSelectedColor(color);
    onColorSelect(color);
  };

  const handleMouseDown = (e) => {
    if (e.target.getAttribute('data-drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - pickerPosition.x,
        y: e.clientY - pickerPosition.y
      });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPickerPosition({
        x: Math.max(0, Math.min(e.clientX - dragStart.x, window.innerWidth - 300)),
        y: Math.max(0, Math.min(e.clientY - dragStart.y, window.innerHeight - 400))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <div
      className="fixed bg-zinc-800 rounded-xl shadow-2xl border border-zinc-600 pointer-events-auto"
      data-color-picker
      style={{
        left: pickerPosition.x,
        top: pickerPosition.y,
        width: '300px',
        userSelect: 'none',
        zIndex: 999999
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header with drag handle */}
      <div 
        className="flex items-center justify-between p-4 border-b border-zinc-600 bg-zinc-700 rounded-t-xl cursor-move"
        data-drag-handle="true"
      >
        <div className="flex items-center space-x-2">
          <Type className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Text Colors</h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg hover:bg-zinc-600 flex items-center justify-center transition-colors"
          title="Close"
        >
          <X className="w-4 h-4 text-gray-300" />
        </button>
      </div>

      <div className="p-4">
        {/* Gradient Bar */}
        <div className="mb-6">
          <label className="text-xs font-medium text-gray-300 mb-3 block">Custom Color</label>
          <div 
            className="w-full h-10 rounded-lg cursor-pointer border border-zinc-600 relative overflow-hidden"
            style={{
              background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
            }}
            onClick={handleGradientClick}
          >
            <div 
              className="absolute top-0 w-4 h-10 bg-white border-2 border-zinc-700 rounded-sm shadow-lg"
              style={{ left: `${(gradientHue / 360) * 100}%`, transform: 'translateX(-50%)' }}
            />
          </div>
        </div>

        {/* Color Grid */}
        <div className="mb-6">
          <label className="text-xs font-medium text-gray-300 mb-3 block">Preset Colors</label>
          <div className="grid grid-cols-8 gap-2">
            {colors.map((color, index) => (
              <button
                key={index}
                className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-105 hover:shadow-lg ${
                  selectedColor === color ? 'border-blue-400 shadow-lg ring-2 ring-blue-400/50' : 'border-zinc-500 hover:border-zinc-400'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => {
                  setSelectedColor(color);
                  onColorSelect(color);
                }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Selected Color Preview */}
        <div className="flex items-center justify-between p-4 bg-zinc-700 rounded-lg border border-zinc-600">
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-lg border-2 border-zinc-500 shadow-sm"
              style={{ backgroundColor: selectedColor }}
            />
            <div>
              <div className="text-xs font-medium text-gray-400">Selected Color</div>
              <div className="text-sm font-mono text-white">{selectedColor}</div>
            </div>
          </div>
          <button
            onClick={() => onColorSelect(selectedColor)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

// Editable Card Component with Hover Controls
export const EditableCard = ({ 
  children, 
  className = '', 
  elementId,
  onImageUpload,
  onTextEdit,
  onMove,
  allowImageEdit = true,
  allowTextEdit = true,
  allowMove = true
}) => {
  const { 
    isEditMode, 
    showUploadModal, 
    setShowUploadModal, 
    setEditingElement,
    setShowColorPicker,
    setColorPickerPosition,
    setColorPickerCallback,
    setShowTextPositioner,
    setTextPositionerTarget,
    saveContent
  } = React.useContext(EditContext) || {};
  const [isHovered, setIsHovered] = useState(false);
  const [controlsPosition, setControlsPosition] = useState({ top: 8, right: 8 });
  const cardRef = useRef(null);

  // Handle upload events for this specific card
  React.useEffect(() => {
    const handleUpload = async (event) => {
      const { elementId: uploadElementId, fileData, fileType } = event.detail;
      if (uploadElementId === elementId) {
        // Save to Supabase
        if (elementId) {
          await saveContent(elementId, {
            background_media: fileData,
            media_type: fileType
          });
        }
        
        // Call the original handler if provided
        if (onImageUpload) {
          onImageUpload(fileData, fileType);
        }
      }
    };

    const handleControlsPositionUpdate = (event) => {
      const { top, right, elementId: targetElementId } = event.detail;
      if (targetElementId === elementId) {
        setControlsPosition({ top, right });
      }
    };

    window.addEventListener('editSystemUpload', handleUpload);
    window.addEventListener('updateControlsPosition', handleControlsPositionUpdate);
    return () => {
      window.removeEventListener('editSystemUpload', handleUpload);
      window.removeEventListener('updateControlsPosition', handleControlsPositionUpdate);
    };
  }, [elementId, onImageUpload, saveContent]);

  const handleImageEdit = () => {
    setEditingElement(elementId);
    setShowUploadModal(true);
  };

  const handleTextEdit = (e) => {
    e.stopPropagation();
    
    // Find the text element to make draggable
    const cardElement = e.currentTarget.closest('.relative') || e.currentTarget.parentElement;
    let textElement = null;
    
    if (cardElement) {
      textElement = cardElement.querySelector('.editable-text-element') || 
                   cardElement.querySelector('[contenteditable="true"]') ||
                   cardElement.querySelector('[data-element-id]');
    }
    
    // Enable dragging for this text element
    if (textElement) {
      enableTextDragging(textElement);
    }
    
    // Find the actual green edit button that was clicked
    const button = e.target.closest('[data-edit-button="text"]') || e.target;
    const rect = button.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const pickerWidth = 300;
    const pickerHeight = 450;
    
    // Calculate position relative to viewport (not including scroll)
    let x = rect.left + rect.width + 15; // 15px gap from button
    let y = rect.top - 20; // Slightly above the button
    
    // Ensure picker stays within viewport horizontally
    if (x + pickerWidth > viewportWidth - 20) {
      x = rect.left - pickerWidth - 15; // Position to the left
    }
    if (x < 20) {
      x = 20; // Keep minimum distance from left edge
    }
    
    // Ensure picker stays within viewport vertically
    if (y + pickerHeight > viewportHeight - 20) {
      y = viewportHeight - pickerHeight - 20;
    }
    if (y < 20) {
      y = 20; // Keep minimum distance from top
    }
    
    // Final safety check to ensure it's always visible within current viewport
    x = Math.max(20, Math.min(x, viewportWidth - pickerWidth - 20));
    y = Math.max(20, Math.min(y, viewportHeight - pickerHeight - 20));
    
    // Set up the color picker callback for this specific element
    setColorPickerCallback(() => (color) => handleColorSelect(color));
    setColorPickerPosition({ x, y });
    setShowColorPicker(true);
    if (onTextEdit) onTextEdit();
  };

  const handleColorSelect = async (color) => {
    // Apply color to selected text or all text
    const selection = window.getSelection();
    let updatedElement = null;
    
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (range.toString()) {
        // Apply color to selected text
        const span = document.createElement('span');
        span.style.color = color;
        try {
          range.surroundContents(span);
          updatedElement = span.closest('[data-element-id]');
        } catch (e) {
          // If selection spans multiple elements, extract and wrap
          const contents = range.extractContents();
          span.appendChild(contents);
          range.insertNode(span);
          updatedElement = span.closest('[data-element-id]');
        }
      } else {
        // Apply color to the entire editable element
        const editableElements = document.querySelectorAll('[contenteditable="true"]');
        editableElements.forEach(element => {
          if (element.getAttribute('data-element-id') === elementId || 
              element.closest('[data-element-id]')?.getAttribute('data-element-id') === elementId) {
            element.style.color = color;
            updatedElement = element;
          }
        });
      }
    }
    
    // Save color changes to Supabase
    if (updatedElement && elementId) {
      await saveContent(elementId, {
        text_styles: {
          color: color,
          fontSize: updatedElement.style.fontSize || null,
          fontWeight: updatedElement.style.fontWeight || null
        }
      });
    }
  };


  const updateControlsPosition = (textElement, cardElement) => {
    if (!textElement || !cardElement) return;
    
    const textRect = textElement.getBoundingClientRect();
    const cardRect = cardElement.getBoundingClientRect();
    
    // Position controls relative to the text element
    const top = textRect.top - cardRect.top - 5;
    const right = cardRect.right - textRect.right - 5;
    
    // Trigger a re-render of the controls position
    const event = new CustomEvent('updateControlsPosition', {
      detail: { top, right, elementId: textElement.getAttribute('data-element-id') }
    });
    window.dispatchEvent(event);
  };

  const enableTextDragging = (textElement) => {
    if (!textElement) return;
    
    // Make element draggable
    textElement.draggable = true;
    textElement.style.cursor = 'grab';
    
    const handleDragStart = (e) => {
      e.dataTransfer.effectAllowed = 'move';
      textElement.style.cursor = 'grabbing';
      textElement.style.opacity = '0.7';
    };
    
    const handleDragEnd = (e) => {
      textElement.style.cursor = 'grab';
      textElement.style.opacity = '1';
    };
    
    const handleDocumentDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };
    
    const handleDocumentDrop = (e) => {
      e.preventDefault();
      const rect = textElement.getBoundingClientRect();
      const newX = e.clientX - rect.width / 2;
      const newY = e.clientY - rect.height / 2;
      
      // Apply new position
      textElement.style.position = 'fixed';
      textElement.style.left = `${newX}px`;
      textElement.style.top = `${newY}px`;
      textElement.style.zIndex = '1000';
      
      // Save position if possible
      const elementId = textElement.getAttribute('data-element-id');
      
      // Update controls position after moving text
      const cardElement = document.querySelector(`[data-element-id="${elementId}"]`)?.closest('.relative');
      if (cardElement) {
        setTimeout(() => updateControlsPosition(textElement, cardElement), 100);
      }
      if (elementId && saveContent) {
        try {
          saveContent(elementId, {
            text_position: {
              position: 'fixed',
              left: `${newX}px`,
              top: `${newY}px`,
              zIndex: '1000'
            }
          });
        } catch (error) {
          console.log('Position saved locally');
        }
      }
    };
    
    // Add event listeners
    textElement.addEventListener('dragstart', handleDragStart);
    textElement.addEventListener('dragend', handleDragEnd);
    document.addEventListener('dragover', handleDocumentDragOver);
    document.addEventListener('drop', handleDocumentDrop);
    
    // Store cleanup function for later
    textElement._dragCleanup = () => {
      textElement.draggable = false;
      textElement.style.cursor = '';
      textElement.removeEventListener('dragstart', handleDragStart);
      textElement.removeEventListener('dragend', handleDragEnd);
      document.removeEventListener('dragover', handleDocumentDragOver);
      document.removeEventListener('drop', handleDocumentDrop);
      delete textElement._dragCleanup;
    };
  };

  const disableTextDragging = (textElement) => {
    if (textElement && textElement._dragCleanup) {
      textElement._dragCleanup();
    }
  };

  const handleTextPositionChange = async (newPosition) => {
    if (elementId) {
      await saveContent(elementId, {
        text_position: newPosition
      });
    }
  };

  return (
    <div
      ref={cardRef}
      className={`${className} ${isEditMode ? 'relative' : ''}`}
      onMouseEnter={() => isEditMode && setIsHovered(true)}
      onMouseLeave={() => isEditMode && setIsHovered(false)}
    >
      {children}
      
      {/* Hover Controls */}
      {isEditMode && isHovered && (
        <div 
          className="absolute flex space-x-1 z-50 bg-black/20 backdrop-blur-sm rounded-lg p-1"
          style={{
            top: `${controlsPosition.top}px`,
            right: `${controlsPosition.right}px`
          }}
        >
          {allowTextEdit && (
            <button
              onClick={handleTextEdit}
              data-edit-button="text"
              className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-all shadow-lg"
              title="Edit text content"
            >
              <Type className="w-4 h-4" />
            </button>
          )}
          
          {allowImageEdit && (
            <button
              onClick={handleImageEdit}
              className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-all shadow-lg"
              title="Edit image/video"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          )}
          
        </div>
      )}
    </div>
  );
};

// Upload Modal Component
export const UploadModal = ({ onUpload, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onUpload(e.target.result, file.type);
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Change Background</h3>
        </div>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-gray-600 mb-2">Drop files here or click to upload</p>
          <p className="text-sm text-gray-400">Images and videos supported</p>
          
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,video/*"
            onChange={handleInputChange}
          />
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors"
          >
            Apply Background
          </button>
        </div>
      </div>
    </div>
  );
};

// Global Upload Modal Manager
export const GlobalUploadModal = () => {
  const { showUploadModal, setShowUploadModal, editingElement, setEditingElement } = React.useContext(EditContext);

  const handleUpload = (fileData, fileType) => {
    // Dispatch custom event for upload handling
    window.dispatchEvent(new CustomEvent('editSystemUpload', {
      detail: {
        elementId: editingElement,
        fileData,
        fileType
      }
    }));
    setEditingElement(null);
  };

  const handleClose = () => {
    setShowUploadModal(false);
    setEditingElement(null);
  };

  if (!showUploadModal) return null;

  return <UploadModal onUpload={handleUpload} onClose={handleClose} />;
};

// Global Text Positioner Manager - renders at document body level
export const GlobalTextPositioner = () => {
  const { 
    showTextPositioner, 
    setShowTextPositioner, 
    textPositionerTarget,
    saveContent
  } = React.useContext(EditContext);

  // Close text positioner when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showTextPositioner && 
          !event.target.closest('.fixed.bg-zinc-800') &&
          !event.target.closest('[data-edit-button]')) {
        setShowTextPositioner(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTextPositioner, setShowTextPositioner]);

  const handlePositionChange = async (newPosition) => {
    if (textPositionerTarget) {
      const elementId = textPositionerTarget.getAttribute('data-element-id') || 
                      textPositionerTarget.closest('[data-element-id]')?.getAttribute('data-element-id');
      
      if (elementId) {
        await saveContent(elementId, {
          text_position: newPosition
        });
      }
    }
  };

  if (!showTextPositioner || !textPositionerTarget) return null;

  // Render to body using portal
  return ReactDOM.createPortal(
    <TextPositioner
      target={textPositionerTarget}
      onPositionChange={handlePositionChange}
      onClose={() => setShowTextPositioner(false)}
    />,
    document.body
  );
};

// Global Color Picker Manager - renders at document body level
export const GlobalColorPicker = () => {
  const { 
    showColorPicker, 
    setShowColorPicker, 
    colorPickerPosition, 
    colorPickerCallback 
  } = React.useContext(EditContext);

  // Close color picker when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showColorPicker && 
          !event.target.closest('[data-color-picker]') &&
          !event.target.closest('[contenteditable="true"]') &&
          !event.target.closest('[data-edit-button="text"]')) {
        setShowColorPicker(false);
        
        // Disable dragging for all elements when color picker closes
        document.querySelectorAll('.editable-text-element').forEach(element => {
          if (element._dragCleanup) {
            element._dragCleanup();
          }
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColorPicker, setShowColorPicker]);

  const handleClose = () => {
    setShowColorPicker(false);
    // Disable dragging for all elements when manually closing
    document.querySelectorAll('.editable-text-element').forEach(element => {
      if (element._dragCleanup) {
        element._dragCleanup();
      }
    });
  };

  if (!showColorPicker) return null;

  // Render to body using portal
  return ReactDOM.createPortal(
    <ColorPicker
      position={colorPickerPosition}
      onColorSelect={colorPickerCallback}
      onClose={handleClose}
    />,
    document.body
  );
};