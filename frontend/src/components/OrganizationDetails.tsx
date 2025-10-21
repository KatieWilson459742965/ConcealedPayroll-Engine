import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, FileText, Loader2, Calendar } from "lucide-react";
import { usePayroll } from "@/hooks/usePayroll";

interface TeamMember {
  address: string;
  name: string;
  role: string;
  joinedAt: bigint;
}

interface Distribution {
  id: string;
  createdAt: bigint;
  executedAt: bigint;
  isExecuted: boolean;
  isCancelled: boolean;
}

interface OrganizationDetailsProps {
  organizationId: string;
  organizationName: string;
  onBack: () => void;
}

const OrganizationDetails = ({ organizationId, organizationName, onBack }: OrganizationDetailsProps) => {
  const {
    getOrganizationMembers,
    getTeamMember,
    getOrganizationDistributions,
    getDistribution,
  } = usePayroll();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrganizationData();
  }, [organizationId]);

  const loadOrganizationData = async () => {
    setLoading(true);
    try {
      // Load members
      const memberAddresses = await getOrganizationMembers(organizationId);
      const memberDetails = await Promise.all(
        memberAddresses.map(async (addr: string) => {
          const details = await getTeamMember(organizationId, addr);
          return {
            address: addr,
            name: details.memberName,
            role: details.role,
            joinedAt: details.joinedAt,
          };
        })
      );
      setMembers(memberDetails);

      // Load distributions
      const distIds = await getOrganizationDistributions(organizationId);
      const distDetails = await Promise.all(
        distIds.map(async (id: string) => {
          try {
            const details = await getDistribution(id);
            return {
              id,
              createdAt: details.createdAt,
              executedAt: details.executedAt,
              isExecuted: details.isExecuted,
              isCancelled: details.isCancelled,
            };
          } catch (error) {
            console.error(`Failed to load distribution ${id}:`, error);
            return null;
          }
        })
      );
      setDistributions(distDetails.filter((d): d is Distribution => d !== null));
    } catch (error) {
      console.error("Failed to load organization data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: bigint) => {
    if (timestamp === 0n) return "-";
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const formatDateTime = (timestamp: bigint) => {
    if (timestamp === 0n) return "-";
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" onClick={onBack} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Organizations
          </Button>
          <Card className="glass-card border-0">
            <CardContent className="py-12 text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading organization data...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Organizations
        </Button>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-1">{organizationName}</h2>
          <p className="text-xs text-muted-foreground font-mono">{organizationId.slice(0, 16)}...</p>
        </div>

        {/* Organization Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{members.length}</div>
                  <div className="text-sm text-muted-foreground">Team Members</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <FileText className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{distributions.length}</div>
                  <div className="text-sm text-muted-foreground">Payroll Distributions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Members List */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Members
            </CardTitle>
            <CardDescription>All members in this organization</CardDescription>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No team members yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Wallet Address</TableHead>
                    <TableHead>Joined Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.address}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{member.role}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {member.address.slice(0, 6)}...{member.address.slice(-4)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(member.joinedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Payroll Distributions History */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Payroll Distribution History
            </CardTitle>
            <CardDescription>All salary distributions for this organization</CardDescription>
          </CardHeader>
          <CardContent>
            {distributions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No distributions yet</p>
                <p className="text-sm mt-2">Create your first payroll distribution to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Distribution ID</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Executed At</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {distributions.map((dist) => (
                    <TableRow key={dist.id}>
                      <TableCell className="font-mono text-xs">
                        {dist.id.slice(0, 10)}...{dist.id.slice(-8)}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {formatDateTime(dist.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {dist.isExecuted ? formatDateTime(dist.executedAt) : "-"}
                      </TableCell>
                      <TableCell>
                        {dist.isCancelled ? (
                          <Badge variant="destructive">Cancelled</Badge>
                        ) : dist.isExecuted ? (
                          <Badge variant="default">Executed</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganizationDetails;
