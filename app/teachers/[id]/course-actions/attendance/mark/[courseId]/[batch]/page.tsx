"use client";

import { useState, useEffect } from "react";
import { getStudentsByBatch, markAttendance, AttendanceRecord, getTeacherCourses } from "@/lib/api";
import { Users, CheckCircle, XCircle, Save, Loader2, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MarkAttendancePage({
    params,
}: {
    params: Promise<{ id: string; courseId: string; batch: string }>;
}) {
    // Unwrapping promise params
    const [unwrappedParams, setUnwrappedParams] = useState<{ id: string; courseId: string; batch: string } | null>(null);

    // State
    const [students, setStudents] = useState<any[]>([]);
    const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [courseDetails, setCourseDetails] = useState<{ courseCode: string } | null>(null);

    const router = useRouter();

    useEffect(() => {
        // Resolve promise params
        params.then(setUnwrappedParams);
    }, [params]);

    useEffect(() => {
        if (!unwrappedParams) return;

        const fetchData = async () => {
            try {
                const { id, courseId, batch } = unwrappedParams;

                // 1. We need course code to fetch students
                // In a real app we might pass this via query params or fetch course details single endpoint
                // Here we fetch all courses to find the code, mimicking previous server component logic
                const courses = await getTeacherCourses(id);
                const course = courses.find((c: any) => c.id == courseId);

                if (!course) throw new Error("Course not found");
                setCourseDetails({ courseCode: course.courseNo });

                // 2. Fetch Students
                const decodedBatch = decodeURIComponent(batch);
                const studentsData = await getStudentsByBatch(course.courseNo, decodedBatch);

                if (Array.isArray(studentsData)) {
                    setStudents(studentsData);
                    // Initialize all as present (true) by default
                    const initialAttendance: Record<string, boolean> = {};
                    studentsData.forEach(s => {
                        initialAttendance[s.studentId] = true;
                    });
                    setAttendanceMap(initialAttendance);
                }
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Failed to load class list");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [unwrappedParams]);

    const toggleAttendance = (studentId: string | number) => {
        setAttendanceMap(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
        }));
    };

    const markAll = (status: boolean) => {
        const newMap: Record<string, boolean> = {};
        students.forEach(s => {
            newMap[s.studentId] = status;
        });
        setAttendanceMap(newMap);
    };

    const handleSubmit = async () => {
        if (!unwrappedParams) return;
        setSubmitting(true);
        try {
            const payload = Object.entries(attendanceMap).map(([studentId, present]) => ({
                studentId: Number(studentId),
                present
            }));

            await markAttendance(unwrappedParams.courseId, payload);
            setSubmitted(true);
            setTimeout(() => {
                // Redirect back to dashboard or course list after short delay
                router.push(`/teachers/${unwrappedParams.id}/course-actions/attendance`);
            }, 2000);

        } catch (err) {
            console.error(err);
            alert("Failed to submit attendance. Please try again.");
            setSubmitting(false);
        }
    };

    if (!unwrappedParams) return null;

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-500">Loading student list...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                    <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Error Loading Data</h3>
                <p className="text-gray-500">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 text-blue-600 hover:underline">Retry</button>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={40} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Attendance Submitted!</h2>
                <p className="text-gray-500 mt-2">Records have been updated successfully.</p>
                <p className="text-sm text-gray-400 mt-8">Redirecting...</p>
            </div>
        );
    }

    const presentCount = Object.values(attendanceMap).filter(v => v).length;
    const absentCount = students.length - presentCount;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Link href={`/teachers/${unwrappedParams.id}/course-actions/attendance/mark`} className="hover:text-blue-600 hover:underline">Mark</Link>
                        <span>/</span>
                        <Link href={`/teachers/${unwrappedParams.id}/course-actions/attendance/mark/${unwrappedParams.courseId}`} className="hover:text-blue-600 hover:underline">{courseDetails?.courseCode}</Link>
                        <span>/</span>
                        <span className="font-semibold text-gray-700">{decodeURIComponent(unwrappedParams.batch)}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Mark Attendance</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        <span className="font-medium text-green-600">{presentCount} Present</span> • <span className="font-medium text-red-500">{absentCount} Absent</span> of {students.length} Total
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => markAll(true)}
                        className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded border border-green-200 hover:bg-green-100 transition-colors"
                    >
                        Mark All Present
                    </button>
                    <button
                        onClick={() => markAll(false)}
                        className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 rounded border border-red-200 hover:bg-red-100 transition-colors"
                    >
                        Mark All Absent
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200 grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-5 md:col-span-4">Student Name</div>
                    <div className="col-span-2 hidden md:block">Roll No</div>
                    <div className="col-span-6 md:col-span-5 text-right pr-4">Status</div>
                </div>

                <div className="divide-y divide-gray-100">
                    {students.map((student, index) => {
                        const isPresent = attendanceMap[student.studentId];
                        return (
                            <div
                                key={student.studentId}
                                onClick={() => toggleAttendance(student.studentId)}
                                className={`grid grid-cols-12 gap-4 p-4 items-center cursor-pointer transition-colors ${isPresent ? 'bg-white hover:bg-gray-50' : 'bg-red-50/30 hover:bg-red-50/60'
                                    }`}
                            >
                                <div className="col-span-1 text-center text-gray-400 font-mono text-sm">{index + 1}</div>
                                <div className="col-span-5 md:col-span-4">
                                    <div className="font-medium text-gray-900">{student.name}</div>
                                    <div className="text-xs text-gray-500 md:hidden">{student.rollNo}</div>
                                </div>
                                <div className="col-span-2 hidden md:block text-sm text-gray-600 font-mono">{student.rollNo}</div>
                                <div className="col-span-6 md:col-span-5 flex justify-end pr-2">
                                    <div className="flex bg-gray-100 p-1 rounded-lg">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleAttendance(student.studentId); }}
                                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${isPresent
                                                    ? 'bg-white text-green-600 shadow-sm'
                                                    : 'text-gray-400 hover:text-gray-600'
                                                }`}
                                        >
                                            Present
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleAttendance(student.studentId); }}
                                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${!isPresent
                                                    ? 'bg-white text-red-600 shadow-sm'
                                                    : 'text-gray-400 hover:text-gray-600'
                                                }`}
                                        >
                                            Absent
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="sticky bottom-6 flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl hover:scale-105 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="animate-spin" size={20} /> Starting...
                        </>
                    ) : (
                        <>
                            <Save size={20} /> Submit Attendance
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
