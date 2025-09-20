import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus } from 'lucide-react';
import { bomAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

type BomItem = {
  _id: string;
  productCode: string;
  productName: string;
  version?: string;
  materials?: Array<unknown>;
  operations?: Array<unknown>;
};

export default function BOM() {
  const [boms, setBoms] = useState<BomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadBOMs();
  }, []);

  const loadBOMs = async () => {
    try {
      setLoading(true);
      const response = await bomAPI.getAll();
      setBoms(response.boms || []);
    } catch (error: any) {
      console.error('Failed to load BOMs:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load BOMs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bill of Materials</h1>
          <p className="text-muted-foreground">Manage product recipes and manufacturing operations</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'inventory') && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create BOM
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bill of Materials</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Code</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Materials</TableHead>
                <TableHead>Operations</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No BOMs found. Create your first Bill of Materials.
                  </TableCell>
                </TableRow>
              ) : (
                boms.map((bom) => (
                  <TableRow key={bom._id}>
                    <TableCell className="font-medium">{bom.productCode}</TableCell>
                    <TableCell>{bom.productName}</TableCell>
                    <TableCell>{bom.version || '-'}</TableCell>
                    <TableCell>{bom.materials?.length ?? 0} items</TableCell>
                    <TableCell>{bom.operations?.length ?? 0} ops</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}