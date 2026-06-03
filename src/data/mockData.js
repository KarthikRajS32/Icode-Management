// Seed data for ICode Management System (2-Role Refactored)

export const INITIAL_TEACHERS = [
  {
    id: 't-1',
    name: 'Sarah Connor',
    email: 'teacher@gmail.com', // Linked to default teacher credential
    phone: '+1 (555) 019-2834',
    subject: 'Mathematics',
  },
  {
    id: 't-2',
    name: 'David Miller',
    email: 'david.miller@icode.edu',
    phone: '+1 (555) 014-9988',
    subject: 'Science & Physics',
  },
  {
    id: 't-3',
    name: 'Elena Rostova',
    email: 'elena.rostova@icode.edu',
    phone: '+1 (555) 012-7744',
    subject: 'English & Literature',
  },
  {
    id: 't-4',
    name: 'Marcus Vance',
    email: 'marcus.vance@icode.edu',
    phone: '+1 (555) 017-3311',
    subject: 'Creative Fine Arts',
  }
];

export const INITIAL_PARENTS = [
  {
    id: 'p-1',
    name: 'John Doe Senior',
    email: 'john.doe@gmail.com',
    phone: '+1 (555) 011-2233',
    address: '742 Evergreen Terrace, Springfield',
    childName: 'Alex Doe',
    childAge: 10,
    childGender: 'Male',
    childId: 's-1'
  },
  {
    id: 'p-2',
    name: 'Robert Smith',
    email: 'robert.smith@gmail.com',
    phone: '+1 (555) 015-6677',
    address: '128 Pinecrest Avenue, Riverdale',
    childName: 'Emily Smith',
    childAge: 10,
    childGender: 'Female',
    childId: 's-2'
  },
  {
    id: 'p-3',
    name: 'Grace Miller',
    email: 'grace.miller@gmail.com',
    phone: '+1 (555) 019-8899',
    address: '404 Oakwood Lane, Gotham',
    childName: 'Jack Miller',
    childAge: 11,
    childGender: 'Male',
    childId: 's-3'
  },
  {
    id: 'p-4',
    name: 'Sophia Lopez',
    email: 'sophia.lopez@gmail.com',
    phone: '+1 (555) 021-3344',
    address: '902 Beverly Boulevard, Los Angeles',
    childName: 'Isabella Lopez',
    childAge: 12,
    childGender: 'Female',
    childId: 's-4'
  }
];

export const INITIAL_CLASSROOMS = [
  {
    id: 'c-1',
    name: 'Grade 5',
    section: 'A',
    capacity: 25,
    teacherId: 't-1', // Assigned to Sarah Connor
  },
  {
    id: 'c-2',
    name: 'Grade 6',
    section: 'B',
    capacity: 20,
    teacherId: 't-2', // Assigned to David Miller
  },
  {
    id: 'c-3',
    name: 'Grade 7',
    section: 'A',
    capacity: 30,
    teacherId: 't-3', // Assigned to Elena Rostova
  },
  {
    id: 'c-4',
    name: 'Grade 8',
    section: 'C',
    capacity: 28,
    teacherId: null, // Unassigned
  }
];

export const INITIAL_STUDENTS = [
  {
    id: 's-1',
    name: 'Alex Doe',
    age: 10,
    gender: 'Male',
    parentId: 'p-1',
    parentName: 'John Doe Senior',
    parentEmail: 'john.doe@gmail.com'
  },
  {
    id: 's-2',
    name: 'Emily Smith',
    age: 10,
    gender: 'Female',
    parentId: 'p-2',
    parentName: 'Robert Smith',
    parentEmail: 'robert.smith@gmail.com'
  },
  {
    id: 's-3',
    name: 'Jack Miller',
    age: 11,
    gender: 'Male',
    parentId: 'p-3',
    parentName: 'Grace Miller',
    parentEmail: 'grace.miller@gmail.com'
  },
  {
    id: 's-4',
    name: 'Isabella Lopez',
    age: 12,
    gender: 'Female',
    parentId: 'p-4',
    parentName: 'Sophia Lopez',
    parentEmail: 'sophia.lopez@gmail.com'
  },
  {
    id: 's-5',
    name: 'Ryan Doe',
    age: 10,
    gender: 'Male',
    parentId: 'p-1',
    parentName: 'John Doe Senior',
    parentEmail: 'john.doe@gmail.com'
  }
];

export const INITIAL_CLASSROOM_STUDENTS = [
  { studentId: 's-1', classroomId: 'c-1' },
  { studentId: 's-2', classroomId: 'c-1' },
  { studentId: 's-3', classroomId: 'c-2' },
  { studentId: 's-4', classroomId: 'c-3' }
];

export const INITIAL_ACTIVITIES = [
  {
    id: 'act-1',
    title: 'Math Puzzle Championship',
    description: 'Alex solved the complex multi-digit multiplication puzzle in under 2 minutes today! He demonstrated exceptional analytical capabilities and supported his peers during group problem-solving.',
    photoPreset: 'math',
    date: '2026-05-28',
    studentId: 's-1',
    classroomId: 'c-1',
    teacherId: 't-1',
  },
  {
    id: 'act-2',
    title: 'Solar System Scale Model',
    description: 'Jack took the lead in constructing the Papier-Mâché replica of Jupiter today. He successfully explained the gas composition and relative size ratio to the entire class. Stellar teamwork!',
    photoPreset: 'science',
    date: '2026-05-29',
    studentId: 's-3',
    classroomId: 'c-2',
    teacherId: 't-2',
  },
  {
    id: 'act-3',
    title: 'Acrylic Landscape Painting',
    description: 'Emily demonstrated wonderful depth and color mixing skills in her sunset canvas painting. She practiced patience and precision with detail brushes. A beautiful masterpiece!',
    photoPreset: 'art',
    date: '2026-05-29',
    studentId: 's-2',
    classroomId: 'c-1',
    teacherId: 't-1',
  },
  {
    id: 'act-4',
    title: 'Word Wizard Reading Challenge',
    description: 'Alex read three chapters of his library adventure book aloud today. His pronunciation of complex vocabulary is improving significantly, and his expression brings the characters to life!',
    photoPreset: 'reading',
    date: '2026-05-29',
    studentId: 's-1',
    classroomId: 'c-1',
    teacherId: 't-1',
  }
];

export const ACTIVITY_PHOTO_PRESETS = [
  {
    id: 'math',
    label: 'Math & Logic',
    url: 'https://images.unsplash.com/photo-1453733190148-c44698c26588?auto=format&fit=crop&q=80&w=600',
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'science',
    label: 'Science & Lab',
    url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=600',
    color: 'from-teal-500 to-emerald-600'
  },
  {
    id: 'art',
    label: 'Art & Design',
    url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=600',
    color: 'from-pink-500 to-rose-600'
  },
  {
    id: 'reading',
    label: 'Reading & Literacy',
    url: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'sports',
    label: 'Sports & Play',
    url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600',
    color: 'from-purple-500 to-violet-600'
  }
];
