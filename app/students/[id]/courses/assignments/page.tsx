"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { getStudentCourses, Course, Assignment, uploadFile, submitAssignment, getFileDownloadUrl } from "@/lib/api";
import { useCourseStore } from "@/lib/store";
import CourseMenu from "@/components/CourseMenu";
import FileUpload from "@/components/FileUpload";

export default function CourseAssignmentsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const selectedCourseId = useCourseStore((state) => state.selectedCourseId);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<number[]>([]);
    const [submittingId, setSubmittingId] = useState<number | null>(null);

    useEffect(() => {
        if (!selectedCourseId) {
            router.push(`/students/${id}/courses`);
            return;
        }

        const fetchAssignments = async () => {
            try {
                const courses = await getStudentCourses(id);
                const foundCourse = courses.find(c => c.id === selectedCourseId);
                setCourse(foundCourse || null);
                setAssignments(foundCourse?.assignments || []);
            } catch (error) {
                console.error("Failed to fetch assignments:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, [id, selectedCourseId, router]);

    const toggleExpand = (assignmentId: number) => {
        setExpandedIds(prev =>
            prev.includes(assignmentId)
                ? prev.filter(id => id !== assignmentId)
                : [...prev, assignmentId]
        );
    };

    const handleUrlSubmit = async (url: string, assignmentId: number) => {
        try {
            setSubmittingId(assignmentId);
            await submitAssignment({
                studentId: id,
                assignmentId: assignmentId,
                fileUrl: url
            });

            setAssignments(prev => prev.map(a =>
                a.id === assignmentId
                    ? { ...a, status: "submitted", studentSubmissionFileUrl: url }
                    : a
            ));
            alert("Assignment submitted successfully!");
        } catch (error) {
            console.error("Failed to submit assignment:", error);
            alert("Failed to submit assignment. Please try again.");
        } finally {
            setSubmittingId(null);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading assignments...</div>;
    }

    if (!course) {
        return (
            <div className="space-y-6">
                <CourseMenu studentId={id} courseId={String(selectedCourseId)} />
                <div className="p-8 text-center text-gray-500">Course not found.</div>
            </div>
        );
    }

    const getStatusColor = (status: Assignment["status"]) => {
        switch (status) {
            case "submitted": return "text-green-600 bg-green-50 border-green-200";
            case "late": return "text-red-600 bg-red-50 border-red-200";
            default: return "text-orange-600 bg-orange-50 border-orange-200";
        }
    };

    const getStatusIcon = (status: Assignment["status"]) => {
        switch (status) {
            case "submitted": return <CheckCircle size={14} className="mr-1" />;
            case "late": return <AlertCircle size={14} className="mr-1" />;
            default: return <Clock size={14} className="mr-1" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">{course.courseName}</h2>
                    <p className="text-gray-500 mt-1">{course.courseNo} • {course.credits} Credits</p>
                </div>
            </div>

            <CourseMenu studentId={id} courseId={String(selectedCourseId)} />

            <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mr-3">
                        <FileText size={20} />
                    </div>
                    Assignments
                </h3>

                {assignments.length > 0 ? (
                    <div className="space-y-4">
                        {assignments.map((assignment, index) => {
                            const isExpanded = expandedIds.includes(assignment.id);
                            const isSubmitting = submittingId === assignment.id;
                            const statusStyle = getStatusColor(assignment.status);

                            return (
                                <motion.div
                                    key={assignment.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-sm hover:shadow-md transition-all"
                                >
                                    <div
                                        onClick={() => toggleExpand(assignment.id)}
                                        className="p-6 cursor-pointer hover:bg-white/40 transition-colors flex items-start justify-between relative z-10"
                                    >
                                        <div>
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h4 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">{assignment.title}</h4>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center ${statusStyle}`}>
                                                    {getStatusIcon(assignment.status)}
                                                    {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 flex items-center font-medium">
                                                <Clock size={14} className="mr-1" />
                                                Due: {new Date(assignment.dueDate).toLocaleDateString(undefined, {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        {isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                                    </div>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-gray-100 bg-white/30"
                                            >
                                                <div className="p-6 space-y-6">
                                                    <div>
                                                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Instructions</h5>
                                                        <p className="text-sm text-gray-600 leading-relaxed">{assignment.description}</p>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 py-4 border-t border-gray-100">
                                                        <div className="flex-1">
                                                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Assignment Material</h5>
                                                            {assignment.teacherFileUrl ? (
                                                                <a
                                                                    href={assignment.teacherFileUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-bold transition-colors bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 hover:bg-blue-100"
                                                                >
                                                                    <FileText className="mr-2 h-4 w-4" />
                                                                    View Assignment Material
                                                                </a>
                                                            ) : (
                                                                <span className="text-sm text-gray-400 italic flex items-center">
                                                                    <AlertCircle className="mr-2 h-4 w-4" />
                                                                    No file attached
                                                                </span>
                                                            )}
                                                        </div>

                                                        {assignment.status !== "pending" && (
                                                            <div className="flex-1">
                                                                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Your Work</h5>
                                                                {assignment.studentSubmissionFileUrl ? (
                                                                    <a
                                                                        href={assignment.studentSubmissionFileUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center text-sm text-green-600 hover:text-green-700 font-bold transition-colors bg-green-50 px-4 py-2 rounded-lg border border-green-100 hover:bg-green-100"
                                                                    >
                                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                                        View Your Submission URL
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-sm text-gray-500">File uploaded</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {assignment.status === "pending" && (
                                                        <div>
                                                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Submit Assignment URL</h5>
                                                            <div className="max-w-md">
                                                                {isSubmitting ? (
                                                                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                                                        <p className="text-sm text-gray-500">Submitting...</p>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-col sm:flex-row gap-3">
                                                                        <input
                                                                            type="url"
                                                                            placeholder="Google Drive / Docs URL"
                                                                            className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-700"
                                                                            id={`url-input-${assignment.id}`}
                                                                        />
                                                                        <button
                                                                            onClick={() => {
                                                                                const input = document.getElementById(`url-input-${assignment.id}`) as HTMLInputElement;
                                                                                if (input && input.value) {
                                                                                    if (!input.checkValidity()) {
                                                                                        alert("Please enter a valid absolute URL (e.g., https://...)");
                                                                                        return;
                                                                                    }
                                                                                    handleUrlSubmit(input.value, assignment.id);
                                                                                } else {
                                                                                    alert("Please enter a valid URL");
                                                                                }
                                                                            }}
                                                                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors whitespace-nowrap"
                                                                        >
                                                                            Submit
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4 text-gray-400">
                            <FileText className="w-8 h-8" />
                        </div>
                        <p className="text-gray-600 font-medium">No assignments assigned yet.</p>
                        <p className="text-sm text-gray-400 mt-2">Enjoy your free time!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
