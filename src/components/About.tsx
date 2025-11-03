import { CheckCircle2 } from "lucide-react";

const About = () => {
  const benefits = [
    "Faster response times for civic issues",
    "Data-driven decision making for authorities",
    "Increased citizen engagement and accountability",
    "Transparent tracking of issue resolution",
    "Community-powered urban improvement",
  ];

  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Transforming Urban Living Through Technology
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              CityZen is more than just a reporting platform—it's a movement towards smarter, more responsive cities. 
              We bridge the gap between citizens and authorities, making civic participation accessible to everyone.
            </p>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Using cutting-edge AI and real-time data visualization, we empower communities to take ownership of 
              their urban spaces while providing authorities with the tools they need to respond effectively.
            </p>
            
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CheckCircle2 className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
                  <span className="text-foreground text-lg">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary to-secondary p-1">
              <div className="w-full h-full rounded-3xl bg-background p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold text-primary mb-4">10K+</div>
                  <div className="text-xl text-muted-foreground mb-8">Issues Resolved</div>
                  
                  <div className="text-6xl font-bold text-secondary mb-4">50+</div>
                  <div className="text-xl text-muted-foreground mb-8">Cities Connected</div>
                  
                  <div className="text-6xl font-bold text-accent mb-4">95%</div>
                  <div className="text-xl text-muted-foreground">Satisfaction Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
