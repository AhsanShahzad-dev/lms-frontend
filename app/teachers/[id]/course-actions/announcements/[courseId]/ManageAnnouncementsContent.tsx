"use client";

import { useState, useEffect } from "react";
import { createAnnouncement, deleteAnnouncement, Announcement, Course } from "@/lib/api";
import { Bell, Trash2, Plus, Calendar, AlertCircle, Loader2, Save, X, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

interface ManageAnnouncementsContentProps {
    id: string;
    courseId: string;
    initialCourse: Course | null;
    initialError: string | null;
}

export default function ManageAnnouncementsContent({ id, courseId, initialCourse, initialError }: ManageAnnouncementsContentProps) {
    const [course, setCourse] = useState<Course | null>(initialCourse);
    const [error, setError] = useState<string | null>(initialError);
    const [isCreating, setIsCreating] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    // Sync state when Server Component re-fetches data (e.g. after router.refresh())
    useEffect(() => {
        setCourse(initialCourse);
        setError(initialError);
    }, [initialCourse, initialError]);

    const handleDelete = async (announcementId: number) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;

        // Optimistic update
        const previousCourse = course;
        if (course && course.announcements) {
            setCourse({
                ...course,
                announcements: course.announcements.filter(a => a.id !== announcementId)
            });
        }

        try {
            await deleteAnnouncement(announcementId);
            setCourse(prev => prev ? {
                ...prev,
                announcements: prev.announcements?.filter(a => a.id !== announcementId) || []
            } : null);
            router.refresh();
        } catch (err) {
            console.error("Failed to delete", err);
            alert("Failed to delete announcement.");
            setCourse(previousCourse);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !courseId) return;

        setSubmitting(true);
        const previousCourse = course;
        try {
            // Optimistic Update (Temporary ID)
            const tempId = Date.now();
            const newAnnouncement: Announcement = {
                id: tempId,
                courseId: parseInt(courseId),
                message: newMessage,
                timestamp: new Date().toISOString()
            };

            if (course) {
                // Prepend new announcement
                setCourse({
                    ...course,
                    announcements: [newAnnouncement, ...(course.announcements || [])]
                });
            }


            const realAnnouncement = await createAnnouncement({
                courseId: courseId,
                message: newMessage
            });

            // Replace the optimistic temp announcement with the real one from the server
            if (course) {
                setCourse(prev => prev ? {
                    ...prev,
                    announcements: [realAnnouncement, ...(prev.announcements?.filter(a => a.id !== tempId) || [])]
                } : null);
            }

            setNewMessage("");
            setIsCreating(false);
            
            // Refresh the server component to keep data in sync
            router.refresh();
        } catch (err) {
            console.error(err);
            alert("Failed to post announcement.");
            if (course) {
                setCourse(previousCourse);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric"
            });
        } catch (e) {
            return dateString;
        }
    };

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
            className="space-y-6 max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Link href={`/teachers/${id}/course-actions/announcements`} className="hover:text-blue-600 hover:underline flex items-center gap-1 transition-colors">
                            <ArrowLeft size={14} /> Back
                        </Link>
                        <span>/</span>
                        <span className="font-semibold text-gray-700">{course.courseNo}</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Manage Announcements</h2>
                    <p className="text-gray-500 text-sm mt-1">{course.courseName}</p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-all shadow-md hover:shadow-lg shadow-orange-200"
                >
                    <Plus size={18} /> New Announcement
                </motion.button>
            </div>

            {/* Create Form Modal/Inline */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm"
                    >
                        <button
                            onClick={() => setIsCreating(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 hover:bg-orange-100/50 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                                <Bell size={16} />
                            </span>
                            Create New Announcement
                        </h3>
                        <form onSubmit={handleCreate}>
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your announcement message here..."
                                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[120px] bg-white shadow-sm transition-all text-gray-700"
                                required
                            />
                            <div className="flex justify-end mt-4 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-70 flex items-center gap-2 shadow-sm"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    Post Announcement
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Announcements List */}
            <motion.div
                className="space-y-4"
                variants={containerVars}
                initial="hidden"
                animate="show"
            >
                <AnimatePresence mode="popLayout">
                    {course.announcements && course.announcements.length > 0 ? (
                        course.announcements.map((announcement) => (
                            <motion.div
                                variants={itemVars}
                                initial="hidden"
                                animate="show"
                                exit="hidden"
                                layout
                                key={announcement.id || Math.random()}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-orange-200 transition-all group hover:shadow-md"
                            >
                                <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3 text-xs text-gray-400 font-medium uppercase tracking-wide">
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                                            <Calendar size={12} className="text-orange-400" />
                                            {formatDate(announcement.timestamp)}
                                        </div>
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {announcement.message}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDelete(announcement.id!)}
                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    title="Delete Announcement"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <motion.div variants={itemVars} className="text-center py-16 bg-white rounded-2xl border border-gray-100 border-dashed">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 mb-4 group">
                            <Bell className="h-6 w-6 text-gray-300 group-hover:text-orange-500 transition-colors" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No Announcements Yet</h3>
                        <p className="mt-1 text-sm text-gray-500">Create your first announcement to notify students.</p>
                    </motion.div>
                )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}
