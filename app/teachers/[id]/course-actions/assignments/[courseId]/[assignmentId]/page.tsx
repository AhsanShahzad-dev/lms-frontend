import { Search, Download, AlertCircle, FileText, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { getTeacherCourses, getAssignmentSubmissions, getFileDownloadUrl, Course } from "@/lib/api";
import Link from "next/link";

export default async function AssignmentSubmissionsPage({
    params,
}: {
    params: Promise<{ id: string; courseId: string; assignmentId: string }>;
}) {
    const { id, courseId, assignmentId } = await params;

    // Validate assignmentId is a number
    if (isNaN(Number(assignmentId))) {
        return (
            <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-red-200">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Invalid Assignment ID</h2>
                <p className="text-gray-500">The assignment ID "{assignmentId}" is not valid.</p>
                <Link href={`/teachers/${id}/course-actions/assignments/${courseId}`} className="mt-6 inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Go Back to Assignments
                </Link>
            </div>
        );
    }

    const getValidUrl = (url: string) => {
        if (!url) return "#";
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        return `https://${url}`;
    };

    // Fetch Data
    // We need course details (for total student list) AND submissions
    let submissions: any[] = [];
    let courseStudents: number[] = [];
    let courseName = "";

    try {
        const [submissionsData, coursesData] = await Promise.all([
            getAssignmentSubmissions(assignmentId),
            getTeacherCourses(id)
        ]);

        if (Array.isArray(submissionsData)) {
            submissions = submissionsData;
        }

        if (Array.isArray(coursesData)) {
            const course = coursesData.find((c: any) => c.id == courseId);
            if (course) {
                courseStudents = course.studentIds || [];
                courseName = course.courseName;
            }
        }

    } catch (error) {
        console.warn("Failed to catch data", error);
    }

    // Identify missing students (Logic: if studentId in courseStudents but not in submissions)
    // Note: submissions array has objects with studentId. courseStudents is array of IDs.
    const submittedStudentIds = submissions.map(s => Number(s.studentId));
    const missingCount = courseStudents.filter(sid => !submittedStudentIds.includes(Number(sid))).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Link href={`/teachers/${id}/course-actions/assignments/${courseId}`} className="hover:text-blue-600 hover:underline flex items-center gap-1">
                            <ArrowLeft size={14} /> Back to Assignments
                        </Link>
                        <span>/</span>
                        <span className="font-semibold text-gray-700">Submissions</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Student Submissions</h2>
                    <p className="text-gray-500 text-sm mt-1">{courseName}</p>
                </div>

                <div className="flex gap-4 text-sm font-medium bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle size={16} /> {submissions.length} Submitted
                    </div>
                    <div className="w-px bg-gray-200"></div>
                    <div className="flex items-center gap-2 text-red-500">
                        <XCircle size={16} /> {missingCount} Missing
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700">Submission List</h3>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search student..."
                            className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 w-full"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Student Name</th>
                                <th className="px-6 py-4">Submission Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {submissions.length > 0 ? (
                                submissions.map((sub, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                                                    {sub.studentName?.charAt(0) || "S"}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{sub.studentName || `Student ${sub.studentId}`}</div>
                                                    <div className="text-xs text-gray-500">ID: {sub.studentId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                                            {new Date(sub.submittedAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                <CheckCircle size={12} /> Submitted
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {sub.fileUrl ? (
                                                <a href={getValidUrl(sub.fileUrl)} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 text-sm font-medium hover:underline inline-flex items-center gap-1">
                                                    <FileText size={14} /> View URL
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 text-sm text-xs italic">No File</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <FileText className="h-8 w-8 text-gray-300 mb-2" />
                                            <p>No submissions found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
