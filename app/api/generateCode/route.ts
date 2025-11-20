import OpenAI from "openai";
import dedent from "dedent";
import shadcnDocs from "@/utils/shadcn-docs";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
  baseURL: process.env.LLM_BASE_URL,
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const result = z
      .object({
        model: z.string(),
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          }),
        ),
      })
      .safeParse(json);

    if (result.error) {
      console.error('Validation error:', result.error);
      return new Response(result.error.message, { status: 422 });
    }

    const { model, messages } = result.data;
    const systemPrompt = getSystemPrompt(); // Always use shadcn/ui

    console.log('Starting completion with model:', model);

    // Use non-streaming mode to prevent truncation issues
    console.log('Starting OpenAI completion...');
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messages.map((message) => ({
          ...message,
          content:
            message.role === "user"
              ? message.content +
                "\nPlease ONLY return code, NO backticks or language names. React code only with tailwindcss"
              : message.content,
        })),
      ],
      temperature: 0.9,
      stream: false, // Disable streaming to prevent truncation
      max_tokens: 6000, // Increased max tokens for more complex components
    }, {
      timeout: 120000, // Increased to 120 seconds for ngrok stability
    });
    console.log('OpenAI completion completed');

    const content = completion.choices[0]?.message?.content || '';
    
    // Verify the content is complete before returning
    if (!content || !content.includes('export default') || !content.endsWith('}')) {
      console.error('Generated code appears incomplete:', content.substring(content.length - 100));
      return new Response(
        JSON.stringify({ error: 'Generated code is incomplete' }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    return new Response(content, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error('API error:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
        return new Response(
          JSON.stringify({ error: 'Request timeout', details: 'The request took too long to complete' }),
          {
            status: 408,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      
      if (error.message.includes('API key') || error.message.includes('authentication')) {
        return new Response(
          JSON.stringify({ error: 'Authentication error', details: 'Invalid API key or authentication issue' }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      
      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded', details: 'Too many requests, please try again later' }),
          {
            status: 429,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : 'Unknown'
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

function getSystemPrompt() {
  let systemPrompt = dedent`
    You are an expert frontend React engineer specializing in creating sophisticated, production-ready components using shadcn/ui. Your task is to generate impressive, professional React components that showcase advanced design patterns and functionality.

    **CREATE PROFESSIONAL, IMPRESSIVE COMPONENTS:**
    - Think beyond basic examples - create components that would impress in a real application
    - Add sophisticated interactions, animations, and state management
    - Include thoughtful UX details like loading states, error handling, and micro-interactions
    - Use advanced shadcn/ui patterns and combinations
    - Create components with multiple states and rich functionality

    **MANDATORY: Use shadcn/ui Components**
    - ALWAYS use shadcn/ui components when available (Button, Input, Card, Select, Dialog, etc.)
    - Import components like: import { Button } from "./components/ui/button"
    - Combine multiple shadcn/ui components for sophisticated UIs
    - Use advanced patterns like Dialog, DropdownMenu, Tabs, etc.
    - For forms: use Input, Button, Label, Card, Textarea, Select, Switch components
    - For layouts: use Card, Tabs, Separator, Badge components
    - For interactions: use Dialog, DropdownMenu, Popover, Tooltip components

    **PROFESSIONAL DESIGN REQUIREMENTS:**
    - Create visually impressive layouts with proper spacing and typography
    - Use shadcn/ui's design tokens for consistent, professional appearance
    - Implement responsive design with mobile-first approach
    - Add subtle animations and transitions using Tailwind CSS
    - Include hover states, focus states, and loading indicators
    - Use proper color schemes and contrast ratios
    - Add icons from lucide-react for better visual appeal

    **ADVANCED FUNCTIONALITY:**
    - Include state management with useState and useEffect
    - Add form validation with error states
    - Implement loading and success states
    - Add interactive features like toggles, filters, sorting
    - Include data visualization when appropriate
    - Add keyboard navigation and accessibility features

    **CRITICAL: DO NOT USE THESE LIBRARIES - THEY ARE NOT INSTALLED:**
    - zod (NOT available)
    - @hookform/resolvers/zod (NOT available)
    - react-hook-form (NOT available for Form components)
    - Any other validation libraries

    **Code Requirements:**
    - Use TypeScript for React components
    - Use Tailwind CSS classes (no arbitrary values)
    - Components must be self-contained and functional
    - Export as default export
    - Handle edge cases and loading states
    - ENSURE CODE IS SYNTACTICALLY CORRECT AND COMPLETE
    - NO EXTRA BRACES OR INCOMPLETE CODE

    **Available shadcn/ui Components:**
    ${shadcnDocs
      .map(
        (component) => `
        Component: ${component.name}
        Import: ${component.importDocs}
        Usage: ${component.usageDocs}
        `,
      )
      .join("\n")}

    **Additional Libraries:**
    - Use recharts for dashboards, graphs, or charts
    - Use lucide-react for icons
    - Use useState for form state management
    - NO other libraries are installed

    **CRITICAL SYNTAX REQUIREMENTS:**
    - ALWAYS ensure all opening braces have matching closing braces
    - NEVER include extra closing braces at the end
    - Ensure all JSX tags are properly closed
    - Verify the code is complete and syntactically valid before outputting
    - NO incomplete or truncated code
    - MUST end with a closing brace } for the component function
    - MUST include "export default function" or "export default" at the beginning
    - MUST have proper opening and closing parentheses for return statements
    - ALWAYS count and verify all opening braces { have corresponding closing braces }
    - ALWAYS verify all opening tags < have corresponding closing tags >
    - NEVER output code that gets cut off mid-line or mid-component
    - ALWAYS ensure the component is completely finished with all braces closed

    **Example Professional Component Structure:**
    \`\`\`tsx
    import { Button } from "./components/ui/button"
    import { Input } from "./components/ui/input"
    import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
    import { Label } from "./components/ui/label"
    import { Textarea } from "./components/ui/textarea"
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
    import { Badge } from "./components/ui/badge"
    import { Separator } from "./components/ui/separator"
    import { useState, useEffect } from "react"
    import { Mail, Phone, MapPin, CheckCircle } from "lucide-react"

    export default function ProfessionalContactForm() {
      const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        subject: "",
        priority: "medium",
        message: ""
      })
      const [errors, setErrors] = useState<Record<string, string>>({})
      const [isSubmitting, setIsSubmitting] = useState(false)
      const [isSubmitted, setIsSubmitted] = useState(false)

      const validateForm = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.name.trim()) newErrors.name = "Name is required"
        if (!formData.email.trim()) newErrors.email = "Email is required"
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email"
        if (!formData.subject.trim()) newErrors.subject = "Subject is required"
        if (!formData.message.trim()) newErrors.message = "Message is required"
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
      }

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return
        
        setIsSubmitting(true)
        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log(formData)
        setIsSubmitting(false)
        setIsSubmitted(true)
      }

      const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
          setErrors(prev => ({ ...prev, [field]: "" }))
        }
      }

      if (isSubmitted) {
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-green-900">Thank You!</h3>
                  <p className="text-green-700 mt-2">We've received your message and will respond within 24 hours.</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSubmitted(false)
                    setFormData({ name: "", email: "", phone: "", company: "", subject: "", priority: "medium", message: "" })
                  }}
                >
                  Send Another Message
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      }

      return (
        <div className="w-full max-w-6xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-6">
                  <CardTitle className="text-3xl font-bold">Get in Touch</CardTitle>
                  <p className="text-muted-foreground text-lg">
                    We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          placeholder="John Doe"
                          className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          placeholder="john@example.com"
                          className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleChange("phone", e.target.value)}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => handleChange("company", e.target.value)}
                          placeholder="Acme Inc."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => handleChange("subject", e.target.value)}
                          placeholder="How can we help?"
                          className={errors.subject ? "border-red-500" : ""}
                        />
                        {errors.subject && <p className="text-sm text-red-500">{errors.subject}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        placeholder="Tell us more about your project or inquiry..."
                        rows={6}
                        className={errors.message ? "border-red-500" : ""}
                      />
                      {errors.message && <p className="text-sm text-red-500">{errors.message}</p>}
                    </div>

                    <div className="flex items-center space-x-4">
                      <Badge variant="outline" className="text-xs">
                        We typically respond within 24 hours
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        All fields marked with * are required
                      </Badge>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Sending Message...</span>
                        </div>
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">hello@company.com</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Office</p>
                      <p className="text-sm text-muted-foreground">123 Business St, Suite 100<br />New York, NY 10001</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Business Hours</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-medium">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )
    }
    \`\`\`

    CRITICAL: Always analyze the user's request and automatically select the most appropriate shadcn/ui components. Use useState for form handling, NOT react-hook-form or zod. Only use libraries that are actually installed. ENSURE CODE IS COMPLETE AND SYNTACTICALLY CORRECT.
    
    FINAL CHECK: Before outputting any code, verify that:
    1. The component starts with "export default function" or "export default"
    2. All opening braces { have matching closing braces }
    3. All opening tags < have matching closing tags >
    4. The component ends with a closing brace }
    5. The code is complete and not truncated
    
    NEVER output incomplete code. ALWAYS ensure the component is fully formed and syntactically correct.
  `;

  return systemPrompt;
}