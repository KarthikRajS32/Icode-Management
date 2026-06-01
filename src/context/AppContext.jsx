import { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_TEACHERS,
  INITIAL_PARENTS,
  INITIAL_CLASSROOMS,
  INITIAL_STUDENTS,
  INITIAL_ACTIVITIES
} from '../data/mockData';
import { sendStudentActivityMail } from '../services/mailService';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const getStoredItem = (key, fallback) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      return fallback;
    }
  };

  const setStoredItem = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  };

  const [teachers, setTeachers] = useState(() => getStoredItem('icode_teachers', INITIAL_TEACHERS));
  const [parents, setParents] = useState(() => getStoredItem('icode_parents', INITIAL_PARENTS));
  const [classrooms, setClassrooms] = useState(() => getStoredItem('icode_classrooms', INITIAL_CLASSROOMS));
  const [students, setStudents] = useState(() => getStoredItem('icode_students', INITIAL_STUDENTS));
  const [activities, setActivities] = useState(() => getStoredItem('icode_activities', INITIAL_ACTIVITIES));

  const defaultAccounts = [
    { id: 'u-1', email: 'admin@gmail.com', password: 'admin123', name: 'Super Admin', role: 'superadmin' },
    { id: 'u-2', email: 'teacher@gmail.com', password: 'teacher123', name: 'Sarah Connor', role: 'teacher', associatedId: 't-1' },
  ];
  const [accounts, setAccounts] = useState(() => getStoredItem('icode_accounts', defaultAccounts));
  const [currentUser, setCurrentUser] = useState(() => getStoredItem('icode_current_user', null));
  const [toast, setToast] = useState(null);
  const [mailReceipts, setMailReceipts] = useState(() => getStoredItem('icode_mail_receipts', []));

  useEffect(() => setStoredItem('icode_teachers', teachers), [teachers]);
  useEffect(() => setStoredItem('icode_parents', parents), [parents]);
  useEffect(() => setStoredItem('icode_classrooms', classrooms), [classrooms]);
  useEffect(() => setStoredItem('icode_students', students), [students]);
  useEffect(() => setStoredItem('icode_activities', activities), [activities]);
  useEffect(() => setStoredItem('icode_accounts', accounts), [accounts]);
  useEffect(() => setStoredItem('icode_current_user', currentUser), [currentUser]);
  useEffect(() => setStoredItem('icode_mail_receipts', mailReceipts), [mailReceipts]);

  const triggerToast = (message, type = 'success') => {
    const id = Date.now();
    setToast({ message, type, id });
    setTimeout(() => setToast(prev => (prev?.id === id ? null : prev)), 3500);
  };

  // --- Authentication ---
  const login = (email, password) => {
    const match = accounts.find(
      acc => acc.email.toLowerCase() === email.toLowerCase().trim() && acc.password === password
    );
    if (match) {
      setCurrentUser(match);
      triggerToast(`Welcome back, ${match.name}!`, 'success');
      return { success: true, user: match };
    }
    triggerToast('Access denied. Invalid credentials.', 'error');
    return { success: false };
  };

  const logout = () => {
    if (currentUser) {
      const name = currentUser.name;
      setCurrentUser(null);
      triggerToast(`Signed out. Goodbye, ${name}!`, 'info');
    }
  };

  // --- Teacher CRUD ---
  const addTeacher = (form) => {
    const newId = `t-${Date.now()}`;
    const newTeacher = { id: newId, name: form.name.trim(), email: form.email.toLowerCase().trim(), phone: form.phone.trim(), subject: form.subject.trim() };
    const newAccount = { id: `u-${Date.now()}`, email: newTeacher.email, password: form.password || 'teacher123', name: newTeacher.name, role: 'teacher', associatedId: newId };
    setTeachers(prev => [...prev, newTeacher]);
    setAccounts(prev => [...prev, newAccount]);
    triggerToast(`Teacher "${newTeacher.name}" registered successfully!`, 'success');
  };

  const updateTeacher = (id, form) => {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, name: form.name, phone: form.phone, subject: form.subject } : t));
    setAccounts(prev => prev.map(acc => acc.associatedId === id ? { ...acc, name: form.name } : acc));
    triggerToast('Teacher details saved.', 'success');
  };

  const deleteTeacher = (id) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
    setAccounts(prev => prev.filter(acc => acc.associatedId !== id));
    setClassrooms(prev => prev.map(c => c.teacherId === id ? { ...c, teacherId: null } : c));
    setActivities(prev => prev.filter(act => act.teacherId !== id));
    triggerToast('Instructor account deactivated.', 'info');
  };

  // --- Parent CRUD (contact info only, no login) ---
  const addParent = (form) => {
    const parentId = `p-${Date.now()}`;
    const studentId = `s-${Date.now()}`;
    const newParent = { id: parentId, name: form.name.trim(), email: form.email.toLowerCase().trim(), phone: form.phone.trim(), address: form.address.trim(), childId: studentId };
    const newStudent = { id: studentId, name: form.childName.trim(), age: parseInt(form.childAge, 10) || 10, gender: form.childGender || 'Male', parentId, classroomId: form.classroomId || '', parentName: form.name.trim() };
    setParents(prev => [...prev, newParent]);
    setStudents(prev => [...prev, newStudent]);
    triggerToast('Parent & child registered successfully!', 'success');
  };

  const updateParent = (id, form) => {
    const oldParent = parents.find(p => p.id === id);
    if (!oldParent) return;
    setParents(prev => prev.map(p => p.id === id ? { ...p, name: form.name, email: form.email, phone: form.phone, address: form.address } : p));
    setStudents(prev => prev.map(s => s.id === oldParent.childId ? { ...s, name: form.childName, age: parseInt(form.childAge, 10), gender: form.childGender, parentName: form.name, classroomId: form.classroomId ?? s.classroomId } : s));
    triggerToast('Family record updated.', 'success');
  };

  const deleteParent = (id) => {
    const target = parents.find(p => p.id === id);
    if (!target) return;
    setParents(prev => prev.filter(p => p.id !== id));
    setStudents(prev => prev.filter(s => s.parentId !== id));
    setActivities(prev => prev.filter(act => act.studentId !== target.childId));
    triggerToast('Family record removed.', 'info');
  };

  // --- Classroom CRUD ---
  const addClassroom = (form, selectedStudentIds = []) => {
    const classId = `c-${Date.now()}`;
    const newClassroom = { id: classId, name: form.name.trim(), section: form.section.toUpperCase().trim(), capacity: parseInt(form.capacity, 10) || 30, teacherId: form.teacherId || null };
    setClassrooms(prev => [...prev, newClassroom]);
    if (selectedStudentIds.length > 0) {
      setStudents(prev => prev.map(s => selectedStudentIds.includes(s.id) ? { ...s, classroomId: classId } : s));
    }
    triggerToast(`Classroom "${newClassroom.name}-${newClassroom.section}" created.`, 'success');
  };

  const updateClassroom = (classId, form, selectedStudentIds = []) => {
    setClassrooms(prev => prev.map(c => c.id === classId ? { ...c, name: form.name.trim(), section: form.section.toUpperCase().trim(), capacity: parseInt(form.capacity, 10), teacherId: form.teacherId || null } : c));
    setStudents(prev => prev.map(s => {
      if (selectedStudentIds.includes(s.id)) return { ...s, classroomId: classId };
      if (s.classroomId === classId) return { ...s, classroomId: '' };
      return s;
    }));
    triggerToast('Classroom updated.', 'success');
  };

  const deleteClassroom = (classId) => {
    setClassrooms(prev => prev.filter(c => c.id !== classId));
    setStudents(prev => prev.map(s => s.classroomId === classId ? { ...s, classroomId: '' } : s));
    triggerToast('Classroom deleted.', 'info');
  };

  // --- Direct Student CRUD ---
  const addStudentDirect = (form) => {
    const studentId = `s-${Date.now()}`;
    const parentId = `p-${Date.now()}`;
    const pEmail = `${form.parentName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;
    
    const newParent = {
      id: parentId,
      name: form.parentName.trim(),
      email: pEmail,
      phone: 'Not Provided',
      address: 'Not Provided',
      childId: studentId
    };

    const newAccount = {
      id: `u-${Date.now()}`,
      email: pEmail,
      password: 'parent123',
      name: form.parentName.trim(),
      role: 'parent',
      associatedId: parentId
    };

    setParents(prev => [...prev, newParent]);
    setAccounts(prev => [...prev, newAccount]);
    setStudents(prev => [
      ...prev,
      {
        id: studentId,
        name: form.name.trim(),
        age: form.age,
        gender: form.gender,
        parentId: parentId,
        classroomId: form.classroomId,
        parentName: form.parentName.trim()
      }
    ]);
    triggerToast(`Student "${form.name}" enrolled successfully.`, 'success');
  };

  const updateStudentDirect = (id, form) => {
    const student = students.find(s => s.id === id);
    let assignedParentId = student?.parentId || '';

    if (student) {
      const pEmail = `${form.parentName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;
      if (student.parentId) {
        setParents(prev => prev.map(p => p.id === student.parentId ? { ...p, name: form.parentName.trim(), email: pEmail } : p));
        setAccounts(prev => prev.map(acc => acc.associatedId === student.parentId ? { ...acc, name: form.parentName.trim(), email: pEmail } : acc));
      } else {
        assignedParentId = `p-${Date.now()}`;
        const newParent = {
          id: assignedParentId,
          name: form.parentName.trim(),
          email: pEmail,
          phone: 'Not Provided',
          address: 'Not Provided',
          childId: id
        };
        const newAccount = {
          id: `u-${Date.now()}`,
          email: pEmail,
          password: 'parent123',
          name: form.parentName.trim(),
          role: 'parent',
          associatedId: assignedParentId
        };
        setParents(prev => [...prev, newParent]);
        setAccounts(prev => [...prev, newAccount]);
      }
    }

    setStudents(prev => prev.map(s => s.id === id ? {
      ...s,
      name: form.name.trim(),
      age: form.age,
      gender: form.gender,
      parentName: form.parentName.trim(),
      classroomId: form.classroomId,
      parentId: s.parentId || assignedParentId
    } : s));
    triggerToast('Student record updated.', 'success');
  };

  const deleteStudentDirect = (id) => {
    const student = students.find(s => s.id === id);
    if (student?.parentId) {
      setParents(prev => prev.filter(p => p.id !== student.parentId));
      setAccounts(prev => prev.filter(acc => acc.associatedId !== student.parentId));
    }
    setStudents(prev => prev.filter(s => s.id !== id));
    setActivities(prev => prev.filter(act => act.studentId !== id));
    triggerToast('Student de-enrolled.', 'info');
  };

  // --- Activity Logging ---
  const addStudentActivity = async (form) => {
    const newId = `act-${Date.now()}`;
    const newActivity = { id: newId, title: form.title.trim(), description: form.description.trim(), photoPreset: form.photoPreset || 'math', customPhoto: form.customPhoto || null, date: form.date || new Date().toISOString().split('T')[0], studentId: form.studentId, classroomId: form.classroomId, teacherId: currentUser?.associatedId || 't-1' };
    setActivities(prev => [newActivity, ...prev]);

    const targetStudent = students.find(s => s.id === form.studentId);
    const targetParent = parents.find(p => p.id === targetStudent?.parentId);
    const targetTeacher = teachers.find(t => t.id === newActivity.teacherId);
    const targetClassroom = classrooms.find(c => c.id === newActivity.classroomId);

    triggerToast('Observation saved.', 'success');

    if (targetStudent) {
      try {
        const receipt = await sendStudentActivityMail(newActivity, targetStudent, targetParent, targetTeacher, targetClassroom);
        setMailReceipts(prev => [receipt, ...prev]);
        triggerToast(`Mock email dispatched to: ${receipt.to}`, 'info');
      } catch (err) {
        console.error('Mock mail error', err);
      }
    }
  };

  const deleteActivity = (id) => {
    setActivities(prev => prev.filter(act => act.id !== id));
    triggerToast('Observation removed.', 'info');
  };

  const dismissMailReceipt = (id) => setMailReceipts(prev => prev.filter(r => r.id !== id));

  return (
    <AppContext.Provider value={{
      currentUser, login, logout,
      teachers, parents, classrooms, students, activities, mailReceipts,
      addTeacher, updateTeacher, deleteTeacher,
      addParent, updateParent, deleteParent,
      addClassroom, updateClassroom, deleteClassroom,
      addStudentActivity, deleteActivity, dismissMailReceipt,
      addStudentDirect, updateStudentDirect, deleteStudentDirect,
      toast, triggerToast, setToast
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
