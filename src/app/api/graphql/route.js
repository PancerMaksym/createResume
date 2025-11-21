import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { connectDB } from "../../../lib/db";
import User from "../../../lib/models/user";
import { gql } from "graphql-tag";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

await connectDB();

const typeDefs = gql`
  type HTMLPart {
    id: String
    content: String
  }

  input HTMLPartInput {
    id: String
    content: String
  }

  type User {
    _id: ID!
    email: String!
    resume: Resume
  }

  type Resume {
    photo: String
    name: String!
    place: [String!]!
    tags: [String!]!
    HTMLpart: [HTMLPart!]
  }

  type Query {
    getUsers: [User!]
    getUser(id: ID!): User!
    me: User!
    getTags: [String!]!
  }

  input ResumeInput {
    photo: String
    name: String!
    place: [String!]!
    tags: [String!]!
    HTMLpart: [HTMLPartInput!]
  }

  type AuthPayload {
    token: String!
  }

  type Mutation {
    addUser(email: String!, password: String!): String!
    updateResume(resume: ResumeInput): String!
    loginUser(email: String!, password: String!): AuthPayload!
    sendEmail(email: String!): String!
    setNewPassword(token: String!, password: String!): String!
  }
`;

const JWT_SECRET = process.env.JWT_SECRET;

function generateToken(userId) {
  const payload = {
    id: userId,
  };

  const token = jwt.sign(payload, JWT_SECRET);
  return token;
}

const resolvers = {
  Query: {
    getUsers: async () => {
      return await User.find({ "resume.name": { $exists: true, $ne: "" } });
    },
    getUser: async (_, { id }) => {
      return await User.findById(id);
    },
    getTags: async () => {
      const Tags = [
        ...new Set((await User.find()).flatMap((user) => user.resume.tags)),
      ];
      return Tags;
    },
    me: async (_, __, { user }) => {
      if (!user) throw new Error("Unauthorized");
      return user;
    },
  },

  Mutation: {
    addUser: async (_, { email, password }) => {
      const hasUser = await User.findOne({ email });

      if (!hasUser) {
        try {
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(password, saltRounds);

          const newUser = new User({
            email,
            password: hashedPassword,
          });

          await newUser.save();
          return "Success";
        } catch (error) {
          console.error("❌ Error adding user:", error);

          return "Error";
        }
      } else {
        console.error("❌ User already exist:");

        return "Error";
      }
    },
    updateResume: async (_, { resume }, { user }) => {
      if (!user) throw new Error("Unauthorized");

      await User.findByIdAndUpdate(
        user._id,
        { $set: { resume: resume } },
        { new: true }
      );

      return "Success";
    },
    loginUser: async (_, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new Error("Користувача не знайдено");
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        throw new Error("Невірний пароль");
      }

      const token = generateToken(user.id);

      return {
        token,
      };
    },
    sendEmail: async (_, { email }) => {
      try {
        const user = await User.findOne({ email });

        if (!user) {
          throw new Error("User not found");
        }

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
          },
        });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "15m",
        });

        await transporter.sendMail({
          from: `"Create Resume" <${process.env.MAIL_USER}>`,
          to: email,
          subject: "Reset your password",
          text: `Click here to reset your password: ${process.env.NEXT_PUBLIC_DOMAIN}/reset?token=${token}`,
        });

        return "Success";
      } catch (err) {
        throw new Error(err.message || "Error sending email");
      }
    },
    setNewPassword: async (_, { token, password }) => {
      try {
        const saltRounds = 10;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await User.findByIdAndUpdate(
          userId,
          { $set: { password: hashedPassword } },
          { new: true }
        );

        return "Success";
      } catch (err) {
        throw new Error(err.message || "Error change password");
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const getLoggedInUser = async (req) => {
  const authHeader = req.headers.get("authorization") || "";

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split("Bearer ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
      return user;
    } catch (error) {
      console.error("Token verification failed:", error);
      throw new Error("Authentication failed");
    }
  }

  return null;
};

const handler = startServerAndCreateNextHandler(server, {
  context: async (req) => ({
    req,
    user: await getLoggedInUser(req),
  }),
});

export async function GET(request) {
  return handler(request);
}
export async function POST(request) {
  return handler(request);
}
