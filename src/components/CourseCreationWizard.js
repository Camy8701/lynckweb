import React, { useState } from 'react';
import { coursesService } from '../services/coursesService';
import { useAuth } from '../contexts/Auth0Context';
import {
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  Video,
  Mic,
  Youtube,
  Check,
  Loader2,
  GripVertical,
  Plus,
  Trash2,
  Edit,
  Eye,
  Save,
  Globe,
  DollarSign,
  Star,
  Users,
  BookOpen,
  Play,
  Settings,
  X,
  Award
} from 'lucide-react';

const CourseCreationWizard = ({ onClose }) => {
  const { user, profile, isDevelopmentMode } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [courseData, setCourseData] = useState({
    // Step 1 - Basics
    title: '',
    description: '',
    targetAudience: '',
    language: 'EN',
    category: '',
    difficulty: 'beginner',
    
    // Step 2 - Content
    uploadedFiles: [],
    voiceRecording: null,
    textInput: '',
    youtubeLink: '',
    
    // Step 3 - AI Generated
    generatedOutline: null,
    isGenerating: false,
    
    // Step 4 - Customization
    lessons: [],
    quizzes: [],
    
    // Step 5 - Tiers
    tiers: {
      foundation: { price: 49, features: [], materials: [] },
      advanced: { price: 97, features: [], materials: [] },
      mastery: { price: 197, features: [], materials: [] }
    },
    
    // Step 6 - Publish
    isPublished: false,
    visibility: 'public'
  });

  const steps = [
    { number: 1, title: 'Course Basics', icon: BookOpen },
    { number: 2, title: 'Content Input', icon: Upload },
    { number: 3, title: 'AI Generation', icon: Settings },
    { number: 4, title: 'Customization', icon: Edit },
    { number: 5, title: 'Tier Setup', icon: DollarSign },
    { number: 6, title: 'Publish', icon: Globe }
  ];

  const categories = [
    'Web Development',
    'Data Science',
    'Digital Marketing',
    'Design',
    'Business',
    'Photography',
    'Music',
    'Language Learning',
    'Personal Development'
  ];

  const languages = [
    { code: 'EN', name: 'English' },
    { code: 'FR', name: 'French' },
    { code: 'DE', name: 'German' },
    { code: 'ES', name: 'Spanish' }
  ];

  const updateField = (field, value) => {
    if (typeof field !== 'string' || field.trim() === '') {
      console.warn('Invalid field name provided to updateField');
      return;
    }
    
    setCourseData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFileUpload = (files) => {
    if (!files || files.length === 0) return;
    
    try {
      const newFiles = Array.from(files).map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        uploadProgress: 100 // Simulate instant upload for demo
      }));
      
      setCourseData(prev => ({
        ...prev,
        uploadedFiles: [...prev.uploadedFiles, ...newFiles]
      }));
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const generateCourseOutline = () => {
    if (courseData.isGenerating) return; // Prevent multiple simultaneous generations
    
    updateField('isGenerating', true);
    
    // Simulate AI generation
    const timeoutId = setTimeout(() => {
      const sampleOutline = {
        modules: [
          {
            id: 1,
            title: 'Introduction and Fundamentals',
            lessons: [
              { id: 1, title: 'Welcome to the Course', duration: '10 min' },
              { id: 2, title: 'Setting Up Your Environment', duration: '15 min' },
              { id: 3, title: 'Core Concepts Overview', duration: '20 min' }
            ]
          },
          {
            id: 2,
            title: 'Practical Implementation',
            lessons: [
              { id: 4, title: 'Hands-on Exercise 1', duration: '25 min' },
              { id: 5, title: 'Common Pitfalls and Solutions', duration: '18 min' },
              { id: 6, title: 'Best Practices', duration: '22 min' }
            ]
          },
          {
            id: 3,
            title: 'Advanced Topics',
            lessons: [
              { id: 7, title: 'Advanced Techniques', duration: '30 min' },
              { id: 8, title: 'Real-world Applications', duration: '28 min' },
              { id: 9, title: 'Final Project', duration: '45 min' }
            ]
          }
        ],
        totalDuration: '213 minutes',
        estimatedStudyTime: '6-8 hours'
      };
      
      updateField('generatedOutline', sampleOutline);
      updateField('isGenerating', false);
    }, 3000);
  };

  const publishCourse = async () => {
    if (isPublishing) return;
    
    setIsPublishing(true);
    
    try {
      if (isDevelopmentMode) {
        // In development mode, just simulate success
        await new Promise(resolve => setTimeout(resolve, 2000));
        alert('Course published successfully! (Development mode)');
        updateField('isPublished', true);
        onClose();
        return;
      }

      // Get teacher ID from user or profile
      const teacherId = profile?.id || user?.sub || 'dev-teacher';
      
      // Prepare course data for database
      const courseToCreate = {
        title: courseData.title,
        description: courseData.description,
        teacher_id: teacherId,
        category: courseData.category,
        difficulty_level: courseData.difficulty,
        language: courseData.language,
        status: 'published',
        visibility: courseData.visibility || 'public',
        
        // Pricing tiers
        price_foundation: courseData.tiers.foundation.price * 100, // Convert to cents
        price_advanced: courseData.tiers.advanced.price * 100,
        price_mastery: courseData.tiers.mastery.price * 100,
        
        // Additional metadata
        target_audience: courseData.targetAudience,
        estimated_duration: courseData.generatedOutline?.totalDuration || '0 minutes',
        course_structure: JSON.stringify(courseData.generatedOutline),
        
        // Timestamps
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await coursesService.createCourse(courseToCreate);
      
      if (error) {
        console.error('Error creating course:', error);
        alert('Failed to publish course. Please try again.');
        return;
      }

      console.log('Course created successfully:', data);
      updateField('isPublished', true);
      alert('Course published successfully!');
      onClose();
      
    } catch (error) {
      console.error('Error publishing course:', error);
      alert('Failed to publish course. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Course Basics</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Course Title</label>
            <input
              type="text"
              value={courseData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Enter your course title"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Target Audience</label>
            <input
              type="text"
              value={courseData.targetAudience}
              onChange={(e) => updateField('targetAudience', e.target.value)}
              placeholder="Who is this course for?"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={courseData.category}
              onChange={(e) => updateField('category', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-zinc-800">{cat}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
            <select
              value={courseData.language}
              onChange={(e) => updateField('language', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code} className="bg-zinc-800">{lang.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty Level</label>
            <select
              value={courseData.difficulty}
              onChange={(e) => updateField('difficulty', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="beginner" className="bg-zinc-800">Beginner</option>
              <option value="intermediate" className="bg-zinc-800">Intermediate</option>
              <option value="advanced" className="bg-zinc-800">Advanced</option>
            </select>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Course Description</label>
        <textarea
          value={courseData.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Describe what students will learn in this course"
          rows={4}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Content Input</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* File Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">File Upload</h3>
          <div
            className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer && e.dataTransfer.files) {
                handleFileUpload(e.dataTransfer.files);
              }
            }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => {
              const fileInput = document.getElementById('file-upload');
              if (fileInput) fileInput.click();
            }}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-white mb-2">Drop files here or click to upload</p>
            <p className="text-sm text-gray-400">PDF, DOCX, DOC, MP4, MOV supported</p>
            <input
              id="file-upload"
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.mp4,.mov"
              onChange={(e) => {
                if (e.target && e.target.files) {
                  handleFileUpload(e.target.files);
                }
              }}
              className="hidden"
            />
          </div>
          
          {/* File List */}
          {courseData.uploadedFiles && courseData.uploadedFiles.length > 0 && (
            <div className="space-y-2">
              {courseData.uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-white text-sm">{file.name}</p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${file.uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  <button 
                    className="text-red-400 hover:text-red-300"
                    onClick={() => {
                      if (file && file.id) {
                        setCourseData(prev => ({
                          ...prev,
                          uploadedFiles: prev.uploadedFiles.filter(f => f.id !== file.id)
                        }));
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Other Input Methods */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Other Input Methods</h3>
          
          {/* Voice Recording */}
          <div className="bg-white/10 border border-white/20 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Mic className="w-5 h-5 text-purple-400" />
              <span className="font-medium text-white">Voice Recording</span>
            </div>
            <button className="w-full bg-purple-600/20 border border-purple-500/30 text-purple-400 py-3 rounded-lg hover:bg-purple-600/30 transition-colors">
              Start Recording
            </button>
          </div>
          
          {/* YouTube Link */}
          <div className="bg-white/10 border border-white/20 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Youtube className="w-5 h-5 text-red-400" />
              <span className="font-medium text-white">YouTube Link</span>
            </div>
            <input
              type="url"
              value={courseData.youtubeLink}
              onChange={(e) => updateField('youtubeLink', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          {/* Text Input */}
          <div className="bg-white/10 border border-white/20 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <FileText className="w-5 h-5 text-green-400" />
              <span className="font-medium text-white">Text Input</span>
            </div>
            <textarea
              value={courseData.textInput}
              onChange={(e) => updateField('textInput', e.target.value)}
              placeholder="Paste or type your content here..."
              rows={4}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">AI Generation</h2>
      
      {!courseData.generatedOutline && !courseData.isGenerating && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Settings className="w-12 h-12 text-white animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-4">Ready to Generate Your Course</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Our AI will analyze your uploaded content and create a structured course outline with lessons, 
            modules, and suggested quiz questions.
          </p>
          <button
            onClick={generateCourseOutline}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
          >
            <Settings className="w-5 h-5" />
            <span>Generate Course Outline</span>
          </button>
        </div>
      )}
      
      {courseData.isGenerating && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-4">AI is Analyzing Your Content...</h3>
          <p className="text-gray-300 mb-6">This may take a few moments. Please wait while we create your course structure.</p>
          <div className="max-w-md mx-auto">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      )}
      
      {courseData.generatedOutline && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Generated Course Outline</h3>
            <button
              onClick={generateCourseOutline}
              className="text-blue-400 hover:text-blue-300 px-4 py-2 rounded-lg border border-blue-500/30 hover:bg-blue-600/20 transition-colors"
            >
              Regenerate
            </button>
          </div>
          
          <div className="bg-white/10 border border-white/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-300">
                  Total Duration: <span className="text-white font-medium">{courseData.generatedOutline?.totalDuration || 'N/A'}</span>
                </div>
                <div className="text-sm text-gray-300">
                  Study Time: <span className="text-white font-medium">{courseData.generatedOutline?.estimatedStudyTime || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {courseData.generatedOutline?.modules?.map((module, moduleIndex) => (
                <div key={module.id} className="border border-white/20 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3">
                    Module {moduleIndex + 1}: {module.title}
                  </h4>
                  <div className="space-y-2">
                    {module.lessons?.map((lesson, lessonIndex) => (
                      <div key={lesson.id} className="flex items-center justify-between p-2 rounded bg-white/5">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-400">{moduleIndex + 1}.{lessonIndex + 1}</span>
                          <span className="text-white">{lesson.title}</span>
                        </div>
                        <span className="text-sm text-gray-400">{lesson.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Customization</h2>
      
      {courseData.generatedOutline ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Course Structure</h3>
            <button className="text-blue-400 hover:text-blue-300 px-4 py-2 rounded-lg border border-blue-500/30 hover:bg-blue-600/20 transition-colors">
              Add Module
            </button>
          </div>
          
          <div className="space-y-4">
            {courseData.generatedOutline?.modules?.map((module, moduleIndex) => (
              <div key={module.id} className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                    <input
                      type="text"
                      value={module.title}
                      onChange={(e) => {
                        const updatedOutline = { ...courseData.generatedOutline };
                        updatedOutline.modules[moduleIndex].title = e.target.value;
                        updateField('generatedOutline', updatedOutline);
                      }}
                      className="bg-transparent border-none text-lg font-semibold text-white focus:outline-none focus:bg-white/10 rounded px-2 py-1"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <Edit className="w-4 h-4 text-gray-300" />
                    </button>
                    <button className="p-2 hover:bg-red-600/20 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {module.lessons?.map((lesson, lessonIndex) => (
                    <div key={lesson.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center space-x-3 flex-1">
                        <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                        <Play className="w-4 h-4 text-blue-400" />
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) => {
                            const updatedOutline = { ...courseData.generatedOutline };
                            updatedOutline.modules[moduleIndex].lessons[lessonIndex].title = e.target.value;
                            updateField('generatedOutline', updatedOutline);
                          }}
                          className="bg-transparent border-none text-white focus:outline-none flex-1"
                        />
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-400">{lesson.duration}</span>
                        <button className="p-1 hover:bg-white/10 rounded transition-colors">
                          <Edit className="w-3 h-3 text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-red-600/20 rounded transition-colors">
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button className="w-full p-3 border-2 border-dashed border-white/30 rounded-lg text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors">
                    + Add Lesson
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quiz & Assessment Settings</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Quiz Frequency</label>
                <select className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white">
                  <option value="module" className="bg-zinc-800">End of each module</option>
                  <option value="lesson" className="bg-zinc-800">After every 3 lessons</option>
                  <option value="custom" className="bg-zinc-800">Custom placement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Pass Threshold</label>
                <select className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white">
                  <option value="70" className="bg-zinc-800">70%</option>
                  <option value="80" className="bg-zinc-800">80%</option>
                  <option value="90" className="bg-zinc-800">90%</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-4">Generate Course Structure First</h3>
          <p className="text-gray-300 mb-6">Complete step 3 to customize your course structure.</p>
          <button
            onClick={() => setCurrentStep(3)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Go to AI Generation
          </button>
        </div>
      )}
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Tier Setup</h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Foundation Tier */}
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Foundation</h3>
            <div className="flex items-center justify-center space-x-2">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={courseData.tiers.foundation.price}
                onChange={(e) => updateField('tiers', {
                  ...courseData.tiers,
                  foundation: { ...courseData.tiers.foundation, price: parseInt(e.target.value) }
                })}
                className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-center w-20"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Features Included</label>
              <div className="space-y-2">
                {['Course videos', 'Basic materials', 'Community access'].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Materials</label>
              <textarea
                placeholder="List materials included..."
                rows={3}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 text-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* Advanced Tier */}
        <div className="backdrop-blur-md bg-white/10 border border-purple-500/30 rounded-xl p-6 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full">Popular</span>
          </div>
          
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Advanced</h3>
            <div className="flex items-center justify-center space-x-2">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={courseData.tiers.advanced.price}
                onChange={(e) => updateField('tiers', {
                  ...courseData.tiers,
                  advanced: { ...courseData.tiers.advanced, price: parseInt(e.target.value) }
                })}
                className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-center w-20"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Features Included</label>
              <div className="space-y-2">
                {['All Foundation features', 'Premium materials', '1-on-1 sessions', 'Advanced projects'].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Materials</label>
              <textarea
                placeholder="List premium materials..."
                rows={3}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 text-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* Mastery Tier */}
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Mastery</h3>
            <div className="flex items-center justify-center space-x-2">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={courseData.tiers.mastery.price}
                onChange={(e) => updateField('tiers', {
                  ...courseData.tiers,
                  mastery: { ...courseData.tiers.mastery, price: parseInt(e.target.value) }
                })}
                className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-center w-20"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Features Included</label>
              <div className="space-y-2">
                {['All Advanced features', 'Personal mentorship', 'Certificate', 'Lifetime access'].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Materials</label>
              <textarea
                placeholder="List exclusive materials..."
                rows={3}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 text-sm resize-none"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Payment & Delivery Settings</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Payment Options</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="text-blue-500 rounded" defaultChecked />
                <span className="text-gray-300 text-sm">One-time payment</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="text-blue-500 rounded" />
                <span className="text-gray-300 text-sm">Payment plans (3 months)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="text-blue-500 rounded" />
                <span className="text-gray-300 text-sm">Subscription model</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Course Access</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="radio" name="access" className="text-blue-500" defaultChecked />
                <span className="text-gray-300 text-sm">Lifetime access</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="access" className="text-blue-500" />
                <span className="text-gray-300 text-sm">1 year access</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="access" className="text-blue-500" />
                <span className="text-gray-300 text-sm">6 months access</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Publish Course</h2>
      
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Course Preview */}
        <div className="space-y-6">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Course Preview</h3>
            
            <div className="aspect-video bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg mb-4 flex items-center justify-center">
              <Play className="w-16 h-16 text-white/50" />
            </div>
            
            <div className="space-y-3">
              <h4 className="text-xl font-bold text-white">{courseData.title || 'Course Title'}</h4>
              <p className="text-gray-300">{courseData.description || 'Course description will appear here...'}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-400">By {courseData.instructor || 'You'}</span>
                  <span className="text-sm text-gray-400">{courseData.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-white">4.9 (New)</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-white/20">
                <span className="text-sm text-gray-300">Starting from</span>
                <span className="text-xl font-bold text-cyan-400">${courseData.tiers.foundation.price}</span>
              </div>
            </div>
          </div>
          
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">SEO & Marketing</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">SEO Keywords</label>
                <input
                  type="text"
                  placeholder="web development, react, javascript"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Course Tags</label>
                <div className="flex flex-wrap gap-2">
                  {['Beginner', 'Web Dev', 'React'].map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm flex items-center space-x-2">
                      <span>{tag}</span>
                      <X className="w-3 h-3 cursor-pointer" />
                    </span>
                  ))}
                  <button className="px-3 py-1 border border-white/30 text-gray-400 rounded-full text-sm hover:border-blue-400 hover:text-blue-400 transition-colors">
                    + Add Tag
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Launch Strategy</label>
                <select className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white">
                  <option value="immediate" className="bg-zinc-800">Publish immediately</option>
                  <option value="scheduled" className="bg-zinc-800">Schedule for later</option>
                  <option value="beta" className="bg-zinc-800">Beta launch to select students</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Publishing Options */}
        <div className="space-y-6">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Publishing Options</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Visibility</label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={courseData.visibility === 'public'}
                      onChange={(e) => updateField('visibility', e.target.value)}
                      className="text-blue-500"
                    />
                    <div>
                      <span className="text-white font-medium">Public</span>
                      <p className="text-sm text-gray-400">Anyone can find and enroll in your course</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="visibility"
                      value="unlisted"
                      checked={courseData.visibility === 'unlisted'}
                      onChange={(e) => updateField('visibility', e.target.value)}
                      className="text-blue-500"
                    />
                    <div>
                      <span className="text-white font-medium">Unlisted</span>
                      <p className="text-sm text-gray-400">Only people with the link can access</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={courseData.visibility === 'private'}
                      onChange={(e) => updateField('visibility', e.target.value)}
                      className="text-blue-500"
                    />
                    <div>
                      <span className="text-white font-medium">Private</span>
                      <p className="text-sm text-gray-400">Invite-only access</p>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/20">
                <label className="block text-sm font-medium text-gray-300 mb-3">Additional Options</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-blue-500 rounded" defaultChecked />
                    <span className="text-gray-300 text-sm">Enable course reviews</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-blue-500 rounded" defaultChecked />
                    <span className="text-gray-300 text-sm">Allow student discussions</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-blue-500 rounded" />
                    <span className="text-gray-300 text-sm">Send launch notification to followers</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="text-blue-500 rounded" />
                    <span className="text-gray-300 text-sm">Feature on your profile</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Pre-Launch Checklist</h3>
            
            <div className="space-y-3">
              {[
                { item: 'Course content uploaded', checked: true },
                { item: 'Pricing tiers configured', checked: true },
                { item: 'Course description complete', checked: courseData.description?.length > 50 },
                { item: 'Thumbnail image added', checked: false },
                { item: 'First lesson preview set', checked: false }
              ].map((check, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    check.checked 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-400'
                  }`}>
                    {check.checked && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm ${check.checked ? 'text-white' : 'text-gray-400'}`}>
                    {check.item}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-medium">Ready to publish?</span>
                <span className="text-sm text-gray-400">3/5 checks complete</span>
              </div>
              
              <button
                onClick={publishCourse}
                disabled={isPublishing}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-5 h-5" />
                    <span>Publish Course</span>
                  </>
                )}
              </button>
              
              <button className="w-full mt-3 border border-white/30 text-gray-300 hover:text-white hover:border-white/50 py-2 px-6 rounded-lg font-medium transition-colors">
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return renderStep1();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-white/20 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Create New Course</h1>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center space-x-4 mt-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    isActive 
                      ? 'border-blue-500 bg-blue-500 text-white' 
                      : isCompleted
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-600 text-gray-400'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="ml-3 hidden md:block">
                    <p className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-600 ml-4" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {renderCurrentStep()}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-white/20 flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 1
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">
              Step {currentStep} of {steps.length}
            </span>
            
            {currentStep === steps.length ? (
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Publish Course</span>
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCreationWizard;