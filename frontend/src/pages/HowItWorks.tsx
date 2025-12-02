import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Shield, Lock, Eye, Zap, FileCheck, Users } from "lucide-react";

const HowItWorks = () => {
  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Demo Video Section - At the top */}
          <section className="mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center gradient-text">
              How It Works
            </h1>
            <p className="text-xl text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
              Watch our demo to see PrivyPayroll in action
            </p>

            <Card className="glass-card p-6">
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-black/20">
                <video
                  controls
                  className="w-full h-full"
                  ref={(video) => {
                    if (video) {
                      video.playbackRate = 1.5;
                    }
                  }}
                >
                  <source src="/demo.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </Card>
          </section>

          {/* Project Overview */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-center">
              Privacy-First Payroll Platform
            </h2>
            <Card className="glass-card p-8">
              <p className="text-lg text-muted-foreground leading-relaxed">
                PrivyPayroll is an enterprise-grade encrypted payroll management platform powered by <span className="text-primary font-semibold">Zama's Fully Homomorphic Encryption (FHE)</span> technology.
                It enables companies to manage payroll on-chain while keeping all salary information completely confidential.
                Employees can verify their payments without revealing sensitive financial data to anyone, including administrators.
              </p>
            </Card>
          </section>

          {/* Key Mechanisms */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Core Mechanisms
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass-card p-6 hover:scale-105 transition-transform">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  Fully Homomorphic Encryption
                </h3>
                <p className="text-muted-foreground">
                  All salary data is encrypted using Zama's FHE technology before being stored on-chain.
                  This means calculations can be performed on encrypted data without ever decrypting it,
                  ensuring complete privacy throughout the entire process.
                </p>
              </Card>

              <Card className="glass-card p-6 hover:scale-105 transition-transform">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  Zero-Knowledge Verification
                </h3>
                <p className="text-muted-foreground">
                  Employees can verify their salary payments and payroll history without revealing
                  the actual amounts to anyone. The system proves payment correctness while maintaining
                  absolute confidentiality of financial details.
                </p>
              </Card>

              <Card className="glass-card p-6 hover:scale-105 transition-transform">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  Selective Disclosure
                </h3>
                <p className="text-muted-foreground">
                  Only authorized parties can decrypt and view salary information. Employees control
                  access to their data, and can selectively disclose encrypted salary proofs for
                  loan applications or audits without revealing actual amounts.
                </p>
              </Card>

              <Card className="glass-card p-6 hover:scale-105 transition-transform">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  On-Chain Transparency
                </h3>
                <p className="text-muted-foreground">
                  All payroll transactions are recorded on the blockchain, providing an immutable
                  audit trail. This ensures operational transparency and compliance while maintaining
                  complete privacy of individual salary data.
                </p>
              </Card>
            </div>
          </section>

          {/* How It Works Steps */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">
              The Process
            </h2>

            <div className="space-y-6">
              <Card className="glass-card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Employee Registration</h3>
                    <p className="text-muted-foreground">
                      HR administrators add employees to the system. Each employee's wallet address
                      is registered on-chain, establishing their unique identity in the payroll system.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Salary Encryption</h3>
                    <p className="text-muted-foreground">
                      When setting or updating salaries, the amounts are encrypted client-side using
                      Zama's FHE SDK. The encrypted data is then submitted to the smart contract,
                      ensuring that salary information never travels unencrypted.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Encrypted Storage</h3>
                    <p className="text-muted-foreground">
                      The smart contract stores all salary data in encrypted form on the Ethereum
                      blockchain. No one, including node operators or administrators, can read the
                      actual salary amounts without proper decryption keys.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Payroll Distribution</h3>
                    <p className="text-muted-foreground">
                      When payroll is processed, the smart contract performs calculations on encrypted
                      data to determine payment amounts, deductions, and distributions without ever
                      decrypting the underlying salary information.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                    5
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Employee Verification</h3>
                    <p className="text-muted-foreground">
                      Employees can view their encrypted salary data through the dashboard. Using their
                      private keys, they can decrypt and verify their payment information, ensuring
                      accuracy while maintaining privacy from all other parties.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Benefits Section */}
          <section>
            <h2 className="text-3xl font-bold mb-8 text-center">
              Key Benefits
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="glass-card p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Employee Privacy</h3>
                <p className="text-sm text-muted-foreground">
                  Salary information remains confidential, preventing workplace inequality and protecting
                  employee financial privacy.
                </p>
              </Card>

              <Card className="glass-card p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <FileCheck className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Regulatory Compliance</h3>
                <p className="text-sm text-muted-foreground">
                  Meet data protection regulations like GDPR while maintaining transparent
                  audit trails for compliance.
                </p>
              </Card>

              <Card className="glass-card p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Enhanced Security</h3>
                <p className="text-sm text-muted-foreground">
                  Blockchain immutability combined with FHE encryption provides unparalleled
                  security for sensitive payroll data.
                </p>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
