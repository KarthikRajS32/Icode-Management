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
  School, User, Activity, Plus, Calendar, Image as ImageIcon,
  FileImage, ClipboardCheck, Mail, ChevronRight, Camera, Trash2, Clock
} from 'lucide-react';

export const TeacherStudentActivities = () => {
  const { currentUser, classrooms, students, classroomStudents, activities, addStudentActivity, deleteActivity, triggerToast } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const initialClassroomId = queryParams.get('classroomId');
  const teacherId = currentUser?.associatedId || 't-1';
  const assignedClassrooms = classrooms.filter(c => c.teacherId === teacherId);
  const selectedClassroomId = initialClassroomId || (assignedClassrooms.length > 0 ? assignedClassrooms[0].id : '');
  const activeStudents = students.filter(s => classroomStudents.some(cs => cs.studentId === s.id && cs.classroomId === selectedClassroomId));

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photoPreset, setPhotoPreset] = useState('');
  const [customPhotos, setCustomPhotos] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [formErrors, setFormErrors] = useState({});
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      setFormErrors(prev => ({ ...prev, camera: null }));
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      setFormErrors(prev => ({ ...prev, camera: 'Unable to access device camera. Please check permissions.' }));
    }
  };

  const stopCamera = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    setCameraActive(false);
  };

  const captureSnapshot = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640; canvas.height = video.videoHeight || 480;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      setCustomPhotos(prev => [...prev, canvas.toDataURL('image/jpeg', 0.85)]);
      triggerToast('Photo captured!', 'success');
    }
  };

  useEffect(() => { if (cameraActive && videoRef.current && streamRef.current) { videoRef.current.srcObject = streamRef.current; } }, [cameraActive]);
  useEffect(() => { if (!modalOpen) stopCamera(); }, [modalOpen]);

  useEffect(() => {
    if (activeStudents.length > 0) {
      const isInClass = activeStudents.some(s => s.id === selectedStudentId);
      if (!isInClass) { const t = setTimeout(() => setSelectedStudentId(activeStudents[0].id), 0); return () => clearTimeout(t); }
    } else if (selectedStudentId !== '') { const t = setTimeout(() => setSelectedStudentId(''), 0); return () => clearTimeout(t); }
  }, [selectedClassroomId, activeStudents, selectedStudentId]);

  const activeStudent = students.find(s => s.id === selectedStudentId);
  const studentActivities = activities.filter(act => act.studentId === selectedStudentId && act.classroomId === selectedClassroomId);

  const resetForm = () => { setTitle(''); setDescription(''); setPhotoPreset(''); setCustomPhotos([]); setDate(new Date().toISOString().split('T')[0]); setFormErrors({}); };
  const handleOpenModal = () => { resetForm(); setModalOpen(true); };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setFormErrors(prev => ({ ...prev, customPhotos: null }));
    const newPhotos = []; let processed = 0; let hasError = false;
    files.forEach(file => {
      if (!file.type.startsWith('image/')) { setFormErrors(prev => ({ ...prev, customPhotos: 'Please select only image files' })); hasError = true; return; }
      if (file.size > 2 * 1024 * 1024) { setFormErrors(prev => ({ ...prev, customPhotos: 'Each image must be under 2MB' })); hasError = true; return; }
      const reader = new FileReader();
      reader.onload = () => { if (!hasError) { newPhotos.push(reader.result); processed++; if (processed === files.length) { setCustomPhotos(prev => [...prev, ...newPhotos]); setPhotoPreset(''); } } };
      reader.readAsDataURL(file);
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!title.trim()) errors.title = 'Activity title is required';
    if (!description.trim()) errors.description = 'Activity description is required';
    if (!date) errors.date = 'Logging date is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    let resolvedImages = [];
    if (customPhotos.length > 0) { resolvedImages = customPhotos; }
    else if (photoPreset) { const preset = ACTIVITY_PHOTO_PRESETS.find(p => p.id === photoPreset); if (preset) resolvedImages = [preset.url]; }
    await addStudentActivity({ title, description, photoPreset: customPhotos.length > 0 ? '' : photoPreset, customPhoto: customPhotos[0] || null, images: resolvedImages, date, studentId: selectedStudentId, classroomId: selectedClassroomId });
    setModalOpen(false); resetForm();
  };

  return (
    <div className="flex flex-col gap-6 w-full font-sans animate-fade-in">

      {/* Header with classroom picker */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Daily Activity Logs</h1>
          <p className="text-sm text-slate-500 mt-0.5">Record student milestones and send parent notifications.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-100 rounded-lg">
            <School size={15} className="text-slate-500" />
          </div>
          <select value={selectedClassroomId}
            onChange={e => navigate(`/teacher/activities?classroomId=${e.target.value}`)}
            className="px-3 py-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-sm font-semibold outline-none text-slate-700 shadow-sm cursor-pointer">
            {assignedClassrooms.map(c => <option key={c.id} value={c.id}>Class {c.name} {c.section}</option>)}
          </select>
        </div>
      </div>

      {/* No students empty state */}
      {activeStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center gap-4 p-16 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
            <User size={28} className="text-slate-300" />
          </div>
          <div>
            <h3 className="font-bold text-slate-700 text-base">No Students Enrolled</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm leading-relaxed">This classroom has no enrolled students. Contact the administrator to assign student rosters.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

          {/* Student roster column */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase font-bold text-slate-400 tracking-widest">Student Roster</p>
              <Badge variant="blue" className="text-[10px]">{activeStudents.length}</Badge>
            </div>
            <div className="flex flex-col gap-2 max-h-[520px] overflow-y-auto pr-0.5">
              {activeStudents.map(st => {
                const isActive = st.id === selectedStudentId;
                const studentActs = activities.filter(a => a.studentId === st.id && a.classroomId === selectedClassroomId).length;
                return (
                  <div key={st.id} onClick={() => setSelectedStudentId(st.id)}
                    className={`p-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer select-none ${isActive ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={st.name} size="sm" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-800 text-sm truncate">{st.name}</span>
                        <span className="text-[11px] text-slate-400 font-medium mt-0.5">Age {st.age} · {st.gender}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={isActive ? 'blue' : 'gray'} className="text-[10px]">{studentActs}</Badge>
                      <ChevronRight size={13} className={isActive ? 'text-blue-500' : 'text-slate-300'} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity timeline column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {activeStudent && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {/* Student header */}
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={activeStudent.name} size="md" />
                    <div>
                      <h2 className="font-bold text-slate-800 text-base leading-tight">{activeStudent.name}</h2>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">Parent: <span className="font-semibold text-slate-700">{activeStudent.parentName}</span></p>
                    </div>
                  </div>
                  <Button variant="primary" size="sm" onClick={handleOpenModal} className="flex items-center gap-1.5 font-semibold">
                    <Plus size={13} /> Add Activity
                  </Button>
                </div>

                {/* Timeline */}
                <div className="p-5">
                  {studentActivities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center gap-3 py-16 text-slate-400">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center ring-1 ring-slate-100">
                        <ClipboardCheck size={22} className="text-slate-300" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-500">No activity logs yet</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-[220px] leading-relaxed">Click "Add Activity" to record classroom milestones for this student.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 relative before:content-[''] before:absolute before:left-4 before:top-3 before:bottom-3 before:w-px before:bg-slate-100">
                      {studentActivities.map(act => {
                        const activePreset = ACTIVITY_PHOTO_PRESETS.find(p => p.id === act.photoPreset);
                        const photoUrl = act.customPhoto || activePreset?.url || 'https://images.unsplash.com/photo-1453733190148-c44698c26588?auto=format&fit=crop&q=80&w=600';
                        return (
                          <div key={act.id} className="relative pl-9 group">
                            <div className="absolute left-[13px] top-2 w-2.5 h-2.5 rounded-full border-2 border-blue-500 bg-white" />
                            <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:shadow-sm transition-all flex flex-col sm:flex-row gap-4 items-start">
                              <div className="flex flex-wrap gap-2 w-full sm:w-40 flex-shrink-0">
                                {act.images && act.images.length > 0 ? (
                                  act.images.map((imgUrl, i) => (
                                    <div key={i} className={`rounded-lg overflow-hidden border border-slate-200 ${act.images.length === 1 ? 'w-full h-28' : 'w-20 h-16'}`}>
                                      <img src={imgUrl} alt={`${act.title} - ${i + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                  ))
                                ) : (
                                  <div className="w-full h-28 rounded-lg overflow-hidden border border-slate-200">
                                    <img src={photoUrl} alt={act.title} className="w-full h-full object-cover" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-grow flex flex-col gap-1.5 min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                  <h4 className="font-bold text-sm text-slate-800 leading-snug">{act.title}</h4>
                                  <button onClick={() => deleteActivity(act.id)}
                                    className="text-[10px] font-semibold text-slate-400 hover:text-red-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer whitespace-nowrap flex-shrink-0">
                                    <Trash2 size={11} /> Delete
                                  </button>
                                </div>
                                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1"><Clock size={10} /> {formatDate(act.date)}</span>
                                <p className="text-sm text-slate-500 leading-relaxed mt-1">{act.description}</p>
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

      {/* Activity log modal */}
      <Dialog isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={activeStudent ? `Log Activity — ${activeStudent.name}` : 'Log Student Activity'} size="lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <Input label="Activity Title" placeholder="e.g. Solar System Scale Model" value={title} onChange={e => setTitle(e.target.value)} error={formErrors.title} className="sm:col-span-2" />
            <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} error={formErrors.date} />
          </div>
          <Input label="Notes & Observations" placeholder="Describe what the student worked on, observed, or accomplished today..." textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} error={formErrors.description} />

          {/* Photo section */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Activity Photos</label>
            <div className="flex flex-col gap-3 p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-center relative items-center justify-center min-h-[130px] w-full">
              {cameraActive ? (
                <div className="flex flex-col items-center gap-3 w-full bg-slate-900 p-4 rounded-xl">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full max-w-md h-44 object-cover rounded-lg border border-slate-700" />
                  <div className="flex gap-2">
                    <Button type="button" variant="success" onClick={captureSnapshot} className="flex items-center gap-1.5 text-xs"><Camera size={12} /> Capture</Button>
                    <Button type="button" variant="secondary" onClick={stopCamera} className="text-xs">Close Camera</Button>
                  </div>
                  {formErrors.camera && <span className="text-xs text-red-500">{formErrors.camera}</span>}
                </div>
              ) : customPhotos.length > 0 ? (
                <div className="flex flex-col gap-3 w-full items-center">
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><FileImage size={12} /> {customPhotos.length} photo{customPhotos.length > 1 ? 's' : ''} selected</span>
                  <div className="flex flex-wrap gap-2 justify-center max-h-20 overflow-y-auto">
                    {customPhotos.map((photo, index) => (
                      <div key={index} className="relative w-14 h-12 rounded-lg overflow-hidden border border-slate-200 group/preview">
                        <img src={photo} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setCustomPhotos(prev => prev.filter((_, i) => i !== index))}
                          className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity text-[9px] font-bold cursor-pointer">
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 items-center">
                    <label className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">Add More<input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" /></label>
                    <button type="button" onClick={startCamera} className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"><Camera size={11} /> Live Capture</button>
                    <button type="button" onClick={() => setCustomPhotos([])} className="text-xs font-semibold text-red-500 hover:underline cursor-pointer">Clear All</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2.5 py-1">
                  <ImageIcon size={22} className="text-slate-400" />
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Drag & drop images or click upload</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">PNG, JPG (Max 2MB per file)</span>
                  </div>
                  <div className="flex gap-2.5 mt-1">
                    <label className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm">
                      Upload Picture<input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                    </label>
                    <button type="button" onClick={startCamera}
                      className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5">
                      <Camera size={12} className="text-slate-500" /> Live Capture
                    </button>
                  </div>
                </div>
              )}
              {formErrors.customPhotos && <span className="text-xs text-red-500 mt-1">{formErrors.customPhotos}</span>}
            </div>
          </div>

          {/* Parent notification banner */}
          <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3 text-xs text-blue-700">
            <Mail size={16} className="flex-shrink-0 mt-0.5 text-blue-500" />
            <div>
              <span className="font-bold block mb-0.5">Auto-Dispatch Parent Notice</span>
              <span className="text-blue-600 leading-relaxed">Saving this entry will email a notification to <b>{activeStudent?.parentName}</b> ({activeStudent?.parentEmail || 'No email registered'}).</span>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end pt-2 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" className="font-semibold">Submit Activity</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
