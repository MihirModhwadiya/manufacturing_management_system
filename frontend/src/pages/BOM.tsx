import { useEffect, useState } from 'react';
import { bomAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

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
      <div style={{ padding: 24 }}>
        <h2>Loading Bill of Materials…</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>Bill of Materials</h1>
          <p style={{ color: '#666', marginTop: 4 }}>Manage product recipes and manufacturing operations</p>
        </div>
        <button style={{ padding: '8px 12px', cursor: 'pointer' }}>Create BOM</button>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb', background: '#fafafa' }}>
          <strong>Bill of Materials</strong>
        </div>
        <div style={{ padding: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Product Code</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Product Name</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Version</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Materials</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Operations</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {boms.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#6b7280' }}>
                    No BOMs found. Create your first Bill of Materials.
                  </td>
                </tr>
              ) : (
                boms.map((bom) => (
                  <tr key={bom._id}>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{bom.productCode}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{bom.productName}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{bom.version || '-'}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{bom.materials?.length ?? 0} items</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{bom.operations?.length ?? 0} ops</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>Active</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}