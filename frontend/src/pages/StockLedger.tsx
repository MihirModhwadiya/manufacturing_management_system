import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { stockLedgerAPI, materialAPI } from '@/lib/api';
import { Plus, Search, Filter, TrendingUp, TrendingDown, Package, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StockLedger() {
  const [searchTerm, setSearchTerm] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] = useState<string>('all');
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [movements, setMovements] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMovement, setNewMovement] = useState({
    material: '',
    partNumber: '',
    description: '',
    movementType: 'in',
    quantity: '',
    reason: '',
    reference: '',
    notes: ''
  });
  const { toast } = useToast();

  // Load stock movements and materials on component mount
  useEffect(() => {
    loadMovements();
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const data = await materialAPI.getAll();
      setMaterials(data.materials || []);
    } catch (error) {
      console.error('Failed to load materials:', error);
      toast({
        title: 'Warning',
        description: 'Could not load materials list.',
        variant: 'destructive'
      });
      setMaterials([]);
    }
  };

  const loadMovements = async () => {
    try {
      setLoading(true);
      const data = await stockLedgerAPI.getAll();
      setMovements(data.movements || []);
    } catch (error) {
      console.error('Failed to load stock movements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load stock movements. Please try again.',
        variant: 'destructive'
      });
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = (movement.material?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.material?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.reference?.toLowerCase().includes(searchTerm.toLowerCase())) ?? false;
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

  const handleRecordMovement = async () => {
    try {
      // Validate required fields
      if (!newMovement.material || !newMovement.quantity || !newMovement.reason) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in material, quantity, and reason fields.',
          variant: 'destructive'
        });
        return;
      }

      // Call API to record the movement
      const movementData = {
        material: newMovement.material,
        movementType: newMovement.movementType as 'in' | 'out' | 'adjustment',
        quantity: parseFloat(newMovement.quantity),
        reason: newMovement.reason,
        reference: newMovement.reference,
        notes: newMovement.notes
      };

      await stockLedgerAPI.recordMovement(movementData);
      
      toast({
        title: 'Movement Recorded',
        description: 'Stock movement has been recorded successfully.',
      });

      // Refresh the movements list
      await loadMovements();

      // Reset form and close dialog
      setNewMovement({
        material: '',
        partNumber: '',
        description: '',
        movementType: 'in',
        quantity: '',
        reason: '',
        reference: '',
        notes: ''
      });
      setIsRecordDialogOpen(false);
    } catch (error) {
      console.error('Error recording movement:', error);
      toast({
        title: 'Error',
        description: 'Failed to record stock movement. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const stats = {
    totalMovements: movements.length,
    incomingItems: movements.filter(m => m.movementType === 'in').length,
    outgoingItems: movements.filter(m => m.movementType === 'out').length,
    adjustments: movements.filter(m => m.movementType === 'adjustment').length
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
            <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Record Movement
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Record Stock Movement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="material">Material *</Label>
                      <Select
                        value={newMovement.material}
                        onValueChange={(value) => {
                          const selectedMaterial = materials.find(m => m._id === value);
                          setNewMovement({ 
                            ...newMovement, 
                            material: value,
                            partNumber: selectedMaterial?.code || '',
                            description: selectedMaterial?.name || ''
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                        <SelectContent>
                          {materials.map(material => (
                            <SelectItem key={material._id} value={material._id}>
                              {material.code} - {material.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="movementType">Movement Type *</Label>
                      <Select
                        value={newMovement.movementType}
                        onValueChange={(value) => setNewMovement({ ...newMovement, movementType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in">Incoming</SelectItem>
                          <SelectItem value="out">Outgoing</SelectItem>
                          <SelectItem value="adjustment">Adjustment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason *</Label>
                    <Input
                      id="reason"
                      value={newMovement.reason}
                      onChange={(e) => setNewMovement({ ...newMovement, reason: e.target.value })}
                      placeholder="Enter reason for movement"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.01"
                      value={newMovement.quantity}
                      onChange={(e) => setNewMovement({ ...newMovement, quantity: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reference">Reference</Label>
                    <Input
                      id="reference"
                      value={newMovement.reference}
                      onChange={(e) => setNewMovement({ ...newMovement, reference: e.target.value })}
                      placeholder="Work order, supplier invoice, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      value={newMovement.notes}
                      onChange={(e) => setNewMovement({ ...newMovement, notes: e.target.value })}
                      placeholder="Additional notes"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleRecordMovement} className="flex-1">
                      Record Movement
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsRecordDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="animate-pulse">Loading movements...</div>
                    </TableCell>
                  </TableRow>
                ) : filteredMovements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No stock movements found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMovements.map((movement) => (
                    <TableRow key={movement._id}>
                      <TableCell>{new Date(movement.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{movement.material?.code || 'N/A'}</TableCell>
                      <TableCell>{movement.material?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMovementIcon(movement.movementType)}
                          <span className="capitalize">{movement.movementType}</span>
                        </div>
                      </TableCell>
                      <TableCell className={getQuantityClass(movement.quantity)}>
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                      </TableCell>
                      <TableCell>{movement.material?.unit || 'N/A'}</TableCell>
                      <TableCell>{movement.reference || 'N/A'}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>{movement.material?.stockQuantity || 0} {movement.material?.unit || ''}</span>
                          {(movement.material?.stockQuantity || 0) < 20 && (
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
                  ))
                )}
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
            {loading ? (
              <div className="animate-pulse space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            ) : movements.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No stock data available</p>
            ) : (
              movements
                .filter(m => (m.material?.stockQuantity || 0) < 20)
                .slice(0, 5) // Show only first 5 low stock items
                .map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-3 border border-warning/20 bg-warning/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      <div>
                        <p className="font-medium">{item.material?.name || 'Unknown Material'}</p>
                        <p className="text-sm text-muted-foreground">Code: {item.material?.code || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-warning">{item.material?.stockQuantity || 0} {item.material?.unit || ''}</p>
                      <p className="text-xs text-muted-foreground">Low Stock</p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}