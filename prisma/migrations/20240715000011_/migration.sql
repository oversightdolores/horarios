-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "morning" TEXT[],
    "afternoon" TEXT[],
    "night" TEXT[],
    "dayOff" TEXT[],

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);
