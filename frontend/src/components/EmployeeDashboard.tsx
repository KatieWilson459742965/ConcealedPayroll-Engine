import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Wallet, Building2, Calendar, Lock, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import { usePayroll } from "@/hooks/usePayroll";

interface Organization {
  id: string;
  name: string;
  memberName: string;
  role: string;
  joinedAt: bigint;
}

const EmployeeDashboard = () => {
  const { address } = useAccount();
  const { getMemberOrganizations, getOrganization, getTeamMember } = usePayroll();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      loadEmployeeData();
    }
  }, [address]);

  const loadEmployeeData = async () => {
    setLoading(true);
    try {
      // Get all organizations where user is a member
      const orgIds = await getMemberOrganizations();

      // Load details for each organization
      const orgDetails = await Promise.all(
        orgIds.map(async (orgId: string) => {
          try {
            const orgInfo = await getOrganization(orgId);
            const memberInfo = await getTeamMember(orgId, address!);

            return {
              id: orgId,
              name: orgInfo.organizationName,
              memberName: memberInfo.memberName,
              role: memberInfo.role,
              joinedAt: memberInfo.joinedAt,
            };
          } catch (error) {
            console.error(`Failed to load organization ${orgId}:`, error);
            return null;
          }
        })
      );

      setOrganizations(orgDetails.filter((org): org is Organization => org !== null));
    } catch (error) {
      console.error("Failed to load employee data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  if (!address) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card border-0">
            <CardContent className="py-12 text-center">
              <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-muted-foreground">
                Please connect your wallet to view your employee dashboard
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card border-0">
            <CardContent className="py-12 text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading your employee data...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Employee Dashboard</h2>
            <p className="text-muted-foreground">View your employment and payroll information</p>
          </div>

          <Card className="glass-card border-0">
            <CardContent className="py-12 text-center">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Organizations Found</h3>
              <p className="text-muted-foreground">
                You are not currently a member of any organization.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Contact your employer to be added to their payroll system.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            <CardDescription>Your personal and wallet details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Wallet Address
                </div>
                <div className="font-mono text-sm">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Organizations
                </div>
                <Badge variant="secondary" className="text-base">
                  {organizations.length} {organizations.length === 1 ? 'Organization' : 'Organizations'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organizations List */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Your Organizations
            </CardTitle>
            <CardDescription>Organizations where you are employed</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Your Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell>{org.memberName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{org.role}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(org.joinedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Privacy Information */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Privacy & Encryption
            </CardTitle>
            <CardDescription>How your salary data is protected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <div className="font-semibold mb-1">Zama FHE Technology</div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your salary data is protected by Fully Homomorphic Encryption from Zama.
                    All salary information remains encrypted on-chain, and only you can decrypt your own data.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✅ Salaries encrypted with Zama FHE when added to organization</li>
                    <li>✅ Payroll computations performed on encrypted data</li>
                    <li>✅ Only you can view your own salary information</li>
                    <li>✅ Admins manage distributions without seeing individual salaries</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Payroll Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  Payroll distributions are created by your organization's admin.
                  When a distribution is created for you, it uses your encrypted monthly salary stored in the contract.
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card/50">
                <div className="text-sm font-medium mb-1">Current Network</div>
                <Badge variant="secondary">Sepolia Testnet</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
