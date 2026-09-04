import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
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
      { title: "Todellaa | Payment Verification & Reconciliation" },
      {
        name: "description",
        content:
          "Todellaa helps businesses verify payments, reconcile transactions, and maintain accurate financial records with confidence.",
      },
      { name: "author", content: "Dr Noskim Atidigah, Todellaa" },
      { name: "keywords", content: "payment verification, payment reconciliation, invoice matching, Paystack, bank sync, mobile money, financial operations, automated reconciliation, Todellaa" },
      { name: "theme-color", content: "#e8562a" },
      // Open Graph
      { property: "og:title", content: "Todellaa | Payment Verification & Reconciliation" },
      {
        property: "og:description",
        content:
          "Todellaa helps businesses verify payments, reconcile transactions, and maintain accurate financial records with confidence.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://todellaa.com" },
      { property: "og:image", content: "/logo.png" },
      { property: "og:image:alt", content: "Todellaa Logo" },
      { property: "og:site_name", content: "Todellaa" },
      // Twitter Card
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Todellaa | Payment Verification & Reconciliation" },
      {
        name: "twitter:description",
        content:
          "Todellaa helps businesses verify payments, reconcile transactions, and maintain accurate financial records with confidence.",
      },
      { name: "twitter:image", content: "/logo.png" },
    ],
    links: [
      {
        rel: "icon",
        href: "/logo.png",
        type: "image/png",
      },
      {
        rel: "apple-touch-icon",
        href: "/logo.png",
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Sora:wght@400;600;700;800&family=Syne:wght@600;700;800&family=Space+Grotesk:wght@500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Inter:ital,wght@0,300..800;1,300..800&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script src="https://js.paystack.co/v1/inline.js" async></script>
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

