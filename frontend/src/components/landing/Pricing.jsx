import { useState, useEffect, useContext } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { PLANS } from '../../data/plans';

function BillingToggle({ isAnnual, onToggle }) {
  return (
    <div className='lp-pricing-toggle reveal'>
      <span className={!isAnnual ? 'active' : ''} onClick={onToggle}>Monthly</span>
      <button
        role='switch'
        aria-checked={isAnnual}
        className={`lp-switch ${isAnnual ? 'annual' : ''}`}
        onClick={onToggle}
      >
        <span className='lp-switch-knob' />
      </button>
      <span className={isAnnual ? 'active' : ''} onClick={onToggle}>Annual</span>
      <span className='lp-save-pill'>Save 20%</span>
    </div>
  );
}

const getPlanFeatures = (plan) => {
    // Phase 3: If it's a static fallback plan, it already has an array of string features
    if (plan.features && Array.isArray(plan.features)) {
        return plan.features;
    }

    const features = [];
    if (plan.feature_students) features.push(`Up to ${plan.max_students === -1 ? 'Unlimited' : plan.max_students} students`);
    if (plan.max_admins || plan.max_faculty) {
        const admins = plan.max_admins === -1 ? 'Unlimited Admins' : `${plan.max_admins} Admins`;
        const faculty = plan.max_faculty === -1 ? 'Unlimited Faculty' : `${plan.max_faculty} Faculty`;
        features.push(`${admins} & ${faculty}`);
    } else {
        if (plan.feature_faculty) features.push("Faculty management");
    }
    if (plan.feature_attendance) features.push("Attendance tracking");
    if (plan.feature_fees) features.push("Fee management");
    if (plan.feature_exams) features.push("Examination management");
    if (plan.feature_timetable) features.push("Master timetable generation");
    if (plan.feature_reports) features.push("Reports & analytics");
    if (plan.feature_sms) features.push("SMS notifications");
    if (plan.feature_email) features.push("Email notifications");
    if (plan.feature_parent_portal) features.push("Parent portal");
    if (plan.feature_mobile_app) features.push("Mobile app access");
    if (plan.feature_api_access) features.push("API access");

    return features;
};

/**
 * Phase 3: Smart plan button logic
 * - Plan index 0 (first/cheapest plan): shows "Start Free Trial" if the user has NOT used it yet
 *   → once used (tracked in localStorage), shows "Upgrade to Basic Plan" (i.e., the *next* plan)
 * - All other plans: show "Upgrade to <Plan Name>"
 */
