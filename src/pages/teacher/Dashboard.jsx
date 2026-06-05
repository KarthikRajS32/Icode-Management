import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/Button';
import { Avatar } from '../../components/Avatar';
import { formatDate } from '../../utils/formatDate';
import { School, Users, ClipboardCheck, Activity, ArrowRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TeacherDashboard = () => {
  const { currentUser, classrooms, students, classroomStudents, activities } = useApp();
  const navigate = useNavigate();

  const teacherId = currentUser?.associatedId || 't-1';
  const assignedClassrooms = classrooms.filter(c => c.teacherId === teacherId);
  const assignedClassroomIds = assignedClassrooms.map(c => c.id);
  const teacherStudentIds = classroomStudents.filter(cs => assignedClassroomIds.includes(cs.classroomId)).map(cs => cs.studentId);
  const totalStudents = students.filter(s => teacherStudentIds.includes(s.id)).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const teacherActivities = activities.filter(act => act.teacherId === teacherId);
  const todaysActivities = teacherActivities.filter(act => act.date === todayStr).length;

  const mathAct = teacherActivities.filter(act => act.photoPreset === 'math').length;
  const scienceAct = teacherActivities.filter(act => act.photoPreset === 'science').length;
  const artAct = teacherActivities.filter(act => act.photoPreset === 'art').length;
  const readingAct = teacherActivities.filter(act => act.photoPreset === 'reading').length;
  const totalActivities = Math.max(1, teacherActivities.length);

  const subjectBreakdown = [
    { label: 'Mathematics & Logic', count: mathAct, pct: Math.round((mathAct / totalActivities) * 100), color: 'bg-blue-600' },
    { label: 'Science & Experiments', count: scienceAct, pct: Math.round((scienceAct / totalActivities) * 100), color: 'bg-emerald-600' },
    { label: 'Creative Expression & Art', count: artAct, pct: Math.round((artAct / totalActivities) * 100), color: 'bg-pink-600' },
    { label: 'Reading & Literacy', count: readingAct, pct: Math.round((readingAct / totalActivities) * 100), color: 'bg-amber-500' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full font-sans animate-fade-in">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Faculty Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Monitor your classrooms and record student learning outcomes.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/teacher/activities')} className="flex items-center gap-1.5">
          <Plus size={14} /> Log Activity
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div onClick={() => navigate('/teacher/classrooms')}
          className="bg-white border border-slate-200 rounded-xl p-5 py-8 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">My Classrooms</span>
              <p className="text-3xl font-black text-slate-800 mt-1.5">{assignedClassrooms.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center ring-1 ring-inset ring-blue-100">
              <School size={18} />
            </div>
          </div>
        </div>

        <div onClick={() => navigate('/teacher/classrooms')}
          className="bg-white border border-slate-200 rounded-xl p-5 py-8 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</span>
              <p className="text-3xl font-black text-slate-800 mt-1.5">{totalStudents}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-inset ring-emerald-100">
              <Users size={18} />
            </div>
          </div>
        </div>

        <div onClick={() => navigate('/teacher/activities')}
          className="bg-white border border-slate-200 rounded-xl p-5 py-8 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Logs</span>
              <p className="text-3xl font-black text-slate-800 mt-1.5">{todaysActivities}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center ring-1 ring-inset ring-amber-100">
              <ClipboardCheck size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Activity breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm lg:col-span-2 flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="font-bold text-slate-800 text-sm">Activity Breakdown</p>
            <p className="text-xs text-slate-500 mt-0.5">Distribution of activity logs recorded across subjects.</p>
          </div>
          <div className="p-5 flex flex-col gap-5">
            {subjectBreakdown.map(item => (
              <div key={item.label} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{item.label}</span>
                  <span className="font-bold text-slate-500 tabular-nums">{item.count} <span className="text-slate-400 font-medium">({item.pct}%)</span></span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div style={{ width: `${item.pct}%` }} className={`h-full rounded-full ${item.color} transition-all duration-700`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent logs */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="font-bold text-slate-800 text-sm">Recent Activity Logs</p>
            <p className="text-xs text-slate-500 mt-0.5">Your most recently submitted updates.</p>
          </div>
          <div className="flex-grow overflow-y-auto flex flex-col gap-2 p-4 max-h-64">
            {teacherActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center gap-2 h-full py-8 text-slate-400">
                <Activity size={20} className="text-slate-300" />
                <p className="text-xs font-medium text-slate-400">No activities logged yet.</p>
              </div>
            ) : (
              teacherActivities.slice(0, 4).map(act => {
                const student = students.find(s => s.id === act.studentId);
                return (
                  <div key={act.id} onClick={() => navigate('/teacher/activities')}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-1.5 hover:border-slate-300 hover:bg-white transition-all cursor-pointer">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-medium text-slate-400">{formatDate(act.date)}</span>
                      <span className="text-[10px] font-bold text-blue-600">{student?.name || 'N/A'}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 truncate">{act.title}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 leading-relaxed">{act.description}</p>
                  </div>
                );
              })
            )}
          </div>
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">{teacherActivities.length} total logs</span>
            <button onClick={() => navigate('/teacher/activities')} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer">
              View All <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
