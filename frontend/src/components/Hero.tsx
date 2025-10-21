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
          <span className="text-sm font-medium">Powered by Zama FHE</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <span className="gradient-text">PrivyPayroll</span>
          <br />
          <span className="text-foreground">Privacy-First Payroll Platform</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Enterprise-grade encrypted payroll management powered by Zama's FHE technology.
          Keep salaries confidential while maintaining complete operational transparency.
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
            <h3 className="text-lg font-semibold mb-2">Complete Privacy</h3>
            <p className="text-sm text-muted-foreground">
              Salaries remain encrypted on-chain with Zama FHE. Only authorized parties can decrypt their own data.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl hover:scale-105 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 mx-auto">
              <Shield className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Organization Management</h3>
            <p className="text-sm text-muted-foreground">
              Create organizations, add team members, and manage encrypted payroll distributions seamlessly
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl hover:scale-105 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Blockchain Secure</h3>
            <p className="text-sm text-muted-foreground">
              All payroll records stored immutably on Ethereum with full audit trail and transparency
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
