import { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_TEACHERS,
  INITIAL_PARENTS,
  INITIAL_CLASSROOMS,
  INITIAL_STUDENTS,
  INITIAL_ACTIVITIES,
  INITIAL_CLASSROOM_STUDENTS,
  ACTIVITY_PHOTO_PRESETS
} from '../data/mockData';
import { sendStudentActivityMail } from '../services/mailService';
import { supabase, supabaseAdmin } from '../lib/supabase';

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
  const [classroomStudents, setClassroomStudents] = useState(() => getStoredItem('icode_classroom_students', INITIAL_CLASSROOM_STUDENTS));
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
  useEffect(() => setStoredItem('icode_classroom_students', classroomStudents), [classroomStudents]);
  useEffect(() => setStoredItem('icode_activities', activities), [activities]);
  useEffect(() => setStoredItem('icode_accounts', accounts), [accounts]);
  useEffect(() => setStoredItem('icode_current_user', currentUser), [currentUser]);
  useEffect(() => setStoredItem('icode_mail_receipts', mailReceipts), [mailReceipts]);

  // Seeding Super Admin in Supabase Auth if administrative client is active
  useEffect(() => {
    const seedAdmin = async () => {
      if (supabaseAdmin) {
        try {
          const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
          if (!error && users) {
            const adminExists = users.some(u => u.email === 'admin@gmail.com');
            if (!adminExists) {
              console.log('Super Admin admin@gmail.com not found. Seeding default Super Admin...');
              const { error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: 'admin@gmail.com',
                password: 'admin123',
                email_confirm: true,
                user_metadata: {
                  role: 'superadmin',
                  name: 'Super Admin'
                }
              });
              if (createError) {
                console.error('Failed to seed default Super Admin:', createError.message);
              } else {
                console.log('Default Super Admin admin@gmail.com seeded successfully!');
              }
            }
          }
        } catch (e) {
          console.error('Failed to list/seed default Super Admin:', e);
        }
      }
    };
    seedAdmin();
  }, []);

  // Listen to auth changes and manage session
  useEffect(() => {
    const initSessionListener = async () => {
      // Fetch current session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const user = session.user;
        let role = user.user_metadata?.role;
        if (!role && user.email === 'admin@gmail.com') role = 'superadmin';
        role = role || 'teacher';
        
        setCurrentUser({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email.split('@')[0],
          role,
          associatedId: user.user_metadata?.teacherId || null
        });
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          const user = session.user;
          let role = user.user_metadata?.role;
          if (!role && user.email === 'admin@gmail.com') role = 'superadmin';
          role = role || 'teacher';

          setCurrentUser({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email.split('@')[0],
            role,
            associatedId: user.user_metadata?.teacherId || null
          });
        } else {
          setCurrentUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    initSessionListener();
  }, []);

  const triggerToast = (message, type = 'success') => {
    const id = Date.now();
    setToast({ message, type, id });
    setTimeout(() => setToast(prev => (prev?.id === id ? null : prev)), 3500);
  };

  // --- Authentication ---
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) {
        triggerToast(`Access denied. ${error.message}`, 'error');
        return { success: false, error };
      }

      const user = data.user;
      let role = user.user_metadata?.role;
      if (!role && user.email === 'admin@gmail.com') role = 'superadmin';
      role = role || 'teacher';

      if (role !== 'superadmin' && role !== 'teacher') {
        await supabase.auth.signOut();
        triggerToast('Access denied. Role not permitted.', 'error');
        return { success: false };
      }

      const associatedId = user.user_metadata?.teacherId || null;
      const name = user.user_metadata?.name || user.email;

      const userSession = {
        id: user.id,
        email: user.email,
        name,
        role,
        associatedId
      };

      setCurrentUser(userSession);
      triggerToast(`Welcome back, ${name}!`, 'success');
      return { success: true, user: userSession };
    } catch (err) {
      triggerToast('An error occurred during sign in.', 'error');
      return { success: false, error: err };
    }
  };

  const logout = async () => {
    if (currentUser) {
      const name = currentUser.name;
      const { error } = await supabase.auth.signOut();
      if (error) {
        triggerToast(`Sign Out Error: ${error.message}`, 'error');
      } else {
        setCurrentUser(null);
        triggerToast(`Signed out. Goodbye, ${name}!`, 'info');
      }
    }
  };

  // --- Teacher CRUD ---
  const addTeacher = async (form) => {
    if (!supabaseAdmin) {
      triggerToast('Admin client missing. Add VITE_SUPABASE_SERVICE_ROLE_KEY to .env to invite teachers.', 'error');
      return { success: false, error: 'Admin client missing' };
    }

    const newId = `t-${Date.now()}`;
    const name = form.name.trim();
    const email = form.email.toLowerCase().trim();
    const phone = form.phone.trim();
    const subject = form.subject.trim();

    try {
      const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${window.location.origin}/setup-password`,
        data: {
          role: 'teacher',
          name,
          phone,
          subject,
          teacherId: newId
        }
      });

      if (error) {
        triggerToast(`Failed to register teacher: ${error.message}`, 'error');
        return { success: false, error };
      }

      // Add to local teachers list
      const newTeacher = { id: newId, name, email, phone, subject };
      setTeachers(prev => [...prev, newTeacher]);

      // Add to local accounts mapping
      const newAccount = {
        id: data.user.id,
        email,
        name,
        role: 'teacher',
        associatedId: newId
      };
      setAccounts(prev => [...prev, newAccount]);

      triggerToast(`Teacher "${name}" invited successfully!`, 'success');
      return { success: true };
    } catch (err) {
      triggerToast('An error occurred while inviting the teacher.', 'error');
      return { success: false, error: err };
    }
  };

  const updateTeacher = async (id, form) => {
    if (supabaseAdmin) {
      const account = accounts.find(acc => acc.associatedId === id);
      if (account) {
        try {
          await supabaseAdmin.auth.admin.updateUserById(account.id, {
            user_metadata: {
              name: form.name.trim(),
              phone: form.phone.trim(),
              subject: form.subject.trim()
            }
          });
        } catch (e) {
          console.error('Failed to update user in Supabase Auth:', e);
        }
      }
    }
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, name: form.name, phone: form.phone, subject: form.subject } : t));
    setAccounts(prev => prev.map(acc => acc.associatedId === id ? { ...acc, name: form.name } : acc));
    triggerToast('Teacher details saved.', 'success');
  };

  const deleteTeacher = async (id) => {
    if (supabaseAdmin) {
      const account = accounts.find(acc => acc.associatedId === id);
      if (account) {
        try {
          await supabaseAdmin.auth.admin.deleteUser(account.id);
        } catch (e) {
          console.error('Failed to delete user from Supabase Auth:', e);
        }
      }
    }
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
    const pEmail = form.email.toLowerCase().trim();
    const newParent = { id: parentId, name: form.name.trim(), email: pEmail, phone: form.phone.trim(), address: form.address.trim(), childId: studentId };
    const newStudent = { id: studentId, name: form.childName.trim(), age: parseInt(form.childAge, 10) || 10, gender: form.childGender || 'Male', parentId, parentName: form.name.trim(), parentEmail: pEmail };
    setParents(prev => [...prev, newParent]);
    setStudents(prev => [...prev, newStudent]);
    if (form.classroomId) {
      setClassroomStudents(prev => [...prev, { studentId, classroomId: form.classroomId }]);
    }
    triggerToast('Parent & child registered successfully!', 'success');
  };

  const updateParent = (id, form) => {
    const oldParent = parents.find(p => p.id === id);
    if (!oldParent) return;
    const pEmail = form.email.toLowerCase().trim();
    setParents(prev => prev.map(p => p.id === id ? { ...p, name: form.name, email: pEmail, phone: form.phone, address: form.address } : p));
    setStudents(prev => prev.map(s => s.id === oldParent.childId ? { ...s, name: form.childName, age: parseInt(form.childAge, 10), gender: form.childGender, parentName: form.name, parentEmail: pEmail } : s));
    if (form.classroomId !== undefined) {
      setClassroomStudents(prev => {
        const withoutChild = prev.filter(cs => cs.studentId !== oldParent.childId);
        if (form.classroomId) {
          return [...withoutChild, { studentId: oldParent.childId, classroomId: form.classroomId }];
        }
        return withoutChild;
      });
    }
    triggerToast('Family record updated.', 'success');
  };

  const deleteParent = (id) => {
    const target = parents.find(p => p.id === id);
    if (!target) return;
    setParents(prev => prev.filter(p => p.id !== id));
    setStudents(prev => prev.filter(s => s.parentId !== id));
    setClassroomStudents(prev => prev.filter(cs => cs.studentId !== target.childId));
    setActivities(prev => prev.filter(act => act.studentId !== target.childId));
    triggerToast('Family record removed.', 'info');
  };

  // --- Classroom CRUD ---
  const addClassroom = (form, selectedStudentIds = []) => {
    const classId = `c-${Date.now()}`;
    const newClassroom = { id: classId, name: form.name.trim(), section: form.section.toUpperCase().trim(), capacity: parseInt(form.capacity, 10) || 30, teacherId: form.teacherId || null };
    setClassrooms(prev => [...prev, newClassroom]);
    if (selectedStudentIds.length > 0) {
      const newMappings = selectedStudentIds.map(stId => ({ studentId: stId, classroomId: classId }));
      setClassroomStudents(prev => [...prev, ...newMappings]);
    }
    triggerToast(`Classroom "${newClassroom.name}-${newClassroom.section}" created.`, 'success');
  };

  const updateClassroom = (classId, form, selectedStudentIds = []) => {
    setClassrooms(prev => prev.map(c => c.id === classId ? { ...c, name: form.name.trim(), section: form.section.toUpperCase().trim(), capacity: parseInt(form.capacity, 10), teacherId: form.teacherId || null } : c));
    setClassroomStudents(prev => {
      const otherClassroomMappings = prev.filter(cs => cs.classroomId !== classId);
      const newMappings = selectedStudentIds.map(stId => ({ studentId: stId, classroomId: classId }));
      return [...otherClassroomMappings, ...newMappings];
    });
    triggerToast('Classroom updated.', 'success');
  };

  const deleteClassroom = (classId) => {
    setClassrooms(prev => prev.filter(c => c.id !== classId));
    setClassroomStudents(prev => prev.filter(cs => cs.classroomId !== classId));
    triggerToast('Classroom deleted.', 'info');
  };

  // --- Direct Student CRUD ---
  const addStudentDirect = (form) => {
    const studentId = `s-${Date.now()}`;
    const parentId = `p-${Date.now()}`;
    const pEmail = form.parentEmail.toLowerCase().trim();
    
    const newParent = {
      id: parentId,
      name: form.parentName.trim(),
      email: pEmail,
      phone: 'Not Provided',
      address: 'Not Provided',
      childId: studentId
    };

    setParents(prev => [...prev, newParent]);
    setStudents(prev => [
      ...prev,
      {
        id: studentId,
        name: form.name.trim(),
        age: form.age,
        gender: form.gender,
        parentId: parentId,
        parentName: form.parentName.trim(),
        parentEmail: pEmail
      }
    ]);
    if (form.classroomId) {
      setClassroomStudents(prev => [...prev, { studentId, classroomId: form.classroomId }]);
    }
    triggerToast(`Student "${form.name}" enrolled successfully.`, 'success');
  };

  const updateStudentDirect = (id, form) => {
    const student = students.find(s => s.id === id);
    let assignedParentId = student?.parentId || '';
    const pEmail = form.parentEmail.toLowerCase().trim();

    if (student) {
      if (student.parentId) {
        setParents(prev => prev.map(p => p.id === student.parentId ? { ...p, name: form.parentName.trim(), email: pEmail } : p));
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
        setParents(prev => [...prev, newParent]);
      }
    }

    setStudents(prev => prev.map(s => s.id === id ? {
      ...s,
      name: form.name.trim(),
      age: form.age,
      gender: form.gender,
      parentName: form.parentName.trim(),
      parentEmail: pEmail,
      parentId: s.parentId || assignedParentId
    } : s));
    if (form.classroomId) {
      setClassroomStudents(prev => {
        const exists = prev.some(cs => cs.studentId === id && cs.classroomId === form.classroomId);
        if (!exists) {
          return [...prev, { studentId: id, classroomId: form.classroomId }];
        }
        return prev;
      });
    }
    triggerToast('Student record updated.', 'success');
  };

  const deleteStudentDirect = (id) => {
    const student = students.find(s => s.id === id);
    if (student?.parentId) {
      setParents(prev => prev.filter(p => p.id !== student.parentId));
      setAccounts(prev => prev.filter(acc => acc.associatedId !== student.parentId));
    }
    setStudents(prev => prev.filter(s => s.id !== id));
    setClassroomStudents(prev => prev.filter(cs => cs.studentId !== id));
    setActivities(prev => prev.filter(act => act.studentId !== id));
    triggerToast('Student de-enrolled.', 'info');
  };

  // --- Activity Logging ---
  const addStudentActivity = async (form) => {
    const newId = `act-${Date.now()}`;
    
    let activityImages = form.images || [];
    if (activityImages.length === 0 && form.photoPreset) {
      const preset = ACTIVITY_PHOTO_PRESETS.find(p => p.id === form.photoPreset);
      if (preset) {
        activityImages = [preset.url];
      }
    }

    const newActivity = {
      id: newId,
      activityId: newId,
      title: form.title.trim(),
      description: form.description.trim(),
      photoPreset: form.photoPreset || '',
      customPhoto: form.customPhoto || null,
      images: activityImages,
      date: form.date || new Date().toISOString().split('T')[0],
      studentId: form.studentId,
      classroomId: form.classroomId,
      teacherId: currentUser?.associatedId || 't-1'
    };
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
      teachers, parents, classrooms, students, classroomStudents, activities, mailReceipts,
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
