import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Avatar } from '../../components/Avatar';
import { formatDate } from '../../utils/formatDate';
import {
  Users,
  UserCheck,
  GraduationCap,
  School,
  Activity,
  ArrowRight,
  TrendingUp,
  Mail
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard = () => {
  const { teachers, parents, students, classrooms, activities, mailReceipts } = useApp();
  const navigate = useNavigate();

  // Metrics Calculations
  const totalTeachers = teachers.length;
  const totalParents = parents.length;
  const totalStudents = students.length;
  const totalClassrooms = classrooms.length;

  // Custom Chart Data: 1. Student Gender Breakdown
  const maleCount = students.filter(s => s.gender === 'Male').length;
  const femaleCount = students.filter(s => s.gender === 'Female').length;
  const otherCount = students.filter(s => s.gender === 'Other').length;
  const totalGenders = Math.max(1, maleCount + femaleCount + otherCount);
  
  const malePercentage = Math.round((maleCount / totalGenders) * 100);
  const femalePercentage = Math.round((femaleCount / totalGenders) * 100);
  const otherPercentage = Math.round((otherCount / totalGenders) * 100);

  // Custom Chart Data: 2. Classroom Enrollment Capacities (Bar chart)
  const classroomChartData = classrooms.map(cls => {
    const studentsInClass = students.filter(s => s.classroomId === cls.id).length;
    const fillPercent = Math.min(100, Math.round((studentsInClass / cls.capacity) * 100));
    return {
      name: `${cls.name}-${cls.section}`,
      students: studentsInClass,
      capacity: cls.capacity,
      percent: fillPercent
    };
  });

  return (
    <div className="flex flex-col gap-8 font-sans w-full">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-2 relative z-10 text-center md:text-left">
          <Badge variant="blue" className="text-[9px] w-max mx-auto md:mx-0">
            System Operational
          </Badge>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Welcome, Administrator!
          </h1>
          <p className="text-slate-400 text-xs md:text-sm max-w-md">
            Manage classrooms, track student progress, register family accounts, and oversee all academy operations.
          </p>
        </div>

        <div className="flex items-center gap-4 relative z-10 bg-slate-900/60 backdrop-blur-md p-4.5 rounded-2xl border border-slate-800">
          <TrendingUp className="text-blue-400" size={32} />
          <div className="flex flex-col text-left">
            <span className="text-xs text-gray-400 font-semibold uppercase">Email Alerts Sent</span>
            <span className="text-2xl font-black text-white leading-tight">
              {mailReceipts.length}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4 CORE KPI METRIC CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Teachers metric */}
        <Card
          title={String(totalTeachers)}
          subtitle="Total Teachers"
          icon={Users}
          glow
          glowColor="indigo"
          className="cursor-pointer"
          onClick={() => navigate('/admin/teachers')}
        >
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold mt-4">
            <span>View Teachers</span>
            <ArrowRight size={14} className="text-blue-500" />
          </div>
        </Card>

        {/* Parents metric */}
        <Card
          title={String(totalParents)}
          subtitle="Registered Parents"
          icon={UserCheck}
          glow
          glowColor="emerald"
          className="cursor-pointer"
          onClick={() => navigate('/admin/parents')}
        >
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold mt-4">
            <span>View Parents</span>
            <ArrowRight size={14} className="text-emerald-500" />
          </div>
        </Card>

        {/* Students metric */}
        <Card
          title={String(totalStudents)}
          subtitle="Total Students Enrolled"
          icon={GraduationCap}
          glow
          glowColor="rose"
          className="cursor-pointer"
          onClick={() => navigate('/admin/classrooms')}
        >
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold mt-4">
            <span>View Classrooms</span>
            <ArrowRight size={14} className="text-rose-500" />
          </div>
        </Card>

        {/* Classrooms metric */}
        <Card
          title={String(totalClassrooms)}
          subtitle="Active Classrooms"
          icon={School}
          glow
          glowColor="amber"
          className="cursor-pointer"
          onClick={() => navigate('/admin/classrooms')}
        >
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold mt-4">
            <span>Manage Classrooms</span>
            <ArrowRight size={14} className="text-amber-500" />
          </div>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE CUSTOM SVG GRAPHICS SECTION */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Custom Bar Chart: Classroom Capacity vs Students */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div className="flex flex-col gap-1 mb-6">
            <h3 className="font-extrabold text-gray-800 text-sm">Classroom Enrollment Overview</h3>
            <p className="text-[11px] text-gray-400">Current student count vs. total seat capacity per classroom.</p>
          </div>

          <div className="flex flex-col gap-5 flex-grow justify-center">
            {classroomChartData.map((data, index) => (
              <div key={index} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-700 font-bold">{data.name}</span>
                  <span className="text-gray-500">
                    {data.students} / {data.capacity} students ({data.percent}%)
                  </span>
                </div>
                
                {/* Horizontal Progress Bar */}
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden relative">
                  <div
                    style={{ width: `${data.percent}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      data.percent > 90
                        ? 'bg-rose-600'
                        : data.percent > 70
                        ? 'bg-amber-500'
                        : 'bg-blue-600'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Circular Donut Chart: Gender Distribution */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col gap-1 mb-4">
            <h3 className="font-extrabold text-gray-800 text-sm">Student Gender Distribution</h3>
            <p className="text-[11px] text-gray-400">Gender breakdown across all enrolled students.</p>
          </div>

          {/* SVG Circular Ring */}
          <div className="flex items-center justify-center py-4 relative flex-grow">
            <svg width="150" height="150" viewBox="0 0 42 42" className="transform -rotate-90">
              {/* Slate backing track */}
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--color-bg-track, #f1f5f9)" strokeWidth="4.5" />
              
              {/* Male segment: blue */}
              <circle
                cx="21"
                cy="21"
                r="15.915"
                fill="transparent"
                stroke="#3b82f6"
                strokeWidth="4.8"
                strokeDasharray={`${malePercentage} ${100 - malePercentage}`}
                strokeDashoffset="0"
                className="transition-all duration-500"
              />

              {/* Female segment: pink */}
              <circle
                cx="21"
                cy="21"
                r="15.915"
                fill="transparent"
                stroke="#ec4899"
                strokeWidth="4.8"
                strokeDasharray={`${femalePercentage} ${100 - femalePercentage}`}
                strokeDashoffset={-malePercentage}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-black">{totalStudents}</span>
              <span className="text-[9px] uppercase font-bold text-gray-400">Students</span>
            </div>
          </div>

          {/* Legend Table */}
          <div className="flex flex-col gap-2.5 mt-4">
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-gray-600">Male</span>
              </div>
              <span className="font-extrabold">{maleCount} ({malePercentage}%)</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                <span className="text-gray-600">Female</span>
              </div>
              <span className="font-extrabold">{femaleCount} ({femalePercentage}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RECENT DISPATCHED NOTIFICATIONS & SCHOOL UPDATES TIMELINE */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Simulated Activities Feed */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex flex-col gap-0.5">
              <h3 className="font-extrabold text-gray-800 text-sm">Recent Student Activities</h3>
              <p className="text-[10px] text-gray-400">Latest activity logs submitted by teachers.</p>
            </div>
            <button
              onClick={() => navigate('/admin/classrooms')}
              className="text-xs font-bold text-blue-600 hover:text-blue-500 flex items-center gap-1 cursor-pointer"
            >
              View all classrooms <ArrowRight size={12} />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {activities.slice(0, 3).map((act, index) => {
              const matchedStudent = students.find(s => s.id === act.studentId);
              const matchedTeacher = teachers.find(t => t.id === act.teacherId);
              return (
                <div
                  key={act.id}
                  className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-2xl border border-gray-100 transition-colors"
                >
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-500">
                    <Activity size={18} />
                  </div>
                  <div className="flex-grow flex flex-col gap-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-xs text-gray-800">
                        {act.title}
                      </span>
                      <span className="text-[9px] text-gray-400 font-semibold whitespace-nowrap">
                        {formatDate(act.date)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {act.description}
                    </p>
                    <div className="flex items-center gap-2.5 mt-2">
                      <Avatar name={matchedStudent?.name || 'Student'} size="sm" className="w-5 h-5 text-[8px]" />
                      <span className="text-[10px] text-gray-400 font-semibold">
                        Student: <b className="text-gray-700 font-bold">{matchedStudent?.name}</b>
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="text-[10px] text-gray-400 font-semibold">
                        Teacher: <b className="text-gray-700 font-bold">{matchedTeacher?.name}</b>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Outbox Mail Bell summaries */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col gap-1 mb-4">
            <h3 className="font-extrabold text-gray-800 text-sm">Email Notifications Sent</h3>
            <p className="text-[11px] text-gray-400">Email alerts dispatched to parents after activity submissions.</p>
          </div>

          <div className="flex-grow overflow-y-auto flex flex-col gap-3.5 py-2 max-h-[220px]">
            {mailReceipts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center gap-2 h-full text-slate-400 py-6">
                <Mail size={22} className="text-gray-300" />
                <p className="text-[10px] font-bold">No notifications yet</p>
                <p className="text-[9px] text-gray-400 max-w-[160px]">
                  Email notifications will appear here after teachers submit student activities.
                </p>
              </div>
            ) : (
              mailReceipts.slice(0, 3).map((rcpt) => (
                <div
                  key={rcpt.id}
                  className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between text-[8px] font-bold">
                    <span className="text-gray-400">To: {rcpt.parentName}</span>
                    <Badge variant="blue" className="px-1 py-0 border-none scale-90">
                      Delivered
                    </Badge>
                  </div>
                  <p className="text-[10px] font-extrabold text-gray-700 truncate">
                    {rcpt.subject}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
