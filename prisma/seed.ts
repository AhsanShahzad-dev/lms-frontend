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
    const batches = ["Batch-A", "Batch-B", "Batch-C", "Batch-D", "Batch-E", "Batch-F", "Batch-G", "Batch-H", "Batch-I", "Batch-J"];
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

    // 3. Create Students (10 per batch, 100 total)
    const createdStudents = [];
    for (let i = 1; i <= 100; i++) {
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
                className: `CS-${(i % 4) + 1}A`,
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

    // 5. Create Courses (3 per teacher to ensure all teachers have 3 courses)
    const courseData = [];
    for (let i = 1; i <= 30; i++) {
        courseData.push({
            courseNo: `CS-${100 + i}`,
            courseName: i === 1 ? "Introduction to Computer Science" : `Computer Science Topics ${i}`,
            credits: i % 2 === 0 ? 3 : 4,
            teacherId: ((i - 1) % 10) + 1, // Distribute evenly across 10 teachers
        });
    }

    const createdCourses = [];
    for (const c of courseData) {
        const course = await prisma.course.create({
            data: {
                courseNo: c.courseNo,
                courseName: c.courseName,
                credits: c.credits,
                teacherId: c.teacherId,
            }
        });
        createdCourses.push(course);
    }
    console.log(`Created ${createdCourses.length} courses`);

    // 6. Enroll Batches in Courses (Each course gets 3 unique batches)
    for (const course of createdCourses) {
        // Deterministically pick 3 batches based on course id to avoid full random
        const batchIndices = [
            (course.id * 1) % batches.length,
            (course.id * 2 + 1) % batches.length,
            (course.id * 3 + 2) % batches.length,
        ];
        const uniqueBatches = Array.from(new Set(batchIndices)).map(idx => batches[idx]);
        
        // Find all students in these batches
        const studentsInBatches = createdStudents.filter(s => uniqueBatches.includes(s.batchName));
        const studentIdsToConnect = studentsInBatches.map(s => ({ id: s.id }));

        await prisma.course.update({
            where: { id: course.id },
            data: {
                students: {
                    connect: studentIdsToConnect
                }
            }
        });
    }
    console.log("Enrolled students in courses by batch");

    // 7. Add Course Data (Announcements, Resources, Assignments, Attendance, Marks)
    for (const course of createdCourses) {
        // Find students enrolled in this course to generate attendance/marks
        const enrolledCourse = await prisma.course.findUnique({
            where: { id: course.id },
            include: { students: { select: { id: true } } }
        });
        
        if (!enrolledCourse || !enrolledCourse.students) continue;
        const studentIds = enrolledCourse.students.map(s => s.id);

        // Add dummy Announcements
        await prisma.announcement.create({
            data: {
                courseId: course.id,
                message: `Welcome to ${course.courseName}! Make sure to read the syllabus.`,
                timestamp: new Date(Date.now() - 3600000 * 24 * 2) 
            }
        });

        // Add dummy Learning Resources
        await prisma.learningResource.create({
            data: {
                courseId: course.id,
                title: `Lecture 1: ${course.courseName} Overview`,
                fileUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            }
        });

        // Add dummy Assignments
        const assignment1 = await prisma.assignment.create({
            data: {
                courseId: course.id,
                title: "Assignment 1: Getting Started",
                description: "Complete the setup instructions and answer the theoretical questions in the attachment.",
                dueDate: new Date(Date.now() + 3600000 * 24 * 4), 
                teacherFileUrl: "https://drive.google.com/file/d/1JrquBTSEVKfvmwnaRc8KFffyhwgP30FG/view?usp=sharing"
            }
        });

        const assignment2 = await prisma.assignment.create({
            data: {
                courseId: course.id,
                title: "Assignment 2: Deep Dive Practice",
                description: "Implement the custom components outlined in details.",
                dueDate: new Date(Date.now() - 3600000 * 24 * 1), 
                teacherFileUrl: "https://drive.google.com/file/d/1JrquBTSEVKfvmwnaRc8KFffyhwgP30FG/view?usp=sharing"
            }
        });

        // Add dummy submissions for student 12 (Ahsan Khan) if he is enrolled
        if (studentIds.includes(12)) {
            await prisma.submission.create({
                data: {
                    studentId: 12,
                    assignmentId: assignment2.id,
                    fileUrl: "https://drive.google.com/file/d/1JrquBTSEVKfvmwnaRc8KFffyhwgP30FG/view?usp=sharing",
                    submittedAt: new Date(assignment2.dueDate.getTime() - 3600000 * 2) 
                }
            });
        }

        // Add dummy Attendance & Marks records for each student in the course
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
