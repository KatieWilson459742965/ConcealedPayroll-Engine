import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, UserPlus, Send, Loader2, Users } from "lucide-react";
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
  const [payrollForm, setPayrollForm] = useState({
    recipientAddress: "",
    memberIndex: "",
    amount: "",
    currency: "1", // 1=USD
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
      if (orgs.length > 0 && !selectedOrg) {
        setSelectedOrg(orgs[0].id);
      }
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
      if (orgId) setSelectedOrg(orgId);
    } catch (error: any) {
      console.error("Create organization error:", error);
    }
  };

  const handleAddMember = async () => {
    if (!selectedOrg) {
      toast.error("Please select an organization first");
      return;
    }

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
    } catch (error: any) {
      console.error("Add member error:", error);
    }
  };

  const handleDistributeSalary = async () => {
    if (!selectedOrg) {
      toast.error("Please select an organization first");
      return;
    }

    if (!payrollForm.recipientAddress || !payrollForm.memberIndex || !payrollForm.amount || !payrollForm.period) {
      toast.error("Please fill all payroll fields");
      return;
    }

    if (!isAddress(payrollForm.recipientAddress)) {
      toast.error("Invalid recipient address");
      return;
    }

    // Validate period format (YYYYMM)
    const periodNum = parseInt(payrollForm.period);
    if (isNaN(periodNum) || payrollForm.period.length !== 6) {
      toast.error("Period must be in YYYYMM format (e.g., 202501)");
      return;
    }

    try {
      await createPayrollDistribution(
        selectedOrg,
        payrollForm.recipientAddress,
        parseInt(payrollForm.memberIndex),
        payrollForm.amount,
        parseInt(payrollForm.currency),
        periodNum
      );
      setPayrollForm({
        recipientAddress: "",
        memberIndex: "",
        amount: "",
        currency: "1",
        period: "",
      });
    } catch (error: any) {
      console.error("Distribute salary error:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Organization Management</h2>
          <p className="text-muted-foreground">Create organizations and manage encrypted payroll</p>
        </div>

        <Tabs defaultValue="create-org" className="w-full">
          <TabsList className="grid w-full grid-cols-3 glass-card">
            <TabsTrigger value="create-org">Create Organization</TabsTrigger>
            <TabsTrigger value="manage-members">Manage Members</TabsTrigger>
            <TabsTrigger value="payroll">Payroll Distribution</TabsTrigger>
          </TabsList>

          {/* Create Organization Tab */}
          <TabsContent value="create-org">
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

                {/* Organizations List */}
                {organizations.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-4">Your Organizations</h3>
                    <div className="space-y-2">
                      {organizations.map((org) => (
                        <div
                          key={org.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedOrg === org.id
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => setSelectedOrg(org.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{org.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">{org.id}</p>
                            </div>
                            {selectedOrg === org.id && (
                              <div className="text-xs text-primary font-semibold">Selected</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Members Tab */}
          <TabsContent value="manage-members">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Add Team Member
                </CardTitle>
                <CardDescription>
                  {selectedOrg ? "Add members to your organization" : "Select an organization first"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!selectedOrg ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Please create or select an organization first</p>
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
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
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="memberRole">Role</Label>
                        <Input
                          id="memberRole"
                          placeholder="Software Engineer"
                          value={newMember.role}
                          onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleAddMember}
                      disabled={loading || !newMember.address || !newMember.name || !newMember.role}
                      className="w-full glow-effect"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add Team Member
                        </>
                      )}
                    </Button>

                    {/* Members List */}
                    {members.length > 0 && (
                      <div className="pt-6 border-t">
                        <h3 className="text-lg font-semibold mb-4">Team Members</h3>
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
                              {members.map((member, index) => (
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
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payroll Distribution Tab */}
          <TabsContent value="payroll">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Distribute Encrypted Payroll
                </CardTitle>
                <CardDescription>
                  {selectedOrg
                    ? "Create encrypted payroll distribution with FHE"
                    : "Select an organization first"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!selectedOrg ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Send className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Please create or select an organization first</p>
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="recipientAddress">Recipient Address</Label>
                        <Input
                          id="recipientAddress"
                          placeholder="0x..."
                          value={payrollForm.recipientAddress}
                          onChange={(e) =>
                            setPayrollForm({ ...payrollForm, recipientAddress: e.target.value })
                          }
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="memberIndex">Member Index</Label>
                        <Input
                          id="memberIndex"
                          type="number"
                          placeholder="0"
                          value={payrollForm.memberIndex}
                          onChange={(e) =>
                            setPayrollForm({ ...payrollForm, memberIndex: e.target.value })
                          }
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount (ETH)</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={payrollForm.amount}
                          onChange={(e) => setPayrollForm({ ...payrollForm, amount: e.target.value })}
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                          value={payrollForm.currency}
                          onValueChange={(value) => setPayrollForm({ ...payrollForm, currency: value })}
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">USD</SelectItem>
                            <SelectItem value="2">EUR</SelectItem>
                            <SelectItem value="3">GBP</SelectItem>
                            <SelectItem value="4">ETH</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="period">Payment Period (YYYYMM)</Label>
                        <Input
                          id="period"
                          placeholder="202501"
                          value={payrollForm.period}
                          onChange={(e) => setPayrollForm({ ...payrollForm, period: e.target.value })}
                          disabled={loading}
                          maxLength={6}
                        />
                        <p className="text-xs text-muted-foreground">
                          Example: 202501 for January 2025
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleDistributeSalary}
                      disabled={
                        loading ||
                        !payrollForm.recipientAddress ||
                        !payrollForm.memberIndex ||
                        !payrollForm.amount ||
                        !payrollForm.period
                      }
                      className="w-full glow-effect"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Create Encrypted Payroll Distribution
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
