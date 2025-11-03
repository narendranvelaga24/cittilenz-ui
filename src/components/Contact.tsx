import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Get In Touch
            </h2>
            <p className="text-xl text-muted-foreground">
              Have questions? We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8 fade-in-up">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Email Us</h3>
                  <p className="text-muted-foreground">support@cityzen.com</p>
                  <p className="text-muted-foreground">info@cityzen.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Call Us</h3>
                  <p className="text-muted-foreground">+1 (555) 123-4567</p>
                  <p className="text-muted-foreground">Mon-Fri, 9AM-6PM</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Visit Us</h3>
                  <p className="text-muted-foreground">123 Smart City Avenue</p>
                  <p className="text-muted-foreground">Tech District, TC 12345</p>
                </div>
              </div>
            </div>

            <form className="space-y-6 fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div>
                <Input
                  type="text"
                  placeholder="Your Name"
                  className="h-12 rounded-xl border-border/50"
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Your Email"
                  className="h-12 rounded-xl border-border/50"
                />
              </div>
              <div>
                <Textarea
                  placeholder="Your Message"
                  rows={6}
                  className="rounded-xl border-border/50 resize-none"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg font-semibold rounded-xl"
              >
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
