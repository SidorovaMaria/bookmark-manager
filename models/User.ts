import { Schema, models, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  image?: string;
  lastLoginAt?: Date;
  signInCount: number;
  createdAt: Date;
  updatedAt: Date;
}
/**
 * User
 * - email: unique + lowercase to avoid case-dup bugs
 * - passwordHash: bcrypt hash of user password (never store plaintext)
 * - image: optional avatar (you can later move this to Cloudinary)
 * - audit fields: lastLoginAt, signInCount
 */
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, trim: true, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    salt: { type: String, required: true },
    passwordHash: { type: String, required: true },
    image: { type: String },
    lastLoginAt: Date,
    signInCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
// In case this file is hot-reloaded, reuse existing model
export const User = models.User || model<IUser>("User", UserSchema);

//? Why use index on the email?
//To speed up queries searching by email, especially for login and signup operations.
// ? Trade offs
// -Speeds up reads (+)
// -Can enforce uniqueness (+)
// -Slightly slower writes due to index maintenance (-)
// -Consumes additional storage for the index (-)

// ? Used for
//Signup route: validate body → hashPassword() → save User.
//Login route: find by normalized email → verifyPassword() → issue access & refresh tokens → set cookies.
//Refresh route: rotate refresh tokens (we’ll add a RefreshToken model then).
//Protected routes: read & verify access token from HttpOnly cookie.
