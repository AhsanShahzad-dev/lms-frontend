const isServer = typeof window === "undefined";
const BASE_URL = isServer
    ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api")
    : "/api";

// --- Types ---

export interface Student {
    id: number;
    name: string;
    regNo: string;
    emailAddress: string;
    contactNumber: string;
    guardianNumber: string;
    fatherName: string;
    program: string;
    session: string;
    semester: string;
    campus: string;
    className: string;
    nationality: string;
    dob: string;
    profilePic: string;
    password?: string; // Optional as it might not always be needed/safe to display
    cgpa: number;
    wifiAccount: string;
    office365Email: string;
    office365Pass?: string;
    batch: string;
}

export interface Announcement {
    id: number;
    courseId: number;
    message: string;
    timestamp: string;
}

export interface LearningResource {
    id: number;
    courseId: number;
    title: string;
    fileUrl: string;
}

export interface Assignment {
    id: number;
    title: string;
    description: string;
    dueDate: string;
    teacherFileUrl: string | null;
    teacherSubmitted: boolean;
    studentSubmissionFileUrl: string | null;
    status: "pending" | "submitted" | "late";
}

export interface Course {
    id: number;
    courseNo: string;
    courseName: string;
    credits: number;
    teacherId: number;
    studentIds: number[];
    announcements?: Announcement[];
    learningResources?: LearningResource[];
    assignments?: Assignment[];
}

export interface AttendanceStats {
    courseId: number;
    courseName: string;
    totalClasses: number;
    presents: number;
    absents: number;
}

export interface AttendanceRecord {
    studentId: number | string;
    present: boolean;
}

export interface AnnouncementData {
    courseId: number | string;
    message: string;
}

export interface AssignmentData {
    title: string;
    description: string;
    dueDate: string; // ISO date string expected
    teacherId: number | string;
    courseId: number | string;
}

export interface MarksData {
    courseId: number;
    courseName: string;
    quizMarks: number;
    assignmentMarks: number;
    midsMarks: number;
    finalMarks: number;
}

export interface Admin {
    id: number;
    name: string;
    regNo: string;
    emailAddress: string;
    contactNumber: string;
    guardianNumber: string;
    fatherName: string;
    program: string;
    session: string;
    semester: string;
    campus: string;
    className: string;
    nationality: string;
    dob: string;
    profilePic: string;
    designation: string;
    department: string;
}

// Admin types
export interface StudentCreationData {
    id: number;
    name: string;
    regNo: string;
    emailAddress: string;
    contactNumber: string;
    guardianNumber: string;
    fatherName: string;
    program: string;
    session: string;
    semester: string;
    campus: string;
    className: string;
    nationality: string;
    dob: string;
    profilePic: string;
    password?: string;
    cgpa?: number;
    wifiAccount?: string;
    office365Email?: string;
    office365Pass?: string;
    batch?: string;
}

export interface TeacherCreationData {
    name: string;
    regNo: string;
    emailAddress: string;
    contactNumber: string;
    guardianNumber: string;
    fatherName: string;
    program: string;
    session: string;
    semester: string;
    campus: string;
    className: string;
    nationality: string;
    dob: string;
    profilePic: string;
    password?: string;
    qualification: string;
    specialization: string;
}

export interface CourseCreationData {
    courseNo: string;
    courseName: string;
    credits: number;
}

export interface BatchAssignData {
    studentIds: number[];
    batch: string;
}

export interface AssignTeacherData {
    courseId: number;
    teacherId: number;
}

export interface AssignStudentsData {
    courseId: number;
    studentIds: number[];
}

export interface AssignBatchToCourseData {
    courseId: number;
    batchId: number;
}

// --- Helper Functions ---

/**
 * Generic GET request handler
 * @param endpoint - The API endpoint (e.g., "/student/1")
 * @returns Promise with the response data
 */
async function apiGet<T>(endpoint: string): Promise<T> {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (isServer) {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const token = cookieStore.get("jwt_token")?.value;
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "GET",
        headers,
        cache: "no-store",
    });

    if (res.status === 401) {
        throw new Error("Unauthorized");
    }

    if (!res.ok) {
        throw new Error(`API GET request failed: ${res.status} ${res.statusText}`);
    }

    return res.json();
}

