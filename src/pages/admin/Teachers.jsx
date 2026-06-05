import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Table } from '../../components/Table';
import { Dialog } from '../../components/Dialog';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Badge } from '../../components/Badge';
import { Avatar } from '../../components/Avatar';
import { Plus, Edit2, Trash2, Eye, Mail, Phone, Users } from 'lucide-react';

export const AdminTeachers = () => {
  const { teachers, addTeacher, updateTeacher, deleteTeacher, classrooms } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [viewingTeacher, setViewingTeacher] = useState(null);
  const [deletingTeacherId, setDeletingTeacherId] = useState(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const resetForm = () => { setName(''); setEmail(''); setPhone(''); setSubject(''); setFormErrors({}); setEditingTeacher(null); };

  const handleOpenCreate = () => { resetForm(); setModalOpen(true); };
  const handleOpenEdit = (teacher) => { resetForm(); setEditingTeacher(teacher); setName(teacher.name); setEmail(teacher.email); setPhone(teacher.phone); setSubject(teacher.subject); setModalOpen(true); };
  const handleOpenView = (teacher) => { setViewingTeacher({ ...teacher, assignedClasses: classrooms.filter(c => c.teacherId === teacher.id) }); setViewOpen(true); };
  const handleOpenDelete = (id) => { setDeletingTeacherId(id); setConfirmOpen(true); };

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Full name is required';
    if (!email.trim()) errors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Email address is invalid';
    if (!phone.trim()) errors.phone = 'Phone number is required';
    else if (phone.trim().length < 8) errors.phone = 'Please enter a valid phone number';
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
      if (editingTeacher) { await updateTeacher(editingTeacher.id, formData); setModalOpen(false); resetForm(); }
      else { const res = await addTeacher(formData); if (res?.success) { setModalOpen(false); resetForm(); } }
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const handleConfirmDelete = () => {
    if (deletingTeacherId) { deleteTeacher(deletingTeacherId); setConfirmOpen(false); setDeletingTeacherId(null); }
  };

  const columns = [
    {
      key: 'name', label: 'Teacher',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" />
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800 text-sm">{row.name}</span>
            <span className="text-xs text-slate-400">{row.email}</span>
          </div>
        </div>
      )
    },
    {
      key: 'subject', label: 'Subject',
      render: (row) => <Badge variant="blue">{row.subject}</Badge>
    },
    {
      key: 'phone', label: 'Phone',
      render: (row) => <span className="text-sm text-slate-600">{row.phone}</span>
    },
    {
      key: 'actions', label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleOpenView(row)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye size={14} /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(row)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"><Edit2 size={14} /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleOpenDelete(row.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full font-sans animate-fade-in">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Faculty Directory</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage teacher profiles and teaching assignments.</p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate} className="flex items-center gap-2 font-semibold">
          <Plus size={15} /> Add Teacher
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Teachers', value: teachers.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Subjects Covered', value: [...new Set(teachers.map(t => t.subject))].length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'With Classrooms', value: teachers.filter(t => classrooms.some(c => c.teacherId === t.id)).length, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Unassigned', value: teachers.filter(t => !classrooms.some(c => c.teacherId === t.id)).length, color: 'text-slate-600', bg: 'bg-slate-100' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-4 py-8 shadow-sm flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <Users size={15} className={stat.color} />
            </div>
            <div>
              <p className="text-lg font-black text-slate-800 leading-none">{stat.value}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-800 text-sm">Active Instructors</p>
            <p className="text-xs text-slate-500 mt-0.5">View contact details and teaching categories.</p>
          </div>
          <Badge variant="blue">{teachers.length} Total</Badge>
        </div>
        <div className="p-5">
          <Table columns={columns} data={teachers} searchPlaceholder="Search teachers by name..." searchKey="name" emptyMessage="No teachers registered yet." pageSize={6} />
        </div>
      </div>

      {/* Add/Edit modal */}
      <Dialog isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editingTeacher ? `Edit Teacher — ${editingTeacher.name}` : 'Add New Teacher'} size="md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Full Name" placeholder="e.g. Sarah Johnson" value={name} onChange={e => setName(e.target.value)} error={formErrors.name} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Email Address" type="email" placeholder="e.g. sarah.j@icode.edu" value={email} onChange={e => setEmail(e.target.value)} error={formErrors.email} disabled={!!editingTeacher} />
            <Input label="Phone Number" placeholder="e.g. +1 (555) 019-2834" value={phone} onChange={e => setPhone(e.target.value)} error={formErrors.phone} />
          </div>
          <Input label="Teaching Subject" placeholder="e.g. Mathematics" value={subject} onChange={e => setSubject(e.target.value)} error={formErrors.subject} />
          <div className="flex items-center gap-3 justify-end mt-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="primary" loading={submitting}>{editingTeacher ? 'Save Changes' : 'Invite Teacher'}</Button>
          </div>
        </form>
      </Dialog>

      {/* View profile modal */}
      <Dialog isOpen={viewOpen} onClose={() => setViewOpen(false)} title="Teacher Profile" size="sm">
        {viewingTeacher && (
          <div className="flex flex-col gap-5 py-1">
            <div className="flex flex-col items-center gap-3 py-4 bg-slate-50 rounded-xl border border-slate-100">
              <Avatar name={viewingTeacher.name} size="lg" />
              <div className="text-center">
                <h3 className="font-bold text-slate-800 text-base">{viewingTeacher.name}</h3>
                <Badge variant="blue" className="mt-1.5">{viewingTeacher.subject}</Badge>
              </div>
            </div>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <Mail size={14} className="text-slate-400 flex-shrink-0" />
                <span className="text-slate-600 font-medium truncate">{viewingTeacher.email}</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <Phone size={14} className="text-slate-400 flex-shrink-0" />
                <span className="text-slate-600 font-medium">{viewingTeacher.phone}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Assigned Classrooms</span>
                {viewingTeacher.assignedClasses?.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No classrooms assigned.</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {viewingTeacher.assignedClasses.map(cls => (
                      <Badge key={cls.id} variant="slate">{cls.name}-{cls.section}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <Button variant="secondary" onClick={() => setViewOpen(false)} className="w-full">Close</Button>
          </div>
        )}
      </Dialog>

      <ConfirmDialog isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleConfirmDelete}
        title="Remove Teacher?" message="Are you sure you want to remove this teacher? This will unassign them from classrooms and deactivate their portal access." confirmText="Confirm Delete" />
    </div>
  );
};
