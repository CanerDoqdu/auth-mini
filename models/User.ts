import mongoose from 'mongoose';
import bcrypt from "bcrypt";

interface IUser {
  _id?: string;
  username: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IUserMethods {
  comparePassword(password: string): Promise<boolean>;
}

interface IUserStatics {
  signup(username: string, email: string, password: string): Promise<IUser>;
  login(username: string, password: string): Promise<IUser>;
}

type UserModel = mongoose.Model<IUser, Record<string, unknown>, IUserMethods> & IUserStatics;

const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, { timestamps: true });

    userSchema.pre("save", async function () { 
    if (!this.isModified("password")) return;

    try {
        const hashedPassword = await bcrypt.hash(this.password, 10);
        this.password = hashedPassword;
    } catch (err) {
        throw err;
    }
    });

// Signup static method
userSchema.statics.signup = async function (username: string, email: string, password: string) {
    const user = new this({ username, email, password });
    await user.save();
    return user;
};

// Login static method
userSchema.statics.login = async function (username: string, password: string) {
    const user = await this.findOne({ username });
    if (!user) {
        throw Error("Invalid username or password");
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        throw Error("Invalid username or password");
    }
    return user;
};

export default (mongoose.models.User as mongoose.Model<IUser, Record<string, unknown>, IUserMethods> & IUserStatics) || mongoose.model<IUser, UserModel>("User", userSchema);