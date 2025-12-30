"use client";

import * as shadcnComponents from "@/utils/shadcn";
import { Sandpack } from "@codesandbox/sandpack-react";
import {
  SandpackPreview,
  SandpackProvider
} from "@codesandbox/sandpack-react/unstyled";
import { sandpackDark as draculaTheme } from "@codesandbox/sandpack-themes";
import dedent from "dedent";
import { useMemo } from "react";
import "./code-viewer.css";

export default function CodeViewer({
  code,
  showEditor = false,
}: {
  code: string;
  showEditor?: boolean;
}) {
  // Memoize files to prevent infinite re-renders during streaming
  const files = useMemo(() => ({
    "App.tsx": code,
    ...sharedFiles,
  }), [code]);

  // Use code length as key to reduce re-renders during streaming
  const codeKey = useMemo(() => Math.floor(code.length / 100), [code.length]);

  return showEditor ? (
    <Sandpack
      key={codeKey}
      options={{
        showNavigator: false,
        editorHeight: "80vh",
        showTabs: false,
        ...sharedOptions,
      }}
      files={files}
      {...sharedProps}
    />
  ) : (
    <SandpackProvider
      key={codeKey}
      files={files}
      className="flex h-full w-full grow flex-col justify-center"
      options={{ ...sharedOptions }}
      {...sharedProps}
    >
      <SandpackPreview
        className="flex h-full w-full grow flex-col justify-center p-4 md:pt-16"
        showOpenInCodeSandbox={false}
        showRefreshButton={false}
      />
    </SandpackProvider>
  );
}

let sharedProps = {
  template: "react-ts",
  theme: draculaTheme,
  customSetup: {
    dependencies: {
      "lucide-react": "0.462.0",
      "recharts": "2.9.0",
      "react-router-dom": "6.26.0",
      "framer-motion": "11.3.19",
      "react-icons": "5.2.1",
      "axios": "1.7.2",
      "@heroicons/react": "2.1.5",
      "@radix-ui/react-accordion": "^1.2.0",
      "@radix-ui/react-alert-dialog": "^1.1.1",
      "@radix-ui/react-aspect-ratio": "^1.1.0",
      "@radix-ui/react-avatar": "^1.1.0",
      "@radix-ui/react-checkbox": "^1.1.1",
      "@radix-ui/react-collapsible": "^1.1.0",
      "@radix-ui/react-dialog": "^1.1.1",
      "@radix-ui/react-dropdown-menu": "^2.1.1",
      "@radix-ui/react-hover-card": "^1.1.1",
      "@radix-ui/react-label": "^2.1.0",
      "@radix-ui/react-menubar": "^1.1.1",
      "@radix-ui/react-navigation-menu": "^1.2.0",
      "@radix-ui/react-popover": "^1.1.1",
      "@radix-ui/react-progress": "^1.1.0",
      "@radix-ui/react-radio-group": "^1.2.0",
      "@radix-ui/react-select": "^2.1.1",
      "@radix-ui/react-separator": "^1.1.0",
      "@radix-ui/react-slider": "^1.2.0",
      "@radix-ui/react-slot": "^1.1.0",
      "@radix-ui/react-switch": "^1.1.0",
      "@radix-ui/react-tabs": "^1.1.0",
      "@radix-ui/react-toast": "^1.2.1",
      "@radix-ui/react-toggle": "^1.1.0",
      "@radix-ui/react-toggle-group": "^1.1.0",
      "@radix-ui/react-tooltip": "^1.1.2",
      "class-variance-authority": "^0.7.0",
      clsx: "^2.1.1",
      "date-fns": "^3.6.0",
      "embla-carousel-react": "^8.1.8",
      "react-day-picker": "^8.10.1",
      "tailwind-merge": "^2.4.0",
      "tailwindcss-animate": "^1.0.7",
      vaul: "^0.9.1",
      "@tsparticles/react": "^3.0.0",
    },
  },
} as const;

let sharedOptions = {
  externalResources: [
    "https://cdn.tailwindcss.com",
  ],
};

