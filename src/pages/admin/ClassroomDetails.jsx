import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Table } from '../../components/Table';
import { Dialog } from '../../components/Dialog';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Badge } from '../../components/Badge';
import { Avatar } from '../../components/Avatar';
import { ArrowLeft, Plus, Edit2, Trash2, Users, User, School } from 'lucide-react';

export const AdminClassroomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { classrooms, teachers, students, classroomStudents, addStudentDirect, updateStudentDirect, deleteStudentDirect } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudentId, setDeletingStudentId] = useState(null);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const classroom = classrooms.find(c => c.id === id);

  if (!classroom) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-4 p-16 bg-white border border-slate-200 rounded-xl shadow-sm max-w-lg mx-auto mt-12 font-sans">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center ring-1 ring-red-100">
          <School size={28} className="text-red-500" />
        </div>
        <div>
          <h2 className="font-bold text-lg text-slate-800">Classroom Not Found</h2>
          <p className="text-sm text-slate-400 mt-1">The classroom you're looking for doesn't exist or has been deleted.</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/admin/classrooms')} className="mt-8 ">
          Back to Classrooms
        </Button>
      </div>
    );
  }

  const classTeacher = teachers.find(t => t.id === classroom.teacherId);
  const classStudents = students.filter(s => classroomStudents.some(cs => cs.studentId === s.id && cs.classroomId === classroom.id));
  const seatOccupancy = classStudents.length;
  const seatPercentage = Math.min(100, Math.round((seatOccupancy / classroom.capacity) * 100));
  const availableSlots = Math.max(0, classroom.capacity - seatOccupancy);

  const barColor = seatPercentage >= 100 ? 'bg-red-500' : seatPercentage >= 80 ? 'bg-amber-500' : 'bg-blue-600';
  const pctColor = seatPercentage >= 100 ? 'text-red-600' : seatPercentage >= 80 ? 'text-amber-600' : 'text-blue-600';

  const resetForm = () => { setName(''); setAge(''); setGender('Male'); setParentName(''); setParentEmail(''); setFormErrors({}); setEditingStudent(null); };
  const handleOpenCreate = () => { resetForm(); setModalOpen(true); };
  const handleOpenEdit = (student) => { resetForm(); setEditingStudent(student); setName(student.name); setAge(String(student.age)); setGender(student.gender); setParentName(student.parentName || ''); setParentEmail(student.parentEmail || ''); setModalOpen(true); };
  const handleOpenDelete = (studentId) => { setDeletingStudentId(studentId); setConfirmOpen(true); };

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Student name is required';
    if (!age.trim() || isNaN(age) || parseInt(age, 10) < 3) errors.age = 'Enter a valid age (3+)';
    if (!parentName.trim()) errors.parentName = 'Parent Name is required';
    if (!parentEmail.trim()) errors.parentEmail = 'Parent email is required';
    else if (!/\S+@\S+\.\S+/.test(parentEmail)) errors.parentEmail = 'Enter a valid email address';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const formData = { name, age: parseInt(age, 10), gender, parentName, parentEmail, classroomId: classroom.id };
    if (editingStudent) { updateStudentDirect(editingStudent.id, formData); } else { addStudentDirect(formData); }
    setModalOpen(false); resetForm();
  };

  const handleConfirmDelete = () => {
    if (deletingStudentId) { deleteStudentDirect(deletingStudentId); setConfirmOpen(false); setDeletingStudentId(null); }
  };

  const columns = [
    {
      key: 'name', label: 'Student',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" />
          <span className="font-semibold text-slate-800 text-sm">{row.name}</span>
        </div>
      )
    },
    { key: 'age', label: 'Age', render: (row) => <span className="text-sm text-slate-600">{row.age} yrs</span> },
    {
      key: 'gender', label: 'Gender',
      render: (row) => <Badge variant={row.gender === 'Male' ? 'blue' : row.gender === 'Female' ? 'rose' : 'slate'}>{row.gender}</Badge>
    },
    {
      key: 'parentName', label: 'Parent / Guardian',
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <User size={12} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">{row.parentName || 'N/A'}</span>
          </div>
          {row.parentEmail && <span className="text-xs text-slate-400 pl-4">{row.parentEmail}</span>}
        </div>
      )
    },
    {
      key: 'actions', label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(row)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={13} /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleOpenDelete(row.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full font-sans animate-fade-in">

      {/* Breadcrumb + header */}
      <div className="flex flex-col gap-3">
        <Link to="/admin/classrooms" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors w-max">
          <ArrowLeft size={13} /> Back to Classrooms
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">{classroom.name} — Section {classroom.section}</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Instructor: <span className="font-semibold text-slate-700">{classTeacher ? classTeacher.name : 'No teacher assigned'}</span>
            </p>
          </div>
          <Button variant="primary" onClick={handleOpenCreate} disabled={seatOccupancy >= classroom.capacity} className="flex items-center gap-2 font-semibold">
            <Plus size={14} /> Enroll Student
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center ring-1 ring-blue-100 flex-shrink-0">
            <Users size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Enrolled</p>
            <p className="text-2xl font-black text-slate-800 leading-none mt-1">{seatOccupancy}</p>
            <p className="text-xs text-slate-400 mt-0.5">of {classroom.capacity} seats</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center ring-1 ring-emerald-100 flex-shrink-0">
            <School size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Available Slots</p>
            <p className="text-2xl font-black text-slate-800 leading-none mt-1">{availableSlots}</p>
            <p className="text-xs text-slate-400 mt-0.5">remaining capacity</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-center gap-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500">Seat Occupancy</span>
            <span className={`font-black tabular-nums ${pctColor}`}>{seatPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div style={{ width: `${seatPercentage}%` }} className={`h-full rounded-full transition-all duration-500 ${barColor}`} />
          </div>
          <div className="flex items-center justify-between">
            <Badge variant={seatPercentage >= 100 ? 'red' : seatPercentage >= 80 ? 'amber' : 'emerald'} className="text-[10px]">
              {seatPercentage >= 100 ? 'Full' : seatPercentage >= 80 ? 'Near Capacity' : 'Available'}
            </Badge>
            <span className="text-xs text-slate-400 font-medium">{seatOccupancy}/{classroom.capacity}</span>
          </div>
        </div>
      </div>

      {/* Roster table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-800 text-sm">Classroom Roster</p>
            <p className="text-xs text-slate-500 mt-0.5">View and manage students enrolled in this section.</p>
          </div>
          <Badge variant="blue">{classStudents.length} Students</Badge>
        </div>
        <div className="p-5">
          <Table columns={columns} data={classStudents} searchPlaceholder="Search roster by name..." searchKey="name" emptyMessage="No students enrolled in this classroom yet." pageSize={6} />
        </div>
      </div>

      {/* Enroll/Edit modal */}
      <Dialog isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editingStudent ? `Edit Student — ${editingStudent.name}` : 'Enroll Student'} size="md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Student's Full Name" placeholder="e.g. John Miller" value={name} onChange={e => setName(e.target.value)} error={formErrors.name} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Age" placeholder="e.g. 11" type="number" value={age} onChange={e => setAge(e.target.value)} error={formErrors.age} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 tracking-wide">Gender</label>
              <div className="flex gap-2">
                {['Male', 'Female'].map(g => (
                  <button key={g} type="button" onClick={() => setGender(g)}
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-all cursor-pointer ${gender === g ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Parent / Guardian Name" placeholder="e.g. Grace Miller" value={parentName} onChange={e => setParentName(e.target.value)} error={formErrors.parentName} />
            <Input label="Parent Email Address" type="email" placeholder="e.g. grace.miller@gmail.com" value={parentEmail} onChange={e => setParentEmail(e.target.value)} error={formErrors.parentEmail} />
          </div>
          <div className="flex items-center gap-3 justify-end pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{editingStudent ? 'Save Changes' : 'Enroll Student'}</Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleConfirmDelete}
        title="Remove Student?" message="Are you sure you want to remove this student? All activity records will also be deleted." confirmText="Remove" />
    </div>
  );
};
