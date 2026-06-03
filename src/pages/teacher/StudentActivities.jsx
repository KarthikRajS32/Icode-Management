import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Dialog } from '../../components/Dialog';
import { Badge } from '../../components/Badge';
import { Avatar } from '../../components/Avatar';
import { ACTIVITY_PHOTO_PRESETS } from '../../data/mockData';
import { formatDate } from '../../utils/formatDate';
import {
  School,
  User,
  Activity,
  Plus,
  Calendar,
  Image as ImageIcon,
  FileImage,
  ClipboardCheck,
  Mail,
  ChevronRight,
  Camera
} from 'lucide-react';

export const TeacherStudentActivities = () => {
  const { currentUser, classrooms, students, classroomStudents, activities, addStudentActivity, deleteActivity, triggerToast } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve classroom ID from URL query parameters (e.g. ?classroomId=c-1)
  const queryParams = new URLSearchParams(location.search);
  const initialClassroomId = queryParams.get('classroomId');

  // Filter assigned classrooms
  const teacherId = currentUser?.associatedId || 't-1';
  const assignedClassrooms = classrooms.filter(c => c.teacherId === teacherId);

  // Selected classroom read directly from URL (Source of Truth)
  const selectedClassroomId = initialClassroomId || (assignedClassrooms.length > 0 ? assignedClassrooms[0].id : '');

  // Roster of students in active classroom using classroomStudents join state
  const activeStudents = students.filter(s => classroomStudents.some(cs => cs.studentId === s.id && cs.classroomId === selectedClassroomId));

  // States
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photoPreset, setPhotoPreset] = useState('');
  const [customPhotos, setCustomPhotos] = useState([]); // array of base64 strings
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [formErrors, setFormErrors] = useState({});

  // Camera Capture States & Refs
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      setFormErrors(prev => ({ ...prev, camera: null }));
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setFormErrors(prev => ({ ...prev, camera: "Unable to access device camera. Please check permissions." }));
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureSnapshot = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const base64Img = canvas.toDataURL('image/jpeg', 0.85);
      setCustomPhotos(prev => [...prev, base64Img]);
      triggerToast('Photo captured!', 'success');
    }
  };

  // Wire stream to video element when camera becomes active
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  // Clean up and stop camera stream if modal is closed
  useEffect(() => {
    if (!modalOpen) {
      stopCamera();
    }
  }, [modalOpen]);

  // Set first student as active when classroom changes
  useEffect(() => {
    if (activeStudents.length > 0) {
      const isInClass = activeStudents.some(s => s.id === selectedStudentId);
      if (!isInClass) {
        const timer = setTimeout(() => {
          setSelectedStudentId(activeStudents[0].id);
        }, 0);
        return () => clearTimeout(timer);
      }
    } else if (selectedStudentId !== '') {
      const timer = setTimeout(() => {
        setSelectedStudentId('');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [selectedClassroomId, activeStudents, selectedStudentId]);

  // Find target child student
  const activeStudent = students.find(s => s.id === selectedStudentId);
  // Find activities logged for this child in the selected classroom
  const studentActivities = activities.filter(act => act.studentId === selectedStudentId && act.classroomId === selectedClassroomId);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPhotoPreset('');
    setCustomPhotos([]);
    setDate(new Date().toISOString().split('T')[0]);
    setFormErrors({});
  };

  const handleOpenModal = () => {
    resetForm();
    setModalOpen(true);
  };

  // Convert custom uploaded images to base64 array
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setFormErrors(prev => ({ ...prev, customPhotos: null }));

    const newPhotos = [];
    let processed = 0;
    let hasError = false;

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        setFormErrors(prev => ({ ...prev, customPhotos: 'Please select only image files' }));
        hasError = true;
        return;
      }

      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setFormErrors(prev => ({ ...prev, customPhotos: 'Each image must be under 2MB' }));
        hasError = true;
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (!hasError) {
          newPhotos.push(reader.result);
          processed++;
          if (processed === files.length) {
            setCustomPhotos(prev => [...prev, ...newPhotos]);
            setPhotoPreset(''); // Disable preset selection in favor of custom photos
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index) => {
    setCustomPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors = {};
    if (!title.trim()) errors.title = 'Activity title is required';
    if (!description.trim()) errors.description = 'Activity description highlights are required';
    if (!date) errors.date = 'Logging date is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Resolve images array
    let resolvedImages = [];
    if (customPhotos.length > 0) {
      resolvedImages = customPhotos;
    } else if (photoPreset) {
      const preset = ACTIVITY_PHOTO_PRESETS.find(p => p.id === photoPreset);
      if (preset) {
        resolvedImages = [preset.url];
      }
    }

    const activityData = {
      title,
      description,
      photoPreset: customPhotos.length > 0 ? '' : photoPreset,
      customPhoto: customPhotos[0] || null, // legacy compatibility
      images: resolvedImages,
      date,
      studentId: selectedStudentId,
      classroomId: selectedClassroomId
    };

    await addStudentActivity(activityData);
    setModalOpen(false);
    resetForm();
  };

  return (
    <div className="flex flex-col gap-6 w-full font-sans">

      {/* Header Selector bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white border border-gray-100 rounded-3xl shadow-xs">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg font-extrabold text-gray-800 leading-tight">
            Daily Activity Log
          </h1>
          <p className="text-[10px] text-gray-400">
            Record student activities and send updates directly to parent accounts.
          </p>
        </div>

        {/* Classroom picker dropdown */}
        <div className="flex items-center gap-3">
          <School size={16} className="text-gray-400" />
          <select
            value={selectedClassroomId}
            onChange={(e) => {
              navigate(`/teacher/activities?classroomId=${e.target.value}`);
            }}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold outline-none text-gray-700 focus:border-blue-500 transition-colors"
          >
            {assignedClassrooms.map((c) => (
              <option key={c.id} value={c.id}>
                Class: {c.name} {c.section}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main split viewport layout */}
      {activeStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center gap-3 p-16 bg-white border border-gray-100 rounded-3xl mt-2">
          <div className="p-4 bg-gray-50 rounded-full text-gray-400">
            <User size={32} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-gray-700">No Students Enrolled</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm leading-relaxed">
              This classroom has no enrolled students. Contact the admin to enroll students.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mt-2">

          {/* Left Column: Student roster list */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              Students
            </span>

            <div className="flex flex-col gap-2.5 max-h-[500px] overflow-y-auto">
              {activeStudents.map((st) => {
                const isActive = st.id === selectedStudentId;
                const studentActs = activities.filter(act => act.studentId === st.id && act.classroomId === selectedClassroomId).length;

                return (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStudentId(st.id)}
                    className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 cursor-pointer select-none ${isActive
                        ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-500/5'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={st.name} size="sm" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-gray-800 text-xs truncate">
                          {st.name}
                        </span>
                        <span className="text-[9px] text-gray-400 font-semibold uppercase mt-0.5">
                          Age {st.age} · {st.gender}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={isActive ? 'blue' : 'slate'} className="text-[8px] px-1.5 py-0 border-none scale-90">
                        {studentActs} Log{studentActs !== 1 && 's'}
                      </Badge>
                      <ChevronRight size={14} className={`text-gray-400 ${isActive ? 'text-blue-500' : ''}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Individual student daily timeline feed */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {activeStudent && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs flex flex-col gap-6">

                {/* Timeline student header bar */}
                <div className="flex items-center justify-between gap-4 pb-5 border-b border-gray-100">
                  <div className="flex items-center gap-3.5">
                    <Avatar name={activeStudent.name} size="md" />
                    <div className="flex flex-col">
                      <h2 className="font-black text-gray-800 text-sm leading-tight">
                        {activeStudent.name}
                      </h2>
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                        Parent: <b className="text-gray-600 font-bold">{activeStudent.parentName}</b>
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleOpenModal}
                    className="rounded-xl font-bold flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Add Activity
                  </Button>
                </div>

                {/* Timeline activities feed */}
                <div className="flex flex-col gap-6">
                  {studentActivities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center gap-3 py-16 text-gray-400">
                      <div className="p-3 bg-gray-50 rounded-full text-gray-400">
                        <ClipboardCheck size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-gray-600">No activities logged yet</p>
                        <p className="text-[10px] text-gray-400 mt-1 max-w-[200px] leading-relaxed">
                          Click "Add Activity" to start logging updates for this student.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-8 relative before:content-[''] before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-gray-100">
                      {studentActivities.map((act) => {
                        // Resolve preset photo URL or custom base64 file
                        const activePreset = ACTIVITY_PHOTO_PRESETS.find(p => p.id === act.photoPreset);
                        const photoUrl = act.customPhoto || activePreset?.url || 'https://images.unsplash.com/photo-1453733190148-c44698c26588?auto=format&fit=crop&q=80&w=600';

                        return (
                          <div key={act.id} className="relative pl-12 group flex flex-col gap-4">
                            {/* Dot indicator */}
                            <div className="absolute left-[15px] top-1 w-3.5 h-3.5 rounded-full border-[2.5px] border-blue-500 bg-white shadow-sm" />

                            <div className="p-5 rounded-2xl border border-gray-100 hover:border-gray-200 bg-white transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start">
                              {/* Photo card attachment(s) */}
                              <div className="flex flex-wrap gap-2.5 w-full sm:w-72 flex-shrink-0">
                                {act.images && act.images.length > 0 ? (
                                  act.images.map((imgUrl, i) => (
                                    <div key={i} className={`rounded-xl overflow-hidden relative border border-gray-100 shadow-xs ${act.images.length === 1 ? 'w-36 h-28' : 'w-20 h-16'}`}>
                                      <img
                                        src={imgUrl}
                                        alt={`${act.title} - ${i + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                      />
                                    </div>
                                  ))
                                ) : (
                                  <div className="w-36 h-28 rounded-xl overflow-hidden relative border border-gray-100 shadow-xs">
                                    <img
                                      src={photoUrl}
                                      alt={act.title}
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="flex-grow flex flex-col gap-1.5 min-w-0">
                                <div className="flex items-center justify-between gap-2.5">
                                  <h4 className="font-extrabold text-xs text-gray-800 leading-tight">
                                    {act.title}
                                  </h4>
                                  <button
                                    onClick={() => deleteActivity(act.id)}
                                    className="text-[9px] font-bold text-gray-400 hover:text-rose-500 uppercase flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </div>

                                <span className="text-[9px] text-gray-400 font-bold flex items-center gap-1">
                                  <Calendar size={10} /> {formatDate(act.date)}
                                </span>

                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                  {act.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DAILY ACTIVITY LOGGER DRAWER DIALOG */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={activeStudent ? `Log Activity: ${activeStudent.name}` : 'Log Activity'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <Input
              label="Activity Title"
              placeholder="e.g. Solar System Scale Model"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={formErrors.title}
              className="sm:col-span-2"
            />
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              error={formErrors.date}
            />
          </div>

          <Input
            label="Notes & Observations"
            placeholder="e.g. Emily worked diligently today. She took charge of paint mixing, helped clean the lab tools, and demonstrated great sharing skills..."
            textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={formErrors.description}
          />

          {/* Picture Selector block */}
          <div className="flex flex-col gap-3.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              Activity Photos
            </label>

            {/* Custom file Drag/Drop or Live Camera Stream */}
            <div className="flex flex-col gap-3 p-4 border border-dashed border-gray-200 rounded-2xl bg-gray-50 text-center relative items-center justify-center min-h-[140px] w-full">
              {cameraActive ? (
                <div className="flex flex-col items-center gap-3 w-full bg-slate-950 p-4 rounded-xl shadow-inner">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full max-w-md h-48 object-cover rounded-lg bg-slate-900 border border-slate-800"
                  />
                  <div className="flex gap-3 w-full justify-center">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={captureSnapshot}
                      className="rounded-xl flex items-center justify-center gap-1.5 font-bold bg-emerald-600 hover:bg-emerald-700 py-2 px-4 text-xs shadow-md"
                    >
                      <Camera size={14} /> Take Photo
                    </Button>
                    <Button
                      type="button"
                      variant="glass"
                      onClick={stopCamera}
                      className="rounded-xl flex items-center justify-center gap-1.5 font-bold py-2 px-4 text-xs"
                    >
                      Close Camera
                    </Button>
                  </div>
                  {formErrors.camera && (
                    <span className="text-[10px] text-rose-500 font-semibold">{formErrors.camera}</span>
                  )}
                </div>
              ) : customPhotos.length > 0 ? (
                <div className="flex flex-col gap-3 w-full">
                  <span className="text-[10px] text-emerald-500 font-extrabold flex items-center justify-center gap-1">
                    <FileImage size={12} /> Custom images active ({customPhotos.length})
                  </span>
                  <div className="flex flex-wrap gap-2 justify-center max-h-[80px] overflow-y-auto pr-1">
                    {customPhotos.map((photo, index) => (
                      <div key={index} className="relative w-12 h-10 rounded-lg overflow-hidden border border-gray-200 group/preview">
                        <img src={photo} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity duration-150 text-[9px] font-bold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 justify-center items-center mt-0.5">
                    <label className="text-[9px] font-bold text-blue-500 hover:underline cursor-pointer flex items-center gap-0.5">
                      Add More
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="text-[9px] font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Camera size={12} /> Capture Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomPhotos([])}
                      className="text-[9px] font-bold text-rose-500 hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2.5 py-2">
                  <ImageIcon size={24} className="text-gray-400" />
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block">Drag & Drop Image(s) here</span>
                    <span className="text-[9px] text-gray-400 block mt-0.5">Supports PNG, JPG (Max 2MB per image)</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-extrabold cursor-pointer transition-colors duration-200 flex items-center justify-center gap-1.5 shadow-xs">
                      Upload Picture(s)
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-extrabold cursor-pointer transition-colors duration-200 flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Camera size={12} /> Capture Photo
                    </button>
                  </div>
                </div>
              )}
              {formErrors.customPhotos && (
                <span className="text-[9px] text-rose-500 mt-1 font-semibold">{formErrors.customPhotos}</span>
              )}
            </div>
          </div>

          <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-2xl flex items-center gap-3.5 text-[10px] text-gray-400 leading-normal">
            <Mail size={22} className="text-gray-400 flex-shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="font-extrabold text-gray-500 uppercase tracking-wider">Email Notification</span>
              <span>
                Submitting this activity will send an email notification to <b>{activeStudent?.parentName} ({activeStudent?.parentEmail || 'No email registered'})</b>.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end mt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="rounded-xl font-bold flex items-center gap-1.5">
              Submit Activity
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
