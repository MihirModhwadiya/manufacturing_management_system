import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockStockMovements } from '@/data/mockData';
import { Plus, Search, Filter, TrendingUp, TrendingDown, Package, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StockLedger() {
  const [searchTerm, setSearchTerm] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] = useState<string>('all');

  const filteredMovements = mockStockMovements.filter(movement => {
    const matchesSearch = movement.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = movementTypeFilter === 'all' || movement.movementType === movementTypeFilter;
    
    return matchesSearch && matchesType;
  });

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'out':
        return <TrendingDown className="h-4 w-4 text-error" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-warning" />;
    }
  };

  const getQuantityClass = (quantity: number) => {
    return cn(
      "font-medium",
      quantity > 0 ? "text-success" : quantity < 0 ? "text-error" : "text-muted-foreground"
    );
  };

  const stats = {
    totalMovements: mockStockMovements.length,
    incomingItems: mockStockMovements.filter(m => m.movementType === 'in').length,
    outgoingItems: mockStockMovements.filter(m => m.movementType === 'out').length,
    adjustments: mockStockMovements.filter(m => m.movementType === 'adjustment').length
  };

  return (
    <div className="space-y-6">
      <Header 
        title="Stock Ledger"
        subtitle="Track inventory movements and stock levels"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Movements</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMovements}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incoming</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.incomingItems}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outgoing</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-error">{stats.outgoingItems}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adjustments</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.adjustments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Movements */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Stock Movements</CardTitle>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Record Movement
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search parts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={movementTypeFilter} onValueChange={setMovementTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by movement type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Movements</SelectItem>
                <SelectItem value="in">Incoming</SelectItem>
                <SelectItem value="out">Outgoing</SelectItem>
                <SelectItem value="adjustment">Adjustments</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Movements Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Part Number</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Movement Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>{new Date(movement.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{movement.partNumber}</TableCell>
                    <TableCell>{movement.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getMovementIcon(movement.movementType)}
                        <span className="capitalize">{movement.movementType}</span>
                      </div>
                    </TableCell>
                    <TableCell className={getQuantityClass(movement.quantity)}>
                      {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                    </TableCell>
                    <TableCell>{movement.unit}</TableCell>
                    <TableCell>{movement.reference}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{movement.currentStock} {movement.unit}</span>
                        {movement.currentStock < 20 && (
                          <AlertTriangle className="h-4 w-4 text-warning" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Stock Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockStockMovements
              .filter(m => m.currentStock < 20)
              .map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border border-warning/20 bg-warning/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-muted-foreground">Part: {item.partNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-warning">{item.currentStock} {item.unit}</p>
                    <p className="text-xs text-muted-foreground">Low Stock</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}