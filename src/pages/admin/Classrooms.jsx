import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Dialog } from '../../components/Dialog';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Card } from '../../components/Card';
import { MultiSelect } from '../../components/MultiSelect';
import { Plus, Edit2, Trash2, ArrowRight, User, Users, GraduationCap, School } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminClassrooms = () => {
  const { classrooms, teachers, students, addClassroom, updateClassroom, deleteClassroom } = useApp();
  const navigate = useNavigate();

  // Dialog states
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [editingClassroom, setEditingClassroom] = useState(null);
  const [deletingClassroomId, setDeletingClassroomId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [section, setSection] = useState('');
  const [capacity, setCapacity] = useState('30');
  const [teacherId, setTeacherId] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  const [formErrors, setFormErrors] = useState({});

  const resetForm = () => {
    setName('');
    setSection('');
    setCapacity('30');
    setTeacherId('');
    setSelectedStudentIds([]);
    setFormErrors({});
    setEditingClassroom(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (cls, e) => {
    e.stopPropagation();
    resetForm();
    setEditingClassroom(cls);
    setName(cls.name);
    setSection(cls.section);
    setCapacity(String(cls.capacity));
    setTeacherId(cls.teacherId || '');
    // Pre-select students currently in this classroom
    const currentStudentIds = students.filter(s => s.classroomId === cls.id).map(s => s.id);
    setSelectedStudentIds(currentStudentIds);
    setModalOpen(true);
  };

  const handleOpenDelete = (id, e) => {
    e.stopPropagation(); // Avoid triggering navigation
    setDeletingClassroomId(id);
    setConfirmOpen(true);
  };

  // Validations
  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Class name is required (e.g. Grade 5)';
    if (!section.trim()) errors.section = 'Section identifier is required (e.g. A)';
    if (!capacity.trim() || isNaN(capacity) || parseInt(capacity, 10) < 5) {
      errors.capacity = 'Please enter a valid capacity (minimum 5)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = {
      name,
      section,
      capacity,
      teacherId
    };

    if (editingClassroom) {
      updateClassroom(editingClassroom.id, formData, selectedStudentIds);
    } else {
      addClassroom(formData, selectedStudentIds);
    }

    setModalOpen(false);
    resetForm();
  };

  const handleConfirmDelete = () => {
    if (deletingClassroomId) {
      deleteClassroom(deletingClassroomId);
      setConfirmOpen(false);
      setDeletingClassroomId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto font-sans">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            Academy Classrooms
          </h1>
          <p className="text-xs text-slate-400">
            Define learning groups, set seat limits, and assign certified faculty leaders.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreate}
          className="rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm"
        >
          <Plus size={16} /> Create Classroom
        </Button>
      </div>

      {/* Grid Dashboard */}
      {classrooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center gap-3 p-16 bg-white dark:bg-slate-900 border rounded-3xl mt-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400">
            <School size={32} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-200">No Classrooms Available</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
              Register classrooms first to start enrolling students and assigning academic guides.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
          {classrooms.map((cls) => {
            const assignedTeacher = teachers.find(t => t.id === cls.teacherId);
            const enrolledStudents = students.filter(s => s.classroomId === cls.id).length;
            const loadPercent = Math.min(100, Math.round((enrolledStudents / cls.capacity) * 100));

            return (
              <Card
                key={cls.id}
                title={`${cls.name} - ${cls.section}`}
                subtitle={`Capacity Limit: ${cls.capacity}`}
                icon={School}
                glow
                glowColor={loadPercent > 90 ? 'rose' : loadPercent > 70 ? 'amber' : 'indigo'}
                className="cursor-pointer group hover:scale-[1.01] hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300"
                onClick={() => navigate(`/admin/classrooms/${cls.id}`)}
                action={
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleOpenEdit(cls, e)}
                      className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl"
                    >
                      <Edit2 size={13} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleOpenDelete(cls.id, e)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                }
              >
                <div className="flex flex-col gap-4">
                  {/* Assigned Teacher details */}
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex-shrink-0">
                      <User size={14} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase leading-none">Class Leader</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate mt-0.5">
                        {assignedTeacher ? assignedTeacher.name : 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  {/* Enrollment progress */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Users size={12} /> {enrolledStudents} Enrolled
                      </span>
                      <span className={`${
                        loadPercent > 90
                          ? 'text-rose-500'
                          : loadPercent > 70
                          ? 'text-orange-500'
                          : 'text-indigo-500'
                      }`}>
                        {loadPercent}% Seats Occupied
                      </span>
                    </div>
                    
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${loadPercent}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          loadPercent > 90
                            ? 'bg-rose-600'
                            : loadPercent > 70
                            ? 'bg-amber-500'
                            : 'bg-indigo-600'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Action Link Footer */}
                  <div className="flex items-center justify-between pt-4.5 border-t border-slate-50 dark:border-slate-800/60 text-xs font-semibold text-slate-400 group-hover:text-indigo-500 transition-colors mt-2">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider">
                      <GraduationCap size={13} /> View Student roster
                    </span>
                    <ArrowRight size={13} className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* CLASSROOM REGISTRATION / EDIT MODAL */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingClassroom ? `Edit Classroom: ${editingClassroom.name}-${editingClassroom.section}` : 'Create Classroom'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Classroom Identifier (Grade)"
              placeholder="Grade 5"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={formErrors.name}
            />
            <Input
              label="Section Identifier"
              placeholder="A"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              error={formErrors.section}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Capacity Limit (Seats)"
              placeholder="30"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              error={formErrors.capacity}
            />

            {/* Assign teacher select picklist */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide">
                Assign Class Leader (Teacher)
              </label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none text-sm text-slate-700 dark:text-slate-200 focus:border-indigo-500 transition-colors"
              >
                <option value="">-- Choose Instructor --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.subject})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assign Students Multi-Select */}
          <MultiSelect
            label="Assign Students to Classroom"
            placeholder="Select students to enroll..."
            options={students.filter(s => !s.classroomId || s.classroomId === '' || (editingClassroom && s.classroomId === editingClassroom.id)).map(s => ({ value: s.id, label: `${s.name} (Age ${s.age})` }))}
            selectedValues={selectedStudentIds}
            onChange={setSelectedStudentIds}
          />

          <div className="flex items-center gap-3 justify-end mt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="rounded-xl font-bold">
              {editingClassroom ? 'Save settings' : 'Create Classroom'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* DELETION CONFIRMATION DIALOG */}
      {/* ========================================================================= */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Classroom Profile?"
        message="Are you sure you want to delete this classroom? Deleting this classroom will unassign enrolled students, and they will need to be reallocated into active classrooms."
        confirmText="Confirm Delete"
      />
    </div>
  );
};
