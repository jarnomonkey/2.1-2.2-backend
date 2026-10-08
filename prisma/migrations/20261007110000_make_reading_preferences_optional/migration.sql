-- Make optional reading preferences nullable.
ALTER TABLE "reading_profiles"
  ALTER COLUMN "lengthPref" DROP NOT NULL,
  ALTER COLUMN "readingGoal" DROP NOT NULL;