import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  DollarSign, 
  Calculator, 
  PieChart, 
  TrendingUp, 
  Shield, 
  Info, 
  Download,
  CreditCard,
  Building,
  Users,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface PaymentBreakdownProps {
  userType: 'employer' | 'professional';
}

export function PaymentBreakdown({ userType }: PaymentBreakdownProps) {
  const [salary, setSalary] = useState(500000);
  const [currency, setCurrency] = useState('NGN');

  // Tax and compliance calculations
  const calculateBreakdown = (grossSalary: number) => {
    // Nigerian tax calculations
    const payeeTax = grossSalary * 0.24; // Simplified PAYE calculation
    const pensionEmployee = grossSalary * 0.08;
    const pensionEmployer = grossSalary * 0.10;
    const nhfContribution = grossSalary * 0.025;
    const nsitfContribution = grossSalary * 0.01;
    const itkContribution = grossSalary * 0.01;
    
    // swipe fees
    const eorFee = grossSalary * 0.08; // 8% EOR fee
    const complianceFee = 15000; // Fixed monthly compliance fee
    const platformFee = grossSalary * 0.02; // 2% platform fee
    
    const totalEmployerCost = grossSalary + pensionEmployer + nhfContribution + nsitfContribution + itkContribution + eorFee + complianceFee + platformFee;
    const totalDeductions = payeeTax + pensionEmployee;
    const netSalary = grossSalary - totalDeductions;
    
    return {
      grossSalary,
      netSalary,
      totalEmployerCost,
      deductions: {
        payeeTax,
        pensionEmployee,
        pensionEmployer,
        nhfContribution,
        nsitfContribution,
        itkContribution
      },
      swipeFees: {
        eorFee,
        complianceFee,
        platformFee
      }
    };
  };

  const breakdown = calculateBreakdown(salary);

  if (userType === 'employer') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Cost Calculator & Payment Breakdown
            </CardTitle>
            <CardDescription>
              Calculate total employment costs including taxes, compliance, and EOR fees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="calculator" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="calculator">Cost Calculator</TabsTrigger>
                <TabsTrigger value="breakdown">Detailed Breakdown</TabsTrigger>
                <TabsTrigger value="compliance">Compliance Costs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="calculator" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="salary">Monthly Salary (NGN)</Label>
                      <Input
                        id="salary"
                        type="number"
                        value={salary}
                        onChange={(e) => setSalary(Number(e.target.value))}
                        placeholder="500000"
                      />
                    </div>
                    
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium mb-2">Quick Estimates</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSalary(300000)}
                          className="text-xs"
                        >
                          ₦300K
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSalary(500000)}
                          className="text-xs"
                        >
                          ₦500K
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSalary(800000)}
                          className="text-xs"
                        >
                          ₦800K
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground mb-1">Total Monthly Cost</div>
                          <div className="text-2xl font-bold text-primary">
                            ₦{breakdown.totalEmployerCost.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Employee receives ₦{breakdown.netSalary.toLocaleString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-background rounded border">
                        <div className="text-lg font-semibold">
                          ₦{breakdown.swipeFees.eorFee.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">EOR Services</div>
                      </div>
                      <div className="text-center p-3 bg-background rounded border">
                        <div className="text-lg font-semibold">
                          ₦{(breakdown.deductions.payeeTax + breakdown.deductions.pensionEmployee + breakdown.deductions.pensionEmployer).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Tax & Benefits</div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="breakdown" className="space-y-4 mt-4">
                <div className="grid gap-4">
                  {/* Salary Section */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Employee Compensation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Gross Salary</span>
                        <span className="font-medium">₦{breakdown.grossSalary.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-red-600">
                        <span>- PAYE Tax</span>
                        <span>₦{breakdown.deductions.payeeTax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-red-600">
                        <span>- Pension (Employee)</span>
                        <span>₦{breakdown.deductions.pensionEmployee.toLocaleString()}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between items-center font-medium">
                        <span>Net Salary</span>
                        <span className="text-green-600">₦{breakdown.netSalary.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Employer Contributions */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Employer Contributions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Pension (Employer 10%)</span>
                        <span>₦{breakdown.deductions.pensionEmployer.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>NHF Contribution (2.5%)</span>
                        <span>₦{breakdown.deductions.nhfContribution.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>NSITF (1%)</span>
                        <span>₦{breakdown.deductions.nsitfContribution.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>ITK (1%)</span>
                        <span>₦{breakdown.deductions.itkContribution.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* swipe Fees */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        swipe Service Fees
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>EOR Service Fee (8%)</span>
                        <span>₦{breakdown.swipeFees.eorFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Compliance Management</span>
                        <span>₦{breakdown.swipeFees.complianceFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Platform Fee (2%)</span>
                        <span>₦{breakdown.swipeFees.platformFee.toLocaleString()}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between items-center font-medium">
                        <span>Total Service Fees</span>
                        <span>₦{(breakdown.swipeFees.eorFee + breakdown.swipeFees.complianceFee + breakdown.swipeFees.platformFee).toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Total Cost */}
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Total Monthly Cost</span>
                        <span className="text-primary">₦{breakdown.totalEmployerCost.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="compliance" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        What's Included in EOR Services
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid gap-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Legal employment in Nigeria</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Tax compliance and filing</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Pension and benefits administration</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Payroll processing and payments</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Compliance monitoring and reporting</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Employee contracts and documentation</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-600" />
                        Compliance Fees Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>CBN compliance monitoring</span>
                          <span>₦5,000/month</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax filing and reporting</span>
                          <span>₦7,000/month</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Legal documentation</span>
                          <span>₦3,000/month</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-medium">
                          <span>Total Compliance Fee</span>
                          <span>₦15,000/month</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-yellow-900 dark:text-yellow-100">Cost Savings</span>
                    </div>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Our EOR services save you an average of 40% compared to setting up a Nigerian subsidiary, 
                      plus eliminate compliance risks and setup time.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Professional view
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Salary & Tax Information
          </CardTitle>
          <CardDescription>
            Understand your take-home pay and tax obligations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-green-700 dark:text-green-300 mb-1">Your Take-Home</div>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    ₦{breakdown.netSalary.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">per month</div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">Gross Salary</div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    ₦{breakdown.grossSalary.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">per month</div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Deductions Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Pay-As-You-Earn (PAYE) Tax</span>
                  <span className="font-medium">₦{breakdown.deductions.payeeTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Pension Contribution (8%)</span>
                  <span className="font-medium">₦{breakdown.deductions.pensionEmployee.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center font-medium">
                  <span>Total Deductions</span>
                  <span className="text-red-600">₦{(breakdown.deductions.payeeTax + breakdown.deductions.pensionEmployee).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Employer Contributions (Benefits for You)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Employer Pension Contribution (10%)</span>
                  <span className="font-medium text-green-600">₦{breakdown.deductions.pensionEmployer.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>National Housing Fund (NHF)</span>
                  <span className="font-medium text-green-600">₦{breakdown.deductions.nhfContribution.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>NSITF (Industrial Training)</span>
                  <span className="font-medium text-green-600">₦{breakdown.deductions.nsitfContribution.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
            
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900 dark:text-blue-100">Tax & Compliance</span>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                All taxes are automatically calculated and paid by your employer through swipe's EOR service. 
                You'll receive annual tax certificates for your records.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}