
import React, { useState, useMemo } from 'react';
import type { StaffMember, Shift, AttendanceRecord, MonthlyReport } from '../types';
import { StaffRole } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, UsersIcon, CalendarDaysIcon, DocumentTextIcon, ClockIcon } from './Icons';

interface StaffManagerProps {
    staff: StaffMember[];
    shifts: Shift[];
    attendance: AttendanceRecord[];
    reports: MonthlyReport[];
    onAddStaff: (staff: Omit<StaffMember, 'id'>) => void;
    onUpdateStaff: (staff: StaffMember) => void;
    onDeleteStaff: (id: string) => void;
    onAddShift: (shift: Omit<Shift, 'id'>) => void;
    onDeleteShift: (id: string) => void;
    onClockIn: (staffId: string) => void;
    onClockOut: (staffId: string) => void;
    onSaveReport: (report: Omit<MonthlyReport, 'id'>) => void;
    onDeleteReport: (id: string) => void;
}

type StaffView = 'list' | 'schedule' | 'attendance' | 'reports';

const SubNavButton: React.FC<{ Icon: React.FC<any>, label: string, isActive: boolean, onClick: () => void }> = ({ Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            isActive ? 'bg-amber-700 text-white' : 'text-stone-600 hover:bg-stone-200'
        }`}
    >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
    </button>
);

const formatDateForInput = (date: Date) => date.toISOString().split('T')[0];
const formatTimeForInput = (date: Date) => date.toTimeString().slice(0, 5);


const StaffManager: React.FC<StaffManagerProps> = (props) => {
    const { staff, shifts, attendance, reports, onAddStaff, onUpdateStaff, onDeleteStaff, onAddShift, onDeleteShift, onClockIn, onClockOut, onSaveReport, onDeleteReport } = props;
    const [activeView, setActiveView] = useState<StaffView>('list');

    return (
        <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h3 className="text-2xl font-bold text-stone-900">Staff Management</h3>
                <div className="flex items-center space-x-2 bg-stone-100 p-1 rounded-lg">
                    <SubNavButton Icon={UsersIcon} label="Staff List" isActive={activeView === 'list'} onClick={() => setActiveView('list')} />
                    <SubNavButton Icon={CalendarDaysIcon} label="Shift Schedule" isActive={activeView === 'schedule'} onClick={() => setActiveView('schedule')} />
                    <SubNavButton Icon={ClockIcon} label="Attendance" isActive={activeView === 'attendance'} onClick={() => setActiveView('attendance')} />
                    <SubNavButton Icon={DocumentTextIcon} label="Reports" isActive={activeView === 'reports'} onClick={() => setActiveView('reports')} />
                </div>
            </div>

            {activeView === 'list' && <StaffList staff={staff} onAdd={onAddStaff} onUpdate={onUpdateStaff} onDelete={onDeleteStaff} />}
            {activeView === 'schedule' && <ShiftScheduler staff={staff} shifts={shifts} onAddShift={onAddShift} onDeleteShift={onDeleteShift} />}
            {activeView === 'attendance' && <AttendanceTracker staff={staff} attendance={attendance} onClockIn={onClockIn} onClockOut={onClockOut} />}
            {activeView === 'reports' && <ReportsManager staff={staff} attendance={attendance} reports={reports} onSaveReport={onSaveReport} onDeleteReport={onDeleteReport} />}

        </div>
    );
};

// #region Staff List
const StaffList: React.FC<{ staff: StaffMember[], onAdd: any, onUpdate: any, onDelete: any }> = ({ staff, onAdd, onUpdate, onDelete }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

    const handleOpenForm = (staffMember: StaffMember | null) => {
        setEditingStaff(staffMember);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setEditingStaff(null);
        setIsFormOpen(false);
    };
    
    const handleDelete = (staffId: string) => {
        if (window.confirm('Are you sure you want to delete this staff member? This will also remove their shifts and attendance records.')) {
            onDelete(staffId);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-xl font-semibold text-stone-800">Staff Roster ({staff.length})</h4>
                <button onClick={() => handleOpenForm(null)} className="flex items-center bg-amber-700 text-white px-4 py-2 rounded-lg hover:bg-amber-800 font-semibold text-sm">
                    <PlusIcon className="h-5 w-5 mr-2" /> Add Staff
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staff.map(member => (
                    <div key={member.id} className="bg-stone-50 border border-stone-200 p-4 rounded-lg flex items-center space-x-4">
                        <img src={member.photoUrl} alt={member.name} className="h-16 w-16 rounded-full object-cover" />
                        <div className="flex-grow">
                            <h5 className="font-bold text-stone-800">{member.name}</h5>
                            <p className="text-sm text-amber-700">{member.role}</p>
                            <p className="text-xs text-stone-500 mt-1">{member.contact}</p>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <button onClick={() => handleOpenForm(member)} className="p-2 rounded-full bg-stone-200 hover:bg-amber-600 text-stone-600 hover:text-white"><PencilIcon className="h-4 w-4" /></button>
                            <button onClick={() => handleDelete(member.id)} className="p-2 rounded-full bg-stone-200 hover:bg-red-500 text-stone-600 hover:text-white"><TrashIcon className="h-4 w-4" /></button>
                        </div>
                    </div>
                ))}
            </div>
            {isFormOpen && <StaffFormModal staff={editingStaff} onClose={handleCloseForm} onSave={editingStaff ? onUpdate : onAdd} />}
        </div>
    );
};

const StaffFormModal: React.FC<{ staff: StaffMember | null, onClose: () => void, onSave: (data: any) => void }> = ({ staff, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: staff?.name || '',
        role: staff?.role || StaffRole.WAITER,
        contact: staff?.contact || '',
        photoUrl: staff?.photoUrl || `https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80`,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(staff ? { ...staff, ...formData } : formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative border border-stone-200" onClick={e => e.stopPropagation()}>
                <h4 className="text-xl font-bold mb-6 text-center text-stone-800">{staff ? 'Edit Staff Member' : 'Add New Staff'}</h4>
                <button type="button" onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-stone-400 hover:bg-stone-100"><XMarkIcon className="h-6 w-6" /></button>
                <div className="space-y-4">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required className="w-full bg-stone-50 border-stone-300 rounded-md p-2 text-stone-900" />
                    <select name="role" value={formData.role} onChange={handleChange} required className="w-full bg-stone-50 border-stone-300 rounded-md p-2 text-stone-900">
                        {Object.values(StaffRole).map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                    <input name="contact" value={formData.contact} onChange={handleChange} placeholder="Contact (Email/Phone)" required className="w-full bg-stone-50 border-stone-300 rounded-md p-2 text-stone-900" />
                    <input name="photoUrl" value={formData.photoUrl} onChange={handleChange} placeholder="Photo URL" required className="w-full bg-stone-50 border-stone-300 rounded-md p-2 text-stone-900" />
                </div>
                <div className="mt-8 flex justify-end space-x-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-stone-800 bg-stone-200 hover:bg-stone-300 font-semibold">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-lg text-white bg-amber-700 hover:bg-amber-800 font-semibold">Save</button>
                </div>
            </form>
        </div>
    );
};
// #endregion

// #region Shift Scheduler
const ShiftScheduler: React.FC<{ staff: StaffMember[], shifts: Shift[], onAddShift: any, onDeleteShift: any }> = ({ staff, shifts, onAddShift, onDeleteShift }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const weekDays = useMemo(() => {
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        return Array.from({ length: 7 }, (_, i) => {
            const day = new Date(startOfWeek);
            day.setDate(day.getDate() + i);
            return day;
        });
    }, [selectedDate]);

    const shiftsByDay = useMemo(() => {
        const grouped: Record<string, Shift[]> = {};
        shifts.forEach(shift => {
            const day = shift.startTime.toDateString();
            if (!grouped[day]) grouped[day] = [];
            grouped[day].push(shift);
        });
        return grouped;
    }, [shifts]);

    const changeWeek = (direction: 'prev' | 'next') => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
            return newDate;
        });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                    <h4 className="text-xl font-semibold text-stone-800">Weekly Schedule</h4>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => changeWeek('prev')} className="p-1 rounded-md bg-stone-200 hover:bg-stone-300 text-stone-700">&lt;</button>
                        <span className="text-sm font-medium text-stone-600">{weekDays[0].toLocaleDateString()} - {weekDays[6].toLocaleDateString()}</span>
                        <button onClick={() => changeWeek('next')} className="p-1 rounded-md bg-stone-200 hover:bg-stone-300 text-stone-700">&gt;</button>
                    </div>
                </div>
                <button onClick={() => setIsFormOpen(true)} className="flex items-center bg-amber-700 text-white px-4 py-2 rounded-lg hover:bg-amber-800 font-semibold text-sm">
                    <PlusIcon className="h-5 w-5 mr-2" /> Add Shift
                </button>
            </div>
            <div className="grid grid-cols-7 gap-2">
                {weekDays.map(day => (
                    <div key={day.toISOString()} className="bg-stone-100 rounded-lg p-2 space-y-2">
                        <p className="font-bold text-center text-stone-800 text-sm">{day.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                        <p className="font-bold text-center text-stone-500 text-xs mb-2">{day.toLocaleDateString('en-US', { day: '2-digit' })}</p>
                        {(shiftsByDay[day.toDateString()] || []).map(shift => {
                            const staffMember = staff.find(s => s.id === shift.staffId);
                            return (
                                <div key={shift.id} className="bg-white border border-stone-200 p-1.5 rounded-md text-xs relative group">
                                    <p className="font-semibold text-amber-700 truncate">{staffMember?.name}</p>
                                    <p className="text-stone-500">{formatTimeForInput(shift.startTime)} - {formatTimeForInput(shift.endTime)}</p>
                                    <button onClick={() => onDeleteShift(shift.id)} className="absolute top-1 right-1 p-0.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        <XMarkIcon className="h-3 w-3" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
            {isFormOpen && <ShiftFormModal staff={staff} onClose={() => setIsFormOpen(false)} onSave={onAddShift} />}
        </div>
    );
};

const ShiftFormModal: React.FC<{ staff: StaffMember[], onClose: () => void, onSave: (data: any) => void }> = ({ staff, onClose, onSave }) => {
    const today = new Date();
    const [formData, setFormData] = useState({
        staffId: staff[0]?.id || '',
        date: formatDateForInput(today),
        startTime: '09:00',
        endTime: '17:00',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { staffId, date, startTime, endTime } = formData;
        onSave({
            staffId,
            startTime: new Date(`${date}T${startTime}`),
            endTime: new Date(`${date}T${endTime}`),
        });
        onClose();
    };

    return (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm relative border border-stone-200" onClick={e => e.stopPropagation()}>
                <h4 className="text-xl font-bold mb-6 text-center text-stone-800">Add New Shift</h4>
                <button type="button" onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-stone-400 hover:bg-stone-100"><XMarkIcon className="h-6 w-6" /></button>
                <div className="space-y-4">
                    <select value={formData.staffId} onChange={e => setFormData(p => ({...p, staffId: e.target.value}))} className="w-full bg-stone-50 border-stone-300 rounded-md p-2 text-stone-900">
                        {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <input type="date" value={formData.date} onChange={e => setFormData(p => ({...p, date: e.target.value}))} className="w-full bg-stone-50 border-stone-300 rounded-md p-2 text-stone-900" />
                    <div className="flex items-center space-x-2">
                         <input type="time" value={formData.startTime} onChange={e => setFormData(p => ({...p, startTime: e.target.value}))} className="w-full bg-stone-50 border-stone-300 rounded-md p-2 text-stone-900" />
                         <span>to</span>
                         <input type="time" value={formData.endTime} onChange={e => setFormData(p => ({...p, endTime: e.target.value}))} className="w-full bg-stone-50 border-stone-300 rounded-md p-2 text-stone-900" />
                    </div>
                </div>
                 <div className="mt-8 flex justify-end space-x-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-stone-800 bg-stone-200 hover:bg-stone-300 font-semibold">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-lg text-white bg-amber-700 hover:bg-amber-800 font-semibold">Add Shift</button>
                </div>
            </form>
        </div>
    );
};
// #endregion

// #region Attendance Tracker
const AttendanceTracker: React.FC<{ staff: StaffMember[], attendance: AttendanceRecord[], onClockIn: any, onClockOut: any }> = ({ staff, attendance, onClockIn, onClockOut }) => {
    const todayStr = new Date().toDateString();
    
    const todaysRecords = useMemo(() => {
        return attendance.filter(a => a.clockIn.toDateString() === todayStr);
    }, [attendance, todayStr]);

    const getStaffStatus = (staffId: string) => {
        const record = todaysRecords.find(r => r.staffId === staffId && !r.clockOut);
        if (record) return 'Clocked In';

        const completedRecord = todaysRecords.find(r => r.staffId === staffId && r.clockOut);
        if (completedRecord) return 'Clocked Out';
        
        return 'Absent';
    };

    const calculateHours = (record: AttendanceRecord | undefined) => {
        if (!record || !record.clockOut) return '-';
        const diff = record.clockOut.getTime() - record.clockIn.getTime();
        return (diff / (1000 * 60 * 60)).toFixed(2) + 'h';
    };

    return (
        <div>
            <h4 className="text-xl font-semibold text-stone-800 mb-4">Today's Attendance ({todayStr})</h4>
            <div className="bg-stone-50 rounded-lg border border-stone-200">
                <div className="grid grid-cols-4 font-semibold text-stone-600 p-3 border-b border-stone-200">
                    <span>Employee</span>
                    <span className="text-center">Status</span>
                    <span className="text-center">Today's Hours</span>
                    <span className="text-right">Action</span>
                </div>
                <div className="divide-y divide-stone-200">
                    {staff.map(member => {
                        const status = getStaffStatus(member.id);
                        const record = todaysRecords.find(r => r.staffId === member.id);
                        return (
                            <div key={member.id} className="grid grid-cols-4 items-center p-3">
                                <div className="flex items-center space-x-3">
                                    <img src={member.photoUrl} alt={member.name} className="h-10 w-10 rounded-full object-cover" />
                                    <div>
                                        <p className="font-semibold text-stone-800">{member.name}</p>
                                        <p className="text-xs text-stone-500">{member.role}</p>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                        status === 'Clocked In' ? 'bg-green-100 text-green-800' :
                                        status === 'Clocked Out' ? 'bg-blue-100 text-blue-800' :
                                        'bg-stone-200 text-stone-600'
                                    }`}>{status}</span>
                                </div>
                                <p className="text-center font-mono text-stone-600">{calculateHours(record)}</p>
                                <div className="text-right">
                                    {status === 'Absent' && <button onClick={() => onClockIn(member.id)} className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">Clock In</button>}
                                    {status === 'Clocked In' && <button onClick={() => onClockOut(member.id)} className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">Clock Out</button>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
// #endregion

// #region Reports Manager
const ReportsManager: React.FC<{ staff: StaffMember[], attendance: AttendanceRecord[], reports: MonthlyReport[], onSaveReport: any, onDeleteReport: any }> = (props) => {
    const [selectedStaff, setSelectedStaff] = useState(props.staff[0]?.id || '');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [generatedReport, setGeneratedReport] = useState<Omit<MonthlyReport, 'id'> | null>(null);

    const handleGenerate = () => {
        const staffName = props.staff.find(s => s.id === selectedStaff)?.name || 'N/A';
        const records = props.attendance.filter(a => a.staffId === selectedStaff && a.clockIn.getMonth() === selectedMonth && a.clockIn.getFullYear() === selectedYear && a.clockOut);
        
        const attendanceData = [];
        let totalHours = 0;

        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(selectedYear, selectedMonth, i);
            const dayRecords = records.filter(r => r.clockIn.getDate() === i);
            let hours = 0;
            if (dayRecords.length > 0) {
                 hours = dayRecords.reduce((acc, rec) => acc + ((rec.clockOut!.getTime() - rec.clockIn.getTime()) / (1000 * 60 * 60)), 0);
                 totalHours += hours;
            }
            attendanceData.push({
                date: date.toLocaleDateString(),
                hours: parseFloat(hours.toFixed(2)),
                status: dayRecords.length > 0 ? 'Present' : 'Absent',
            });
        }
        
        setGeneratedReport({
            staffId: selectedStaff,
            staffName,
            month: selectedMonth,
            year: selectedYear,
            totalHours: parseFloat(totalHours.toFixed(2)),
            attendanceData,
            generatedAt: new Date(),
        });
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
                 <h4 className="text-xl font-semibold text-stone-800 mb-4">Generate Report</h4>
                 <div className="bg-stone-50 border border-stone-200 p-4 rounded-lg space-y-3">
                     <select value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)} className="w-full bg-white border-stone-300 rounded-md p-2 text-stone-900">
                         {props.staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                     </select>
                     <div className="flex gap-3">
                         <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))} className="w-full bg-white border-stone-300 rounded-md p-2 text-stone-900">
                            {Array.from({length: 12}).map((_, i) => <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>)}
                         </select>
                         <input type="number" value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} className="w-full bg-white border-stone-300 rounded-md p-2 text-stone-900" />
                     </div>
                     <button onClick={handleGenerate} className="w-full bg-amber-700 text-white font-semibold py-2 rounded-lg hover:bg-amber-800">Generate</button>
                 </div>
                 {generatedReport && (
                     <div className="mt-4 bg-stone-50 border border-stone-200 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                             <div>
                                <h5 className="text-lg font-bold text-stone-800">Report for {generatedReport.staffName}</h5>
                                <p className="text-sm text-stone-600">{new Date(generatedReport.year, generatedReport.month).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                             </div>
                             <p className="font-extrabold text-2xl text-amber-600">{generatedReport.totalHours} <span className="text-base font-semibold">hrs</span></p>
                        </div>
                         <div className="h-48 overflow-y-auto mt-2 space-y-1 pr-2">
                             {generatedReport.attendanceData.map(d => (
                                 <div key={d.date} className="grid grid-cols-3 text-sm bg-white/50 p-1.5 rounded-md">
                                     <span className="text-stone-600">{d.date}</span>
                                     <span className={`font-semibold text-center ${d.status === 'Present' ? 'text-green-600' : 'text-stone-400'}`}>{d.status}</span>
                                     <span className="font-mono text-right text-stone-600">{d.status === 'Present' ? `${d.hours}h` : '-'}</span>
                                 </div>
                             ))}
                         </div>
                         <button onClick={() => { props.onSaveReport(generatedReport); setGeneratedReport(null); }} className="w-full mt-3 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700">Save Report</button>
                     </div>
                 )}
            </div>
             <div>
                <h4 className="text-xl font-semibold text-stone-800 mb-4">Saved Reports ({props.reports.length})</h4>
                <div className="space-y-3 h-[450px] overflow-y-auto pr-2">
                    {props.reports.map(report => (
                        <div key={report.id} className="bg-stone-50 border border-stone-200 p-3 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-stone-800">{report.staffName}</p>

                                <p className="text-xs text-stone-500">{new Date(report.year, report.month).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <p className="font-bold text-amber-700">{report.totalHours} hrs</p>
                                <button onClick={() => props.onDeleteReport(report.id)} className="p-2 rounded-full bg-stone-200 hover:bg-red-500 text-stone-600 hover:text-white"><TrashIcon className="h-4 w-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
// #endregion

export default StaffManager;
