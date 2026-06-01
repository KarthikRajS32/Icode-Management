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
  const { classrooms, teachers, students, addStudentDirect, updateStudentDirect, deleteStudentDirect } = useApp();

  // Dialog states
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudentId, setDeletingStudentId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [parentName, setParentName] = useState('');

  const [formErrors, setFormErrors] = useState({});

  // Find target classroom
  const classroom = classrooms.find(c => c.id === id);

  // If classroom doesn't exist, redirect or show error
  if (!classroom) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-4 p-16 bg-white border rounded-3xl max-w-lg mx-auto mt-12 font-sans">
        <School size={48} className="text-rose-500" />
        <div>
          <h2 className="font-extrabold text-lg text-gray-800">Classroom Not Found</h2>
          <p className="text-xs text-gray-400 mt-1">
            The classroom you're looking for doesn't exist or may have been deleted.
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/admin/classrooms')} className="rounded-xl mt-2">
          Back to Classrooms
        </Button>
      </div>
    );
  }

  // Gather details
  const classTeacher = teachers.find(t => t.id === classroom.teacherId);
  const classStudents = students.filter(s => s.classroomId === classroom.id);
  const seatOccupancy = classStudents.length;
  const seatPercentage = Math.min(100, Math.round((seatOccupancy / classroom.capacity) * 100));

  const resetForm = () => {
    setName('');
    setAge('');
    setGender('Male');
    setParentName('');
    setFormErrors({});
    setEditingStudent(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    resetForm();
    setEditingStudent(student);
    setName(student.name);
    setAge(String(student.age));
    setGender(student.gender);
    setParentName(student.parentName || '');
    setModalOpen(true);
  };

  const handleOpenDelete = (studentId) => {
    setDeletingStudentId(studentId);
    setConfirmOpen(true);
  };

  // Validations
  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Student name is required';
    if (!age.trim() || isNaN(age) || parseInt(age, 10) < 3) {
      errors.age = 'Please enter a valid age (3+)';
    }
    if (!parentName.trim()) errors.parentName = 'Parent Name is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = {
      name,
      age: parseInt(age, 10),
      gender,
      parentName,
      classroomId: classroom.id
    };

    if (editingStudent) {
      updateStudentDirect(editingStudent.id, formData);
    } else {
      addStudentDirect(formData);
    }

    setModalOpen(false);
    resetForm();
  };

  const handleConfirmDelete = () => {
    if (deletingStudentId) {
      deleteStudentDirect(deletingStudentId);
      setConfirmOpen(false);
      setDeletingStudentId(null);
    }
  };

  // Columns for student table
  const columns = [
    {
      key: 'name',
      label: 'Student',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" />
          <span className="font-bold text-gray-800 text-sm">{row.name}</span>
        </div>
      )
    },
    {
      key: 'age',
      label: 'Age',
      render: (row) => (
        <span className="text-xs font-semibold text-gray-500">
          {row.age} Years Old
        </span>
      )
    },
    {
      key: 'gender',
      label: 'Gender',
      render: (row) => (
        <Badge variant={row.gender === 'Male' ? 'blue' : row.gender === 'Female' ? 'rose' : 'slate'} className="text-[9px] px-2 py-0.5 border-none">
          {row.gender}
        </Badge>
      )
    },
    {
      key: 'parentName',
      label: 'Parent',
      render: (row) => (
        <div className="flex items-center gap-2">
          <User size={14} className="text-gray-400" />
          <span className="text-xs font-semibold text-gray-600">
            {row.parentName || 'N/A'}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(row)}
            className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-gray-50 rounded-xl"
          >
            <Edit2 size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenDelete(row.id)}
            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-gray-50 rounded-xl"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full font-sans">
      {/* Breadcrumb Header */}
      <div className="flex flex-col gap-2">
        <Link
          to="/admin/classrooms"
          className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-blue-600 w-max transition-colors"
        >
          <ArrowLeft size={14} /> Back to Classrooms
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight">
              {classroom.name} — Section {classroom.section}
            </h1>
            <p className="text-xs text-gray-400">
              Teacher: <b className="text-gray-600 font-bold">{classTeacher ? classTeacher.name : 'No teacher assigned'}</b>
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleOpenCreate}
            disabled={seatOccupancy >= classroom.capacity}
            className="rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm"
          >
            <Plus size={16} /> Enroll Student
          </Button>
        </div>
      </div>

      {/* Classroom KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-500 rounded-xl">
            <Users size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-semibold uppercase leading-none">Students Enrolled</span>
            <span className="text-xl font-black text-gray-800 mt-1 leading-none">{seatOccupancy} Students</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-500 rounded-xl">
            <School size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-semibold uppercase leading-none">Seat Capacity</span>
            <span className="text-xl font-black text-gray-800 mt-1 leading-none">{classroom.capacity} Seats</span>
          </div>
        </div>

        {/* Load progression widget */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col justify-center gap-2">
          <div className="flex items-center justify-between text-[10px] font-bold">
            <span className="text-gray-400 uppercase">Occupancy</span>
            <span className={`${seatPercentage > 90 ? 'text-rose-500' : seatPercentage > 70 ? 'text-orange-500' : 'text-blue-500'}`}>
              {seatPercentage}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${seatPercentage}%` }}
              className={`h-full rounded-full transition-all duration-300 ${
                seatPercentage > 90
                  ? 'bg-rose-600'
                  : seatPercentage > 70
                  ? 'bg-amber-500'
                  : 'bg-blue-600'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Main Student Roster list */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs mt-2">
        <Table
          columns={columns}
          data={classStudents}
          searchPlaceholder="Search students by name..."
          searchKey="name"
          emptyMessage="No students enrolled in this classroom yet."
          pageSize={6}
        />
      </div>

      {/* ========================================================================= */}
      {/* STUDENT ENROLLMENT / EDIT DIALOG */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingStudent ? `Edit Student: ${editingStudent.name}` : 'Enroll Student'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Student's Full Name"
            placeholder="e.g. John Miller"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={formErrors.name}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Age"
              placeholder="e.g. 11"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              error={formErrors.age}
            />

            {/* Gender selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 tracking-wide">
                Gender
              </label>
              <div className="flex gap-2">
                {['Male', 'Female', 'Other'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      gender === g
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Input
            label="Parent / Guardian Name"
            placeholder="e.g. Grace Miller"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            error={formErrors.parentName}
          />

          {!editingStudent && (
            <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col gap-1 mt-1 text-[10px] text-gray-400">
              <span className="font-extrabold text-gray-500">💡 Auto Account Creation</span>
              <span>
                A parent portal account will be automatically created. Login: <b>{parentName.toLowerCase().replace(/\s+/g, '.')}@gmail.com</b> / password: <b>parent123</b>.
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 justify-end mt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="rounded-xl font-bold">
              {editingStudent ? 'Save Changes' : 'Enroll Student'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* DE-ENROLL CONFIRMATION */}
      {/* ========================================================================= */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Student?"
        message="Are you sure you want to remove this student? Their activity records will be deleted and the associated parent account will be deactivated."
        confirmText="Remove"
      />
    </div>
  );
};
