import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppShell } from "../components/AppShell";
import { AuthProvider, useAuth } from "../lib/auth.js";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-semibold text-foreground">404</h1>
        <h2 className="mt-3 text-lg font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This module does not exist in the SupplyX workspace.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Try refreshing or return to the dashboard.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-sm border border-input bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SupplyX — Supply Chain Management Suite" },
      {
        name: "description",
        content:
          "Enterprise supply chain management: procurement, inventory, logistics and finance in one workspace.",
      },
      { property: "og:title", content: "SupplyX — Supply Chain Management Suite" },
      {
        property: "og:description",
        content:
          "Enterprise supply chain management: procurement, inventory, logistics and finance in one workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0e12] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-[12px] text-muted-foreground font-medium tracking-wide">Initializing workspace security...</p>
        </div>
      </div>
    );
  }

  const isLoginPage = pathname === "/login";

  if (!user && !isLoginPage) {
    return <RedirectToLogin />;
  }

  if (user && isLoginPage) {
    return <RedirectToHome />;
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}

function RedirectToLogin() {
  useEffect(() => {
    window.location.replace("/login");
  }, []);
  return null;
}

function RedirectToHome() {
  useEffect(() => {
    window.location.replace("/");
  }, []);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGuard>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </AuthGuard>
      </AuthProvider>
      <Toaster position="bottom-right" toastOptions={{ style: { borderRadius: "3px" } }} />
    </QueryClientProvider>
  );
}
