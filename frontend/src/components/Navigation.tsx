import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Lock } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg">FHE Payroll</h1>
              <p className="text-xs text-muted-foreground">Private Distribution</p>
            </div>
          </div>
          
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
