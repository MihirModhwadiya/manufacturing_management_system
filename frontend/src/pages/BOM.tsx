import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockBOMs } from '@/data/mockData';
import { Plus, Search, FileText, Package, DollarSign } from 'lucide-react';

export default function BOM() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBOM, setSelectedBOM] = useState(mockBOMs[0]);

  const filteredBOMs = mockBOMs.filter(bom =>
    bom.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bom.productId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Header 
        title="Bill of Materials"
        subtitle="Manage product components and cost structures"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* BOM List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Product BOMs</CardTitle>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New BOM
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search BOMs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="space-y-2">
              {filteredBOMs.map((bom) => (
                <div
                  key={bom.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedBOM?.id === bom.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-accent'
                  }`}
                  onClick={() => setSelectedBOM(bom)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{bom.productId}</span>
                    <span className="text-xs text-muted-foreground">{bom.version}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{bom.productName}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{bom.items.length} components</span>
                    <span className="font-medium">${bom.totalCost.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* BOM Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {selectedBOM?.productName}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Product ID: {selectedBOM?.productId} | Version: {selectedBOM?.version}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button size="sm">
                  Edit BOM
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* BOM Summary */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Components</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{selectedBOM?.items.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${selectedBOM?.totalCost.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Component Cost</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${selectedBOM ? (selectedBOM.totalCost / selectedBOM.items.length).toFixed(2) : '0.00'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Components Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedBOM?.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.partNumber}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>${item.cost.toFixed(2)}</TableCell>
                      <TableCell className="font-medium">
                        ${(item.quantity * item.cost).toFixed(2)}
                      </TableCell>
                      <TableCell>{item.supplier || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Cost Breakdown */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedBOM?.items.map((item) => {
                    const itemTotal = item.quantity * item.cost;
                    const percentage = ((itemTotal / selectedBOM.totalCost) * 100).toFixed(1);
                    
                    return (
                      <div key={item.id} className="flex items-center justify-between">
                        <span className="text-sm">{item.description}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{percentage}%</span>
                          <span className="text-sm font-medium">${itemTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}