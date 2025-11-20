"use client";

import CodeViewer from "@/components/code-viewer";
import { useScrollTo } from "@/hooks/use-scroll-to";
import { CheckIcon } from "@heroicons/react/16/solid";
import { ArrowLongRightIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import * as Select from "@radix-ui/react-select";
import * as Tooltip from "@radix-ui/react-tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useEffect, useState, useCallback } from "react";
import { toast, Toaster } from "sonner";
import LoadingDots from "../../components/loading-dots";
import ProductHunt from "@/components/producthunt";
import { useTheme } from "next-themes"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export default function Home() {
  let [status, setStatus] = useState<
    "initial" | "creating" | "created" | "updating" | "updated"
  >("initial");
  let [prompt, setPrompt] = useState("");
  let models = [
    { label: "zai-org/GLM-4.6", value: "zai-org/GLM-4.6" },
  ];
  let [model, setModel] = useState(models[0].value);
  let [shadcn, setShadcn] = useState(false);
  let [modification, setModification] = useState("");
  let [generatedCode, setGeneratedCode] = useState("");
  let [initialAppConfig, setInitialAppConfig] = useState({
    model: "",
    shadcn: true,
  });
  let [ref, scrollTo] = useScrollTo();
  let [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  let [isPublishing, setIsPublishing] = useState(false);

  let loading = status === "creating" || status === "updating";

  const createApp = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (status !== "initial") {
        scrollTo({ delay: 0.5 });
      }

      if (status === "creating") return;

      setStatus("creating");
      setGeneratedCode("");

      try {
        const res = await fetch("/api/generateCode", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (!res.ok) {
          if (res.status === 401) {
            toast.error("Please sign in to generate components");
            setStatus("initial");
            return;
          }
          const errorText = await res.text();
          throw new Error(`Error: ${res.statusText}, ${errorText}`);
        }

        if (!res.body) {
          throw new Error("No response body");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let done = false;

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;

          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            setGeneratedCode((prev) => prev + chunk);
          }
        }

        setMessages([{ role: "user", content: prompt }]);
        setInitialAppConfig({ model, shadcn });
        setStatus("created");
      } catch (error) {
        console.error("Error creating app:", error);
        toast.error("An error occurred while creating the app.");
        setStatus("initial");
      }
    },
    [status, model, prompt, scrollTo]
  );


  const updateApp = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (status === "updating") return;

      setStatus("updating");
      setGeneratedCode("");

      let codeMessage = { role: "assistant", content: generatedCode };
      let modificationMessage = { role: "user", content: modification };

      try {
        const res = await fetch("/api/generateCode", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, codeMessage, modificationMessage],
            model: initialAppConfig.model,
          }),
        });

        if (!res.ok) {
          if (res.status === 401) {
            toast.error("Please sign in to update components");
            setStatus("created");
            return;
          }
          const errorText = await res.text();
          throw new Error(`Error: ${res.statusText}, ${errorText}`);
        }

        if (!res.body) {
          throw new Error("No response body");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let done = false;

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;

          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            setGeneratedCode((prev) => prev + chunk);
          }
        }

        setMessages((prevMessages) => [...prevMessages, codeMessage, modificationMessage]);
        setStatus("updated");
      } catch (error) {
        console.error("Error updating app:", error);
        toast.error("An error occurred while updating the app.");
        setStatus("initial");
      }
    },
    [status, generatedCode, modification, messages, initialAppConfig]
  );

  useEffect(() => {
    let el = document.querySelector(".cm-scroller");
    if (el && loading) {
      let end = el.scrollHeight - el.clientHeight;
      el.scrollTo({ top: end });
    }
  }, [loading]);

  const [mounted, setMounted] = useState(false)
  const { setTheme, theme } = useTheme()

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <main className="mt-12 flex w-full flex-1 flex-col items-center px-4 text-center">
      <div className="py-4" >
        <ProductHunt />
      </div>

      <h1 className="md:text-6xl text-3xl font-regular tracking-tight mb-6 mt-6">
        Create React Components
        <br />
        <span className="text-[#9AE65C]">Instantly</span> with AI for Free
      </h1>

      <p className="md:text-xm text-sm text-muted-foreground mb-6">
        Experience the power of AI with unlimited usage, no API key required.
      </p>

      <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
        <div className="relative w-full">
          <form onSubmit={createApp}>
            <Input
              required
              value={prompt}
              disabled={loading}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Build me a contact form"
              className="w-full h-12 pr-32 text-lg disabled:opacity-75"
            />
            <Button
              type="submit"
              disabled={loading}
              className="absolute right-1 top-1 bg-[#9AE65C] hover:bg-[#8ad34f] text-black h-10"
            >
              Start Building
            </Button>
          </form>
        </div>
      </div>

      <div className="flex items-center justify-between w-full max-w-2xl px-1 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Model:</span>
          <Select.Root
            name="model"
            disabled={loading}
            value={model}
            onValueChange={(value) => setModel(value)}
          >
            <Select.Trigger className="w-full flex items-center justify-between rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">
              <Select.Value />
              <Select.Icon>
                <ChevronDownIcon className="size-4 text-gray-300" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="overflow-hidden rounded-md bg-white shadow-lg">
                <Select.Viewport className="p-2">
                  {models.map((model) => (
                    <Select.Item
                      key={model.value}
                      value={model.value}
                      className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm data-[highlighted]:bg-gray-100 data-[highlighted]:outline-none"
                    >
                      <Select.ItemText asChild>
                        <span className="inline-flex items-center gap-2 text-gray-500">
                          <div className="size-2 rounded-full bg-brand" />
                          {model.label}
                        </span>
                      </Select.ItemText>
                      <Select.ItemIndicator className="ml-auto">
                        <CheckIcon className="size-5 text-brand" />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Viewport>
                <Select.ScrollDownButton />
                <Select.Arrow />
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
        <div>
          <Button
            type="button"
            disabled={loading}
            onClick={() => window.open('https://github.com/akshaynstack/reactai', '_blank')}
            className="right-1 top-1 bg-[#111] hover:bg-[#000] text-white h-10 dark:outline dark:outline-2 dark:outline-brand"
          >
            Open Source <Github className="size-6" />
          </Button>
        </div>
      </div>

      <hr className="border-1 mb-20 h-px bg-gray-700 dark:bg-gray-700" />

      {status !== "initial" && (
        <motion.div
          initial={{ height: 0 }}
          animate={{
            height: "auto",
            overflow: "hidden",
            transitionEnd: { overflow: "visible" },
          }}
          transition={{ type: "spring", bounce: 0, duration: 0.5 }}
          className="w-full pb-[25vh] pt-10"
          onAnimationComplete={() => scrollTo()}
          ref={ref}
        >
          <div className="mt-5">
            <form className="w-full" onSubmit={updateApp}>
              <fieldset disabled={loading} className="group">
                <div className="relative">
                  <div className="relative flex rounded-md bg-white shadow-sm group-disabled:bg-gray-50">
                    <div className="relative flex flex-grow items-stretch">
                      <input
                        required
                        name="modification"
                        value={modification}
                        onChange={(e) => setModification(e.target.value)}
                        className="w-full rounded-md bg-transparent px-6 py-2 text-md disabled:cursor-not-allowed text-black outline-none"
                        placeholder="Make changes to your app here"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-3xl px-3 py-2 text-sm font-semibold text-brand hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand disabled:text-gray-900"
                    >
                      {loading ? (
                        <LoadingDots color="black" style="large" />
                      ) : (
                        <ArrowLongRightIcon className="-ml-0.5 size-6" />
                      )}
                    </button>
                  </div>
                </div>
              </fieldset>
            </form>
            <div className="w-[100%]">
              <Toaster invert={true} />
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="select-none rounded bg-white px-4 py-2.5 text-sm leading-none shadow-md shadow-black/20 text-black"
                      sideOffset={5}
                    >
                      Publish your app to the internet.
                      <Tooltip.Arrow className="fill-white" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
          </div>
          <div className="relative mt-8 w-full overflow-hidden">
            <div className="isolate">
              <CodeViewer code={generatedCode} showEditor />
            </div>

            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={status === "updating" ? { x: "100%" } : undefined}
                  animate={status === "updating" ? { x: "0%" } : undefined}
                  exit={{ x: "100%" }}
                  transition={{
                    type: "spring",
                    bounce: 0,
                    duration: 0.85,
                    delay: 0.5,
                  }}
                  className="absolute inset-x-0 bottom-0 top-1/2 flex items-center justify-center rounded-r border border-gray-400 bg-gradient-to-br from-gray-100 to-gray-300 md:inset-y-0 md:left-1/2 md:right-0"
                >
                  <p className="animate-pulse text-3xl font-bold">
                    {status === "creating"
                      ? "Building your app..."
                      : "Updating your app..."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </main>
  );
}

async function minDelay<T>(promise: Promise<T>, ms: number) {
  let delay = new Promise((resolve) => setTimeout(resolve, ms));
  let [p] = await Promise.all([promise, delay]);

  return p;
}