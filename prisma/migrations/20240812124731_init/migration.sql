-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "morning" TEXT[],
    "afternoon" TEXT[],
    "night" TEXT[],
    "dayOff" TEXT[],
    "position" TEXT NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "position" TEXT NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LastShift" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "index" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LastShift_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");
