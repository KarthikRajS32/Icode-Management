import { useApp } from '../../context/AppContext';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { formatDate } from '../../utils/formatDate';
import {
  School,
  Users,
  ClipboardCheck,
  Activity,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TeacherDashboard = () => {
  const { currentUser, classrooms, students, activities } = useApp();
  const navigate = useNavigate();

  // 1. Calculate assigned classrooms
  const teacherId = currentUser?.associatedId || 't-1';
  const assignedClassrooms = classrooms.filter(c => c.teacherId === teacherId);
  const assignedClassroomIds = assignedClassrooms.map(c => c.id);

  // 2. Calculate students in these classrooms
  const teacherStudents = students.filter(s => assignedClassroomIds.includes(s.classroomId));
  const totalStudents = teacherStudents.length;

  // 3. Today's activities logged by this teacher
  const todayStr = new Date().toISOString().split('T')[0];
  const teacherActivities = activities.filter(act => act.teacherId === teacherId);
  const todaysActivities = teacherActivities.filter(act => act.date === todayStr).length;

  // 4. Custom SVG Analytics: Activity types logged by this teacher
  const mathAct = teacherActivities.filter(act => act.photoPreset === 'math').length;
  const scienceAct = teacherActivities.filter(act => act.photoPreset === 'science').length;
  const artAct = teacherActivities.filter(act => act.photoPreset === 'art').length;
  const readingAct = teacherActivities.filter(act => act.photoPreset === 'reading').length;
  
  const totalActivities = Math.max(1, teacherActivities.length);
  const mathPct = Math.round((mathAct / totalActivities) * 100);
  const sciencePct = Math.round((scienceAct / totalActivities) * 100);
  const artPct = Math.round((artAct / totalActivities) * 100);
  const readingPct = Math.round((readingAct / totalActivities) * 100);

  return (
    <div className="flex flex-col gap-8 font-sans w-full">
      
      {/* Dynamic Welcome Jumbotron */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-2 relative z-10 text-center md:text-left">
          <Badge variant="emerald" className="text-[9px] w-max mx-auto md:mx-0">
            Active
          </Badge>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Welcome back, {currentUser?.name || 'Teacher'}!
          </h1>
          <p className="text-slate-400 text-xs md:text-sm max-w-md">
            Review your assigned classrooms, monitor student progress, and log today's activities.
          </p>
        </div>

        <Button
          variant="glass"
          onClick={() => navigate('/teacher/activities')}
          className="relative z-10 rounded-xl flex items-center gap-2 font-bold"
        >
          <Plus size={16} /> Log Activity
        </Button>
      </div>

      {/* KPI stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card
          title={String(assignedClassrooms.length)}
          subtitle="My Classrooms"
          icon={School}
          glow
          glowColor="emerald"
          className="cursor-pointer"
          onClick={() => navigate('/teacher/classrooms')}
        >
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold mt-4">
            <span>View Classrooms</span>
            <ArrowRight size={14} className="text-emerald-500" />
          </div>
        </Card>

        <Card
          title={String(totalStudents)}
          subtitle="Students in My Classes"
          icon={Users}
          glow
          glowColor="blue"
          className="cursor-pointer"
          onClick={() => navigate('/teacher/classrooms')}
        >
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold mt-4">
            <span>View Students</span>
            <ArrowRight size={14} className="text-blue-500" />
          </div>
        </Card>

        <Card
          title={String(todaysActivities)}
          subtitle="Activities Logged Today"
          icon={ClipboardCheck}
          glow
          glowColor="rose"
          className="cursor-pointer"
          onClick={() => navigate('/teacher/activities')}
        >
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold mt-4">
            <span>Log Activity</span>
            <ArrowRight size={14} className="text-rose-500" />
          </div>
        </Card>
      </div>

      {/* Analytics Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Custom Progress bar listing for logged activities */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div className="flex flex-col gap-0.5 mb-6">
            <h3 className="font-extrabold text-gray-800 text-sm">Activity Category Breakdown</h3>
            <p className="text-[10px] text-gray-400">Distribution of activity types you have logged across all students.</p>
          </div>

          <div className="flex flex-col gap-4.5 flex-grow justify-center">
            {/* Math */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-600">Mathematics & Logic</span>
                <span>{mathAct} {mathAct === 1 ? 'log' : 'logs'} ({mathPct}%)</span>
              </div>
              <div className="w-full h-2.5 bg-gray-50 rounded-full overflow-hidden">
                <div style={{ width: `${mathPct}%` }} className="h-full rounded-full bg-amber-500 shadow-sm" />
              </div>
            </div>

            {/* Science */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-600">Science & Lab Experiments</span>
                <span>{scienceAct} {scienceAct === 1 ? 'log' : 'logs'} ({sciencePct}%)</span>
              </div>
              <div className="w-full h-2.5 bg-gray-50 rounded-full overflow-hidden">
                <div style={{ width: `${sciencePct}%` }} className="h-full rounded-full bg-emerald-600 shadow-sm" />
              </div>
            </div>

            {/* Art */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-600">Art & Creative Expression</span>
                <span>{artAct} {artAct === 1 ? 'log' : 'logs'} ({artPct}%)</span>
              </div>
              <div className="w-full h-2.5 bg-gray-50 rounded-full overflow-hidden">
                <div style={{ width: `${artPct}%` }} className="h-full rounded-full bg-pink-500 shadow-sm" />
              </div>
            </div>

            {/* Reading */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-600">Reading & Literacy</span>
                <span>{readingAct} {readingAct === 1 ? 'log' : 'logs'} ({readingPct}%)</span>
              </div>
              <div className="w-full h-2.5 bg-gray-50 rounded-full overflow-hidden">
                <div style={{ width: `${readingPct}%` }} className="h-full rounded-full bg-blue-600 shadow-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Teacher logs summary timeline */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col gap-1 mb-4">
            <h3 className="font-extrabold text-gray-800 text-sm">Recent Activity Logs</h3>
            <p className="text-[11px] text-gray-400">Your most recently submitted student updates.</p>
          </div>

          <div className="flex-grow overflow-y-auto flex flex-col gap-3.5 max-h-[220px]">
            {teacherActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center gap-2 h-full text-gray-400 py-6">
                <Activity size={22} className="text-gray-300" />
                <p className="text-[10px] font-bold">No activities yet</p>
                <p className="text-[9px] text-gray-400 max-w-[150px] leading-relaxed">
                  Log student activities to see them appear here.
                </p>
              </div>
            ) : (
              teacherActivities.slice(0, 3).map((act) => {
                const student = students.find(s => s.id === act.studentId);
                return (
                  <div
                    key={act.id}
                    className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between text-[8px] font-bold">
                      <span className="text-gray-400">{formatDate(act.date)}</span>
                      <span className="text-emerald-600 font-bold">{student?.name || 'N/A'}</span>
                    </div>
                    <p className="text-[10px] font-extrabold text-gray-700 leading-tight">
                      {act.title}
                    </p>
                    <p className="text-[9px] text-gray-400 line-clamp-1 leading-normal">
                      {act.description}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
