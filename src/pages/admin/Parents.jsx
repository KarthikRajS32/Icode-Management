import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Table } from '../../components/Table';
import { Dialog } from '../../components/Dialog';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Badge } from '../../components/Badge';
import { Avatar } from '../../components/Avatar';
import { Plus, Edit2, Trash2, Eye, Mail, Phone, MapPin, GraduationCap, UserCheck } from 'lucide-react';

export const AdminParents = () => {
  const { parents, addParent, updateParent, deleteParent, classrooms, students, classroomStudents } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [viewingParent, setViewingParent] = useState(null);
  const [deletingParentId, setDeletingParentId] = useState(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [childGender, setChildGender] = useState('Male');
  const [classroomId, setClassroomId] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const resetForm = () => {
    setName(''); setEmail(''); setPhone(''); setAddress(''); setChildName(''); setChildAge(''); setChildGender('Male'); setClassroomId(classrooms[0]?.id || ''); setFormErrors({}); setEditingParent(null);
  };

  const handleOpenCreate = () => { resetForm(); setModalOpen(true); };

  const handleOpenEdit = (parent) => {
    resetForm(); setEditingParent(parent); setName(parent.name); setEmail(parent.email); setPhone(parent.phone); setAddress(parent.address);
    const child = students.find(s => s.parentId === parent.id);
    if (child) {
      setChildName(child.name); setChildAge(String(child.age)); setChildGender(child.gender);
      const ca = classroomStudents.find(cs => cs.studentId === child.id);
      setClassroomId(ca ? ca.classroomId : '');
    }
    setModalOpen(true);
  };

  const handleOpenView = (parent) => {
    const child = students.find(s => s.parentId === parent.id);
    const assignedClassroomIds = child ? classroomStudents.filter(cs => cs.studentId === child.id).map(cs => cs.classroomId) : [];
    const assignedClassrooms = classrooms.filter(c => assignedClassroomIds.includes(c.id));
    setViewingParent({ ...parent, childName: child?.name || 'N/A', childAge: child?.age || 'N/A', childGender: child?.gender || 'N/A', classroomName: assignedClassrooms.length > 0 ? assignedClassrooms.map(c => `${c.name}-${c.section}`).join(', ') : 'Unassigned' });
    setViewOpen(true);
  };

  const handleOpenDelete = (id) => { setDeletingParentId(id); setConfirmOpen(true); };

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Parent name is required';
    if (!email.trim()) errors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Email address is invalid';
    if (!phone.trim()) errors.phone = 'Phone number is required';
    else if (phone.trim().length < 8) errors.phone = 'Please enter a valid phone number';
    if (!address.trim()) errors.address = 'Residential address is required';
    if (!childName.trim()) errors.childName = 'Child name is required';
    if (!childAge.trim() || isNaN(childAge) || parseInt(childAge, 10) < 3) errors.childAge = 'Child age must be at least 3';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const formData = { name, email, phone, address, childName, childAge: parseInt(childAge, 10), childGender, classroomId };
    if (editingParent) { updateParent(editingParent.id, formData); } else { addParent(formData); }
    setModalOpen(false); resetForm();
  };

  const handleConfirmDelete = () => {
    if (deletingParentId) { deleteParent(deletingParentId); setConfirmOpen(false); setDeletingParentId(null); }
  };

  const columns = [
    {
      key: 'name', label: 'Parent',
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
      key: 'child', label: 'Enrolled Child',
      render: (row) => {
        const child = students.find(s => s.parentId === row.id);
        const assignedClassroomIds = child ? classroomStudents.filter(cs => cs.studentId === child.id).map(cs => cs.classroomId) : [];
        const classroomNames = classrooms.filter(c => assignedClassroomIds.includes(c.id)).map(c => `${c.name}-${c.section}`).join(', ') || 'Unassigned';
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-slate-700">{child?.name || 'N/A'}</span>
            <span className="text-xs text-slate-400">{classroomNames}</span>
          </div>
        );
      }
    },
    { key: 'phone', label: 'Phone', render: (row) => <span className="text-sm text-slate-600">{row.phone}</span> },
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

  const enrolledStudents = students.filter(s => parents.some(p => p.id === s.parentId));

  return (
    <div className="flex flex-col gap-6 w-full font-sans animate-fade-in">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Parents & Students</h1>
          <p className="text-sm text-slate-500 mt-0.5">Register parent accounts and manage student admissions.</p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate} className="flex items-center gap-2 font-semibold">
          <Plus size={15} /> Add Parent
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Parents', value: parents.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Enrolled Students', value: enrolledStudents.length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Assigned to Class', value: classroomStudents.length, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Unassigned Students', value: enrolledStudents.filter(s => !classroomStudents.some(cs => cs.studentId === s.id)).length, color: 'text-slate-500', bg: 'bg-slate-100' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-4 py-8 shadow-sm flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <UserCheck size={15} className={stat.color} />
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
            <p className="font-bold text-slate-800 text-sm">Parent Accounts</p>
            <p className="text-xs text-slate-500 mt-0.5">View families and current classroom assignments.</p>
          </div>
          <Badge variant="blue">{parents.length} Registered</Badge>
        </div>
        <div className="p-5">
          <Table columns={columns} data={parents} searchPlaceholder="Search parents by name..." searchKey="name" emptyMessage="No parents registered yet." pageSize={6} />
        </div>
      </div>

      {/* Add/Edit modal */}
      <Dialog isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editingParent ? `Edit Family — ${editingParent.name}` : 'Add Family Account'} size="lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="w-1 h-4 rounded-full bg-blue-600" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Parent Information</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Parent Name" placeholder="e.g. John Doe" value={name} onChange={e => setName(e.target.value)} error={formErrors.name} />
              <Input label="Email Address" type="email" placeholder="e.g. john.doe@gmail.com" value={email} onChange={e => setEmail(e.target.value)} error={formErrors.email} disabled={!!editingParent} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Phone Number" placeholder="e.g. +1 (555) 011-2233" value={phone} onChange={e => setPhone(e.target.value)} error={formErrors.phone} />
              <Input label="Home Address" placeholder="e.g. 742 Evergreen Terrace" value={address} onChange={e => setAddress(e.target.value)} error={formErrors.address} />
            </div>
          </div>

          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="w-1 h-4 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Student Information</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Child's Full Name" placeholder="e.g. Alex Doe" value={childName} onChange={e => setChildName(e.target.value)} error={formErrors.childName} />
              <Input label="Child's Age" placeholder="10" type="number" value={childAge} onChange={e => setChildAge(e.target.value)} error={formErrors.childAge} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 tracking-wide">Child Gender</label>
                <div className="flex gap-2">
                  {['Male', 'Female'].map(g => (
                    <button key={g} type="button" onClick={() => setChildGender(g)}
                      className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-all duration-150 cursor-pointer ${childGender === g ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 tracking-wide">Assign Classroom <span className="text-slate-400 font-normal">(optional)</span></label>
                <select value={classroomId} onChange={e => setClassroomId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white outline-none text-sm text-slate-800 focus:border-blue-500 transition-colors cursor-pointer">
                  <option value="">-- Not Assigned --</option>
                  {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}-{c.section} (Cap: {c.capacity})</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{editingParent ? 'Save Changes' : 'Create Account'}</Button>
          </div>
        </form>
      </Dialog>

      {/* View modal */}
      <Dialog isOpen={viewOpen} onClose={() => setViewOpen(false)} title="Family Profile" size="md">
        {viewingParent && (
          <div className="flex flex-col gap-5 py-1">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <Avatar name={viewingParent.name} size="lg" />
              <div>
                <h3 className="font-bold text-slate-800 text-base">{viewingParent.name}</h3>
                <Badge variant="gray" className="mt-1 text-[10px]">Parent / Sponsor</Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2.5">
                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Contact Details</span>
                <div className="flex items-center gap-2.5 text-sm"><Mail size={14} className="text-slate-400 flex-shrink-0" /><span className="text-slate-600 truncate">{viewingParent.email}</span></div>
                <div className="flex items-center gap-2.5 text-sm"><Phone size={14} className="text-slate-400 flex-shrink-0" /><span className="text-slate-600">{viewingParent.phone}</span></div>
                <div className="flex items-start gap-2.5 text-sm"><MapPin size={14} className="text-slate-400 flex-shrink-0 mt-0.5" /><span className="text-slate-600 leading-snug">{viewingParent.address}</span></div>
              </div>
              <div className="flex flex-col gap-2.5 p-4 bg-emerald-50/40 rounded-xl border border-emerald-100/60">
                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5"><GraduationCap size={13} className="text-emerald-600" /> Student Profile</span>
                <div><p className="text-[10px] text-slate-400 font-bold uppercase">Name</p><p className="font-bold text-slate-800 text-sm">{viewingParent.childName}</p></div>
                <div><p className="text-[10px] text-slate-400 font-bold uppercase">Age / Gender</p><p className="font-semibold text-slate-700 text-sm">{viewingParent.childAge} yrs · {viewingParent.childGender}</p></div>
                <div><p className="text-[10px] text-slate-400 font-bold uppercase">Assigned Class</p><p className="font-bold text-emerald-700 text-sm">{viewingParent.classroomName}</p></div>
              </div>
            </div>
            <Button variant="secondary" onClick={() => setViewOpen(false)} className="w-full">Close Profile</Button>
          </div>
        )}
      </Dialog>

      <ConfirmDialog isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleConfirmDelete}
        title="Remove Parent Account?" message="Are you sure? This will also deactivate their child's enrollment status." confirmText="Delete" />
    </div>
  );
};
