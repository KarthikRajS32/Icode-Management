import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Table } from '../../components/Table';
import { Dialog } from '../../components/Dialog';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Badge } from '../../components/Badge';
import { Avatar } from '../../components/Avatar';
import { Plus, Edit2, Trash2, Eye, Mail, Phone } from 'lucide-react';

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
  const [submitting, setSubmitting] = useState(false);

  const [formErrors, setFormErrors] = useState({});

  // Reset fields helper
  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setSubject('');
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

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const formData = { name, email, phone, subject };

    try {
      if (editingTeacher) {
        await updateTeacher(editingTeacher.id, formData);
        setModalOpen(false);
        resetForm();
      } else {
        const res = await addTeacher(formData);
        if (res && res.success) {
          setModalOpen(false);
          resetForm();
        }
      }
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setSubmitting(false);
    }
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
      label: 'Teacher',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" />
          <div className="flex flex-col">
            <span className="font-bold text-gray-800 text-sm">{row.name}</span>
            <span className="text-[10px] text-gray-400 font-semibold">{row.email}</span>
          </div>
        </div>
      )
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (row) => (
        <Badge variant="blue" className="text-[9px] px-2 py-0.5 border-none">
          {row.subject}
        </Badge>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (row) => (
        <span className="text-xs font-semibold text-gray-500">
          {row.phone}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenView(row)}
            className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-gray-50 rounded-xl"
          >
            <Eye size={15} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(row)}
            className="p-2 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-gray-50 rounded-xl"
          >
            <Edit2 size={15} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenDelete(row.id)}
            className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-gray-50 rounded-xl"
          >
            <Trash2 size={15} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight">
            Faculty & Staff
          </h1>
          <p className="text-xs text-gray-400">
            Manage teacher accounts, assign subjects, and register new instructors to the academy.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreate}
          className="rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm"
        >
          <Plus size={16} /> Add Teacher
        </Button>
      </div>

      {/* Main Data table */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs mt-2">
        <Table
          columns={columns}
          data={teachers}
          searchPlaceholder="Search teachers by name..."
          searchKey="name"
          emptyMessage="No teachers registered yet."
          pageSize={6}
        />
      </div>

      {/* ========================================================================= */}
      {/* INSTRUCTOR CREATION / EDIT DIALOG */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTeacher ? `Edit Teacher: ${editingTeacher.name}` : 'Add New Teacher'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            placeholder="e.g. Sarah Johnson"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={formErrors.name}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. sarah.j@icode.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={formErrors.email}
              disabled={!!editingTeacher} // Keep email immutable for primary keys
            />
            <Input
              label="Phone Number"
              placeholder="e.g. +1 (555) 019-2834"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={formErrors.phone}
            />
          </div>

          <Input
            label="Teaching Subject"
            placeholder="e.g. Mathematics"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            error={formErrors.subject}
          />

          <div className="flex items-center gap-3 justify-end mt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="rounded-xl" disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="rounded-xl font-bold" loading={submitting}>
              {editingTeacher ? 'Save Changes' : 'Invite Teacher'}
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
        title="Teacher Profile"
        size="sm"
      >
        {viewingTeacher && (
          <div className="flex flex-col items-center gap-6 py-2">
            <Avatar name={viewingTeacher.name} size="xl" />
            
            <div className="flex flex-col items-center gap-1.5 text-center">
              <h3 className="font-extrabold text-gray-800 text-lg leading-tight">
                {viewingTeacher.name}
              </h3>
              <Badge variant="blue" className="text-[9px] px-2 py-0.5 border-none">
                {viewingTeacher.subject}
              </Badge>
            </div>

            <div className="w-full flex flex-col gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-slate-400 flex-shrink-0" />
                <span className="text-slate-600 font-semibold truncate">
                  {viewingTeacher.email}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-slate-400 flex-shrink-0" />
                <span className="text-slate-600 font-semibold">
                  {viewingTeacher.phone}
                </span>
              </div>
              
              <div className="flex flex-col gap-1.5 mt-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Assigned Classrooms
                </span>
                {viewingTeacher.assignedClasses?.length === 0 ? (
                  <span className="text-xs text-gray-400 font-semibold">
                    No classrooms assigned.
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
              Close
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
        title="Remove Teacher?"
        message="Are you sure you want to remove this teacher? This will unassign them from all classrooms and deactivate their portal access."
        confirmText="Confirm Delete"
      />
    </div>
  );
};
