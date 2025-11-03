import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Brain, BarChart3, Eye, Trophy, Zap } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: MapPin,
      title: "Geo-Tagging & Image Upload",
      description: "Report issues with precise location data and photo evidence for quick identification and resolution.",
      color: "text-secondary",
    },
    {
      icon: Brain,
      title: "AI-Powered Classification",
      description: "Advanced AI automatically categorizes issues like potholes, garbage, or broken lights for efficient routing.",
      color: "text-accent",
    },
    {
      icon: BarChart3,
      title: "Real-Time Heatmap Dashboard",
      description: "Authorities can visualize issue hotspots and prioritize resources with interactive data visualization.",
      color: "text-primary",
    },
    {
      icon: Eye,
      title: "Public Transparency",
      description: "View all reported issues in your area, track their status, and stay informed about civic improvements.",
      color: "text-secondary",
    },
    {
      icon: Trophy,
      title: "Gamified Engagement",
      description: "Earn badges and rewards for your contributions. Make civic participation fun and rewarding.",
      color: "text-accent",
    },
    {
      icon: Zap,
      title: "Live Status Updates",
      description: "Get real-time notifications when your reported issues are acknowledged, in progress, or resolved.",
      color: "text-primary",
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16 fade-in-up">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground font-marcellus">
            Powerful Features for Smart Cities
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Advanced technology meets civic responsibility. Everything you need to make a real impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-border/50 bg-card/50 backdrop-blur-sm fade-in-scale cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 sm:p-8">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-7 h-7 sm:w-8 sm:h-8 ${feature.color}`} />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
