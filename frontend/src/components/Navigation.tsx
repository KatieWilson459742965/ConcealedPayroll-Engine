import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Lock } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-bold text-lg">PrivyPayroll</h1>
                <p className="text-xs text-muted-foreground">Privacy-First Payroll</p>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === "/" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Home
              </Link>
              <Link
                to="/how-it-works"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === "/how-it-works" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                How It Works
              </Link>
            </div>
          </div>

          <ConnectButton />
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
