import { Button } from "@/components/ui/button";
import { MapPin, Camera, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-secondary opacity-90" />
      
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="fade-in-up mb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Make Your City
              <span className="block bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                Better Together
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed">
              Report civic issues instantly with photos and location. 
              Join thousands of citizens making their communities safer and cleaner.
            </p>
          </div>

          <div className="fade-in-up flex flex-col sm:flex-row gap-4 justify-center mb-16" style={{ animationDelay: "0.2s" }}>
            <Link to="/register">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 rounded-full font-semibold shadow-2xl"
              >
                Start Reporting Issues
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full font-semibold"
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            >
              Learn More
            </Button>
          </div>

          <div className="fade-in grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto" style={{ animationDelay: "0.4s" }}>
            <div className="flex flex-col items-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <MapPin className="w-12 h-12 mb-4 text-secondary" />
              <h3 className="text-lg font-semibold mb-2">Geo-Tagged Reports</h3>
              <p className="text-white/80 text-sm">Precise location tracking</p>
            </div>
            
            <div className="flex flex-col items-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <Camera className="w-12 h-12 mb-4 text-secondary" />
              <h3 className="text-lg font-semibold mb-2">Photo Evidence</h3>
              <p className="text-white/80 text-sm">Visual documentation</p>
            </div>
            
            <div className="flex flex-col items-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <TrendingUp className="w-12 h-12 mb-4 text-secondary" />
              <h3 className="text-lg font-semibold mb-2">Real-Time Updates</h3>
              <p className="text-white/80 text-sm">Track issue resolution</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
