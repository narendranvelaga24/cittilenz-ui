import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MessageSquare, HelpCircle, Book, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const Help = () => {
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const faqs = [
    {
      question: "How do I report an issue?",
      answer: "Click the 'Quick Report' button from your dashboard or navigation menu. Upload a photo, allow location access, select the issue category, add a brief description, and submit. Your issue will be automatically routed to the relevant department.",
    },
    {
      question: "How long does it take to resolve an issue?",
      answer: "Resolution times vary by issue type and severity. Road issues typically take 5-7 days, lighting issues 3-5 days, and waste collection 1-2 days. You can track real-time progress in the 'My Issues' section.",
    },
    {
      question: "Can I report issues anonymously?",
      answer: "Yes! When creating a report, select the 'Anonymous Report' option. Anonymous reports are fully functional but won't earn you civic points or allow you to track updates directly.",
    },
    {
      question: "What are Civic Points and how do I earn them?",
      answer: "Civic Points reward active participation. You earn points by: reporting verified issues (10 points), having issues resolved (20 points), verifying resolutions (5 points), and helping others through comments (3 points). Points unlock badges and community recognition.",
    },
    {
      question: "How do I verify a resolved issue?",
      answer: "When an official marks an issue as resolved, you'll receive a notification. Visit the issue detail page and you'll see 'Verify Resolution' or 'Reopen Issue' options. Upload an after photo if needed and confirm whether the issue is truly fixed.",
    },
    {
      question: "Can I track someone else's reported issue?",
      answer: "Yes! Use the Map View to see all public issues in your neighborhood. Click any pin to view details. You can also comment on public issues to add more information or show support.",
    },
    {
      question: "What happens if my issue isn't resolved on time?",
      answer: "Issues have SLA (Service Level Agreement) timers. If an issue breaches its SLA, it's automatically escalated to a supervisor. You'll also see an 'Escalate' button in your issue tracking page to manually escalate if needed.",
    },
    {
      question: "How accurate is the location detection?",
      answer: "We use GPS and map services for high accuracy (typically within 10-20 meters). You can always adjust the pin on the map before submitting if the auto-detected location isn't perfect.",
    },
    {
      question: "Can I edit or delete a report after submitting?",
      answer: "You can add comments and upload additional photos, but you cannot edit the core details once submitted. If you need to make major changes, contact support. You can delete reports only if they haven't been assigned to an official.",
    },
    {
      question: "What if I see duplicate reports?",
      answer: "Our system automatically detects potential duplicates when you report. If you spot a duplicate after submission, flag it using the 'Report Duplicate' option in the issue menu.",
    },
  ];

  const contactOptions = [
    {
      icon: Mail,
      title: "Email Support",
      description: "support@cittilenz.com",
      action: "Send Email",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "1800-CIVIC-HELP",
      action: "Call Now",
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chat with our support team",
      action: "Start Chat",
    },
  ];

  const resources = [
    {
      icon: Book,
      title: "User Guide",
      description: "Complete guide to using Cittilenz",
      color: "bg-info/10 text-info",
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Watch step-by-step video guides",
      color: "bg-success/10 text-success",
    },
    {
      icon: HelpCircle,
      title: "Community Forum",
      description: "Connect with other citizens",
      color: "bg-warning/10 text-warning",
    },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setContactForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-marcellus font-bold mb-2">Help & Support</h1>
        <p className="text-muted-foreground">Find answers and get assistance</p>
      </div>

      {/* Quick Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contactOptions.map((option, index) => (
          <Card key={index} className="hover-lift cursor-pointer">
            <CardContent className="pt-6 text-center">
              <option.icon className="w-12 h-12 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-1">{option.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
              <Button variant="outline" size="sm" className="w-full">
                {option.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resources.map((resource, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg ${resource.color} hover-scale cursor-pointer`}
              >
                <resource.icon className="w-8 h-8 mb-3" />
                <h4 className="font-semibold mb-1">{resource.title}</h4>
                <p className="text-sm opacity-80">{resource.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact Form */}
      <Card>
        <CardHeader>
          <CardTitle>Still need help? Contact Us</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Name</Label>
              <Input
                id="contact-name"
                placeholder="Your name"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="your@email.com"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-message">Message</Label>
              <Textarea
                id="contact-message"
                placeholder="Describe your issue or question..."
                rows={5}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Privacy & Terms */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Button variant="link">Privacy Policy</Button>
            <Button variant="link">Terms of Service</Button>
            <Button variant="link">Data Protection</Button>
            <Button variant="link">Accessibility</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Help;
