import { Response } from "express";
import { CustomRequest, AuthenticatedUser } from "../middleware/auth.js";
import { prisma } from "../repositories/scm.repo.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supplyx_fallback_secret_key_change_me";

export class UserController {
  async login(req: CustomRequest, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const payload: AuthenticatedUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions as Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }>,
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });

      return res.json({
        token,
        user: payload,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getMe(req: CustomRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const payload: AuthenticatedUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions as Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }>,
      };

      return res.json(payload);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getUsers(req: CustomRequest, res: Response) {
    try {
      if (req.user?.role !== "Superadmin") {
        return res.status(403).json({ message: "Forbidden: Superadmin access required" });
      }

      const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
      });

      // Map users to remove password
      const result = users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        permissions: u.permissions,
        createdAt: u.createdAt,
      }));

      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async createUser(req: CustomRequest, res: Response) {
    try {
      if (req.user?.role !== "Superadmin") {
        return res.status(403).json({ message: "Forbidden: Superadmin access required" });
      }

      const { email, password, name, role, permissions } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ message: "Email, password, and name are required" });
      }

      const existing = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (existing) {
        return res.status(400).json({ message: "Email is already in use" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          name,
          role: role || "User",
          permissions: permissions || {},
        },
      });

      return res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        permissions: newUser.permissions,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async updateUser(req: CustomRequest, res: Response) {
    try {
      if (req.user?.role !== "Superadmin") {
        return res.status(403).json({ message: "Forbidden: Superadmin access required" });
      }

      const { id } = req.params;
      const { email, password, name, role, permissions } = req.body;

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const data: any = {};
      if (email) {
        const existing = await prisma.user.findFirst({
          where: { email: email.toLowerCase(), NOT: { id } },
        });
        if (existing) {
          return res.status(400).json({ message: "Email is already in use" });
        }
        data.email = email.toLowerCase();
      }
      if (name) data.name = name;
      if (role) data.role = role;
      if (permissions) data.permissions = permissions;
      if (password) {
        data.password = await bcrypt.hash(password, 10);
      }

      const updated = await prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          permissions: true,
        },
      });

      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async deleteUser(req: CustomRequest, res: Response) {
    try {
      if (req.user?.role !== "Superadmin") {
        return res.status(403).json({ message: "Forbidden: Superadmin access required" });
      }

      const { id } = req.params;

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role === "Superadmin") {
        const count = await prisma.user.count({ where: { role: "Superadmin" } });
        if (count <= 1) {
          return res.status(400).json({ message: "Cannot delete the last Superadmin user" });
        }
      }

      await prisma.user.delete({ where: { id } });
      return res.json({ message: "User deleted successfully" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
