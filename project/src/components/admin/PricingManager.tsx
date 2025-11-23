import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DollarSign, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';

interface PricingRate {
  id: string;
  customer_type: 'individual' | 'professional';
  distance_min_km: number;
  distance_max_km: number | null;
  rate_per_km: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function PricingManager() {
  const [rates, setRates] = useState<PricingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PricingRate>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRate, setNewRate] = useState({
    customer_type: 'individual' as 'individual' | 'professional',
    distance_min_km: 0,
    distance_max_km: null as number | null,
    rate_per_km: 0,
  });

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_rates')
        .select('*')
        .order('customer_type', { ascending: true })
        .order('distance_min_km', { ascending: true });

      if (error) throw error;
      setRates(data || []);
    } catch (error) {
      console.error('Error fetching rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rate: PricingRate) => {
    setEditingId(rate.id);
    setEditForm(rate);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      const { error } = await supabase
        .from('pricing_rates')
        .update({
          distance_min_km: editForm.distance_min_km,
          distance_max_km: editForm.distance_max_km,
          rate_per_km: editForm.rate_per_km,
          is_active: editForm.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId);

      if (error) throw error;

      await fetchRates();
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error('Error updating rate:', error);
      alert('Erreur lors de la mise à jour du tarif');
    }
  };

  const handleAdd = async () => {
    try {
      const { error } = await supabase
        .from('pricing_rates')
        .insert([newRate]);

      if (error) throw error;

      await fetchRates();
      setShowAddForm(false);
      setNewRate({
        customer_type: 'individual',
        distance_min_km: 0,
        distance_max_km: null,
        rate_per_km: 0,
      });
    } catch (error) {
      console.error('Error adding rate:', error);
      alert('Erreur lors de l\'ajout du tarif');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce tarif ?')) return;

    try {
      const { error } = await supabase
        .from('pricing_rates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchRates();
    } catch (error) {
      console.error('Error deleting rate:', error);
      alert('Erreur lors de la suppression du tarif');
    }
  };

  const formatCustomerType = (type: string) => {
    return type === 'professional' ? 'Professionnel' : 'Particulier';
  };

  const formatDistance = (min: number, max: number | null) => {
    if (max === null) return `${min}+ km`;
    return `${min}-${max} km`;
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  const individualRates = rates.filter(r => r.customer_type === 'individual');
  const professionalRates = rates.filter(r => r.customer_type === 'professional');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-green-600" />
          <h2 className="text-2xl font-bold text-slate-900">Gestion des Tarifs</h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Ajouter un tarif
        </button>
      </div>

      {showAddForm && (
        <div className="bg-slate-50 border-2 border-slate-300 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Nouveau tarif</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
              <select
                value={newRate.customer_type}
                onChange={(e) => setNewRate({ ...newRate, customer_type: e.target.value as 'individual' | 'professional' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="individual">Particulier</option>
                <option value="professional">Professionnel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Distance min (km)</label>
              <input
                type="number"
                value={newRate.distance_min_km}
                onChange={(e) => setNewRate({ ...newRate, distance_min_km: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Distance max (km)</label>
              <input
                type="number"
                value={newRate.distance_max_km || ''}
                onChange={(e) => setNewRate({ ...newRate, distance_max_km: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="Vide = illimité"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Prix/km (€)</label>
              <input
                type="number"
                step="0.01"
                value={newRate.rate_per_km}
                onChange={(e) => setNewRate({ ...newRate, rate_per_km: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Save className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400"
              >
                <X className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-slate-900 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">Tarifs Particuliers</h3>
          </div>
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-sm font-semibold text-slate-700">Distance</th>
                  <th className="text-left py-2 text-sm font-semibold text-slate-700">Prix/km</th>
                  <th className="text-left py-2 text-sm font-semibold text-slate-700">Statut</th>
                  <th className="text-right py-2 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {individualRates.map((rate) => (
                  <tr key={rate.id} className="border-b border-slate-100">
                    {editingId === rate.id ? (
                      <>
                        <td className="py-3">
                          <div className="flex gap-1">
                            <input
                              type="number"
                              value={editForm.distance_min_km}
                              onChange={(e) => setEditForm({ ...editForm, distance_min_km: parseInt(e.target.value) })}
                              className="w-16 px-2 py-1 text-sm border rounded"
                            />
                            <span className="py-1">-</span>
                            <input
                              type="number"
                              value={editForm.distance_max_km || ''}
                              onChange={(e) => setEditForm({ ...editForm, distance_max_km: e.target.value ? parseInt(e.target.value) : null })}
                              placeholder="∞"
                              className="w-16 px-2 py-1 text-sm border rounded"
                            />
                          </div>
                        </td>
                        <td className="py-3">
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.rate_per_km}
                            onChange={(e) => setEditForm({ ...editForm, rate_per_km: parseFloat(e.target.value) })}
                            className="w-20 px-2 py-1 text-sm border rounded"
                          />
                        </td>
                        <td className="py-3">
                          <input
                            type="checkbox"
                            checked={editForm.is_active}
                            onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                            className="rounded"
                          />
                        </td>
                        <td className="py-3 text-right">
                          <button onClick={handleSaveEdit} className="text-green-600 hover:text-green-700 mr-2">
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={handleCancelEdit} className="text-slate-600 hover:text-slate-700">
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 text-slate-900">{formatDistance(rate.distance_min_km, rate.distance_max_km)}</td>
                        <td className="py-3 text-slate-900 font-semibold">{rate.rate_per_km.toFixed(2)}€</td>
                        <td className="py-3">
                          <span className={`inline-block px-2 py-1 text-xs rounded ${rate.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                            {rate.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button onClick={() => handleEdit(rate)} className="text-slate-900 hover:text-slate-800 mr-2">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(rate.id)} className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-green-600 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">Tarifs Professionnels</h3>
          </div>
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-sm font-semibold text-slate-700">Distance</th>
                  <th className="text-left py-2 text-sm font-semibold text-slate-700">Prix/km</th>
                  <th className="text-left py-2 text-sm font-semibold text-slate-700">Statut</th>
                  <th className="text-right py-2 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {professionalRates.map((rate) => (
                  <tr key={rate.id} className="border-b border-slate-100">
                    {editingId === rate.id ? (
                      <>
                        <td className="py-3">
                          <div className="flex gap-1">
                            <input
                              type="number"
                              value={editForm.distance_min_km}
                              onChange={(e) => setEditForm({ ...editForm, distance_min_km: parseInt(e.target.value) })}
                              className="w-16 px-2 py-1 text-sm border rounded"
                            />
                            <span className="py-1">-</span>
                            <input
                              type="number"
                              value={editForm.distance_max_km || ''}
                              onChange={(e) => setEditForm({ ...editForm, distance_max_km: e.target.value ? parseInt(e.target.value) : null })}
                              placeholder="∞"
                              className="w-16 px-2 py-1 text-sm border rounded"
                            />
                          </div>
                        </td>
                        <td className="py-3">
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.rate_per_km}
                            onChange={(e) => setEditForm({ ...editForm, rate_per_km: parseFloat(e.target.value) })}
                            className="w-20 px-2 py-1 text-sm border rounded"
                          />
                        </td>
                        <td className="py-3">
                          <input
                            type="checkbox"
                            checked={editForm.is_active}
                            onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                            className="rounded"
                          />
                        </td>
                        <td className="py-3 text-right">
                          <button onClick={handleSaveEdit} className="text-green-600 hover:text-green-700 mr-2">
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={handleCancelEdit} className="text-slate-600 hover:text-slate-700">
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 text-slate-900">{formatDistance(rate.distance_min_km, rate.distance_max_km)}</td>
                        <td className="py-3 text-slate-900 font-semibold">{rate.rate_per_km.toFixed(2)}€</td>
                        <td className="py-3">
                          <span className={`inline-block px-2 py-1 text-xs rounded ${rate.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                            {rate.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button onClick={() => handleEdit(rate)} className="text-slate-900 hover:text-slate-800 mr-2">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(rate.id)} className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
