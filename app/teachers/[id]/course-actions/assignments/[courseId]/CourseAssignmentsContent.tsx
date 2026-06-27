"use client";

import { useState, useEffect } from "react";
import { getTeacherCourses, createAssignment, uploadFile, getFileDownloadUrl, Course, Assignment } from "@/lib/api";
import { FileText, Plus, Calendar, AlertCircle, Loader2, Save, X, Eye, Download, Search, CheckCircle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";

const containerVars: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVars: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

interface CourseAssignmentsContentProps {
    id: string;
    courseId: string;
}

export default function CourseAssignmentsContent({ id, courseId }: CourseAssignmentsContentProps) {
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Create form state
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newDueDate, setNewDueDate] = useState("");
    const [fileUrlInput, setFileUrlInput] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCourseData();
    }, [id, courseId]);

    const fetchCourseData = async () => {
        setLoading(true);
        try {
            const courses = await getTeacherCourses(id);
            if (Array.isArray(courses)) {
                const found = courses.find((c: any) => c.id == courseId);
                if (found) {
                    setCourse(found);
                } else {
                    setError("Course not found.");
                }
            } else {
                throw new Error("Invalid response");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load course details.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        setSubmitting(true);
        try {
            await createAssignment({
                courseId: courseId,
                teacherId: id,
                title: newTitle,
                description: newDesc,
                dueDate: newDueDate,
                // Pass the URL string directly
                ...({ fileUrl: fileUrlInput } as any)
            });

            // Reset and reload
            setNewTitle("");
            setNewDesc("");
            setNewDueDate("");
            setFileUrlInput("");
            setIsCreating(false);
            await fetchCourseData();

        } catch (err) {
            console.error(err);
            alert("Failed to create assignment.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && !course) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                <span className="ml-3 text-gray-500">Loading assignments...</span>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900">Error</h3>
                <p className="text-gray-500">{error || "Course data unavailable"}</p>
                <Link href="./" className="mt-4 inline-block text-blue-600 hover:underline">Go Back</Link>
            </div>
        );
    }

    return (
        <motion.div
            className="space-y-6 max-w-5xl mx-auto"
            variants={containerVars}
            initial="hidden"
            animate="show"
        >
            <motion.div variants={itemVars} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Link href={`/teachers/${id}/course-actions/assignments`} className="hover:text-blue-600 hover:underline">Assignments</Link>
                        <span>/</span>
                        <span className="font-semibold text-gray-700">{course.courseNo}</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Manage Assignments</h2>
                    <p className="text-gray-500 text-sm mt-1">{course.courseName}</p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20"
                >
                    <Plus size={18} /> Create Assignment
                </motion.button>
            </motion.div>

            {/* Create Form Modal/Inline */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: "auto", scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-purple-50/50 backdrop-blur-sm border border-purple-100 rounded-2xl p-6 relative mb-6 ring-1 ring-purple-600/10">
                            <button
                                onClick={() => setIsCreating(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 hover:bg-purple-100/50 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-purple-100 text-purple-600">
                                    <Plus size={18} />
                                </span>
                                Create New Assignment
                            </h3>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow bg-white/80"
                                        required
                                        placeholder="e.g. Assignment 1 (Project Proposal)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={newDesc}
                                        onChange={(e) => setNewDesc(e.target.value)}
                                        className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px] transition-shadow bg-white/80"
                                        required
                                        placeholder="Enter assignment details..."
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                        <input
                                            type="date"
                                            value={newDueDate}
                                            onChange={(e) => setNewDueDate(e.target.value)}
                                            className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow bg-white/80"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (URL)</label>
                                        <input
                                            type="url"
                                            value={fileUrlInput}
                                            onChange={(e) => setFileUrlInput(e.target.value)}
                                            placeholder="https://drive.google.com/..."
                                            className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 transition-shadow"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end mt-4 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-70 flex items-center gap-2 shadow-lg shadow-purple-200"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                        Create Assignment
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Assignments List */}
            <motion.div variants={containerVars} className="grid grid-cols-1 gap-4">
                {course.assignments && course.assignments.length > 0 ? (
                    course.assignments.map((assignment) => (
                        <motion.div
                            variants={itemVars}
                            key={assignment.id}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-purple-200 transition-all group"
                        >
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border ${assignment.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            assignment.status === 'submitted' ? 'bg-green-50 text-green-600 border-green-100' :
                                                'bg-gray-50 text-gray-500 border-gray-100'
                                            }`}>
                                            {assignment.status || 'Active'}
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                            <Calendar size={12} className="text-gray-400" /> Due: {assignment.dueDate}
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform hidden sm:flex">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">{assignment.title}</h3>
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{assignment.description}</p>

                                            {assignment.teacherFileUrl && (
                                                <a href={assignment.teacherFileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800 hover:underline bg-purple-50 px-3 py-1.5 rounded-lg transition-colors">
                                                    <FileText size={14} /> View Attachment
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 min-w-[170px] justify-center">
                                    <Link
                                        href={`/teachers/${id}/course-actions/assignments/${courseId}/${assignment.id}`}
                                        className="w-full px-4 py-2.5 bg-white text-purple-600 border border-purple-200 text-sm font-bold rounded-xl hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-200"
                                    >
                                        <Eye size={16} /> View Submissions
                                    </Link>
                                    {/* Delete Button placeholder if needed later */}
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <motion.div variants={itemVars} className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 mb-4 group">
                            <FileText className="h-8 w-8 text-gray-300 group-hover:text-gray-400 transition-colors" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No Assignments Yet</h3>
                        <p className="mt-2 text-sm text-gray-500">Create the first assignment for this course.</p>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
}
