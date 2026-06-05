import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Dialog } from '../../components/Dialog';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { MultiSelect } from '../../components/MultiSelect';
import { Badge } from '../../components/Badge';
import { Plus, Edit2, Trash2, ArrowRight, User, Users, GraduationCap, School } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminClassrooms = () => {
  const { classrooms, teachers, students, classroomStudents, addClassroom, updateClassroom, deleteClassroom } = useApp();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState(null);
  const [deletingClassroomId, setDeletingClassroomId] = useState(null);

  const [name, setName] = useState('');
  const [section, setSection] = useState('');
  const [capacity, setCapacity] = useState('30');
  const [teacherId, setTeacherId] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  const resetForm = () => { setName(''); setSection(''); setCapacity('30'); setTeacherId(''); setSelectedStudentIds([]); setFormErrors({}); setEditingClassroom(null); };

  const handleOpenCreate = () => { resetForm(); setModalOpen(true); };

  const handleOpenEdit = (cls, e) => {
    e.stopPropagation(); resetForm(); setEditingClassroom(cls); setName(cls.name); setSection(cls.section); setCapacity(String(cls.capacity)); setTeacherId(cls.teacherId || '');
    setSelectedStudentIds(classroomStudents.filter(cs => cs.classroomId === cls.id).map(cs => cs.studentId));
    setModalOpen(true);
  };

  const handleOpenDelete = (id, e) => { e.stopPropagation(); setDeletingClassroomId(id); setConfirmOpen(true); };

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Class name is required (e.g. Grade 5)';
    if (!section.trim()) errors.section = 'Section is required (e.g. A)';
    if (!capacity.trim() || isNaN(capacity) || parseInt(capacity, 10) < 5) errors.capacity = 'Capacity must be at least 5';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const formData = { name, section, capacity: parseInt(capacity, 10), teacherId };
    if (editingClassroom) { updateClassroom(editingClassroom.id, formData, selectedStudentIds); }
    else { addClassroom(formData, selectedStudentIds); }
    setModalOpen(false); resetForm();
  };

  const handleConfirmDelete = () => {
    if (deletingClassroomId) { deleteClassroom(deletingClassroomId); setConfirmOpen(false); setDeletingClassroomId(null); }
  };

  const totalEnrolled = classroomStudents.length;
  const totalCapacity = classrooms.reduce((sum, c) => sum + c.capacity, 0);

  return (
    <div className="flex flex-col gap-6 w-full font-sans animate-fade-in">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Classrooms</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage learning groups, assign teachers and enroll students.</p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate} className="flex items-center gap-2 font-semibold">
          <Plus size={15} /> New Classroom
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Classrooms', value: classrooms.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Enrolled', value: totalEnrolled, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Capacity', value: totalCapacity, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Available Slots', value: Math.max(0, totalCapacity - totalEnrolled), color: 'text-slate-500', bg: 'bg-slate-100' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-4 py-8 shadow-sm flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <School size={15} className={stat.color} />
            </div>
            <div>
              <p className="text-lg font-black text-slate-800 leading-none">{stat.value}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Classroom grid */}
      {classrooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center gap-4 p-16 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
            <School size={28} className="text-slate-300" />
          </div>
          <div>
            <h3 className="font-bold text-slate-700 text-base">No Classrooms Yet</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm leading-relaxed">Create your first classroom to start enrolling students and assigning teachers.</p>
          </div>
          <Button variant="primary" onClick={handleOpenCreate} className="flex items-center gap-2 mt-2">
            <Plus size={14} /> Create First Classroom
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classrooms.map(cls => {
            const assignedTeacher = teachers.find(t => t.id === cls.teacherId);
            const enrolledStudents = classroomStudents.filter(cs => cs.classroomId === cls.id).length;
            const loadPercent = Math.min(100, Math.round((enrolledStudents / cls.capacity) * 100));

            let statusLabel = 'Available'; let badgeVariant = 'emerald';
            let barColor = 'bg-blue-600'; let iconBg = 'bg-blue-50'; let iconColor = 'text-blue-600';
            if (loadPercent >= 100) { statusLabel = 'Full'; badgeVariant = 'red'; barColor = 'bg-red-500'; iconBg = 'bg-red-50'; iconColor = 'text-red-600'; }
            else if (loadPercent >= 80) { statusLabel = 'Near Capacity'; badgeVariant = 'amber'; barColor = 'bg-amber-500'; iconBg = 'bg-amber-50'; iconColor = 'text-amber-600'; }

            return (
              <div key={cls.id} onClick={() => navigate(`/admin/classrooms/${cls.id}`)}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col gap-4">

                {/* Card top */}
                <div className="flex justify-between items-start">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} ring-1 ring-inset ring-black/5`}>
                    <School size={18} className={iconColor} />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={e => handleOpenEdit(cls, e)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={13} /></Button>
                    <Button variant="ghost" size="sm" onClick={e => handleOpenDelete(cls.id, e)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></Button>
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-slate-800 text-base">{cls.name} — {cls.section}</h3>
                    <Badge variant={badgeVariant} className="text-[10px] flex-shrink-0">{statusLabel}</Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <User size={12} className="text-slate-400 flex-shrink-0" />
                    <span className="font-medium">{assignedTeacher ? assignedTeacher.name : 'No teacher assigned'}</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1"><Users size={11} /> {enrolledStudents} / {cls.capacity} enrolled</span>
                    <span className="font-bold text-slate-600 tabular-nums">{loadPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div style={{ width: `${loadPercent}%` }} className={`h-full rounded-full transition-all duration-500 ${barColor}`} />
                  </div>
                </div>

                {/* Footer link */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                  <span className="flex items-center gap-1.5"><GraduationCap size={12} /> Student Roster</span>
                  <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit modal */}
      <Dialog isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editingClassroom ? `Edit Classroom — ${editingClassroom.name}-${editingClassroom.section}` : 'New Classroom'} size="md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Class Name" placeholder="e.g. Grade 5" value={name} onChange={e => setName(e.target.value)} error={formErrors.name} />
            <Input label="Section" placeholder="e.g. A" value={section} onChange={e => setSection(e.target.value)} error={formErrors.section} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Seat Capacity" placeholder="30" type="number" value={capacity} onChange={e => setCapacity(e.target.value)} error={formErrors.capacity} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 tracking-wide">Assign Teacher</label>
              <select value={teacherId} onChange={e => setTeacherId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white outline-none text-sm text-slate-800 focus:border-blue-500 transition-colors cursor-pointer">
                <option value="">-- Select a Teacher --</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>)}
              </select>
            </div>
          </div>
          <MultiSelect label="Enroll Students" placeholder="Search and select students..."
            options={students.map(s => ({ value: s.id, label: `${s.name} (Age ${s.age})` }))}
            selectedValues={selectedStudentIds} onChange={setSelectedStudentIds} />
          <div className="flex items-center gap-3 justify-end pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{editingClassroom ? 'Save Changes' : 'Create Classroom'}</Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleConfirmDelete}
        title="Delete Classroom?" message="Are you sure you want to delete this classroom? All enrolled students will be unassigned." confirmText="Delete" />
    </div>
  );
};
