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
  const { classrooms, teachers, students, classroomStudents, addClassroom, updateClassroom, deleteClassroom } = useApp();
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
    // Pre-select students currently in this classroom using classroomStudents join state
    const currentStudentIds = classroomStudents.filter(cs => cs.classroomId === cls.id).map(cs => cs.studentId);
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
    <div className="flex flex-col gap-6 w-full font-sans">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
            Classrooms
          </h1>
          <p className="text-xs text-gray-400">
            Manage learning groups, set seat capacities, and assign teachers to classrooms.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreate}
          className="rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm"
        >
          <Plus size={16} /> New Classroom
        </Button>
      </div>

      {/* Grid Dashboard */}
      {classrooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center gap-3 p-16 bg-white border rounded-3xl mt-4">
          <div className="p-4 bg-gray-50 rounded-full text-gray-400">
            <School size={32} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-gray-700">No Classrooms Yet</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm leading-relaxed">
              Create your first classroom to start enrolling students and assigning teachers.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
          {classrooms.map((cls) => {
            const assignedTeacher = teachers.find(t => t.id === cls.teacherId);
            const enrolledStudents = classroomStudents.filter(cs => cs.classroomId === cls.id).length;
            const loadPercent = Math.min(100, Math.round((enrolledStudents / cls.capacity) * 100));

            return (
              <Card
                key={cls.id}
                title={`${cls.name} - ${cls.section}`}
                subtitle={`Capacity: ${cls.capacity} seats`}
                icon={School}
                glow
                glowColor={loadPercent > 90 ? 'rose' : loadPercent > 70 ? 'amber' : 'blue'}
                className="cursor-pointer group hover:scale-[1.01] hover:border-gray-300 transition-all duration-300"
                onClick={() => navigate(`/admin/classrooms/${cls.id}`)}
                action={
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleOpenEdit(cls, e)}
                      className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-gray-50 rounded-xl"
                    >
                      <Edit2 size={13} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleOpenDelete(cls.id, e)}
                      className="p-2 text-gray-400 hover:text-rose-500 hover:bg-gray-50 rounded-xl"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                }
              >
                <div className="flex flex-col gap-4">
                  {/* Assigned Teacher details */}
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-gray-50 text-gray-400 flex-shrink-0">
                      <User size={14} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase leading-none">Assigned Teacher</span>
                      <span className="text-xs font-bold text-gray-700 truncate mt-0.5">
                        {assignedTeacher ? assignedTeacher.name : 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  {/* Enrollment progress */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Users size={12} /> {enrolledStudents} enrolled
                      </span>
                      <span className={`${
                        loadPercent > 90
                          ? 'text-rose-500'
                          : loadPercent > 70
                          ? 'text-orange-500'
                          : 'text-blue-500'
                      }`}>
                        {loadPercent}% full
                      </span>
                    </div>
                    
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${loadPercent}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          loadPercent > 90
                            ? 'bg-rose-600'
                            : loadPercent > 70
                            ? 'bg-amber-500'
                            : 'bg-blue-600'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Action Link Footer */}
                  <div className="flex items-center justify-between pt-4.5 border-t border-gray-100 text-xs font-semibold text-gray-400 group-hover:text-blue-500 transition-colors mt-2">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider">
                      <GraduationCap size={13} /> View Student Roster
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
        title={editingClassroom ? `Edit Classroom: ${editingClassroom.name}-${editingClassroom.section}` : 'New Classroom'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Class Name"
              placeholder="e.g. Grade 5"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={formErrors.name}
            />
            <Input
              label="Section"
              placeholder="e.g. A"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              error={formErrors.section}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Seat Capacity"
              placeholder="30"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              error={formErrors.capacity}
            />

            {/* Assign teacher select picklist */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 tracking-wide">
                Assign Teacher
              </label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white outline-none text-sm text-gray-700 focus:border-blue-500 transition-colors"
              >
                <option value="">-- Select a Teacher --</option>
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
            label="Enroll Students"
            placeholder="Search and select students..."
            options={students.map(s => ({ value: s.id, label: `${s.name} (Age ${s.age})` }))}
            selectedValues={selectedStudentIds}
            onChange={setSelectedStudentIds}
          />

          <div className="flex items-center gap-3 justify-end mt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="rounded-xl font-bold">
              {editingClassroom ? 'Save Changes' : 'Create Classroom'}
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
        title="Delete Classroom?"
        message="Are you sure you want to delete this classroom? All enrolled students will be unassigned and will need to be moved to another classroom."
        confirmText="Delete"
      />
    </div>
  );
};
