import React from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../../components/Badge';
import { School, Users, ArrowRight, GraduationCap, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TeacherClassrooms = () => {
  const { currentUser, classrooms, students, classroomStudents } = useApp();
  const navigate = useNavigate();

  const teacherId = currentUser?.associatedId || 't-1';
  const assignedClassrooms = classrooms.filter(c => c.teacherId === teacherId);

  const handleOpenClassroom = (classroomId) => { navigate(`/teacher/activities?classroomId=${classroomId}`); };

  const totalStudents = classroomStudents.filter(cs => assignedClassrooms.some(c => c.id === cs.classroomId)).length;
  const totalCapacity = assignedClassrooms.reduce((sum, c) => sum + c.capacity, 0);

  return (
    <div className="flex flex-col gap-6 w-full font-sans animate-fade-in">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">My Classrooms</h1>
          <p className="text-sm text-slate-500 mt-0.5">Monitor your assigned learning groups and log student activities.</p>
        </div>
      </div>

      {/* Stats */}
      {assignedClassrooms.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Assigned Classes', value: assignedClassrooms.length, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Total Students', value: totalStudents, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Total Capacity', value: totalCapacity, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-5 py-8 shadow-sm flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                <School size={14} className={stat.color} />
              </div>
              <div>
                <p className="text-lg font-black text-slate-800 leading-none">{stat.value}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid or empty state */}
      {assignedClassrooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center gap-4 p-16 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
            <Inbox size={28} className="text-slate-300" />
          </div>
          <div>
            <h3 className="font-bold text-slate-700 text-base">No Classrooms Assigned</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm leading-relaxed">Contact the system administrator to request classroom assignments.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignedClassrooms.map(cls => {
            const classStudents = students.filter(s => classroomStudents.some(cs => cs.studentId === s.id && cs.classroomId === cls.id));
            const enrolledCount = classStudents.length;
            const fillPercent = Math.min(100, Math.round((enrolledCount / cls.capacity) * 100));

            let statusLabel = 'Available'; let badgeVariant = 'emerald';
            let barColor = 'bg-blue-600'; let iconBg = 'bg-emerald-50'; let iconColor = 'text-emerald-600';
            if (fillPercent >= 100) { statusLabel = 'Full'; badgeVariant = 'red'; barColor = 'bg-red-500'; iconBg = 'bg-red-50'; iconColor = 'text-red-600'; }
            else if (fillPercent >= 80) { statusLabel = 'Near Capacity'; badgeVariant = 'amber'; barColor = 'bg-amber-500'; iconBg = 'bg-amber-50'; iconColor = 'text-amber-600'; }

            return (
              <div key={cls.id} onClick={() => handleOpenClassroom(cls.id)}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col gap-4">

                <div className="flex justify-between items-start">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} ring-1 ring-inset ring-black/5`}>
                    <School size={18} className={iconColor} />
                  </div>
                  <Badge variant={badgeVariant} className="text-[10px]">{statusLabel}</Badge>
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-slate-800 text-base">{cls.name} — {cls.section}</h3>
                  <span className="text-xs text-slate-500 font-medium">Capacity: {cls.capacity} seats</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1"><Users size={11} /> {enrolledCount} enrolled</span>
                    <span className="font-bold text-slate-600 tabular-nums">{fillPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div style={{ width: `${fillPercent}%` }} className={`h-full rounded-full transition-all duration-500 ${barColor}`} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                  <span className="flex items-center gap-1.5"><GraduationCap size={12} /> Log Student Activities</span>
                  <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
