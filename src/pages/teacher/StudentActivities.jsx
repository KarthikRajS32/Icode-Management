import { useState, useEffect } from 'react';
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
  ChevronRight
} from 'lucide-react';

export const TeacherStudentActivities = () => {
  const { currentUser, classrooms, students, activities, addStudentActivity, deleteActivity } = useApp();
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
  
  // Roster of students in active classroom
  const activeStudents = students.filter(s => s.classroomId === selectedClassroomId);

  // States
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photoPreset, setPhotoPreset] = useState('math');
  const [customPhoto, setCustomPhoto] = useState(null); // base64
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [formErrors, setFormErrors] = useState({});

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
  // Find activities logged for this child
  const studentActivities = activities.filter(act => act.studentId === selectedStudentId);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPhotoPreset('math');
    setCustomPhoto(null);
    setDate(new Date().toISOString().split('T')[0]);
    setFormErrors({});
  };

  const handleOpenModal = () => {
    resetForm();
    setModalOpen(true);
  };

  // Convert custom uploaded image to base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormErrors(prev => ({ ...prev, customPhoto: 'Please select an image file' }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setFormErrors(prev => ({ ...prev, customPhoto: 'Image size should be less than 2MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCustomPhoto(reader.result);
      setPhotoPreset(''); // Disable preset selection in favor of custom photo
      setFormErrors(prev => ({ ...prev, customPhoto: null }));
    };
    reader.readAsDataURL(file);
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

    const activityData = {
      title,
      description,
      photoPreset,
      customPhoto,
      date,
      studentId: selectedStudentId,
      classroomId: selectedClassroomId
    };

    await addStudentActivity(activityData);
    setModalOpen(false);
    resetForm();
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto font-sans">
      
      {/* Header Selector bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl shadow-xs">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
            Daily Activities Logger
          </h1>
          <p className="text-[10px] text-slate-400">
            Publish daily developments and trigger notifications directly to family portals.
          </p>
        </div>

        {/* Classroom picker dropdown */}
        <div className="flex items-center gap-3">
          <School size={16} className="text-slate-400" />
          <select
            value={selectedClassroomId}
            onChange={(e) => {
              navigate(`/teacher/activities?classroomId=${e.target.value}`);
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold outline-none text-slate-700 dark:text-slate-200 focus:border-indigo-500 transition-colors"
          >
            {assignedClassrooms.map((c) => (
              <option key={c.id} value={c.id}>
                Class: {c.name}-{c.section}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main split viewport layout */}
      {activeStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center gap-3 p-16 bg-white dark:bg-slate-900 border rounded-3xl mt-2">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400">
            <User size={32} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-200">No Enrolled Students</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
              Enrolled children will be displayed here. Please contact admin to enroll students in this class.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mt-2">
          
          {/* Left Column: Student roster list */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Class Roster Selection
            </span>
            
            <div className="flex flex-col gap-2.5 max-h-[500px] overflow-y-auto">
              {activeStudents.map((st) => {
                const isActive = st.id === selectedStudentId;
                const studentActs = activities.filter(act => act.studentId === st.id).length;

                return (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStudentId(st.id)}
                    className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 cursor-pointer select-none ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-md shadow-indigo-500/5'
                        : 'border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={st.name} size="sm" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate">
                          {st.name}
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold uppercase mt-0.5">
                          Age: {st.age} | {st.gender}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={isActive ? 'indigo' : 'slate'} className="text-[8px] px-1.5 py-0 border-none scale-90">
                        {studentActs} Log{studentActs !== 1 && 's'}
                      </Badge>
                      <ChevronRight size={14} className={`text-slate-400 ${isActive ? 'text-indigo-500' : ''}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Individual student daily timeline feed */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {activeStudent && (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs flex flex-col gap-6">
                
                {/* Timeline student header bar */}
                <div className="flex items-center justify-between gap-4 pb-5 border-b border-slate-50 dark:border-slate-800/50">
                  <div className="flex items-center gap-3.5">
                    <Avatar name={activeStudent.name} size="md" />
                    <div className="flex flex-col">
                      <h2 className="font-black text-slate-800 dark:text-slate-100 text-sm leading-tight">
                        {activeStudent.name}
                      </h2>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                        Sponsor: <b className="text-slate-600 dark:text-slate-300 font-bold">{activeStudent.parentName}</b>
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleOpenModal}
                    className="rounded-xl font-bold flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Daily Update
                  </Button>
                </div>

                {/* Timeline activities feed */}
                <div className="flex flex-col gap-6">
                  {studentActivities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center gap-3 py-16 text-slate-400">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400">
                        <ClipboardCheck size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-xs">No logged activities</p>
                        <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">
                          Click "Daily Update" to publish developmental logs for this student.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-8 relative before:content-[''] before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-100 dark:before:bg-slate-800/80">
                      {studentActivities.map((act) => {
                        // Resolve preset photo URL or custom base64 file
                        const activePreset = ACTIVITY_PHOTO_PRESETS.find(p => p.id === act.photoPreset);
                        const photoUrl = act.customPhoto || activePreset?.url || 'https://images.unsplash.com/photo-1453733190148-c44698c26588?auto=format&fit=crop&q=80&w=600';

                        return (
                          <div key={act.id} className="relative pl-12 group flex flex-col gap-4">
                            {/* Dot indicator */}
                            <div className="absolute left-[15px] top-1 w-3.5 h-3.5 rounded-full border-[2.5px] border-indigo-500 bg-white dark:bg-slate-900 transition-colors shadow-sm" />
                            
                            <div className="p-5 rounded-2xl border border-slate-50 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/20 dark:bg-slate-900/20 transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start">
                              {/* Photo card attachment */}
                              <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden flex-shrink-0 relative border border-slate-200/20 shadow-xs">
                                <img
                                  src={photoUrl}
                                  alt={act.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              </div>

                              <div className="flex-grow flex flex-col gap-1.5 min-w-0">
                                <div className="flex items-center justify-between gap-2.5">
                                  <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 leading-tight">
                                    {act.title}
                                  </h4>
                                  <button
                                    onClick={() => deleteActivity(act.id)}
                                    className="text-[9px] font-bold text-slate-400 hover:text-rose-500 uppercase flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </div>
                                
                                <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                                  <Calendar size={10} /> Published: {formatDate(act.date)}
                                </span>
                                
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
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
        title={activeStudent ? `Log Update: ${activeStudent.name}` : 'Log Daily Update'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <Input
              label="Activity Title"
              placeholder="E.g., Solar System Scale Model"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={formErrors.title}
              className="sm:col-span-2"
            />
            <Input
              label="Activity Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              error={formErrors.date}
            />
          </div>

          <Input
            label="Activity Highlights & Observations"
            placeholder="E.g., Emily worked diligently today. She took charge of paint mixing, helped clean the lab tools, and demonstrated great sharing skills..."
            textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={formErrors.description}
          />

          {/* Picture Selector block */}
          <div className="flex flex-col gap-3.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Attach Activity Image
            </label>

            {/* Custom file Drag/Drop and Preset options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Left Box: Custom Drag-drop upload */}
              <div className="flex flex-col gap-2 p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-slate-900/30 text-center relative items-center justify-center min-h-[140px]">
                {customPhoto ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={customPhoto} alt="Preview" className="w-16 h-12 object-cover rounded-lg border" />
                    <span className="text-[10px] text-emerald-500 font-extrabold flex items-center gap-1">
                      <FileImage size={12} /> Custom image active
                    </span>
                    <button
                      type="button"
                      onClick={() => setCustomPhoto(null)}
                      className="text-[9px] font-bold text-rose-500 hover:underline"
                    >
                      Clear custom attachment
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon size={24} className="text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Drag & Drop Image here</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Supports PNG, JPG (Max 2MB)</span>
                    </div>
                    <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-[10px] font-semibold text-slate-700 dark:text-slate-300 mt-1.5 cursor-pointer transition-colors duration-200">
                      Upload Picture
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
                {formErrors.customPhoto && (
                  <span className="text-[9px] text-rose-500 mt-1 font-semibold">{formErrors.customPhoto}</span>
                )}
              </div>

              {/* Right Box: Preset Quick Illustration Grids */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400">Or Select a Preset theme:</span>
                
                <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                  {ACTIVITY_PHOTO_PRESETS.map((preset) => {
                    const isSelected = photoPreset === preset.id && !customPhoto;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setPhotoPreset(preset.id);
                          setCustomPhoto(null); // Clear custom upload
                        }}
                        className={`p-2 rounded-xl text-left border text-[10px] font-semibold transition-all duration-200 flex items-center justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400'
                            : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className="truncate">{preset.label}</span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60 rounded-2xl flex items-center gap-3.5 text-[10px] text-slate-400 leading-normal">
            <Mail size={22} className="text-slate-400 flex-shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="font-extrabold text-slate-500 uppercase tracking-wider">Dynamic Outbox dispatch</span>
              <span>
                Publishing this report will instantly send a mock daily summary update to parent <b>{activeStudent?.parentName}</b>'s outbox inbox.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end mt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="rounded-xl font-bold flex items-center gap-1.5">
              Publish daily update
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
