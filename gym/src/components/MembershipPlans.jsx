import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, Star, Crown, Zap, X, CreditCard, Calendar, User, Mail, Phone, Shield } from 'lucide-react';
import '../styles/membership-plans.css';
import { membershipService } from '../services/api';
import AuthContext from '../contexts/AuthContext';
import { openAuthModal } from "../utils/authEvent";

const MembershipPlans = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { user } = useContext(AuthContext);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const modalRef = useRef(null);
  const [userSubscription, setUserSubscription] = useState(null);

  // Prevent duplicate fetch (StrictMode)
  const didFetchPlansRef = useRef(false);
  const didFetchSubRef = useRef(false);

  // Static fallback plans data
  const FALLBACK_PLANS = [
    {
      _id: 'basic-plan',
      name: 'Basic',
      price: 2000,
      period: 'month',
      features: [
        'Access to gym equipment',
        'Locker room access',
        'Basic fitness assessment',
        'Mobile app access',
        '24/7 gym access'
      ],
      popular: false,
      iconClass: 'plan-icon-blue'
    },
    {
      _id: 'premium-plan',
      name: 'Premium',
      price: 5000,
      period: 'month',
      features: [
        'Everything in Basic',
        'Personal trainer (2 sessions/month)',
        'Group fitness classes',
        'Nutrition consultation',
        'Guest passes (2/month)',
        'Sauna & steam room access'
      ],
      popular: true,
      iconClass: 'plan-icon-primary'
    },
    {
      _id: 'elite-plan',
      name: 'Elite',
      price: 8000,
      period: 'month',
      features: [
        'Everything in Premium',
        'Unlimited personal training',
        'Custom meal plans',
        'Priority class booking',
        'Massage therapy (1/month)',
        'VIP lounge access',
        'Unlimited guest passes'
      ],
      popular: false,
      iconClass: 'plan-icon-purple'
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    startDate: '',
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    paymentMethod: 'credit',
    agreeTerms: false,
    fitnessGoals: [],
    healthConditions: [],
    emergencyContact: '',
    emergencyPhone: ''
  });

  // Fitness goals options
  const fitnessGoals = [
    'Weight Loss',
    'Muscle Gain',
    'Improved Fitness',
    'Strength Training',
    'Flexibility',
    'Endurance'
  ];

  // Health conditions options
  const healthConditions = [
    'None',
    'Heart Condition',
    'Asthma',
    'Diabetes',
    'Joint Issues',
    'High Blood Pressure',
    'Other'
  ];

  // Fetch user's subscription
  useEffect(() => {
    if (didFetchSubRef.current) return;
    didFetchSubRef.current = true;

    const fetchUserSubscription = async () => {
      if (!user) return;

      try {
        const response = await membershipService.getUserSubscription();

        if (response?.data?.subscription) {
          setUserSubscription(response.data.subscription);
          localStorage.setItem('userSubscription', JSON.stringify(response.data.subscription));
        } else {
          const localSubscription = localStorage.getItem('userSubscription');
          if (localSubscription) setUserSubscription(JSON.parse(localSubscription));
        }
      } catch (err) {
        const localSubscription = localStorage.getItem('userSubscription');
        if (localSubscription) setUserSubscription(JSON.parse(localSubscription));
      }
    };

    fetchUserSubscription();
  }, [user]);

  // Fetch plans data
  useEffect(() => {
    if (didFetchPlansRef.current) return;
    didFetchPlansRef.current = true;

    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await membershipService.getAllPlans();

        if (response?.data?.length > 0) {
          setPlans(response.data);
        } else {
          setPlans(FALLBACK_PLANS);
        }
      } catch (err) {
        setError('Failed to load membership plans');
        setPlans(FALLBACK_PLANS);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Handle clicking outside the modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        if (!submitting) {
          handleCloseModal();
        }
      }
    };

    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal, submitting]);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user && showModal) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        startDate: new Date().toISOString().split('T')[0]
      }));
    }
  }, [user, showModal]);

  // Open modal with selected plan
  const handleChoosePlan = (plan) => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (isSubscribedToPlan(plan._id)) {
      alert(`You are already subscribed to the ${plan.name} plan.`);
      return;
    }

    setSelectedPlan(plan);
    setShowModal(true);
    setCurrentStep(1);
    setSubmitSuccess(false);
    document.body.style.overflow = 'hidden';
  };

  // Close modal
  const handleCloseModal = () => {
    if (submitting) return;

    setShowModal(false);
    document.body.style.overflow = 'auto';

    setTimeout(() => {
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        startDate: '',
        cardName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        paymentMethod: 'credit',
        agreeTerms: false,
        fitnessGoals: [],
        healthConditions: [],
        emergencyContact: '',
        emergencyPhone: ''
      });
      setCurrentStep(1);
      setSubmitSuccess(false);
    }, 300);
  };

  // Input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox' && name === 'fitnessGoals') {
      setFormData((prev) => {
        const updatedGoals = checked
          ? [...prev.fitnessGoals, value]
          : prev.fitnessGoals.filter((goal) => goal !== value);

        return { ...prev, fitnessGoals: updatedGoals };
      });
    } else if (type === 'checkbox' && name === 'healthConditions') {
      setFormData((prev) => {
        const updatedConditions = checked
          ? [...prev.healthConditions, value]
          : prev.healthConditions.filter((condition) => condition !== value);

        return { ...prev, healthConditions: updatedConditions };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Navigation
  const handleNextStep = () => setCurrentStep((prev) => prev + 1);
  const handlePrevStep = () => setCurrentStep((prev) => prev - 1);

  // Validate step
  const validateStep = () => {
    if (currentStep === 1) {
      return formData.fullName && formData.email && formData.phone;
    } else if (currentStep === 2) {
      return formData.address && formData.city && formData.state && formData.zipCode && formData.startDate;
    } else if (currentStep === 3) {
      return formData.fitnessGoals.length > 0;
    } else if (currentStep === 4) {
      return formData.cardName && formData.cardNumber && formData.expiryDate && formData.cvv && formData.agreeTerms;
    }
    return true;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('Please log in to subscribe to a membership plan');
      handleCloseModal();
      openAuthModal('login');
      return;
    }

    try {
      setSubmitting(true);

      const subscriptionData = {
        planId: selectedPlan._id,
        userId: user._id || user.id,
        paymentMethod: formData.paymentMethod,
        startDate: formData.startDate,
        personalInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        fitnessProfile: {
          goals: formData.fitnessGoals,
          healthConditions: formData.healthConditions,
          emergencyContact: {
            name: formData.emergencyContact,
            phone: formData.emergencyPhone
          }
        },
        paymentInfo: {
          cardName: formData.cardName,
          cardNumberLast4: formData.cardNumber.slice(-4),
          expiryDate: formData.expiryDate
        }
      };

      try {
        // Save to DB (or offline fallback inside service)
        const response = await membershipService.subscribe(subscriptionData);

        const newSubscription = response?.data?.subscription || {
          _id: `subscription-${Date.now()}`,
          plan: selectedPlan,
          user: user._id || user.id,
          startDate: formData.startDate,
          endDate: calculateEndDate(formData.startDate, selectedPlan.period),
          status: 'active',
          createdAt: new Date().toISOString()
        };

        setUserSubscription(newSubscription);
        localStorage.setItem('userSubscription', JSON.stringify(newSubscription));

        if (user && typeof user === 'object') {
          const updatedUser = {
            ...user,
            subscription: {
              planId: selectedPlan._id,
              planName: selectedPlan.name,
              startDate: formData.startDate,
              endDate: calculateEndDate(formData.startDate, selectedPlan.period),
              status: 'active'
            }
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        document.dispatchEvent(new CustomEvent('subscriptionUpdated', { detail: { subscription: newSubscription } }));
        document.dispatchEvent(new CustomEvent('userProfileUpdated', {
          detail: {
            user: {
              ...user,
              subscription: {
                planId: selectedPlan._id,
                planName: selectedPlan.name,
                startDate: formData.startDate,
                endDate: calculateEndDate(formData.startDate, selectedPlan.period),
                status: 'active'
              }
            }
          }
        }));

        setSubmitSuccess(true);
        setCurrentStep(5);

        setTimeout(() => {
          handleCloseModal();
        }, 5000);
      } catch (apiError) {
        console.error('API Error:', apiError);

        const fallbackSubscription = {
          _id: `subscription-${Date.now()}`,
          plan: selectedPlan,
          user: user._id || user.id,
          startDate: formData.startDate,
          endDate: calculateEndDate(formData.startDate, selectedPlan.period),
          status: 'active',
          createdAt: new Date().toISOString(),
          isOffline: true
        };

        setUserSubscription(fallbackSubscription);
        localStorage.setItem('userSubscription', JSON.stringify(fallbackSubscription));

        if (user && typeof user === 'object') {
          const updatedUser = {
            ...user,
            subscription: {
              planId: selectedPlan._id,
              planName: selectedPlan.name,
              startDate: formData.startDate,
              endDate: calculateEndDate(formData.startDate, selectedPlan.period),
              status: 'active'
            }
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        document.dispatchEvent(new CustomEvent('subscriptionUpdated', { detail: { subscription: fallbackSubscription } }));

        setSubmitSuccess(true);
        setCurrentStep(5);

        setTimeout(() => {
          handleCloseModal();
        }, 5000);
      }
    } catch (err) {
      console.error('Subscription error:', err);

      const fallbackSubscription = {
        _id: `subscription-${Date.now()}`,
        plan: selectedPlan,
        user: user._id || user.id,
        startDate: formData.startDate,
        endDate: calculateEndDate(formData.startDate, selectedPlan.period),
        status: 'active',
        createdAt: new Date().toISOString(),
        isOffline: true
      };

      setUserSubscription(fallbackSubscription);
      localStorage.setItem('userSubscription', JSON.stringify(fallbackSubscription));

      setSubmitSuccess(true);
      setCurrentStep(5);

      setTimeout(() => {
        handleCloseModal();
      }, 5000);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper: end date
  const calculateEndDate = (startDateStr, period) => {
    const startDate = new Date(startDateStr);
    const endDate = new Date(startDate);

    if (period === 'month') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (period === 'year') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else if (period === 'week') {
      endDate.setDate(endDate.getDate() + 7);
    }

    return endDate.toISOString().split('T')[0];
  };

  // Icons
  const getPlanIcon = (planName) => {
    switch (planName.toLowerCase()) {
      case 'basic':
        return <User className="plan-icon" />;
      case 'premium':
        return <Star className="plan-icon" />;
      case 'elite':
        return <Crown className="plan-icon" />;
      default:
        return <Zap className="plan-icon" />;
    }
  };

  // Robust current plan detection
  const isSubscribedToPlan = (planId) => {
    if (!userSubscription) return false;

    return !!(
      userSubscription?.plan?._id === planId ||
      userSubscription?.planId === planId ||
      (typeof userSubscription?.plan === 'string' && userSubscription.plan === planId)
    );
  };

  // Current plan details for banner
  const currentPlan = useMemo(() => {
    if (!userSubscription) return null;

    if (userSubscription.plan && typeof userSubscription.plan === 'object') {
      return userSubscription.plan;
    }

    const id = userSubscription.planId || userSubscription.plan;
    if (id) {
      return plans.find((p) => p._id === id) || null;
    }

    return null;
  }, [userSubscription, plans]);

  const currentPlanName = currentPlan?.name || userSubscription?.planName || '—';

  // Step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h3>Personal Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="fullName">
                  <User className="form-icon" />
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">
                  <Mail className="form-icon" />
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">
                  <Phone className="form-icon" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h3>Address & Start Date</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="address">Address *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your address"
                />
              </div>
              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your city"
                />
              </div>
              <div className="form-group">
                <label htmlFor="state">State *</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your state"
                />
              </div>
              <div className="form-group">
                <label htmlFor="zipCode">ZIP Code *</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter ZIP code"
                />
              </div>
              <div className="form-group">
                <label htmlFor="startDate">
                  <Calendar className="form-icon" />
                  Membership Start Date *
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h3>Fitness Profile</h3>
            <div className="form-section">
              <h4>Fitness Goals (Select all that apply) *</h4>
              <div className="checkbox-grid">
                {fitnessGoals.map((goal) => (
                  <label key={goal} className="checkbox-label">
                    <input
                      type="checkbox"
                      name="fitnessGoals"
                      value={goal}
                      checked={formData.fitnessGoals.includes(goal)}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    {goal}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h4>Health Conditions (Select all that apply)</h4>
              <div className="checkbox-grid">
                {healthConditions.map((condition) => (
                  <label key={condition} className="checkbox-label">
                    <input
                      type="checkbox"
                      name="healthConditions"
                      value={condition}
                      checked={formData.healthConditions.includes(condition)}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    {condition}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="emergencyContact">Emergency Contact Name</label>
                <input
                  type="text"
                  id="emergencyContact"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  placeholder="Emergency contact name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="emergencyPhone">Emergency Contact Phone</label>
                <input
                  type="tel"
                  id="emergencyPhone"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleInputChange}
                  placeholder="Emergency contact phone"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h3>Payment Information</h3>
            <div className="payment-methods">
              <label className="payment-method">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="credit"
                  checked={formData.paymentMethod === 'credit'}
                  onChange={handleInputChange}
                />
                <span className="payment-method-label">
                  <CreditCard className="payment-icon" />
                  Credit/Debit Card
                </span>
              </label>
            </div>

            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="cardName">Cardholder Name *</label>
                <input
                  type="text"
                  id="cardName"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleInputChange}
                  required
                  placeholder="Name on card"
                />
              </div>
              <div className="form-group full-width">
                <label htmlFor="cardNumber">Card Number *</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                />
              </div>
              <div className="form-group">
                <label htmlFor="expiryDate">Expiry Date *</label>
                <input
                  type="text"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  required
                  placeholder="MM/YY"
                  maxLength="5"
                />
              </div>
              <div className="form-group">
                <label htmlFor="cvv">CVV *</label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  required
                  placeholder="123"
                  maxLength="4"
                />
              </div>
            </div>

            <div className="terms-section">
              <label className="checkbox-label terms-label">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  required
                />
                <span className="checkmark"></span>
                <span className="terms-text">
                  I agree to the <a href="#" onClick={(e) => e.preventDefault()}>Terms and Conditions</a> and <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                </span>
              </label>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-content success-content">
            <div className="success-icon">
              <Check className="check-icon" />
            </div>
            <h3>Subscription Successful!</h3>
            <p>Welcome to {selectedPlan?.name} membership!</p>
            <div className="success-details">
              <p><strong>Plan:</strong> {selectedPlan?.name}</p>
              <p><strong>Price:</strong> ₹{selectedPlan?.price}/{selectedPlan?.period}</p>
              <p><strong>Start Date:</strong> {new Date(formData.startDate).toLocaleDateString()}</p>
              <p><strong>End Date:</strong> {new Date(calculateEndDate(formData.startDate, selectedPlan.period)).toLocaleDateString()}</p>
            </div>
            <p className="success-message">
              You will receive a confirmation email shortly. This modal will close automatically in a few seconds.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <section className="membership-plans">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading membership plans...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error && plans.length === 0) {
    return (
      <section className="membership-plans">
        <div className="container">
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="membership-plans" ref={ref}>
      <div className="container">
        {/* Centered Header */}
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-top-title">
            Choose Your <span className="section-top-title-highlight">Membership Plan</span>
          </h2>
          <p className="section-subtitle">
            Select the perfect plan that fits your fitness goals and lifestyle
          </p>
        </motion.div>

        {/* Current Subscription Banner (if user has one) */}
        {userSubscription && (
          <motion.div 
            className="current-subscription-banner"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="subscription-info">
              <h3>Your Current Plan: <span className="highlight">{currentPlanName}</span></h3>
              <div className="subscription-details">
                <p><strong>Status:</strong> <span className="status-active">Active</span></p>
                <p><strong>Start Date:</strong> {userSubscription.startDate ? new Date(userSubscription.startDate).toLocaleDateString() : '—'}</p>
                <p><strong>End Date:</strong> {userSubscription.endDate ? new Date(userSubscription.endDate).toLocaleDateString() : '—'}</p>
              </div>
            </div>
            <div className="subscription-actions">
              <button className="upgrade-button">Manage Subscription</button>
            </div>
          </motion.div>
        )}

        {/* Plans Grid */}
        <motion.div
          className="plans-grid"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan._id || index}
              className={`plan-card ${plan.popular ? 'popular' : ''} ${isSubscribedToPlan(plan._id) ? 'current-plan' : ''}`}
              variants={cardVariants}
              whileHover={{ 
                y: -10,
                transition: { duration: 0.3 }
              }}
            >
              {plan.popular && (
                <div className="popular-badge">
                  <Star className="badge-icon" />
                  Most Popular
                </div>
              )}
              
              {isSubscribedToPlan(plan._id) && (
                <div className="current-plan-badge">
                  <Check className="badge-icon" />
                  Current Plan
                </div>
              )}

              <div className="plan-header">
                <div className={`plan-icon-wrapper ${plan.iconClass || 'plan-icon-blue'}`}>
                  {getPlanIcon(plan.name)}
                </div>
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  <span className="currency">₹</span>
                  <span className="amount">{plan.price?.toLocaleString() || '0'}</span>
                  <span className="period">/{plan.period || 'month'}</span>
                </div>
              </div>

              <div className="plan-features">
                <ul>
                  {(plan.features || []).map((feature, featureIndex) => (
                    <li key={featureIndex}>
                      <Check className="feature-check" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <motion.button
                className="plan-button"
                onClick={() => handleChoosePlan(plan)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isSubscribedToPlan(plan._id)}
              >
                {isSubscribedToPlan(plan._id) ? 'Current Plan' : `Choose ${plan.name}`}
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Info */}
        <motion.div 
          className="plans-footer"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="footer-features">
            <div className="footer-feature">
              <Shield className="footer-icon" />
              <span>30-day money back guarantee</span>
            </div>
            <div className="footer-feature">
              <Calendar className="footer-icon" />
              <span>Cancel anytime</span>
            </div>
            <div className="footer-feature">
              <User className="footer-icon" />
              <span>Expert support</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Subscription Modal */}
      <AnimatePresence>
        {showModal && selectedPlan && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="subscription-modal"
              ref={modalRef}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="modal-header">
                <h2>Subscribe to {selectedPlan.name}</h2>
                <button
                  className="close-button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  <X />
                </button>
              </div>

              <div className="modal-content">
                {/* Progress Steps */}
                {currentStep < 5 && (
                  <div className="progress-steps">
                    {[1, 2, 3, 4].map(step => (
                      <div
                        key={step}
                        className={`progress-step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
                      >
                        <div className="step-number">
                          {currentStep > step ? <Check /> : step}
                        </div>
                        <div className="step-label">
                          {step === 1 && 'Personal Info'}
                          {step === 2 && 'Address & Date'}
                          {step === 3 && 'Fitness Profile'}
                          {step === 4 && 'Payment'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Plan Summary */}
                {currentStep < 5 && (
                  <div className="plan-summary">
                    <h4>Selected Plan: {selectedPlan.name}</h4>
                    <p>₹{selectedPlan.price?.toLocaleString()}/{selectedPlan.period}</p>
                  </div>
                )}

                {/* Form Content */}
                <form onSubmit={handleSubmit}>
                  {renderStepContent()}

                  {/* Navigation Buttons */}
                  {currentStep < 5 && (
                    <div className="modal-actions">
                      {currentStep > 1 && (
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={handlePrevStep}
                          disabled={submitting}
                        >
                          Previous
                        </button>
                      )}

                      {currentStep < 4 ? (
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={handleNextStep}
                          disabled={!validateStep()}
                        >
                          Next
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="btn-primary"
                          disabled={!validateStep() || submitting}
                        >
                          {submitting ? (
                            <>
                              <div className="spinner-small"></div>
                              Processing...
                            </>
                          ) : (
                            'Complete Subscription'
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default MembershipPlans;
