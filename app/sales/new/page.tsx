'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function NewSalePage() {
  const [step, setStep] = useState(1)
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [vehicles, setVehicles] = useState<any[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
  const [tyres, setTyres] = useState<any[]>([])
  const [selectedTyre, setSelectedTyre] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [tyreType, setTyreType] = useState('both')
  const [loading, setLoading] = useState(false)
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerMobile, setNewCustomerMobile] = useState('')
  const [newCustomerEmail, setNewCustomerEmail] = useState('')
  const [newVehicleRegistration, setNewVehicleRegistration] = useState('')
  const [newVehicleMake, setNewVehicleMake] = useState('')
  const [newVehicleModel, setNewVehicleModel] = useState('')
  const [newVehicleYear, setNewVehicleYear] = useState('')
  const [newVehicleTyreSize, setNewVehicleTyreSize] = useState('')

  const searchCustomers = async (query: string) => {
    if (query.length < 2) {
      setCustomers([])
      return
    }
    setLoading(true)
    try {
      const { data } = await supabase
        .from('customers')
        .select('*')
        .ilike('name', '%' + query + '%')
        .limit(5)
      setCustomers(data || [])
    } catch (error) {
      console.error('Error:', error)
    }
    setLoading(false)
  }

  const addNewCustomer = async () => {
    if (!newCustomerName) {
      alert('Please enter customer name')
      return
    }
    
    setLoading(true)
    try {
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .insert([{
          name: newCustomerName,
          mobile: newCustomerMobile,
          email: newCustomerEmail
        }])
        .select()

      if (customerError) throw customerError
      
      const newCustomer = customerData?.[0]
      if (!newCustomer) throw new Error('Failed to create customer')

      if (newVehicleRegistration && newVehicleMake && newVehicleModel) {
        const { error: vehicleError } = await supabase
          .from('vehicles')
          .insert([{
            customer_id: newCustomer.id,
            registration: newVehicleRegistration,
            make: newVehicleMake,
            model: newVehicleModel,
            year: parseInt(newVehicleYear) || null,
            current_tyre_size: newVehicleTyreSize || null
          }])

        if (vehicleError) throw vehicleError
      }

      handleCustomerSelect(newCustomer)
      setShowAddCustomer(false)
      setNewCustomerName('')
      setNewCustomerMobile('')
      setNewCustomerEmail('')
      setNewVehicleRegistration('')
      setNewVehicleMake('')
      setNewVehicleModel('')
      setNewVehicleYear('')
      setNewVehicleTyreSize('')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to add customer or vehicle')
    }
    setLoading(false)
  }

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer)
    setCustomerSearch(customer.name)
    setCustomers([])
    loadVehicles(customer.id)
  }

  const loadVehicles = async (customerId: string) => {
    try {
      const { data } = await supabase
        .from('vehicles')
        .select('*')
        .eq('customer_id', customerId)
      setVehicles(data || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const addNewVehicle = async () => {
    if (!selectedCustomer) return
    if (!newVehicleRegistration || !newVehicleMake || !newVehicleModel) {
      alert('Please enter registration, make, and model')
      return
    }

    setLoading(true)
    try {
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .insert([{
          customer_id: selectedCustomer.id,
          registration: newVehicleRegistration,
          make: newVehicleMake,
          model: newVehicleModel,
          year: parseInt(newVehicleYear) || null,
          current_tyre_size: newVehicleTyreSize || null
        }])
        .select()

      if (vehicleError) throw vehicleError

      const newVehicle = vehicleData?.[0]
      if (!newVehicle) throw new Error('Failed to create vehicle')

      setVehicles((currentVehicles) => [...currentVehicles, newVehicle])
      setSelectedVehicle(newVehicle)
      setShowAddVehicle(false)
      setNewVehicleRegistration('')
      setNewVehicleMake('')
      setNewVehicleModel('')
      setNewVehicleYear('')
      setNewVehicleTyreSize('')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to add vehicle')
    }
    setLoading(false)
  }

  const loadTyres = async () => {
    if (!selectedVehicle?.current_tyre_size) return
    setLoading(true)
    try {
      const size = selectedVehicle.current_tyre_size
      if (tyreType === 'new' || tyreType === 'both') {
        const { data } = await supabase
          .from('tyre_products')
          .select('*')
          .eq('size', size)
        setTyres(data || [])
      } else {
        const { data } = await supabase
          .from('used_tyre_inventory')
          .select('*')
          .eq('size', size)
          .eq('status', 'available')
        setTyres(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadTyres()
  }, [tyreType, selectedVehicle])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">New Sale</h1>

        {step === 1 && (
          <div className="bg-white rounded-lg p-8 shadow">
            <h2 className="text-2xl font-bold mb-6">Step 1: Customer</h2>
            
            {!showAddCustomer ? (
              <>
                <input
                  type="text"
                  placeholder="Search customer..."
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value)
                    searchCustomers(e.target.value)
                  }}
                  className="w-full px-4 py-2 border rounded mb-4"
                />
                {customers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleCustomerSelect(c)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b"
                  >
                    {c.name}
                  </button>
                ))}
                
                <button
                  onClick={() => setShowAddCustomer(true)}
                  className="w-full mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                >
                  Add New Customer
                </button>

                {selectedCustomer && (
                  <div className="mb-6 p-4 bg-blue-50 rounded mt-4">
                    Selected: {selectedCustomer.name}
                  </div>
                )}
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedCustomer}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded mt-6"
                >
                  Continue
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-4">Add New Customer</h3>
                
                <div className="mb-6 pb-6 border-b">
                  <h4 className="font-semibold mb-4">Customer Details</h4>
                  <input
                    type="text"
                    placeholder="Customer name"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    className="w-full px-4 py-2 border rounded mb-4"
                  />
                  <input
                    type="text"
                    placeholder="Mobile number"
                    value={newCustomerMobile}
                    onChange={(e) => setNewCustomerMobile(e.target.value)}
                    className="w-full px-4 py-2 border rounded mb-4"
                  />
                  <input
                    type="email"
                    placeholder="Email (optional)"
                    value={newCustomerEmail}
                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded mb-4"
                  />
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-4">Vehicle Details (Optional)</h4>
                  <input
                    type="text"
                    placeholder="Registration (e.g. ABC123)"
                    value={newVehicleRegistration}
                    onChange={(e) => setNewVehicleRegistration(e.target.value)}
                    className="w-full px-4 py-2 border rounded mb-4"
                  />
                  <input
                    type="text"
                    placeholder="Make (e.g. Toyota)"
                    value={newVehicleMake}
                    onChange={(e) => setNewVehicleMake(e.target.value)}
                    className="w-full px-4 py-2 border rounded mb-4"
                  />
                  <input
                    type="text"
                    placeholder="Model (e.g. Hilux)"
                    value={newVehicleModel}
                    onChange={(e) => setNewVehicleModel(e.target.value)}
                    className="w-full px-4 py-2 border rounded mb-4"
                  />
                  <input
                    type="text"
                    placeholder="Year (e.g. 2019)"
                    value={newVehicleYear}
                    onChange={(e) => setNewVehicleYear(e.target.value)}
                    className="w-full px-4 py-2 border rounded mb-4"
                  />
                  <input
                    type="text"
                    placeholder="Tyre Size (e.g. 265/60R18)"
                    value={newVehicleTyreSize}
                    onChange={(e) => setNewVehicleTyreSize(e.target.value)}
                    className="w-full px-4 py-2 border rounded mb-4"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowAddCustomer(false)}
                    className="flex-1 bg-gray-400 text-white py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addNewCustomer}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 rounded"
                  >
                    {loading ? 'Saving...' : 'Save Customer'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-lg p-8 shadow">
            <h2 className="text-2xl font-bold mb-6">Step 2: Vehicle</h2>
            {!showAddVehicle ? (
              <>
                {vehicles.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVehicle(v)}
                    className={`w-full text-left px-4 py-3 border rounded mb-2 hover:bg-gray-50 ${selectedVehicle?.id === v.id ? 'border-blue-600 bg-blue-50' : ''}`}
                  >
                    <div className="font-semibold">{v.registration}</div>
                    <div className="text-sm text-gray-600">{v.year} {v.make} {v.model}</div>
                  </button>
                ))}
                <button
                  onClick={() => setShowAddVehicle(true)}
                  className="w-full mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                >
                  Add Vehicle
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-4">Add Vehicle</h3>
                <input
                  type="text"
                  placeholder="Registration (e.g. ABC123)"
                  value={newVehicleRegistration}
                  onChange={(e) => setNewVehicleRegistration(e.target.value)}
                  className="w-full px-4 py-2 border rounded mb-4"
                />
                <input
                  type="text"
                  placeholder="Make (e.g. Toyota)"
                  value={newVehicleMake}
                  onChange={(e) => setNewVehicleMake(e.target.value)}
                  className="w-full px-4 py-2 border rounded mb-4"
                />
                <input
                  type="text"
                  placeholder="Model (e.g. Hilux)"
                  value={newVehicleModel}
                  onChange={(e) => setNewVehicleModel(e.target.value)}
                  className="w-full px-4 py-2 border rounded mb-4"
                />
                <input
                  type="text"
                  placeholder="Year (e.g. 2019)"
                  value={newVehicleYear}
                  onChange={(e) => setNewVehicleYear(e.target.value)}
                  className="w-full px-4 py-2 border rounded mb-4"
                />
                <input
                  type="text"
                  placeholder="Tyre Size (e.g. 265/60R18)"
                  value={newVehicleTyreSize}
                  onChange={(e) => setNewVehicleTyreSize(e.target.value)}
                  className="w-full px-4 py-2 border rounded mb-4"
                />
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowAddVehicle(false)}
                    className="flex-1 bg-gray-400 text-white py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addNewVehicle}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 rounded"
                  >
                    {loading ? 'Saving...' : 'Save Vehicle'}
                  </button>
                </div>
              </>
            )}
            <div className="flex gap-4 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 bg-gray-400 text-white py-2 rounded">Back</button>
              <button onClick={() => setStep(3)} disabled={!selectedVehicle} className="flex-1 bg-blue-600 disabled:bg-gray-400 text-white py-2 rounded">Continue</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-lg p-8 shadow">
            <h2 className="text-2xl font-bold mb-6">Step 3: Tyres</h2>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">Type:</label>
              <div className="flex gap-3">
                <button 
                  onClick={() => setTyreType('both')} 
                  className={tyreType === 'both' ? 'px-4 py-2 rounded bg-blue-600 text-white' : 'px-4 py-2 rounded bg-gray-200'}
                >
                  Both
                </button>
                <button 
                  onClick={() => setTyreType('new')} 
                  className={tyreType === 'new' ? 'px-4 py-2 rounded bg-blue-600 text-white' : 'px-4 py-2 rounded bg-gray-200'}
                >
                  New
                </button>
                <button 
                  onClick={() => setTyreType('used')} 
                  className={tyreType === 'used' ? 'px-4 py-2 rounded bg-blue-600 text-white' : 'px-4 py-2 rounded bg-gray-200'}
                >
                  Used
                </button>
              </div>
            </div>
            {tyres.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTyre(t)}
                className="w-full text-left px-4 py-3 border rounded mb-2 hover:bg-gray-50"
              >
                <div className="font-semibold">{t.brand} {t.model}</div>
                <div className="text-sm">${t.selling_price}</div>
              </button>
            ))}
            {selectedTyre && (
              <div className="mb-6 mt-6 p-4 bg-blue-50 rounded">
                <label className="block text-sm font-semibold mb-3">Quantity:</label>
                <div className="flex gap-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 bg-gray-200 rounded">−</button>
                  <span className="px-4 py-2 font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 bg-gray-200 rounded">+</button>
                </div>
              </div>
            )}
            <div className="flex gap-4 mt-6">
              <button onClick={() => setStep(2)} className="flex-1 bg-gray-400 text-white py-2 rounded">Back</button>
              <button onClick={() => setStep(4)} disabled={!selectedTyre} className="flex-1 bg-blue-600 disabled:bg-gray-400 text-white py-2 rounded">Continue</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="bg-white rounded-lg p-8 shadow">
            <h2 className="text-2xl font-bold mb-6">Step 4: Services</h2>
            <p className="text-gray-600 mb-6">Coming next...</p>
            <button onClick={() => setStep(3)} className="w-full bg-gray-400 text-white py-2 rounded">Back</button>
          </div>
        )}
      </div>
    </div>
  )
} 