let sharedFiles = {
  "/lib/utils.ts": shadcnComponents.utils,
  "/components/ui/accordion.tsx": shadcnComponents.accordian,
  "/components/ui/alert-dialog.tsx": shadcnComponents.alertDialog,
  "/components/ui/alert.tsx": shadcnComponents.alert,
  "/components/ui/avatar.tsx": shadcnComponents.avatar,
  "/components/ui/badge.tsx": shadcnComponents.badge,
  "/components/ui/breadcrumb.tsx": shadcnComponents.breadcrumb,
  "/components/ui/button.tsx": shadcnComponents.button,
  "/components/ui/calendar.tsx": shadcnComponents.calendar,
  "/components/ui/card.tsx": shadcnComponents.card,
  "/components/ui/carousel.tsx": shadcnComponents.carousel,
  "/components/ui/checkbox.tsx": shadcnComponents.checkbox,
  "/components/ui/collapsible.tsx": shadcnComponents.collapsible,
  "/components/ui/dialog.tsx": shadcnComponents.dialog,
  "/components/ui/drawer.tsx": shadcnComponents.drawer,
  "/components/ui/dropdown-menu.tsx": shadcnComponents.dropdownMenu,
  "/components/ui/input.tsx": shadcnComponents.input,
  "/components/ui/label.tsx": shadcnComponents.label,
  "/components/ui/form.tsx": shadcnComponents.form,
  "/components/ui/menubar.tsx": shadcnComponents.menuBar,
  "/components/ui/navigation-menu.tsx": shadcnComponents.navigationMenu,
  "/components/ui/pagination.tsx": shadcnComponents.pagination,
  "/components/ui/popover.tsx": shadcnComponents.popover,
  "/components/ui/progress.tsx": shadcnComponents.progress,
  "/components/ui/radio-group.tsx": shadcnComponents.radioGroup,
  "/components/ui/select.tsx": shadcnComponents.select,
  "/components/ui/separator.tsx": shadcnComponents.separator,
  "/components/ui/skeleton.tsx": shadcnComponents.skeleton,
  "/components/ui/slider.tsx": shadcnComponents.slider,
  "/components/ui/switch.tsx": shadcnComponents.switchComponent,
  "/components/ui/table.tsx": shadcnComponents.table,
  "/components/ui/tabs.tsx": shadcnComponents.tabs,
  "/components/ui/textarea.tsx": shadcnComponents.textarea,
  "/components/ui/toast.tsx": shadcnComponents.toast,
  "/components/ui/toaster.tsx": shadcnComponents.toaster,
  "/components/ui/toggle-group.tsx": shadcnComponents.toggleGroup,
  "/components/ui/toggle.tsx": shadcnComponents.toggle,
  "/components/ui/tooltip.tsx": shadcnComponents.tooltip,
  "/components/ui/use-toast.tsx": shadcnComponents.useToast,
  "/components/ui/hover-card.tsx": shadcnComponents.hoverCard,
  "/styles.css": dedent`
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      margin: 0;
      padding: 0;
    }

    * {
      box-sizing: border-box;
      border-color: hsl(214.3, 31.8%, 91.4%);
    }

    .animate-accordion-down {
      animation: accordion-down 0.2s ease-out;
    }
    .animate-accordion-up {
      animation: accordion-up 0.2s ease-out;
    }
    @keyframes accordion-down {
      from { height: 0; }
      to { height: var(--radix-accordion-content-height); }
    }
    @keyframes accordion-up {
      from { height: var(--radix-accordion-content-height); }
      to { height: 0; }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,
  "/public/index.html": dedent`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          tailwind.config = {
            darkMode: 'class',
            theme: {
              extend: {
                colors: {
                  border: "hsl(214.3, 31.8%, 91.4%)",
                  input: "hsl(214.3, 31.8%, 91.4%)",
                  ring: "hsl(222.2, 84%, 4.9%)",
                  background: "hsl(0, 0%, 100%)",
                  foreground: "hsl(222.2, 84%, 4.9%)",
                  primary: { DEFAULT: "hsl(222.2, 47.4%, 11.2%)", foreground: "hsl(210, 40%, 98%)" },
                  secondary: { DEFAULT: "hsl(210, 40%, 96.1%)", foreground: "hsl(222.2, 47.4%, 11.2%)" },
                  destructive: { DEFAULT: "hsl(0, 84.2%, 60.2%)", foreground: "hsl(210, 40%, 98%)" },
                  muted: { DEFAULT: "hsl(210, 40%, 96.1%)", foreground: "hsl(215.4, 16.3%, 46.9%)" },
                  accent: { DEFAULT: "hsl(210, 40%, 96.1%)", foreground: "hsl(222.2, 47.4%, 11.2%)" },
                  popover: { DEFAULT: "hsl(0, 0%, 100%)", foreground: "hsl(222.2, 84%, 4.9%)" },
                  card: { DEFAULT: "hsl(0, 0%, 100%)", foreground: "hsl(222.2, 84%, 4.9%)" },
                },
                borderRadius: {
                  lg: "0.5rem",
                  md: "calc(0.5rem - 2px)",
                  sm: "calc(0.5rem - 4px)",
                },
              }
            }
          }
        </script>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
          * { border-color: hsl(214.3, 31.8%, 91.4%); }
        </style>
      </head>
      <body class="bg-white text-gray-900 antialiased">
        <div id="root"></div>
      </body>
    </html>
  `,
};