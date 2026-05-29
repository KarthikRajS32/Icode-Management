import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { School, Users, ArrowRight, GraduationCap, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TeacherClassrooms = () => {
  const { currentUser, classrooms, students } = useApp();
  const navigate = useNavigate();

  // Filter classrooms assigned to this teacher
  const teacherId = currentUser?.associatedId || 't-1';
  const assignedClassrooms = classrooms.filter(c => c.teacherId === teacherId);

  const handleOpenClassroom = (classroomId) => {
    // Navigate to activities page pre-selecting this classroom ID
    navigate(`/teacher/activities?classroomId=${classroomId}`);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto font-sans">
      
      {/* Header Block */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
          My Classroom Assignments
        </h1>
        <p className="text-xs text-slate-400">
          Open assigned classes, check daily student lists, and publish student development updates.
        </p>
      </div>

      {/* Classroom grids */}
      {assignedClassrooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center gap-3 p-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl mt-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-full">
            <Inbox size={32} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-200">No Classroom Assigned</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
              You are not currently assigned to any active classrooms. Please contact the administrator to allocate classes.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
          {assignedClassrooms.map((cls) => {
            const classStudents = students.filter(s => s.classroomId === cls.id);
            const enrolledCount = classStudents.length;
            const fillPercent = Math.min(100, Math.round((enrolledCount / cls.capacity) * 100));

            return (
              <Card
                key={cls.id}
                title={`${cls.name} - ${cls.section}`}
                subtitle={`Seating Limit: ${cls.capacity}`}
                icon={School}
                glow
                glowColor={fillPercent > 90 ? 'rose' : fillPercent > 70 ? 'amber' : 'emerald'}
                className="cursor-pointer group hover:scale-[1.01] transition-all duration-300"
                onClick={() => handleOpenClassroom(cls.id)}
              >
                <div className="flex flex-col gap-4">
                  {/* Classroom statistics */}
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500">
                      <GraduationCap size={15} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase leading-none">Class Roster size</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                        {enrolledCount} Active Students
                      </span>
                    </div>
                  </div>

                  {/* Seat progression */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Users size={12} /> Seats load
                      </span>
                      <span className={`${
                        fillPercent > 90
                          ? 'text-rose-500'
                          : fillPercent > 70
                          ? 'text-orange-500'
                          : 'text-emerald-500'
                      }`}>
                        {fillPercent}% Filled
                      </span>
                    </div>
                    
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${fillPercent}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          fillPercent > 90
                            ? 'bg-rose-600'
                            : fillPercent > 70
                            ? 'bg-amber-500'
                            : 'bg-indigo-600'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Interactive card footer link */}
                  <div className="flex items-center justify-between pt-4.5 border-t border-slate-50 dark:border-slate-800/60 text-xs font-semibold text-slate-400 group-hover:text-emerald-500 transition-colors mt-2">
                    <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider">
                      Open Activities Dashboard
                    </span>
                    <ArrowRight size={13} className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
