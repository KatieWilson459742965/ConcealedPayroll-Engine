import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Wallet, Building2, Calendar, Lock } from "lucide-react";

const EmployeeDashboard = () => {
  // Mock data - in real app, this would come from blockchain
  const employeeData = {
    employeeId: "EMP001",
    name: "John Doe",
    department: "Engineering",
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    monthlySalary: "2.5",
    lastPayment: "2024-01-15",
    nextPayment: "2024-02-15",
    encryptedSalary: "enc_a4f8b2c9d1e5f7a3b8c2d4e6f9a1b3c5",
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Employee Dashboard</h2>
          <p className="text-muted-foreground">View your encrypted salary information</p>
        </div>

        {/* Profile Card */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Your personal and employment details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Employee ID</div>
                <div className="font-mono font-semibold">{employeeData.employeeId}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Full Name</div>
                <div className="font-semibold">{employeeData.name}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Department
                </div>
                <Badge variant="secondary" className="capitalize">
                  {employeeData.department}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Wallet Address
                </div>
                <div className="font-mono text-sm">
                  {employeeData.walletAddress.slice(0, 6)}...{employeeData.walletAddress.slice(-4)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Salary Information */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Encrypted Salary Information
            </CardTitle>
            <CardDescription>Your salary data is protected with FHE encryption</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-sm text-muted-foreground mb-2">Encrypted Salary Data</div>
              <div className="font-mono text-xs break-all text-primary">{employeeData.encryptedSalary}</div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-card/50">
                <div className="text-sm text-muted-foreground mb-1">Monthly Salary</div>
                <div className="text-2xl font-bold text-primary">{employeeData.monthlySalary} ETH</div>
              </div>
              <div className="p-4 rounded-lg border bg-card/50">
                <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Last Payment
                </div>
                <div className="text-lg font-semibold">{employeeData.lastPayment}</div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <div className="font-semibold mb-1">Privacy Protected</div>
                  <p className="text-sm text-muted-foreground">
                    Your salary information is encrypted using Fully Homomorphic Encryption (FHE). 
                    Only you can decrypt and view the actual amount while it remains protected on the blockchain.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Schedule */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Payment Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Last Payment</span>
                <span className="font-semibold">{employeeData.lastPayment}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                <span className="text-sm font-medium">Next Payment</span>
                <span className="font-bold text-primary">{employeeData.nextPayment}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
