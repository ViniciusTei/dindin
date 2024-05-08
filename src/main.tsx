import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { Link, RouterProvider, createRouter } from "@tanstack/react-router";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import "./index.css";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => {
    return (
      <div className="mx-auto my-auto">
        <p>Not found!</p>
        <Link to="/">Go home</Link>
      </div>
    );
  },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
});

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <PostHogProvider client={posthog}>
        <RouterProvider router={router} />
      </PostHogProvider>
    </StrictMode>,
  );
}
