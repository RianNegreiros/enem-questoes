-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "givenName" TEXT,
    "familyName" TEXT,
    "picture" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerHistory" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "index" INTEGER NOT NULL,
    "discipline" TEXT,
    "selectedAnswer" TEXT NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AnswerHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "AnswerHistory_userId_idx" ON "AnswerHistory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AnswerHistory_userId_questionId_key" ON "AnswerHistory"("userId", "questionId");

-- AddForeignKey
ALTER TABLE "AnswerHistory" ADD CONSTRAINT "AnswerHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
