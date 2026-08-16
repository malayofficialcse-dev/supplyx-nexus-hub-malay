import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supplyx_fallback_secret_key_change_me";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: Record<string, {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  }>;
}

export interface CustomRequest extends Request {
  user?: AuthenticatedUser;
}

export function authenticateToken(req: CustomRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token is missing or invalid" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token is invalid or expired" });
  }
}

export function requirePermission(moduleName: string, action: "view" | "create" | "edit" | "delete") {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "User is not authenticated" });
    }

    // Superadmin has absolute access to everything
    if (req.user.role === "Superadmin") {
      return next();
    }

    const userPermissions = req.user.permissions;
    const modulePerms = userPermissions?.[moduleName];

    if (modulePerms && modulePerms[action] === true) {
      return next();
    }

    return res.status(403).json({
      message: `You do not have permission to ${action} in ${moduleName}`
    });
  };
}

export function autoAuthorize() {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "User is not authenticated" });
    }

    // Superadmin has absolute access to everything
    if (req.user.role === "Superadmin") {
      return next();
    }

    // Determine the module based on path
    const path = req.baseUrl || req.path;
    let moduleName = "";

    if (path.includes("/api/suppliers/budget") || path.includes("/api/budget")) {
      moduleName = "budget";
    } else if (path.includes("/api/suppliers")) {
      moduleName = "suppliers";
    } else if (path.includes("/api/quotes")) {
      moduleName = "quotes";
    } else if (path.includes("/api/requisitions")) {
      moduleName = "requisitions";
    } else if (path.includes("/api/orders")) {
      moduleName = "orders";
    } else if (path.includes("/api/rfqs")) {
      moduleName = "rfqs";
    } else if (path.includes("/api/analytics")) {
      moduleName = "analytics";
    } else if (path.includes("/api/warehouses")) {
      moduleName = "warehouses";
    } else if (path.includes("/api/shipments")) {
      moduleName = "shipments";
    } else if (path.includes("/api/logistics")) {
      moduleName = "logistics";
    } else if (path.includes("/api/customers")) {
      moduleName = "customers";
    } else if (path.includes("/api/carriers")) {
      moduleName = "carriers";
    } else if (path.includes("/api/contracts")) {
      moduleName = "contracts";
    } else if (path.includes("/api/invoices")) {
      moduleName = "invoices";
    } else if (path.includes("/api/payments")) {
      moduleName = "payments";
    } else if (path.includes("/api/goods-receipts")) {
      moduleName = "goods-receipts";
    } else if (path.includes("/api/inventories") || path.includes("/api/inventory")) {
      moduleName = "inventory";
    } else {
      return next();
    }

    // Determine action based on method
    let action: "view" | "create" | "edit" | "delete" = "view";
    if (req.method === "POST") {
      action = "create";
    } else if (req.method === "PUT" || req.method === "PATCH") {
      action = "edit";
    } else if (req.method === "DELETE") {
      action = "delete";
    }

    const userPermissions = req.user.permissions;
    const modulePerms = userPermissions?.[moduleName];

    if (modulePerms && modulePerms[action] === true) {
      return next();
    }

    return res.status(403).json({
      message: `You do not have permission to ${action} in ${moduleName}`
    });
  };
}
