import {
  INITIAL_TEACHERS,
  INITIAL_PARENTS,
  INITIAL_CLASSROOMS,
  INITIAL_STUDENTS,
  INITIAL_ACTIVITIES
} from '../data/mockData';

// Helper to simulate API network delay
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

const getStored = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setStored = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving to localStorage for key: ${key}`, e);
  }
};

// API Services
export const teacherApi = {
  getAll: async () => {
    await delay();
    return getStored('icode_teachers', INITIAL_TEACHERS);
  },
  create: async (form) => {
    await delay();
    const teachers = getStored('icode_teachers', INITIAL_TEACHERS);
    const accounts = getStored('icode_accounts', [
      { id: 'u-1', email: 'admin@gmail.com', password: 'admin123', name: 'Super Admin', role: 'superadmin' },
      { id: 'u-2', email: 'teacher@gmail.com', password: 'teacher123', name: 'Sarah Connor', role: 'teacher', associatedId: 't-1' }
    ]);

    const newId = `t-${Date.now()}`;
    const newTeacher = {
      id: newId,
      name: form.name.trim(),
      email: form.email.toLowerCase().trim(),
      phone: form.phone.trim(),
      subject: form.subject.trim(),
    };

    const newAccount = {
      id: `u-${Date.now()}`,
      email: newTeacher.email,
      password: form.password || 'teacher123',
      name: newTeacher.name,
      role: 'teacher',
      associatedId: newId
    };

    const updatedTeachers = [...teachers, newTeacher];
    const updatedAccounts = [...accounts, newAccount];

    setStored('icode_teachers', updatedTeachers);
    setStored('icode_accounts', updatedAccounts);

    return { teachers: updatedTeachers, accounts: updatedAccounts };
  },
  update: async (id, form) => {
    await delay();
    const teachers = getStored('icode_teachers', INITIAL_TEACHERS);
    const accounts = getStored('icode_accounts', []);

    const updatedTeachers = teachers.map(t =>
      t.id === id ? { ...t, name: form.name, phone: form.phone, subject: form.subject } : t
    );
    const updatedAccounts = accounts.map(acc =>
      acc.associatedId === id ? { ...acc, name: form.name } : acc
    );

    setStored('icode_teachers', updatedTeachers);
    setStored('icode_accounts', updatedAccounts);

    return { teachers: updatedTeachers, accounts: updatedAccounts };
  },
  delete: async (id) => {
    await delay();
    const teachers = getStored('icode_teachers', INITIAL_TEACHERS);
    const accounts = getStored('icode_accounts', []);
    const classrooms = getStored('icode_classrooms', INITIAL_CLASSROOMS);

    const updatedTeachers = teachers.filter(t => t.id !== id);
    const updatedAccounts = accounts.filter(acc => acc.associatedId !== id);
    const updatedClassrooms = classrooms.map(c =>
      c.teacherId === id ? { ...c, teacherId: null } : c
    );

    setStored('icode_teachers', updatedTeachers);
    setStored('icode_accounts', updatedAccounts);
    setStored('icode_classrooms', updatedClassrooms);

    return { teachers: updatedTeachers, accounts: updatedAccounts, classrooms: updatedClassrooms };
  }
};

export const parentApi = {
  getAll: async () => {
    await delay();
    return getStored('icode_parents', INITIAL_PARENTS);
  },
  create: async (form) => {
    await delay();
    const parents = getStored('icode_parents', INITIAL_PARENTS);
    const students = getStored('icode_students', INITIAL_STUDENTS);

    const parentId = `p-${Date.now()}`;
    const studentId = `s-${Date.now()}`;

    const newParent = {
      id: parentId,
      name: form.name.trim(),
      email: form.email.toLowerCase().trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      childName: form.childName.trim(),
      childAge: parseInt(form.childAge, 10) || 10,
      childGender: form.childGender || 'Male',
      childId: studentId
    };

    const newStudent = {
      id: studentId,
      name: form.childName.trim(),
      age: parseInt(form.childAge, 10) || 10,
      gender: form.childGender || 'Male',
      parentId: parentId,
      classroomId: form.classroomId || '',
      parentName: form.name.trim()
    };

    const updatedParents = [...parents, newParent];
    const updatedStudents = [...students, newStudent];

    setStored('icode_parents', updatedParents);
    setStored('icode_students', updatedStudents);

    return { parents: updatedParents, students: updatedStudents };
  },
  update: async (id, form) => {
    await delay();
    const parents = getStored('icode_parents', INITIAL_PARENTS);
    const students = getStored('icode_students', INITIAL_STUDENTS);

    const target = parents.find(p => p.id === id);
    if (!target) return { parents, students };

    const updatedParents = parents.map(p =>
      p.id === id
        ? {
            ...p,
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: form.address,
            childName: form.childName,
            childAge: parseInt(form.childAge, 10),
            childGender: form.childGender
          }
        : p
    );

    const updatedStudents = students.map(s =>
      s.id === target.childId
        ? {
            ...s,
            name: form.childName,
            age: parseInt(form.childAge, 10),
            gender: form.childGender,
            parentName: form.name,
            classroomId: form.classroomId || s.classroomId
          }
        : s
    );

    setStored('icode_parents', updatedParents);
    setStored('icode_students', updatedStudents);

    return { parents: updatedParents, students: updatedStudents };
  },
  delete: async (id) => {
    await delay();
    const parents = getStored('icode_parents', INITIAL_PARENTS);
    const students = getStored('icode_students', INITIAL_STUDENTS);
    const activities = getStored('icode_activities', INITIAL_ACTIVITIES);

    const target = parents.find(p => p.id === id);
    if (!target) return { parents, students, activities };

    const updatedParents = parents.filter(p => p.id !== id);
    const updatedStudents = students.filter(s => s.parentId !== id);
    const updatedActivities = activities.filter(act => act.studentId !== target.childId);

    setStored('icode_parents', updatedParents);
    setStored('icode_students', updatedStudents);
    setStored('icode_activities', updatedActivities);

    return { parents: updatedParents, students: updatedStudents, activities: updatedActivities };
  }
};

export const classroomApi = {
  getAll: async () => {
    await delay();
    return getStored('icode_classrooms', INITIAL_CLASSROOMS);
  },
  create: async (form, selectedStudentIds = []) => {
    await delay();
    const classrooms = getStored('icode_classrooms', INITIAL_CLASSROOMS);
    const students = getStored('icode_students', INITIAL_STUDENTS);

    const classId = `c-${Date.now()}`;
    const newClassroom = {
      id: classId,
      name: form.name.trim(),
      section: form.section.toUpperCase().trim(),
      capacity: parseInt(form.capacity, 10) || 30,
      teacherId: form.teacherId || null,
    };

    const updatedClassrooms = [...classrooms, newClassroom];

    const updatedStudents = students.map(s =>
      selectedStudentIds.includes(s.id) ? { ...s, classroomId: classId } : s
    );

    setStored('icode_classrooms', updatedClassrooms);
    setStored('icode_students', updatedStudents);

    return { classrooms: updatedClassrooms, students: updatedStudents };
  },
  update: async (classId, form, selectedStudentIds = []) => {
    await delay();
    const classrooms = getStored('icode_classrooms', INITIAL_CLASSROOMS);
    const students = getStored('icode_students', INITIAL_STUDENTS);

    const updatedClassrooms = classrooms.map(c =>
      c.id === classId
        ? {
            ...c,
            name: form.name.trim(),
            section: form.section.toUpperCase().trim(),
            capacity: parseInt(form.capacity, 10),
            teacherId: form.teacherId || null
          }
        : c
    );

    const updatedStudents = students.map(s => {
      if (selectedStudentIds.includes(s.id)) {
        return { ...s, classroomId: classId };
      } else if (s.classroomId === classId) {
        return { ...s, classroomId: '' };
      }
      return s;
    });

    setStored('icode_classrooms', updatedClassrooms);
    setStored('icode_students', updatedStudents);

    return { classrooms: updatedClassrooms, students: updatedStudents };
  },
  delete: async (classId) => {
    await delay();
    const classrooms = getStored('icode_classrooms', INITIAL_CLASSROOMS);
    const students = getStored('icode_students', INITIAL_STUDENTS);

    const updatedClassrooms = classrooms.filter(c => c.id !== classId);
    const updatedStudents = students.map(s =>
      s.classroomId === classId ? { ...s, classroomId: '' } : s
    );

    setStored('icode_classrooms', updatedClassrooms);
    setStored('icode_students', updatedStudents);

    return { classrooms: updatedClassrooms, students: updatedStudents };
  }
};

export const studentApi = {
  getAll: async () => {
    await delay();
    return getStored('icode_students', INITIAL_STUDENTS);
  },
  createDirect: async (form) => {
    await delay();
    const students = getStored('icode_students', INITIAL_STUDENTS);
    const parents = getStored('icode_parents', INITIAL_PARENTS);
    const accounts = getStored('icode_accounts', []);

    const studentId = `s-${Date.now()}`;
    const parentId = `p-${Date.now()}`;

    const newStudent = {
      id: studentId,
      name: form.name.trim(),
      age: parseInt(form.age, 10) || 10,
      gender: form.gender || 'Male',
      parentId: parentId,
      classroomId: form.classroomId || '',
      parentName: form.parentName.trim()
    };

    const newParent = {
      id: parentId,
      name: form.parentName.trim(),
      email: `${form.parentName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      phone: '+1 (555) 019-9900',
      address: 'Registered residential sponsor address',
      childName: form.name.trim(),
      childAge: parseInt(form.age, 10) || 10,
      childGender: form.gender || 'Male',
      childId: studentId
    };

    const newAccount = {
      id: `u-${Date.now()}`,
      email: newParent.email,
      password: 'parent123',
      name: newParent.name,
      role: 'parent',
      associatedId: parentId
    };

    const updatedStudents = [...students, newStudent];
    const updatedParents = [...parents, newParent];
    const updatedAccounts = [...accounts, newAccount];

    setStored('icode_students', updatedStudents);
    setStored('icode_parents', updatedParents);
    setStored('icode_accounts', updatedAccounts);

    return { students: updatedStudents, parents: updatedParents, accounts: updatedAccounts };
  },
  updateDirect: async (studentId, form) => {
    await delay();
    const students = getStored('icode_students', INITIAL_STUDENTS);
    const parents = getStored('icode_parents', INITIAL_PARENTS);

    const targetStudent = students.find(s => s.id === studentId);
    if (!targetStudent) return { students, parents };

    const updatedStudents = students.map(s =>
      s.id === studentId
        ? {
            ...s,
            name: form.name,
            age: parseInt(form.age, 10),
            gender: form.gender,
            parentName: form.parentName
          }
        : s
    );

    const updatedParents = parents.map(p =>
      p.id === targetStudent.parentId
        ? {
            ...p,
            name: form.parentName,
            childName: form.name,
            childAge: parseInt(form.age, 10),
            childGender: form.gender
          }
        : p
    );

    setStored('icode_students', updatedStudents);
    setStored('icode_parents', updatedParents);

    return { students: updatedStudents, parents: updatedParents };
  },
  deleteDirect: async (studentId) => {
    await delay();
    const students = getStored('icode_students', INITIAL_STUDENTS);
    const parents = getStored('icode_parents', INITIAL_PARENTS);
    const activities = getStored('icode_activities', INITIAL_ACTIVITIES);

    const targetStudent = students.find(s => s.id === studentId);
    if (!targetStudent) return { students, parents, activities };

    const updatedStudents = students.filter(s => s.id !== studentId);
    const updatedParents = parents.filter(p => p.id !== targetStudent.parentId);
    const updatedActivities = activities.filter(act => act.studentId !== studentId);

    setStored('icode_students', updatedStudents);
    setStored('icode_parents', updatedParents);
    setStored('icode_activities', updatedActivities);

    return { students: updatedStudents, parents: updatedParents, activities: updatedActivities };
  }
};

export const activityApi = {
  getAll: async () => {
    await delay();
    return getStored('icode_activities', INITIAL_ACTIVITIES);
  },
  create: async (form, teacherId) => {
    await delay();
    const activities = getStored('icode_activities', INITIAL_ACTIVITIES);

    const newId = `act-${Date.now()}`;
    const newActivity = {
      id: newId,
      title: form.title.trim(),
      description: form.description.trim(),
      photoPreset: form.photoPreset || 'math',
      customPhoto: form.customPhoto || null,
      date: form.date || new Date().toISOString().split('T')[0],
      studentId: form.studentId,
      classroomId: form.classroomId,
      teacherId: teacherId || 't-1'
    };

    const updatedActivities = [newActivity, ...activities];
    setStored('icode_activities', updatedActivities);

    return { activity: newActivity, activities: updatedActivities };
  },
  delete: async (id) => {
    await delay();
    const activities = getStored('icode_activities', INITIAL_ACTIVITIES);
    const updatedActivities = activities.filter(act => act.id !== id);

    setStored('icode_activities', updatedActivities);

    return { activities: updatedActivities };
  }
};
