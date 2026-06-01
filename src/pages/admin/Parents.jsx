import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Table } from '../../components/Table';
import { Dialog } from '../../components/Dialog';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Badge } from '../../components/Badge';
import { Avatar } from '../../components/Avatar';
import { Plus, Edit2, Trash2, Eye, Mail, Phone, MapPin, GraduationCap } from 'lucide-react';

export const AdminParents = () => {
  const { parents, addParent, updateParent, deleteParent, classrooms, students } = useApp();

  // Core Dialog State
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const [editingParent, setEditingParent] = useState(null);
  const [viewingParent, setViewingParent] = useState(null);
  const [deletingParentId, setDeletingParentId] = useState(null);

  // Form Fields State: Parent Details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');

  // Form Fields State: Child Details
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [childGender, setChildGender] = useState('Male');
  const [classroomId, setClassroomId] = useState('');

  const [formErrors, setFormErrors] = useState({});

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setPassword('');
    setChildName('');
    setChildAge('');
    setChildGender('Male');
    // Default to first classroom if available
    setClassroomId(classrooms[0]?.id || '');
    setFormErrors({});
    setEditingParent(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (parent) => {
    resetForm();
    setEditingParent(parent);
    setName(parent.name);
    setEmail(parent.email);
    setPhone(parent.phone);
    setAddress(parent.address);
    
    // Gather child details linked to this parent
    const child = students.find(s => s.parentId === parent.id);
    if (child) {
      setChildName(child.name);
      setChildAge(String(child.age));
      setChildGender(child.gender);
      setClassroomId(child.classroomId || '');
    }
    
    setModalOpen(true);
  };

  const handleOpenView = (parent) => {
    const child = students.find(s => s.parentId === parent.id);
    const cls = classrooms.find(c => c.id === child?.classroomId);
    setViewingParent({
      ...parent,
      childName: child?.name || 'N/A',
      childAge: child?.age || 'N/A',
      childGender: child?.gender || 'N/A',
      classroomName: cls ? `${cls.name}-${cls.section}` : 'Unassigned'
    });
    setViewOpen(true);
  };

  const handleOpenDelete = (id) => {
    setDeletingParentId(id);
    setConfirmOpen(true);
  };

  // Form Validations
  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Parent name is required';
    
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

    if (!address.trim()) errors.address = 'Residential address is required';
    
    if (!editingParent && !password.trim()) {
      errors.password = 'Login password is required';
    } else if (!editingParent && password.trim().length < 5) {
      errors.password = 'Password must be at least 5 characters';
    }

    // Child validations
    if (!childName.trim()) errors.childName = 'Child name is required';
    if (!childAge.trim() || isNaN(childAge) || parseInt(childAge) < 3) {
      errors.childAge = 'Please enter a valid age (3+)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = {
      name,
      email,
      phone,
      address,
      password,
      childName,
      childAge,
      childGender,
      classroomId
    };

    if (editingParent) {
      updateParent(editingParent.id, formData);
    } else {
      addParent(formData);
    }

    setModalOpen(false);
    resetForm();
  };

  const handleConfirmDelete = () => {
    if (deletingParentId) {
      deleteParent(deletingParentId);
      setConfirmOpen(false);
      setDeletingParentId(null);
    }
  };

  // Table Columns
  const columns = [
    {
      key: 'name',
      label: 'Parent',
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
      key: 'child',
      label: 'Child',
      render: (row) => {
        const child = students.find(s => s.parentId === row.id);
        const cls = classrooms.find(c => c.id === child?.classroomId);
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-extrabold text-gray-700">
              {child?.name || 'N/A'}
            </span>
            <span className="text-[10px] text-gray-400 font-semibold uppercase">
              Class: {cls ? `${cls.name}-${cls.section}` : 'Unassigned'}
            </span>
          </div>
        );
      }
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
            className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-gray-50"
          >
            <Eye size={15} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(row)}
            className="p-2 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-gray-50"
          >
            <Edit2 size={15} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenDelete(row.id)}
            className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-gray-50"
          >
            <Trash2 size={15} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight">
            Parents & Families
          </h1>
          <p className="text-xs text-gray-400">
            Manage parent accounts, view family profiles, and enroll children into classrooms.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreate}
          className="rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm"
        >
          <Plus size={16} /> Add Parent
        </Button>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs mt-2">
        <Table
          columns={columns}
          data={parents}
          searchPlaceholder="Search parents by name..."
          searchKey="name"
          emptyMessage="No parents registered yet."
          pageSize={6}
        />
      </div>

      {/* ========================================================================= */}
      {/* CREATION & EDIT INTEGRATED PARENT-CHILD DIALOG */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingParent ? `Edit Parent: ${editingParent.name}` : 'Add New Parent'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Section 1: Sponsor Information */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs uppercase font-extrabold text-blue-500 tracking-wider">
              Parent Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Parent Name"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={formErrors.name}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="e.g. john.doe@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={formErrors.email}
                disabled={!!editingParent} // Email remains primary key
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                placeholder="e.g. +1 (555) 011-2233"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={formErrors.phone}
              />
              {!editingParent ? (
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={formErrors.password}
                />
              ) : (
                <div className="flex items-end text-xs text-gray-400 p-3 bg-gray-50 rounded-xl">
                  🔒 Password is locked. Contact the system admin to reset it.
                </div>
              )}
            </div>

            <Input
              label="Home Address"
              placeholder="e.g. 742 Evergreen Terrace, Springfield"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              error={formErrors.address}
            />
          </div>

          {/* Section 2: Student Information */}
          <div className="flex flex-col gap-4 pt-6 border-t border-gray-100">
            <h3 className="text-xs uppercase font-extrabold text-emerald-500 tracking-wider">
              Student Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Child's Full Name"
                placeholder="e.g. Alex Doe"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                error={formErrors.childName}
              />
              <Input
                label="Child's Age"
                placeholder="10"
                type="number"
                value={childAge}
                onChange={(e) => setChildAge(e.target.value)}
                error={formErrors.childAge}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gender selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 tracking-wide">
                  Child Gender
                </label>
                <div className="flex gap-2">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setChildGender(g)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer ${
                        childGender === g
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Classroom picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 tracking-wide">
                  Assign to Classroom <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <select
                  value={classroomId}
                  onChange={(e) => setClassroomId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white outline-none text-sm text-gray-700 focus:border-blue-500 transition-colors"
                >
                  <option value="">-- Not Assigned --</option>
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}-{c.section} (Capacity: {c.capacity})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end mt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="rounded-xl font-bold">
              {editingParent ? 'Save Changes' : 'Add Parent'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* FAMILY PROFILE card */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={viewOpen}
        onClose={() => setViewOpen(false)}
        title="Parent Profile"
        size="md"
      >
        {viewingParent && (
          <div className="flex flex-col gap-6 py-2">
            <div className="flex items-center gap-4">
              <Avatar name={viewingParent.name} size="lg" />
              <div className="flex flex-col gap-0.5">
                <h3 className="font-extrabold text-gray-800 text-base leading-tight">
                  {viewingParent.name}
                </h3>
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  Parent / Guardian
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              {/* Left Column: Contact details */}
              <div className="flex flex-col gap-3 text-sm">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Contact Information
                </span>
                <div className="flex items-center gap-2.5">
                  <Mail size={15} className="text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 font-semibold truncate">{viewingParent.email}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone size={15} className="text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 font-semibold">{viewingParent.phone}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin size={15} className="text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 font-semibold leading-normal">
                    {viewingParent.address}
                  </span>
                </div>
              </div>

              {/* Right Column: Child details */}
              <div className="flex flex-col gap-3 text-sm p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-emerald-500" /> Child Details
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-gray-400">Student Name</span>
                  <span className="font-extrabold text-gray-800">{viewingParent.childName}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-gray-400">Age & Gender</span>
                  <span className="font-bold text-gray-700">
                    {viewingParent.childAge} Years ({viewingParent.childGender})
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-gray-400">Assigned Classroom</span>
                  <span className="font-extrabold text-emerald-600">{viewingParent.classroomName}</span>
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={() => setViewOpen(false)}
              className="w-full mt-4 rounded-xl font-bold"
            >
              Close
            </Button>
          </div>
        )}
      </Dialog>

      {/* ========================================================================= */}
      {/* FAMILY ACCOUNT DELETION CONFIRMATION */}
      {/* ========================================================================= */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Parent?"
        message="Are you sure you want to remove this parent? This will also delete their child's enrollment record and deactivate their portal access."
        confirmText="Delete"
      />
    </div>
  );
};
