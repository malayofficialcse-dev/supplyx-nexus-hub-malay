import jwt from "jsonwebtoken";
import { prisma } from "../repositories/scm.repo.js";
const JWT_SECRET = process.env.JWT_SECRET || "supplyx_fallback_secret_key_change_me";
export async function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Access token is missing or invalid" });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Fetch live user from database to ensure up-to-date permissions
        const dbUser = await prisma.user.findUnique({
            where: { id: decoded.id },
        });
        if (!dbUser) {
            return res.status(401).json({ message: "User account not found or has been revoked" });
        }
        req.user = {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role,
            permissions: (typeof dbUser.permissions === "string"
                ? JSON.parse(dbUser.permissions)
                : dbUser.permissions) || {},
        };
        next();
    }
    catch (error) {
        return res.status(403).json({ message: "Token is invalid or expired" });
    }
}
export function requirePermission(moduleName, action) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "User is not authenticated" });
        }
        // Superadmin has absolute access to everything
        if (req.user.role === "Superadmin") {
            return next();
        }
        let userPermissions = req.user.permissions;
        if (typeof userPermissions === "string") {
            try {
                userPermissions = JSON.parse(userPermissions);
            }
            catch (e) { }
        }
        const modulePerms = userPermissions?.[moduleName];
        if (modulePerms && Boolean(modulePerms[action]) === true) {
            return next();
        }
        return res.status(403).json({
            message: `You do not have permission to ${action} in ${moduleName}`
        });
    };
}
export function autoAuthorize() {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "User is not authenticated" });
        }
        // Superadmin has absolute access to everything
        if (req.user.role === "Superadmin") {
            return next();
        }
        // Determine the module based on path
        const path = (req.originalUrl || req.baseUrl || req.path || "").toLowerCase();
        let moduleName = "";
        if (path.includes("/api/suppliers/budget") || path.includes("/api/budget")) {
            moduleName = "budget";
        }
        else if (path.includes("/api/suppliers")) {
            moduleName = "suppliers";
        }
        else if (path.includes("/api/quotes")) {
            moduleName = "quotes";
        }
        else if (path.includes("/api/requisitions")) {
            moduleName = "requisitions";
        }
        else if (path.includes("/api/orders")) {
            moduleName = "orders";
        }
        else if (path.includes("/api/rfqs")) {
            moduleName = "rfqs";
        }
        else if (path.includes("/api/analytics")) {
            moduleName = "analytics";
        }
        else if (path.includes("/api/warehouses")) {
            moduleName = "warehouses";
        }
        else if (path.includes("/api/shipments")) {
            moduleName = "shipments";
        }
        else if (path.includes("/api/logistics")) {
            moduleName = "logistics";
        }
        else if (path.includes("/api/customers")) {
            moduleName = "customers";
        }
        else if (path.includes("/api/carriers")) {
            moduleName = "carriers";
        }
        else if (path.includes("/api/contracts")) {
            moduleName = "contracts";
        }
        else if (path.includes("/api/invoices")) {
            moduleName = "invoices";
        }
        else if (path.includes("/api/payments")) {
            moduleName = "payments";
        }
        else if (path.includes("/api/goods-receipts")) {
            moduleName = "goods-receipts";
        }
        else if (path.includes("/api/inventories") || path.includes("/api/inventory")) {
            moduleName = "inventory";
        }
        else {
            return next();
        }
        // Determine action based on HTTP method
        let action = "view";
        if (req.method === "POST") {
            action = "create";
        }
        else if (req.method === "PUT" || req.method === "PATCH") {
            action = "edit";
        }
        else if (req.method === "DELETE") {
            action = "delete";
        }
        let userPermissions = req.user.permissions;
        if (typeof userPermissions === "string") {
            try {
                userPermissions = JSON.parse(userPermissions);
            }
            catch (e) { }
        }
        const modulePerms = userPermissions?.[moduleName];
        if (modulePerms && Boolean(modulePerms[action]) === true) {
            return next();
        }
        return res.status(403).json({
            message: `You do not have permission to ${action} in ${moduleName}`
        });
    };
}
