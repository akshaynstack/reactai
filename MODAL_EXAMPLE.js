// Example: How to add Clerk Sign-In Modal to your page

// 1. Add these imports at the top of app/(main)/page.tsx
import { useAuth, SignInButton } from "@clerk/nextjs";

// 2. Inside your Home() component, add this hook
const { isSignedIn } = useAuth();

// 3. In your createApp function, add authentication check
const createApp = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Add this check
        if (!isSignedIn) {
            toast.error("Please sign in to generate components");
            return;
        }

        // Rest of your existing code...
        if (status !== "initial") {
            scrollTo({ delay: 0.5 });
        }
        // ... etc
    },
    [status, model, uiLibrary, prompt, scrollTo, isSignedIn] // Add isSignedIn to dependencies
);

// 4. Update your form submit button to show sign-in modal when not authenticated
// Replace this:
<Button
    type="submit"
    disabled={loading}
    className="absolute right-1 top-1 bg-[#9AE65C] hover:bg-[#8ad34f] text-black h-10"
>
    Start Building
</Button>

// With this:
{
    !isSignedIn ? (
        <SignInButton mode="modal">
            <Button
                type="button"
                className="absolute right-1 top-1 bg-[#9AE65C] hover:bg-[#8ad34f] text-black h-10"
            >
                Start Building
            </Button>
        </SignInButton>
    ) : (
    <Button
        type="submit"
        disabled={loading}
        className="absolute right-1 top-1 bg-[#9AE65C] hover:bg-[#8ad34f] text-black h-10"
    >
        Start Building
    </Button>
)
}

// That's it! Now when users click "Start Building" without being signed in,
// they'll see a beautiful Clerk modal popup instead of being redirected.