/**
 * Generic POST request handler
 * @param endpoint - The API endpoint
 * @param body - The request body
 * @returns Promise with the response data
 */
async function apiPost<T>(endpoint: string, body: any): Promise<T> {
    console.log("🚀 ~ Making API Request to:", `${BASE_URL}${endpoint}`);
    console.log("📦 ~ Request Body:", JSON.stringify(body, null, 2));

    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (isServer) {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const token = cookieStore.get("jwt_token")?.value;
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        let errorMessage = `API POST request failed: ${res.status} ${res.statusText}`;
        try {
            const errorBody = await res.json();
            if (errorBody) {
                return errorBody;
            }
        } catch (e) {
            // response was not JSON or empty
        }
        // If we can't parse the error, or it's not JSON, we might still have to throw or return a generic error object
        console.warn(`API Request failed with status ${res.status}`);
        return { message: res.statusText } as any;
    }

    // Handle empty responses or non-JSON responses if necessary
    const text = await res.text();
    return text ? JSON.parse(text) : ({} as T);
}

/**
 * Generic DELETE request handler
 * @param endpoint - The API endpoint
 * @returns Promise with the response data
 */
async function apiDelete<T>(endpoint: string): Promise<T> {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (isServer) {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const token = cookieStore.get("jwt_token")?.value;
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "DELETE",
        headers,
    });

    if (!res.ok) {
        throw new Error(`API DELETE request failed: ${res.status} ${res.statusText}`);
    }

    const text = await res.text();
    return text ? JSON.parse(text) : ({} as T);
}

// --- Student Portal ---

export const getStudentProfile = (studentId: number | string) =>
    apiGet<Student>(`/student/${studentId}`);

export const getStudentCourses = (studentId: number | string) =>
    apiGet<Course[]>(`/student/${studentId}/courses`);

export const getStudentMarks = (studentId: number | string) =>
    apiGet<MarksData[]>(`/student/${studentId}/marks`);

export const getStudentAttendance = (studentId: number | string) =>
    apiGet<AttendanceStats[]>(`/student/${studentId}/attendance`);

export const getStudentAssignments = (studentId: number | string) =>
    apiGet<any>(`/student/${studentId}/assignments`);

export const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const headers: HeadersInit = {};

    if (isServer) {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const token = cookieStore.get("jwt_token")?.value;
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    }

    const res = await fetch(`${BASE_URL}/files/upload`, {
        method: "POST",
        headers, // Authorization header needs to be added here, but NOT Content-Type (browser sets it for FormData)
        body: formData,
    });

    if (!res.ok) {
        throw new Error(`File upload failed: ${res.status} ${res.statusText}`);
    }

    const filename = await res.text();
    return filename;
};

export interface AssignmentSubmission {
    studentId: number | string;
    assignmentId: number | string;
    fileUrl: string;
}

export const submitAssignment = (data: AssignmentSubmission) =>
    apiPost<any>(`/student/assignment/submit`, data);

export const getFileDownloadUrl = (path: string) => {
    // Extract filename from full path (handles both / and \)
    const filename = path.split(/[/\\]/).pop() || path;
    return `${BASE_URL}/files/download?path=${filename}`;
};

export interface StudentLoginCredentials {
    id: number;
    password: string;
}

export interface LoginResponse {
    token: string;
    email: string;
    role: string;
    id?: number; // Backend might optionally return ID
}

export const validateStudent = (data: StudentLoginCredentials) =>
    apiPost<LoginResponse>(`/student/login`, data);

export interface TeacherLoginCredentials {
    id: number;
    password: string;
}

export const validateTeacher = (data: TeacherLoginCredentials) =>
    apiPost<LoginResponse>(`/teacher/login`, data);

export interface AdminLoginCredentials {
    id: number;
    password: string;
}

export const validateAdmin = (data: AdminLoginCredentials) =>
    apiPost<LoginResponse>(`/admin/login`, data);




// --- Teacher Portal ---

export const getTeacherCourses = (teacherId: number | string) =>
    apiGet<any>(`/teacher/${teacherId}/courses`);

export const getTeacherCourseDetails = (courseCode: string, batchName: string) =>
    apiGet<any>(`/teacher/courses/${courseCode}/${batchName}`);

