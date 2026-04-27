'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaLock, FaCreditCard, FaMobileAlt, FaUniversity, FaArrowLeft, FaCheckCircle, FaShieldAlt, FaWallet, FaPhone, FaBuilding } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [step, setStep] = useState(1);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Billing form state
  const [billingForm, setBillingForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    country: 'Botswana',
    city: 'Gaborone',
    postalCode: ''
  });
  
  // Card details state
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  
  // Mobile money state
  const [mobileMoney, setMobileMoney] = useState({
    provider: 'orange',
    phone: ''
  });
  
  // Bank transfer state
  const [bankTransfer, setBankTransfer] = useState({
    reference: '',
    proofUploaded: false
  });

  useEffect(() => {
    // Get booking data from URL params or localStorage
    const bookingRef = searchParams.get('ref');
    if (bookingRef) {
      loadBookingData(bookingRef);
    }
  }, []);

  const loadBookingData = async (ref) => {
    try {
      const res = await fetch(`/api/bookings/${ref}`);
      if (res.ok) {
        const data = await res.json();
        setBookingData(data);
      }
    } catch (error) {
      console.error('Failed to load booking:', error);
    }
  };

  const handleBillingChange = (e) => {
    setBillingForm({ ...billingForm, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'number') {
      value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }
    if (e.target.name === 'expiry') {
      value = value.replace(/\//g, '').replace(/(\d{2})(\d{2})/, '$1/$2');
    }
    setCardDetails({ ...cardDetails, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentSuccess(true);
      setStep(3);
      setLoading(false);
    }, 2000);
  };

  const subtotal = bookingData?.total_price || 450;
  const tax = subtotal * 0.12; // 12% VAT
  const total = subtotal + tax;

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-4xl text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-slate-500 mb-4">Your booking has been confirmed.</p>
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-600">Booking Reference</p>
            <p className="font-mono font-bold text-blue-600">{bookingData?.booking_reference || 'PULA-ABC123'}</p>
          </div>
          <button 
            onClick={() => router.push('/dashboard/bookings')}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            View My Bookings
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition">
            <FaArrowLeft className="text-sm" /> Back
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Checkout Form - 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              
              {/* Progress Steps */}
              <div className="border-b border-slate-100 p-6">
                <div className="flex items-center justify-between">
                  {[
                    { step: 1, label: 'Billing Info', icon: '📝' },
                    { step: 2, label: 'Payment', icon: '💳' },
                    { step: 3, label: 'Confirmation', icon: '✅' },
                  ].map((s) => (
                    <div key={s.step} className="flex items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full transition ${
                        step >= s.step ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <span className="text-sm">{s.icon}</span>
                      </div>
                      <span className={`ml-2 text-sm font-medium hidden md:inline ${
                        step >= s.step ? 'text-slate-800' : 'text-slate-400'
                      }`}>
                        {s.label}
                      </span>
                      {s.step < 3 && <div className="w-12 h-px bg-slate-200 mx-2 hidden md:block" />}
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                
                {/* Step 1: Billing Information */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-bold text-slate-800">Billing Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">First Name *</label>
                        <input
                          type="text"
                          name="firstName"
                          value={billingForm.firstName}
                          onChange={handleBillingChange}
                          required
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Last Name *</label>
                        <input
                          type="text"
                          name="lastName"
                          value={billingForm.lastName}
                          onChange={handleBillingChange}
                          required
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={billingForm.email}
                          onChange={handleBillingChange}
                          required
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={billingForm.phone}
                          onChange={handleBillingChange}
                          required
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition"
                          placeholder="71 234 567"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Address Line 1 *</label>
                      <input
                        type="text"
                        name="address1"
                        value={billingForm.address1}
                        onChange={handleBillingChange}
                        required
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition"
                        placeholder="123 Main Street"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Address Line 2</label>
                      <input
                        type="text"
                        name="address2"
                        value={billingForm.address2}
                        onChange={handleBillingChange}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition"
                        placeholder="Apartment, suite, etc. (optional)"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Country *</label>
                        <select
                          name="country"
                          value={billingForm.country}
                          onChange={handleBillingChange}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition bg-white"
                        >
                          <option>Botswana</option>
                          <option>South Africa</option>
                          <option>Zimbabwe</option>
                          <option>Namibia</option>
                          <option>Zambia</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">City *</label>
                        <input
                          type="text"
                          name="city"
                          value={billingForm.city}
                          onChange={handleBillingChange}
                          required
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition"
                          placeholder="Gaborone"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Postal / Zip Code</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={billingForm.postalCode}
                        onChange={handleBillingChange}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                    >
                      Continue to Payment
                    </button>
                  </motion.div>
                )}

                {/* Step 2: Payment Method */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-bold text-slate-800">Payment Method</h2>

                    {/* Payment Method Tabs */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'card', name: 'Credit Card', icon: <FaCreditCard />, color: 'blue' },
                        { id: 'mobile', name: 'Mobile Money', icon: <FaMobileAlt />, color: 'orange' },
                        { id: 'bank', name: 'Bank Transfer', icon: <FaUniversity />, color: 'green' },
                      ].map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id)}
                          className={`p-4 rounded-xl text-center transition border-2 ${
                            paymentMethod === method.id
                              ? `border-${method.color}-500 bg-${method.color}-50`
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className={`text-2xl ${paymentMethod === method.id ? `text-${method.color}-600` : 'text-slate-400'}`}>
                            {method.icon}
                          </div>
                          <p className={`text-xs font-semibold mt-1 ${paymentMethod === method.id ? `text-${method.color}-600` : 'text-slate-600'}`}>
                            {method.name}
                          </p>
                        </button>
                      ))}
                    </div>

                    {/* Credit Card Form */}
                    {paymentMethod === 'card' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Card Number *</label>
                          <div className="relative">
                            <input
                              type="text"
                              name="number"
                              value={cardDetails.number}
                              onChange={handleCardChange}
                              placeholder="4242 4242 4242 4242"
                              maxLength="19"
                              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition font-mono"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                              <span className="text-xs">VISA</span>
                              <span className="text-xs">MC</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Expiry Date *</label>
                            <input
                              type="text"
                              name="expiry"
                              value={cardDetails.expiry}
                              onChange={handleCardChange}
                              placeholder="MM/YY"
                              maxLength="5"
                              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">CVC *</label>
                            <input
                              type="text"
                              name="cvc"
                              value={cardDetails.cvc}
                              onChange={handleCardChange}
                              placeholder="123"
                              maxLength="4"
                              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Name on Card *</label>
                          <input
                            type="text"
                            name="name"
                            value={cardDetails.name}
                            onChange={handleCardChange}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition"
                          />
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl">
                          <div className="flex items-start gap-3">
                            <FaLock className="text-blue-500 text-sm mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-blue-800">Test Mode</p>
                              <p className="text-xs text-blue-600">Use test card: 4242 4242 4242 4242 | Any expiry | Any CVC</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mobile Money Form */}
                    {paymentMethod === 'mobile' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Select Provider *</label>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { id: 'orange', name: 'Orange Money', color: 'orange' },
                              { id: 'myzaka', name: 'MyZaka', color: 'green' },
                              { id: 'smega', name: 'Smega', color: 'teal' },
                            ].map((provider) => (
                              <button
                                key={provider.id}
                                type="button"
                                onClick={() => setMobileMoney({ ...mobileMoney, provider: provider.id })}
                                className={`p-3 rounded-xl text-center transition border-2 ${
                                  mobileMoney.provider === provider.id
                                    ? `border-${provider.color}-500 bg-${provider.color}-50`
                                    : 'border-slate-200'
                                }`}
                              >
                                <FaPhone className={`text-lg mx-auto ${mobileMoney.provider === provider.id ? `text-${provider.color}-600` : 'text-slate-400'}`} />
                                <p className="text-xs font-semibold mt-1">{provider.name}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Phone Number *</label>
                          <input
                            type="tel"
                            placeholder="71 234 567"
                            value={mobileMoney.phone}
                            onChange={(e) => setMobileMoney({ ...mobileMoney, phone: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition"
                          />
                        </div>

                        <div className="bg-orange-50 p-4 rounded-xl">
                          <p className="text-xs text-orange-800">
                            📱 You will receive a prompt on your phone to complete payment.
                            Enter your PIN to confirm.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Bank Transfer Form */}
                    {paymentMethod === 'bank' && (
                      <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-xl">
                          <p className="font-bold text-slate-800 mb-2">FNB Botswana Details</p>
                          <div className="space-y-1 text-sm">
                            <p><span className="text-slate-500">Bank:</span> FNB Botswana</p>
                            <p><span className="text-slate-500">Account Name:</span> Pula Tourism</p>
                            <p><span className="text-slate-500">Account Number:</span> 62123456789</p>
                            <p><span className="text-slate-500">Branch Code:</span> 280067</p>
                            <p><span className="text-slate-500">Reference:</span> {bookingData?.booking_reference || 'PULA-REF'}</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Upload Proof of Payment</label>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={() => setBankTransfer({ ...bankTransfer, proofUploaded: true })}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        {loading ? 'Processing...' : `Pay P${total.toFixed(2)}`}
                      </button>
                    </div>

                    <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                      <FaLock className="text-[10px]" /> Secure payment powered by Stripe
                    </p>
                  </motion.div>
                )}
              </form>
            </div>
          </div>

          {/* Order Summary - 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>
              
              {/* Destination Preview */}
              <div className="flex gap-3 pb-4 border-b border-slate-100">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                  <FaWallet className="text-2xl text-blue-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">{bookingData?.destination_name || 'Gaborone Game Reserve'}</p>
                  <p className="text-xs text-slate-500">{bookingData?.check_in || 'Apr 15, 2026'} → {bookingData?.check_out || 'Apr 16, 2026'}</p>
                  <p className="text-xs text-slate-500">{bookingData?.guests || 2} guests • {bookingData?.nights || 1} night</p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="py-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium">P{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tax (12% VAT)</span>
                  <span className="font-medium">P{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Service Fee</span>
                  <span className="font-medium">P0.00</span>
                </div>
                <div className="border-t border-slate-100 pt-3 mt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-blue-600">P{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Secure Badge */}
              <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                  <FaLock className="text-green-600" />
                  <span>Secure transaction</span>
                  <FaShieldAlt className="text-blue-600" />
                  <span>Protected by Stripe</span>
                </div>
                <div className="flex justify-center gap-2 mt-3">
                  <span className="text-xs text-slate-400">VISA</span>
                  <span className="text-xs text-slate-400">MasterCard</span>
                  <span className="text-xs text-slate-400">Orange Money</span>
                  <span className="text-xs text-slate-400">MyZaka</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}