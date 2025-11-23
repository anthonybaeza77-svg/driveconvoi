import { useState } from 'react';
import { supabase, ConvoyageRequest } from '../lib/supabase';
import { calculatePrice, formatPrice, CustomerType } from '../utils/priceCalculator';
import { calculateDistanceBetweenAddresses } from '../utils/geocoding';
import { Car, Mail, Phone, Building2, Calculator, Loader2, Check, Users, Briefcase } from 'lucide-react';
import AddressAutocomplete from './AddressAutocomplete';

export default function QuoteForm() {
  const [formData, setFormData] = useState({
    departure_location: '',
    arrival_location: '',
    vehicle_brand: '',
    vehicle_model: '',
    license_plate: '',
    vin_number: '',
    distance_km: '',
    customer_type: 'individual' as CustomerType,
    client_name: '',
    client_email: '',
    client_phone: '',
    company_name: '',
    siret_number: '',
    notes: '',
  });

  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    if (!formData.departure_location || !formData.arrival_location) {
      setError('Veuillez renseigner les adresses de départ et d\'arrivée');
      return;
    }

    if (!formData.vehicle_brand || !formData.vehicle_model || !formData.license_plate) {
      setError('Veuillez renseigner la marque, le modèle et l\'immatriculation du véhicule');
      return;
    }

    setError(null);
    setIsCalculatingDistance(true);

    try {
      const distance = await calculateDistanceBetweenAddresses(
        formData.departure_location,
        formData.arrival_location
      );

      if (distance === null) {
        setError('Impossible de calculer la distance. Vérifiez les adresses saisies.');
        return;
      }

      setFormData(prev => ({ ...prev, distance_km: distance.toString() }));
      const price = await calculatePrice(distance, formData.customer_type);
      setCalculatedPrice(price);
    } catch (err) {
      setError('Erreur lors du calcul de la distance');
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.customer_type === 'professional' && !formData.siret_number) {
      setError('Le numéro SIRET est obligatoire pour les professionnels');
      return;
    }

    if (formData.customer_type === 'professional' && formData.siret_number.length !== 14) {
      setError('Le numéro SIRET doit contenir 14 chiffres');
      return;
    }

    setIsSubmitting(true);

    try {
      const distance = parseInt(formData.distance_km);
      const price = calculatedPrice || await calculatePrice(distance, formData.customer_type);

      const requestData: ConvoyageRequest = {
        departure_location: formData.departure_location,
        arrival_location: formData.arrival_location,
        vehicle_brand: formData.vehicle_brand,
        vehicle_model: formData.vehicle_model,
        license_plate: formData.license_plate,
        vin_number: formData.vin_number || undefined,
        distance_km: distance,
        customer_type: formData.customer_type,
        calculated_price: price,
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_phone: formData.client_phone,
        company_name: formData.company_name || undefined,
        siret_number: formData.siret_number || undefined,
        notes: formData.notes || undefined,
      };

      const { error: submitError } = await supabase
        .from('convoyage_requests')
        .insert([requestData]);

      if (submitError) throw submitError;

      setSubmitSuccess(true);
      setFormData({
        departure_location: '',
        arrival_location: '',
        vehicle_brand: '',
        vehicle_model: '',
        license_plate: '',
        vin_number: '',
        distance_km: '',
        customer_type: 'individual',
        client_name: '',
        client_email: '',
        client_phone: '',
        company_name: '',
        siret_number: '',
        notes: '',
      });
      setCalculatedPrice(null);

      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'distance_km' || name === 'customer_type') {
      setCalculatedPrice(null);
    }
  };

  const handleCustomerTypeChange = async (type: CustomerType) => {
    setFormData(prev => ({ ...prev, customer_type: type }));
    if (formData.distance_km) {
      const distance = parseInt(formData.distance_km);
      const price = await calculatePrice(distance, type);
      setCalculatedPrice(price);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-900 mb-2">Demandez votre devis</h2>
      <p className="text-slate-600 mb-8">Obtenez un tarif instantané pour votre convoyage</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Type de client</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleCustomerTypeChange('individual')}
              className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                formData.customer_type === 'individual'
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {formData.customer_type === 'individual' && (
                <div className="absolute top-4 right-4">
                  <Check className="w-6 h-6 text-slate-900" />
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-6 h-6 text-slate-900" />
                <p className="text-lg font-semibold text-slate-900">Particulier</p>
              </div>
              <p className="text-sm text-slate-600">Tarif standard pour les particuliers</p>
            </button>

            <button
              type="button"
              onClick={() => handleCustomerTypeChange('professional')}
              className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                formData.customer_type === 'professional'
                  ? 'border-green-500 bg-green-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {formData.customer_type === 'professional' && (
                <div className="absolute top-4 right-4">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <Briefcase className="w-6 h-6 text-green-600" />
                <p className="text-lg font-semibold text-slate-900">Professionnel</p>
              </div>
              <p className="text-sm text-slate-600">Tarif préférentiel pour les entreprises</p>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <AddressAutocomplete
            value={formData.departure_location}
            onChange={(value) => setFormData(prev => ({ ...prev, departure_location: value }))}
            label="Lieu de départ"
            placeholder="Ex: 75 rue de la République, Paris"
          />

          <AddressAutocomplete
            value={formData.arrival_location}
            onChange={(value) => setFormData(prev => ({ ...prev, arrival_location: value }))}
            label="Lieu d'arrivée"
            placeholder="Ex: 10 Place Bellecour, Lyon"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Informations du véhicule</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                <Car className="w-4 h-4 mr-2 text-slate-600" />
                Marque <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="vehicle_brand"
                value={formData.vehicle_brand}
                onChange={handleInputChange}
                required
                placeholder="Ex: Peugeot"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                <Car className="w-4 h-4 mr-2 text-slate-600" />
                Modèle <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="vehicle_model"
                value={formData.vehicle_model}
                onChange={handleInputChange}
                required
                placeholder="Ex: 308"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                <Car className="w-4 h-4 mr-2 text-slate-600" />
                Immatriculation <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="license_plate"
                value={formData.license_plate}
                onChange={handleInputChange}
                required
                placeholder="Ex: AB-123-CD"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                maxLength={15}
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                <Car className="w-4 h-4 mr-2 text-slate-600" />
                Numéro VIN (optionnel)
              </label>
              <input
                type="text"
                name="vin_number"
                value={formData.vin_number}
                onChange={handleInputChange}
                placeholder="Ex: VF1DZ0N0641118804"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                maxLength={17}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
            <Calculator className="w-4 h-4 mr-2 text-slate-600" />
            Distance calculée (km)
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              name="distance_km"
              value={formData.distance_km}
              onChange={handleInputChange}
              required
              min="1"
              placeholder="Cliquez sur 'Calculer' pour obtenir la distance"
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
              readOnly
            />
            <button
              type="button"
              onClick={handleCalculate}
              disabled={isCalculatingDistance || !formData.departure_location || !formData.arrival_location}
              className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isCalculatingDistance ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calcul...
                </>
              ) : (
                'Calculer'
              )}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Renseignez les adresses précises (ville, rue) pour un calcul automatique
          </p>
        </div>

        {calculatedPrice !== null && (
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-300 rounded-xl p-6">
            <p className="text-sm text-slate-600 mb-1">Prix estimé</p>
            <p className="text-4xl font-bold text-slate-900">{formatPrice(calculatedPrice)}</p>
            <p className="text-sm text-slate-500 mt-2">
              {(() => {
                const distance = parseInt(formData.distance_km);
                if (formData.customer_type === 'professional') {
                  if (distance <= 40) return '3,50€/km TTC - Tarif professionnel';
                  if (distance <= 90) return '1,82€/km TTC - Tarif professionnel';
                  return '1,26€/km TTC - Tarif professionnel';
                } else {
                  if (distance <= 40) return '4,20€/km TTC - Tarif particulier';
                  if (distance <= 90) return '2,20€/km TTC - Tarif particulier';
                  return '1,51€/km TTC - Tarif particulier';
                }
              })()}
            </p>
          </div>
        )}

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Vos coordonnées</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Nom complet
              </label>
              <input
                type="text"
                name="client_name"
                value={formData.client_name}
                onChange={handleInputChange}
                required
                placeholder="Votre nom"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                <Mail className="w-4 h-4 mr-2 text-slate-600" />
                Email
              </label>
              <input
                type="email"
                name="client_email"
                value={formData.client_email}
                onChange={handleInputChange}
                required
                placeholder="votre@email.com"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                <Phone className="w-4 h-4 mr-2 text-slate-600" />
                Téléphone
              </label>
              <input
                type="tel"
                name="client_phone"
                value={formData.client_phone}
                onChange={handleInputChange}
                required
                placeholder="06 12 34 56 78"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                <Building2 className="w-4 h-4 mr-2 text-slate-600" />
                Entreprise {formData.customer_type === 'professional' ? '(obligatoire)' : '(optionnel)'}
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                required={formData.customer_type === 'professional'}
                placeholder="Nom de votre entreprise"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {formData.customer_type === 'professional' && (
              <div className="md:col-span-2">
                <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                  <Building2 className="w-4 h-4 mr-2 text-slate-600" />
                  Numéro SIRET (obligatoire pour les professionnels)
                </label>
                <input
                  type="text"
                  name="siret_number"
                  value={formData.siret_number}
                  onChange={handleInputChange}
                  required
                  placeholder="12345678901234 (14 chiffres)"
                  pattern="[0-9]{14}"
                  maxLength={14}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Le numéro SIRET doit contenir exactement 14 chiffres
                </p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Notes additionnelles (optionnel)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Informations supplémentaires..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {submitSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            Votre demande a été envoyée avec succès! Nous vous contacterons rapidement.
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800 font-medium">
            ℹ️ Information importante : Ce devis est indicatif et sera confirmé après validation par convoy-auto.com
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-slate-900 text-white py-4 rounded-lg font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Envoi en cours...' : 'Demander ce devis'}
        </button>
      </form>
    </div>
  );
}
