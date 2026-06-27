import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Start seeding SQLite database...");

    // Clear existing data
    await prisma.submission.deleteMany({});
    await prisma.attendanceRecord.deleteMany({});
    await prisma.marks.deleteMany({});
    await prisma.announcement.deleteMany({});
    await prisma.learningResource.deleteMany({});
    await prisma.assignment.deleteMany({});
    await prisma.course.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.teacher.deleteMany({});
    await prisma.admin.deleteMany({});
    await prisma.batch.deleteMany({});

    // Hash default passwords
    const hashedPassword = await bcrypt.hash("password", 10);
    const hashedAdminPassword = await bcrypt.hash("admin123", 10);

    // 1. Create Batches
    const batches = ["Batch-A", "Batch-B", "Batch-C", "Batch-D", "Batch-E"];
    const createdBatches = [];
    for (const name of batches) {
        const b = await prisma.batch.create({ data: { name } });
        createdBatches.push(b);
    }
    console.log(`Created ${createdBatches.length} batches`);

    // 2. Create Teachers
    const createdTeachers = [];
    for (let i = 1; i <= 10; i++) {
        const teacher = await prisma.teacher.create({
            data: {
                id: i,
                name: `Prof. Teacher ${i}`,
                regNo: `T-${String(i).padStart(3, "0")}`,
                emailAddress: `teacher${i}@university.edu`,
                contactNumber: `0300-${3000000 + i}`,
                guardianNumber: `0300-${4000000 + i}`,
                fatherName: `Father of Teacher ${i}`,
                program: "Computer Science",
                session: "FA24",
                semester: String((i % 3) + 1),
                campus: "Main",
                className: `CS-${(i % 3) + 1}A`,
                nationality: "Pakistani",
                dob: "1980-01-01",
                profilePic: "",
                qualification: i % 2 === 0 ? "PhD CS" : "MSCS",
                specialization: i % 2 === 0 ? "Machine Learning" : "Web Development",
                password: hashedPassword,
            },
        });
        createdTeachers.push(teacher);
    }
    console.log(`Created ${createdTeachers.length} teachers`);

    // 3. Create Students
    const createdStudents = [];
    for (let i = 1; i <= 50; i++) {
        const batchName = batches[Math.floor((i - 1) / 10)];
        const student = await prisma.student.create({
            data: {
                id: i,
                name: i === 12 ? "Ahsan Khan" : `Student Name ${i}`,
                regNo: i === 12 ? "CS-001" : `CS-${String(i).padStart(3, "0")}`,
                emailAddress: `student${i}@university.edu`,
                contactNumber: `0300-${1000000 + i}`,
                guardianNumber: `0300-${2000000 + i}`,
                fatherName: `Father of Student ${i}`,
                program: "BSCS",
                session: "2024-2028",
                semester: String((i % 4) + 1),
                campus: "Main",
                className: `CS-${(i % 4) + 1}${["A", "B", "C"][i % 3]}`,
                nationality: "Pakistani",
                dob: "2005-01-01",
                profilePic: "",
                password: hashedPassword,
                cgpa: Number((3.0 + (i % 11) * 0.1).toFixed(2)),
                wifiAccount: `wifi-std-${i}`,
                office365Email: `std${i}@office365.university.edu`,
                office365Pass: `OfficePass${i}!`,
                batchName: batchName,
            },
        });
        createdStudents.push(student);
    }
    console.log(`Created ${createdStudents.length} students`);

    // 4. Create Admin
    await prisma.admin.create({
        data: {
            id: 1,
            name: "Super Admin",
            regNo: "A-001",
            emailAddress: "admin@university.edu",
            contactNumber: "0300-9999999",
            guardianNumber: "0300-8888888",
            fatherName: "Father of Admin",
            program: "Administration",
            session: "N/A",
            semester: "N/A",
            campus: "Main",
            className: "N/A",
            nationality: "Pakistani",
            dob: "1975-01-01",
            profilePic: "",
            designation: "Chief Administrator",
            department: "IT Services",
            password: hashedAdminPassword,
        },
    });
    console.log("Created Admin account");

    // 5. Create Courses & Enroll Students
    const courseData = [
        { courseNo: "CS-101", courseName: "Introduction to Computer Science", credits: 4, teacherId: 1 },
        { courseNo: "CS-102", courseName: "Object Oriented Programming", credits: 4, teacherId: 2 },
        { courseNo: "CS-201", courseName: "Data Structures", credits: 4, teacherId: 3 },
        { courseNo: "CS-202", courseName: "Database Systems", credits: 4, teacherId: 4 },
        { courseNo: "CS-301", courseName: "Software Engineering", credits: 3, teacherId: 5 },
    ];

    const createdCourses = [];
    for (const c of courseData) {
        // Enroll students 1-25 to courses 1, 3, 5 and students 26-50 to courses 2, 4
        const studentIds = c.teacherId % 2 !== 0 
            ? Array.from({ length: 25 }, (_, idx) => idx + 1)
            : Array.from({ length: 25 }, (_, idx) => idx + 26);

        const course = await prisma.course.create({
            data: {
                courseNo: c.courseNo,
                courseName: c.courseName,
                credits: c.credits,
                teacherId: c.teacherId,
                students: {
                    connect: studentIds.map(id => ({ id }))
                }
            }
        });
        createdCourses.push(course);

        // Add dummy Announcements for the course
        await prisma.announcement.create({
            data: {
                courseId: course.id,
                message: `Welcome to ${course.courseName}! Make sure to read the syllabus.`,
                timestamp: new Date(Date.now() - 3600000 * 24 * 2) // 2 days ago
            }
        });
        await prisma.announcement.create({
            data: {
                courseId: course.id,
                message: "Reminder: The next lab assignment is uploaded and due next week.",
                timestamp: new Date(Date.now() - 3600000 * 3) // 3 hours ago
            }
        });

        // Add dummy Learning Resources
        await prisma.learningResource.create({
            data: {
                courseId: course.id,
                title: "Lecture 1: Course Overview & Introduction",
                fileUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            }
        });
        await prisma.learningResource.create({
            data: {
                courseId: course.id,
                title: "Lecture 2: Core Concepts Reference PDF",
                fileUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e4/A_small_PDF.pdf"
            }
        });

        // Add dummy Assignments
        const assignment1 = await prisma.assignment.create({
            data: {
                courseId: course.id,
                title: "Assignment 1: Getting Started",
                description: "Complete the setup instructions and answer the theoretical questions in the attachment.",
                dueDate: new Date(Date.now() + 3600000 * 24 * 4), // 4 days in future
                teacherFileUrl: "assignment_1_guide.pdf"
            }
        });

        const assignment2 = await prisma.assignment.create({
            data: {
                courseId: course.id,
                title: "Assignment 2: Deep Dive Practice",
                description: "Implement the custom components outlined in details.",
                dueDate: new Date(Date.now() - 3600000 * 24 * 1), // 1 day in past
                teacherFileUrl: "assignment_2_details.pdf"
            }
        });

        // Add dummy submissions for student 12 (Ahsan Khan) if he is enrolled
        if (studentIds.includes(12)) {
            // Submitted Assignment 2 (past due date, submitted on time)
            await prisma.submission.create({
                data: {
                    studentId: 12,
                    assignmentId: assignment2.id,
                    fileUrl: "submission_ahsan_assignment_2.pdf",
                    submittedAt: new Date(assignment2.dueDate.getTime() - 3600000 * 2) // 2 hours before due
                }
            });
        }

        // Add dummy Attendance records for each student in the course
        for (const sId of studentIds) {
            // Record 5 sessions
            for (let day = 1; day <= 5; day++) {
                await prisma.attendanceRecord.create({
                    data: {
                        studentId: sId,
                        courseId: course.id,
                        date: new Date(Date.now() - 3600000 * 24 * day),
                        present: (sId + day) % 6 !== 0 // Some random absents
                    }
                });
            }

            // Add dummy Marks
            await prisma.marks.create({
                data: {
                    studentId: sId,
                    courseId: course.id,
                    quizMarks: Number((5.0 + (sId % 5) * 1.0).toFixed(2)),
                    assignmentMarks: Number((6.0 + (sId % 4) * 1.0).toFixed(2)),
                    midsMarks: Number((15.0 + (sId % 10) * 1.0).toFixed(2)),
                    finalMarks: Number((30.0 + (sId % 20) * 1.0).toFixed(2)),
                }
            });
        }
    }
    console.log(`Created ${createdCourses.length} courses, announcements, resources, assignments, attendance records, and marks`);

    console.log("🌱 Database seeding complete!");
}

main()
    .catch((e) => {
        console.error("Error during database seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
