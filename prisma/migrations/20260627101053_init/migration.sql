-- CreateTable
CREATE TABLE "Admin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "regNo" TEXT NOT NULL,
    "emailAddress" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "guardianNumber" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "session" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "campus" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "dob" TEXT NOT NULL,
    "profilePic" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "regNo" TEXT NOT NULL,
    "emailAddress" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "guardianNumber" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "session" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "campus" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "dob" TEXT NOT NULL,
    "profilePic" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Student" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "regNo" TEXT NOT NULL,
    "emailAddress" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "guardianNumber" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "session" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "campus" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "dob" TEXT NOT NULL,
    "profilePic" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "cgpa" REAL NOT NULL DEFAULT 0.0,
    "wifiAccount" TEXT NOT NULL,
    "office365Email" TEXT NOT NULL,
    "office365Pass" TEXT NOT NULL,
    "batchName" TEXT NOT NULL,
    CONSTRAINT "Student_batchName_fkey" FOREIGN KEY ("batchName") REFERENCES "Batch" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Course" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "courseNo" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "teacherId" INTEGER,
    CONSTRAINT "Course_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "courseId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Announcement_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LearningResource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "courseId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    CONSTRAINT "LearningResource_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "courseId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "teacherFileUrl" TEXT,
    CONSTRAINT "Assignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "assignmentId" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Submission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Submission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "present" BOOLEAN NOT NULL,
    CONSTRAINT "AttendanceRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AttendanceRecord_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Marks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "quizMarks" REAL NOT NULL DEFAULT 0.0,
    "assignmentMarks" REAL NOT NULL DEFAULT 0.0,
    "midsMarks" REAL NOT NULL DEFAULT 0.0,
    "finalMarks" REAL NOT NULL DEFAULT 0.0,
    CONSTRAINT "Marks_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Marks_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_StudentCourses" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_StudentCourses_A_fkey" FOREIGN KEY ("A") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_StudentCourses_B_fkey" FOREIGN KEY ("B") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Batch_name_key" ON "Batch"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_studentId_assignmentId_key" ON "Submission"("studentId", "assignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Marks_studentId_courseId_key" ON "Marks"("studentId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "_StudentCourses_AB_unique" ON "_StudentCourses"("A", "B");

-- CreateIndex
CREATE INDEX "_StudentCourses_B_index" ON "_StudentCourses"("B");