function PlanCard({ plan, isHot, isAnnual, planIndex, totalPlans, allPlans }) {
  try {
    // DB might return DECIMAL as string, so parse it
    const basePrice = parseFloat(plan.price || plan.monthlyPrice || 0);
    const price = isAnnual ? Math.floor(basePrice * 12 * 0.8) : basePrice;
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const hasUsedFreeTrial = localStorage.getItem('free_trial_used') === 'true';

    const getButtonConfig = () => {
      if (planIndex === 0) {
        if (!hasUsedFreeTrial) {
          return {
            label: '🎁 Start Free Trial',
            action: () => {
              localStorage.setItem('free_trial_used', 'true');
              if (user && user.role === 'admin') navigate(`/checkout?plan_id=${plan.id}&trial=true`);
              else { localStorage.setItem("selectedPlan", plan.id); navigate('/register?plan=' + plan.id + '&trial=true'); }
            },
            className: isHot ? 'lp-btn-primary' : 'lp-btn-ghost',
          };
        } else {
          const nextPlan = allPlans.length > 1 ? allPlans[1] : allPlans[0];
          return {
            label: `⬆️ Upgrade to ${nextPlan?.name || 'Basic Plan'}`,
            action: () => {
              if (user && user.role === 'admin') navigate(`/checkout?plan_id=${nextPlan.id}`);
              else { localStorage.setItem("selectedPlan", nextPlan.id); navigate('/register?plan=' + nextPlan.id); }
            },
            className: 'lp-btn-ghost',
          };
        }
      }
      return {
        label: `⬆️ Upgrade to ${plan.name || 'Plan'}`,
        action: () => {
          if (user && user.role === 'admin') navigate(`/checkout?plan_id=${plan.id}`);
          else { localStorage.setItem("selectedPlan", plan.id); navigate('/register?plan=' + plan.id); }
        },
        className: isHot ? 'lp-btn-primary' : 'lp-btn-ghost',
      };
    };

    const btn = getButtonConfig();
    const features = getPlanFeatures(plan) || [];
    const showZeroPrice = (planIndex === 0 && !hasUsedFreeTrial);

    return (
      <div className={`lp-plan-card ${isHot ? 'hot' : ''}`}>
        {isHot && <div className='lp-plan-hot-pill'>Most Popular</div>}

        <div className='lp-plan-icon'>{plan.icon || '📦'}</div>
        <h3 className='lp-plan-name'>{plan.name || 'Plan'}</h3>
        
        {showZeroPrice ? (
          <div className='lp-plan-price'>
            <span style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '1.2rem', marginRight: '8px' }}>
              ₹{(price || 0).toLocaleString()}
            </span>
            ₹0<span>/mo</span>
          </div>
        ) : (
          <div className='lp-plan-price'>₹{(price || 0).toLocaleString()}<span>/{isAnnual ? "year" : "mo"}</span></div>
        )}

        <p style={{ fontSize: '13px', color: 'var(--lp-muted)', marginTop: '-4px' }}>
          {showZeroPrice ? '14-day free trial, no credit card required' : (isAnnual ? `Billed ₹${((basePrice || 0) * 12).toLocaleString()} annually` : 'Billed monthly')}
        </p>

        <div className='lp-plan-divider' />

        <ul className='lp-plan-feats'>
          {features.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>

        <button
          onClick={btn.action}
          className={btn.className}
          style={{
            width: '100%',
            marginTop: 'auto',
            border: !isHot ? '1px solid var(--lp-border)' : 'none',
            cursor: 'pointer',
            font: 'inherit',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          {btn.label || 'Select'}
        </button>
      </div>
    );
  } catch (err) {
    return <div className="lp-plan-card" style={{ border: '2px solid red' }}><h3>Error Loading Card</h3><p>{err.toString()}</p></div>;
  }
}

export default function Pricing() {
  useScrollReveal('reveal', 0.1);
  const [isAnnual, setIsAnnual] = useState(true);
  const [trialUsed, setTrialUsed] = useState(localStorage.getItem('free_trial_used') === 'true');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onStorage = () => setTrialUsed(localStorage.getItem('free_trial_used') === 'true');
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
        const response = await api.get("/plans");
        const activePlans = response.data.data.filter(plan => plan.status === "active");
        
        if (activePlans.length > 0) {
            setPlans(activePlans);
        } else {
            // Fallback to static PLANS from data/plans.js if DB is empty
            setPlans(PLANS.map(p => ({
                ...p,
                price: p.monthlyPrice, // map to expected property
                is_popular: p.isHot
            })));
        }
    } catch (error) {
        console.error("Error fetching plans, falling back to static:", error);
        // Fallback to static PLANS on error
        setPlans(PLANS.map(p => ({
            ...p,
            price: p.monthlyPrice,
            is_popular: p.isHot
        })));
    } finally {
        setLoading(false);
    }
  };

  return (
    <section className='lp-section' id='pricing' style={{ background: '#F8FAFC' }}>
      <div className='lp-section-header reveal'>
        <span className='lp-eyebrow'>Transparent Pricing</span>
        <h2 className='lp-h2'>Choose the Perfect Plan for Your Institute</h2>
        <p className='lp-subtitle'>
          No hidden fees. Cancel anytime. Start with our 14-day free trial on the Starter plan — no credit card required.
        </p>
      </div>

      <BillingToggle isAnnual={isAnnual} onToggle={() => setIsAnnual(!isAnnual)} />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading plans...</div>
      ) : plans.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>No plans available at the moment.</div>
      ) : (
        <div className='lp-pricing-grid'>
          {plans && plans.length > 0 ? plans.map((plan, i) => (
            <PlanCard
              key={plan?.id || i}
              plan={plan}
              isHot={plan?.is_popular}
              isAnnual={isAnnual}
              planIndex={i}
              totalPlans={plans.length}
              allPlans={plans}
            />
          )) : <div style={{width:'100%', textAlign:'center'}}>Grid is empty due to plans array error</div>}
        </div>
      )}
    </section>
  );
}
