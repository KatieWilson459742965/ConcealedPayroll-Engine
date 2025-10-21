import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, UserPlus, Send, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { usePayroll } from "@/hooks/usePayroll";
import { isAddress } from "ethers";

interface Organization {
  id: string;
  name: string;
}

interface TeamMember {
  address: string;
  name: string;
  role: string;
  joinedAt: bigint;
}

type ViewMode = 'list' | 'create-org' | 'manage-org';

const AdminPanel = () => {
  const { address } = useAccount();
  const {
    loading,
    createOrganization,
    addTeamMember,
    createPayrollDistribution,
    getMyOrganizations,
    getOrganizationMembers,
    getTeamMember,
  } = usePayroll();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [members, setMembers] = useState<TeamMember[]>([]);

  // Create Organization Form
  const [orgName, setOrgName] = useState("");

  // Add Member Form
  const [newMember, setNewMember] = useState({
    address: "",
    name: "",
    role: "",
  });

  // Payroll Distribution Form
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [payrollForm, setPayrollForm] = useState({
    amount: "",
    period: "",
  });

  // Load organizations on mount
  useEffect(() => {
    if (address) {
      loadOrganizations();
    }
  }, [address]);

  // Load members when organization is selected
  useEffect(() => {
    if (selectedOrg) {
      loadMembers();
    }
  }, [selectedOrg]);

  const loadOrganizations = async () => {
    try {
      const orgIds = await getMyOrganizations();
      const orgs = orgIds.map((id: string) => ({
        id,
        name: `Organization ${id.slice(0, 8)}...`,
      }));
      setOrganizations(orgs);
    } catch (error) {
      console.error("Failed to load organizations:", error);
    }
  };

  const loadMembers = async () => {
    try {
      const memberAddresses = await getOrganizationMembers(selectedOrg);
      const memberDetails = await Promise.all(
        memberAddresses.map(async (addr: string) => {
          const details = await getTeamMember(selectedOrg, addr);
          return {
            address: addr,
            name: details.memberName,
            role: details.role,
            joinedAt: details.joinedAt,
          };
        })
      );
      setMembers(memberDetails);
    } catch (error) {
      console.error("Failed to load members:", error);
      setMembers([]);
    }
  };

  const handleCreateOrganization = async () => {
    if (!orgName.trim()) {
      toast.error("Please enter organization name");
      return;
    }

    try {
      const orgId = await createOrganization(orgName);
      setOrgName("");
      await loadOrganizations();
      setViewMode('list');
    } catch (error: any) {
      console.error("Create organization error:", error);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.address || !newMember.name || !newMember.role) {
      toast.error("Please fill all member fields");
      return;
    }

    if (!isAddress(newMember.address)) {
      toast.error("Invalid wallet address");
      return;
    }

    try {
      await addTeamMember(selectedOrg, newMember.address, newMember.name, newMember.role);
      setNewMember({ address: "", name: "", role: "" });
      await loadMembers();
      toast.success("Team member added successfully!");
    } catch (error: any) {
      console.error("Add member error:", error);
    }
  };

  const handleDistributeSalary = async () => {
    if (!selectedMemberId) {
      toast.error("Please select a team member");
      return;
    }

    if (!payrollForm.amount || !payrollForm.period) {
      toast.error("Please fill all payroll fields");
      return;
    }

    // Validate period format (YYYYMM)
    const periodNum = parseInt(payrollForm.period);
    if (isNaN(periodNum) || payrollForm.period.length !== 6) {
      toast.error("Period must be in YYYYMM format (e.g., 202501)");
      return;
    }

    // Find selected member
    const selectedMember = members.find((m) => m.address === selectedMemberId);
    if (!selectedMember) {
      toast.error("Member not found");
      return;
    }

    const memberIndex = members.indexOf(selectedMember);

    try {
      // Amount in USD cents to avoid overflow (e.g., 1000.50 USD = 100050 cents)
      const amountInCents = Math.floor(parseFloat(payrollForm.amount) * 100);

      await createPayrollDistribution(
        selectedOrg,
        selectedMember.address,
        memberIndex,
        amountInCents.toString(), // Pass as string, will be converted inside hook
        1, // Currency code 1 = USD (fixed)
        periodNum
      );

      setPayrollForm({
        amount: "",
        period: "",
      });
      setSelectedMemberId("");
      toast.success("Payroll distribution created successfully!");
    } catch (error: any) {
      console.error("Distribute salary error:", error);
    }
  };

  const handleSelectOrganization = (orgId: string) => {
    setSelectedOrg(orgId);
    setViewMode('manage-org');
  };

  // Render organization list
  if (viewMode === 'list') {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Your Organizations</h2>
            <p className="text-muted-foreground">Select an organization to manage or create a new one</p>
          </div>

          <Button onClick={() => setViewMode('create-org')} className="w-full glow-effect" size="lg">
            <Building2 className="w-4 h-4 mr-2" />
            Create New Organization
          </Button>

          {organizations.length === 0 ? (
            <Card className="glass-card border-0">
              <CardContent className="text-center py-12">
                <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No organizations yet. Create one to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {organizations.map((org) => (
                <Card
                  key={org.id}
                  className="glass-card border-0 cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => handleSelectOrganization(org.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{org.name}</h3>
                        <p className="text-xs text-muted-foreground font-mono">{org.id}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Manage →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render create organization form
  if (viewMode === 'create-org') {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => setViewMode('list')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Organizations
          </Button>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Create New Organization
              </CardTitle>
              <CardDescription>
                Organizations you create are only visible to your wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  placeholder="Enter organization name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button
                onClick={handleCreateOrganization}
                disabled={loading || !orgName.trim()}
                className="w-full glow-effect"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4 mr-2" />
                    Create Organization
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render manage organization (add members + distribute payroll)
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => setViewMode('list')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Organizations
        </Button>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-1">Manage Organization</h2>
          <p className="text-xs text-muted-foreground font-mono">{selectedOrg}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Add Team Member */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Add Team Member
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="memberAddress">Wallet Address</Label>
                <Input
                  id="memberAddress"
                  placeholder="0x..."
                  value={newMember.address}
                  onChange={(e) => setNewMember({ ...newMember, address: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memberName">Member Name</Label>
                <Input
                  id="memberName"
                  placeholder="John Doe"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memberRole">Role</Label>
                <Input
                  id="memberRole"
                  placeholder="Software Engineer"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  disabled={loading}
                />
              </div>
              <Button
                onClick={handleAddMember}
                disabled={loading || !newMember.address || !newMember.name || !newMember.role}
                className="w-full glow-effect"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Member
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Distribute Payroll */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Distribute Payroll
              </CardTitle>
              <CardDescription>
                {members.length === 0 ? "Add team members first" : "Create encrypted payroll distribution"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {members.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No team members yet</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="selectMember">Select Team Member</Label>
                    <Select value={selectedMemberId} onValueChange={setSelectedMemberId} disabled={loading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a member" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.address} value={member.address}>
                            {member.name} - {member.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Salary Amount (USD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="5000.00"
                      value={payrollForm.amount}
                      onChange={(e) => setPayrollForm({ ...payrollForm, amount: e.target.value })}
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">Enter amount in USD (e.g., 5000.00)</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="period">Payment Period (YYYYMM)</Label>
                    <Input
                      id="period"
                      placeholder="202501"
                      value={payrollForm.period}
                      onChange={(e) => setPayrollForm({ ...payrollForm, period: e.target.value })}
                      disabled={loading}
                      maxLength={6}
                    />
                    <p className="text-xs text-muted-foreground">Example: 202501 for January 2025</p>
                  </div>
                  <Button
                    onClick={handleDistributeSalary}
                    disabled={loading || !selectedMemberId || !payrollForm.amount || !payrollForm.period}
                    className="w-full glow-effect"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Distribute Encrypted Payroll
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Team Members List */}
        {members.length > 0 && (
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Wallet Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.address}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {member.address.slice(0, 6)}...{member.address.slice(-4)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