export const markAttendance = (courseId: number | string, attendanceData: AttendanceRecord[]) =>
    apiPost<any>(`/teacher/course/${courseId}/attendance`, attendanceData);

export const getStudentsByBatch = (courseCode: string, batchName: string) =>
    apiGet<any[]>(`/teacher/courses/${courseCode}/${batchName}`);

export const createAnnouncement = (data: AnnouncementData) =>
    apiPost<any>(`/teacher/announcement`, data);

export const deleteAnnouncement = (announcementId: number | string) =>
    apiDelete<any>(`/teacher/delannouncement/${announcementId}`);

export const createAssignment = (data: AssignmentData) =>
    apiPost<any>(`/teacher/assignment`, data);

export const getAssignmentSubmissions = (assignmentId: number | string) =>
    apiGet<any[]>(`/teacher/assignment/${assignmentId}/submissions`);

export const recordMarks = (data: MarksData) =>
    apiPost<any>(`/teacher/marks`, data);

export interface MarksSubmissionData {
    studentId: number | string;
    courseId: number | string;
    quizMarks?: number;
    assignmentMarks?: number;
    midsMarks?: number;
    finalMarks?: number;
}

export const submitMark = (data: MarksSubmissionData) =>
    apiPost<any>(`/teacher/marks`, data);

// --- Admin Portal ---

// 1. Admin Profile
export const getAdminProfile = (adminId: number | string) =>
    apiGet<Admin>(`/admin/${adminId}`);

// 2. Get All Teachers (reusing Teacher interface if compatible, or creating new if fields differ slightly)
// For now assuming Teacher interface is sufficient, but note user response included "id" which Teacher interface has.
export const getAdminTeachers = () =>
    apiGet<Teacher[]>(`/admin/teachers`);

// 3. Get Students of a Course
// Need a specific type for this response based on User Request
export interface CourseStudent {
    studentId: number;
    name: string;
    rollNo: string;
    regNo: string;
    email: string;
}

export const getAdminCourseStudents = (courseCode: string, batchName: string) =>
    apiGet<CourseStudent[]>(`/admin/courses/${courseCode}/${batchName}`);

export const getAdminCourseDetails = (courseCode: string, batchName: string) =>
    apiGet<any>(`/admin/courses/${courseCode}/${batchName}`);


export const createStudent = (data: StudentCreationData) =>
    apiPost<any>(`/admin/student`, data);

export const createTeacher = (data: TeacherCreationData) =>
    apiPost<any>(`/admin/teacher`, data);

export const createCourse = (data: CourseCreationData) =>
    apiPost<any>(`/admin/course`, data);

export const assignBatch = (data: BatchAssignData) =>
    apiPost<any>(`/admin/batch/assign`, data);

export const assignBatchToCourse = (data: AssignBatchToCourseData) =>
    apiPost<any>(`/admin/batch/assign`, data);

export const assignTeacherToCourse = (data: AssignTeacherData) =>
    apiPost<any>(`/admin/course/assign-teacher`, data);

export const assignStudentsToCourse = (data: AssignStudentsData) =>
    apiPost<any>(`/admin/course/assign-students`, data);

export interface Teacher {
    id: number;
    name: string;
    regNo: string;
    emailAddress: string;
    contactNumber: string;
    guardianNumber: string;
    fatherName: string;
    program: string;
    session: string;
    semester: string;
    campus: string;
    className: string;
    nationality: string;
    dob: string;
    profilePic: string;
    qualification: string;
    specialization: string;
}

export const getTeacherProfile = (teacherId: number | string) =>
    apiGet<Teacher>(`/teacher/${teacherId}`);

export const deleteTeacher = (teacherId: number | string) =>
    apiDelete<any>(`/admin/teacher/${teacherId}`);

export const getAdminCourses = () =>
    apiGet<Course[]>(`/admin/courses`);

export interface Batch {
    id: number;
    name: string;
}

export const getAllBatches = () =>
    apiGet<Batch[]>(`/admin/batches`);

export const deleteStudent = (studentId: number | string) =>
    apiDelete<any>(`/admin/student/${studentId}`);

export const getAllStudents = () =>
    apiGet<Student[]>(`/admin/students`);

export const createBatch = (data: { name: string }) =>
    apiPost<Batch>(`/admin/batch`, data);
