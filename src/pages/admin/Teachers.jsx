import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Table } from '../../components/Table';
import { Dialog } from '../../components/Dialog';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Badge } from '../../components/Badge';
import { Avatar } from '../../components/Avatar';
import { Plus, Edit2, Trash2, Eye, Mail, Phone, BookOpen, Lock } from 'lucide-react';

export const AdminTeachers = () => {
  const { teachers, addTeacher, updateTeacher, deleteTeacher, classrooms } = useApp();

  // Core dialog state
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const [editingTeacher, setEditingTeacher] = useState(null);
  const [viewingTeacher, setViewingTeacher] = useState(null);
  const [deletingTeacherId, setDeletingTeacherId] = useState(null);

  // Form Fields State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [password, setPassword] = useState('');

  const [formErrors, setFormErrors] = useState({});

  // Reset fields helper
  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setSubject('');
    setPassword('');
    setFormErrors({});
    setEditingTeacher(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (teacher) => {
    resetForm();
    setEditingTeacher(teacher);
    setName(teacher.name);
    setEmail(teacher.email);
    setPhone(teacher.phone);
    setSubject(teacher.subject);
    setModalOpen(true);
  };

  const handleOpenView = (teacher) => {
    // Gather classrooms assigned to this teacher
    const assignedClasses = classrooms.filter(c => c.teacherId === teacher.id);
    setViewingTeacher({ ...teacher, assignedClasses });
    setViewOpen(true);
  };

  const handleOpenDelete = (id) => {
    setDeletingTeacherId(id);
    setConfirmOpen(true);
  };

  // Form Submission Validation
  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Full name is required';
    
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email address is invalid';
    }

    if (!phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (phone.trim().length < 8) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (!subject.trim()) errors.subject = 'Teaching subject is required';
    
    // Password required only for new registrations
    if (!editingTeacher && !password.trim()) {
      errors.password = 'Login password is required';
    } else if (!editingTeacher && password.trim().length < 5) {
      errors.password = 'Password must be at least 5 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = { name, email, phone, subject, password };

    if (editingTeacher) {
      updateTeacher(editingTeacher.id, formData);
    } else {
      addTeacher(formData);
    }

    setModalOpen(false);
    resetForm();
  };

  const handleConfirmDelete = () => {
    if (deletingTeacherId) {
      deleteTeacher(deletingTeacherId);
      setConfirmOpen(false);
      setDeletingTeacherId(null);
    }
  };

  // Grid Columns definition
  const columns = [
    {
      key: 'name',
      label: 'Instructor details',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" />
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{row.name}</span>
            <span className="text-[10px] text-slate-400 font-semibold">{row.email}</span>
          </div>
        </div>
      )
    },
    {
      key: 'subject',
      label: 'Primary Subject',
      render: (row) => (
        <Badge variant="indigo" className="text-[9px] px-2 py-0.5 border-none">
          {row.subject}
        </Badge>
      )
    },
    {
      key: 'phone',
      label: 'Phone Number',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {row.phone}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions Block',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenView(row)}
            className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
          >
            <Eye size={15} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(row)}
            className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
          >
            <Edit2 size={15} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenDelete(row.id)}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
          >
            <Trash2 size={15} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Faculty Directory
          </h1>
          <p className="text-xs text-slate-400">
            Configure subjects, manage teaching assignments, and register academy instructors.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreate}
          className="rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm"
        >
          <Plus size={16} /> Register Instructor
        </Button>
      </div>

      {/* Main Data table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs mt-2">
        <Table
          columns={columns}
          data={teachers}
          searchPlaceholder="Search instructors by name..."
          searchKey="name"
          emptyMessage="No teachers found in registry."
          pageSize={6}
        />
      </div>

      {/* ========================================================================= */}
      {/* INSTRUCTOR CREATION / EDIT DIALOG */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTeacher ? `Edit Details: ${editingTeacher.name}` : 'Register New Instructor'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Instructor Full Name"
            placeholder="Sarah Connor"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={formErrors.name}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="s.connor@icode.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={formErrors.email}
              disabled={!!editingTeacher} // Keep email immutable for primary keys
            />
            <Input
              label="Primary Phone Number"
              placeholder="+1 (555) 019-2834"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={formErrors.phone}
            />
          </div>

          <Input
            label="Primary Teaching Subject"
            placeholder="Mathematics & Trigonometry"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            error={formErrors.subject}
          />

          {!editingTeacher && (
            <Input
              label="Login Secret Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={formErrors.password}
            />
          )}

          <div className="flex items-center gap-3 justify-end mt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="rounded-xl font-bold">
              {editingTeacher ? 'Save changes' : 'Register Instructor'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* INSTRUCTOR DETAIL VIEW CARD */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={viewOpen}
        onClose={() => setViewOpen(false)}
        title="Instructor Profile Card"
        size="sm"
      >
        {viewingTeacher && (
          <div className="flex flex-col items-center gap-6 py-2">
            <Avatar name={viewingTeacher.name} size="xl" />
            
            <div className="flex flex-col items-center gap-1.5 text-center">
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg leading-tight">
                {viewingTeacher.name}
              </h3>
              <Badge variant="indigo" className="text-[9px] px-2 py-0.5 border-none">
                {viewingTeacher.subject}
              </Badge>
            </div>

            <div className="w-full flex flex-col gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-slate-400 flex-shrink-0" />
                <span className="text-slate-600 dark:text-slate-300 font-semibold truncate">
                  {viewingTeacher.email}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-slate-400 flex-shrink-0" />
                <span className="text-slate-600 dark:text-slate-300 font-semibold">
                  {viewingTeacher.phone}
                </span>
              </div>
              
              <div className="flex flex-col gap-1.5 mt-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Assigned Classes
                </span>
                {viewingTeacher.assignedClasses?.length === 0 ? (
                  <span className="text-xs text-slate-400 font-semibold">
                    No active classrooms assigned.
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {viewingTeacher.assignedClasses.map((cls) => (
                      <Badge key={cls.id} variant="slate" className="text-[9px] lowercase font-bold">
                        {cls.name}-{cls.section}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={() => setViewOpen(false)}
              className="w-full mt-6 rounded-xl font-bold"
            >
              Close Card
            </Button>
          </div>
        )}
      </Dialog>

      {/* ========================================================================= */}
      {/* DELETION CONFIRMATION DIALOG */}
      {/* ========================================================================= */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Instructor Profile?"
        message="Are you sure you want to delete this instructor from the registry? Deactivating this account will unassign them from classrooms and freeze their portal credentials immediately."
        confirmText="Confirm Delete"
      />
    </div>
  );
};
