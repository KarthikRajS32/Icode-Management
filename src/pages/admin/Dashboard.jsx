import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../../components/Badge';
import { Avatar } from '../../components/Avatar';
import { formatDate } from '../../utils/formatDate';
import {
  Users, UserCheck, GraduationCap, School, Activity,
  ArrowRight, Mail, Calendar, Search, TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const KPICard = ({ label, value, icon: Icon, iconBg, iconColor, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-350 transition-all duration-200 cursor-pointer flex items-center justify-between h-28 group"
  >
    <div className="flex flex-col">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-3xl font-black text-slate-800 tracking-tight mt-1">{value}</span>
    </div>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} ${iconColor} ring-1 ring-inset ring-black/5 flex-shrink-0`}>
      <Icon size={18} />
    </div>
  </div>
);

export const AdminDashboard = () => {
  const { teachers, parents, students, classrooms, activities, mailReceipts, classroomStudents } = useApp();
  const navigate = useNavigate();

  const [timePeriod, setTimePeriod] = useState('term');
  const [activityFilter, setActivityFilter] = useState('All');
  const [emailSearch, setEmailSearch] = useState('');
  const [hoveredGender, setHoveredGender] = useState(null);

  const totalTeachers = teachers.length;
  const totalParents = parents.length;
  const totalStudents = students.length;
  const totalClassrooms = classrooms.length;

  const maleCount = students.filter(s => s.gender === 'Male').length;
  const femaleCount = students.filter(s => s.gender === 'Female').length;
  const totalGenders = Math.max(1, maleCount + femaleCount);
  const malePercentage = Math.round((maleCount / totalGenders) * 100);
  const femalePercentage = Math.round((femaleCount / totalGenders) * 100);

  const classroomChartData = classrooms.map(cls => {
    const studentsInClass = classroomStudents.filter(cs => cs.classroomId === cls.id).length;
    const fillPercent = Math.min(100, Math.round((studentsInClass / cls.capacity) * 100));
    let status = 'Available'; let statusColor = 'emerald';
    if (fillPercent >= 100) { status = 'Full'; statusColor = 'red'; }
    else if (fillPercent >= 80) { status = 'Optimal'; statusColor = 'amber'; }
    const assignedTeacher = teachers.find(t => t.id === cls.teacherId);
    return { id: cls.id, name: `${cls.name}-${cls.section}`, students: studentsInClass, capacity: cls.capacity, percent: fillPercent, status, statusColor, teacher: assignedTeacher ? assignedTeacher.name : 'Unassigned' };
  });

  const filteredActivities = activities.filter(act => {
    if (activityFilter === 'All') return true;
    const categoryMap = {
      Academics: ['math', 'science', 'reading', 'logic', 'homework', 'exam', 'quiz', 'scale model'],
      Attendance: ['absent', 'late', 'present', 'arrived', 'checked out', 'attendance'],
      Behavior: ['share', 'cooperated', 'helped', 'argument', 'distracted', 'focused', 'leadership']
    };
    const searchStr = `${act.title} ${act.description} ${act.photoPreset}`.toLowerCase();
    return (categoryMap[activityFilter] || []).some(k => searchStr.includes(k));
  });

  const filteredEmails = mailReceipts.filter(mail => {
    if (!emailSearch) return true;
    const term = emailSearch.toLowerCase();
    return mail.parentName?.toLowerCase().includes(term) || mail.subject?.toLowerCase().includes(term) || mail.parentEmail?.toLowerCase().includes(term);
  });

  return (
    <div className="flex flex-col gap-6 w-full font-sans animate-fade-in">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Academy Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">Welcome back — here's what's happening at ICode Academy.</p>
        </div>
        {/* <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-600">
            <Calendar className="text-blue-600" size={13} />
            {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold outline-none text-slate-700 shadow-sm transition-colors cursor-pointer hover:border-slate-300"
          >
            <option value="term">Current Term</option>
            <option value="year">Academic Year</option>
          </select>
        </div> */}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Teachers" value={totalTeachers} icon={Users} iconBg="bg-blue-50" iconColor="text-blue-600"
          onClick={() => navigate('/admin/teachers')} />
        <KPICard label="Parents" value={totalParents} icon={UserCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600"
          onClick={() => navigate('/admin/parents')} />
        <KPICard label="Students" value={totalStudents} icon={GraduationCap} iconBg="bg-violet-50" iconColor="text-blue-600"
          onClick={() => navigate('/admin/classrooms')} />
        <KPICard label="Classrooms" value={totalClassrooms} icon={School} iconBg="bg-amber-50" iconColor="text-amber-600"
          onClick={() => navigate('/admin/classrooms')} />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Classroom capacity panel */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm lg:col-span-2 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-100">
            <div>
              <p className="font-bold text-slate-800 text-sm">Classroom Enrollment Load</p>
              <p className="text-xs text-slate-500 mt-0.5">Track student capacity and allocations per classroom.</p>
            </div>
            <button onClick={() => navigate('/admin/classrooms')} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer whitespace-nowrap">
              Manage <ArrowRight size={12} />
            </button>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-80">
            {classroomChartData.length === 0 ? (
              <div className="col-span-2 flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                <School size={24} className="text-slate-300" />
                <p className="text-sm font-medium text-slate-400">No classrooms configured yet.</p>
              </div>
            ) : classroomChartData.map(data => (
              <div key={data.id} onClick={() => navigate(`/admin/classrooms/${data.id}`)}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between hover:border-slate-300 hover:bg-white transition-all cursor-pointer shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{data.name}</h4>
                    <span className="text-[11px] text-slate-500 font-medium">{data.teacher}</span>
                  </div>
                  <Badge variant={data.statusColor} className="text-[10px]">{data.status}</Badge>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span>{data.students} / {data.capacity} Enrolled</span>
                    <span className="font-bold text-slate-700">{data.percent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div style={{ width: `${data.percent}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${data.percent >= 100 ? 'bg-red-500' : data.percent >= 80 ? 'bg-amber-500' : 'bg-blue-600'}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gender donut */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="font-bold text-slate-800 text-sm">Student Demographics</p>
            <p className="text-xs text-slate-500 mt-0.5">Gender breakdown across all active accounts.</p>
          </div>
          <div className="flex-grow flex flex-col items-center justify-center p-5">
            <div className="relative flex items-center justify-center my-2">
              <svg width="150" height="150" viewBox="0 0 42 42" className="transform -rotate-90">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#e2e8f0" strokeWidth="4" />
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#2563eb" strokeWidth={hoveredGender === 'Male' ? '5.2' : '4'}
                  strokeDasharray={`${malePercentage} ${100 - malePercentage}`} strokeDashoffset="0"
                  className="transition-all duration-300 cursor-pointer"
                  style={{ opacity: hoveredGender && hoveredGender !== 'Male' ? 0.35 : 1 }}
                  onMouseEnter={() => setHoveredGender('Male')} onMouseLeave={() => setHoveredGender(null)} />
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#db2777" strokeWidth={hoveredGender === 'Female' ? '5.2' : '4'}
                  strokeDasharray={`${femalePercentage} ${100 - femalePercentage}`} strokeDashoffset={-malePercentage}
                  className="transition-all duration-300 cursor-pointer"
                  style={{ opacity: hoveredGender && hoveredGender !== 'Female' ? 0.35 : 1 }}
                  onMouseEnter={() => setHoveredGender('Female')} onMouseLeave={() => setHoveredGender(null)} />
              </svg>
              <div className="absolute flex flex-col items-center pointer-events-none">
                {hoveredGender ? (
                  <>
                    <span className={`text-xl font-black ${hoveredGender === 'Male' ? 'text-blue-600' : 'text-pink-600'}`}>
                      {hoveredGender === 'Male' ? malePercentage : femalePercentage}%
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">{hoveredGender}</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl font-black text-slate-800">{totalStudents}</span>
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Total</span>
                  </>
                )}
              </div>
            </div>
            <div className="w-full flex flex-col gap-2 mt-3 pt-4 border-t border-slate-100">
              <div className={`flex items-center justify-between text-xs px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${hoveredGender === 'Male' ? 'border-blue-200 bg-blue-50 text-blue-700 font-semibold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                onMouseEnter={() => setHoveredGender('Male')} onMouseLeave={() => setHoveredGender(null)}>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0" /><span className="font-medium">Male Students</span></div>
                <span className="font-bold">{maleCount}</span>
              </div>
              <div className={`flex items-center justify-between text-xs px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${hoveredGender === 'Female' ? 'border-pink-200 bg-pink-50 text-pink-700 font-semibold' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                onMouseEnter={() => setHoveredGender('Female')} onMouseLeave={() => setHoveredGender(null)}>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-pink-600 flex-shrink-0" /><span className="font-medium">Female Students</span></div>
                <span className="font-bold">{femaleCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Activity feed */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm lg:col-span-2 flex flex-col overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
            <div>
              <p className="font-bold text-slate-800 text-sm">Student Activity Feed</p>
              <p className="text-xs text-slate-500 mt-0.5">Latest updates logged by faculty instructors.</p>
            </div>
            <div className="flex items-center gap-1.5">
              {['All', 'Academics', 'Attendance', 'Behavior'].map(pill => (
                <button key={pill} onClick={() => setActivityFilter(pill)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer border ${activityFilter === pill ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'}`}>
                  {pill}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 flex flex-col gap-0 overflow-y-auto max-h-80">
            {filteredActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center gap-2 py-12 text-slate-400">
                <Activity size={22} className="text-slate-300" />
                <p className="text-sm font-medium text-slate-400">No activities match this filter.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 relative before:content-[''] before:absolute before:left-4 before:top-3 before:bottom-3 before:w-px before:bg-slate-100">
                {filteredActivities.slice(0, 5).map(act => {
                  const matchedStudent = students.find(s => s.id === act.studentId);
                  const matchedTeacher = teachers.find(t => t.id === act.teacherId);
                  return (
                    <div key={act.id} className="relative pl-9">
                      <div className="absolute left-[13px] top-2 w-2.5 h-2.5 rounded-full border-2 border-blue-500 bg-white" />
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-white transition-all">
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                          <span className="font-bold text-xs text-slate-800 leading-snug">{act.title}</span>
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{formatDate(act.date)}</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-1 mb-2">{act.description}</p>
                        <div className="flex items-center gap-3 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <Avatar name={matchedStudent?.name || 'Student'} size="sm" className="w-5 h-5 text-[8px]" />
                            <span className="font-semibold text-slate-700">{matchedStudent?.name}</span>
                          </div>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-500">by <b className="font-semibold text-slate-600">{matchedTeacher?.name || 'Staff'}</b></span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Showing {Math.min(5, filteredActivities.length)} of {filteredActivities.length} entries</span>
            <button onClick={() => navigate('/admin/classrooms')} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer">
              View Classrooms <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Email logs */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="font-bold text-slate-800 text-sm">Dispatched Email Alerts</p>
            <p className="text-xs text-slate-500 mt-0.5">Activity notifications sent to parent accounts.</p>
          </div>
          <div className="p-4 border-b border-slate-100">
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-slate-400 pointer-events-none" size={13} />
              <input type="text" placeholder="Search by parent name..." value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 bg-white placeholder-slate-400 outline-none text-xs font-medium text-slate-700 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          <div className="flex-grow overflow-y-auto flex flex-col gap-2 p-4 max-h-64">
            {filteredEmails.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center gap-2 h-full text-slate-400 py-8">
                <Mail size={20} className="text-slate-300" />
                <p className="text-xs font-medium text-slate-400">No mail receipts yet.</p>
              </div>
            ) : (
              filteredEmails.slice(0, 5).map(mail => (
                <div key={mail.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3 hover:border-slate-300 hover:bg-white transition-all">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg flex-shrink-0 mt-0.5 ring-1 ring-blue-100">
                    <Mail size={13} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-0.5">
                      <span className="text-xs font-bold text-slate-700 truncate">{mail.parentName}</span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md flex-shrink-0 ring-1 ring-emerald-100">Sent</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate font-medium">{mail.subject}</p>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
                      {new Date(mail.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">{filteredEmails.length} alerts total</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-slate-500 font-medium">Active</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
