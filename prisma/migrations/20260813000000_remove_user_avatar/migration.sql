-- Revert avatar/character system: drop avatarStyle/avatarColor from User
ALTER TABLE "User" DROP COLUMN "avatarColor",
DROP COLUMN "avatarStyle";
