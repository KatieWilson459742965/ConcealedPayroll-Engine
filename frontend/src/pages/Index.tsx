import { useState } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import AdminPanel from "@/components/AdminPanel";
import EmployeeDashboard from "@/components/EmployeeDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccount } from "wagmi";

const Index = () => {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {!isConnected ? (
        <Hero />
      ) : (
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="admin" className="max-w-6xl mx-auto">
              <div className="flex justify-center mb-8">
                <TabsList className="glass-card inline-flex">
                  <TabsTrigger value="admin">Admin Panel</TabsTrigger>
                  <TabsTrigger value="employee">Employee View</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="admin">
                <AdminPanel />
              </TabsContent>
              
              <TabsContent value="employee">
                <EmployeeDashboard />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
