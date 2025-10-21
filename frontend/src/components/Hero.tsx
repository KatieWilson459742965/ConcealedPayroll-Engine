import { Shield, Lock, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Hero Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 animate-fade-in">
          <Lock className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Powered by FHE Technology</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <span className="gradient-text">Private Payroll</span>
          <br />
          <span className="text-foreground">Distribution Platform</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Enterprise-grade salary distribution with Fully Homomorphic Encryption.
          Secure, private, and transparent blockchain payroll management.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <ConnectButton />
          <Button variant="outline" size="lg" className="gap-2">
            <Shield className="w-5 h-5" />
            Learn More
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-20 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="glass-card p-6 rounded-2xl hover:scale-105 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">FHE Encryption</h3>
            <p className="text-sm text-muted-foreground">
              Fully homomorphic encryption ensures complete salary privacy while maintaining computational capability
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl hover:scale-105 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 mx-auto">
              <Shield className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Department-Based</h3>
            <p className="text-sm text-muted-foreground">
              Organize employees by departments with unique IDs for streamlined payroll management
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl hover:scale-105 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Blockchain Native</h3>
            <p className="text-sm text-muted-foreground">
              Direct wallet-to-wallet payments with full transparency and immutable records
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
