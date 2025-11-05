import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Target, TrendingUp, Flame } from 'lucide-react';
import { BasicInfo } from '@/components/onboarding/BasicInfo';
import { ActivityGoals } from '@/components/onboarding/ActivityGoals';
import { YourPlan } from '@/components/onboarding/YourPlan';
import { Gender, ActivityLevel, GoalType } from '@/types';

export interface OnboardingData {
  age: number;
  gender: Gender;
  height: number;
  currentWeight: number;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  goalWeight: number;
  rate: number;
}

export const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<OnboardingData>>({});

  const steps = [
    { number: 1, title: 'Basic Info', icon: User },
    { number: 2, title: 'Activity & Goals', icon: Target },
    { number: 3, title: 'Your Plan', icon: TrendingUp },
  ];

  const updateData = (newData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame className="w-10 h-10 text-red-600" />
            <div className="flex flex-col items-start">
              <span className="text-3xl font-bold text-red-600 leading-tight">Firehouse Fit</span>
              <span className="text-sm text-gray-600 leading-tight">AI Calorie & Meal Tracker</span>
            </div>
          </div>
          <p className="text-gray-600">Let's personalize your nutrition journey</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isActive = step === s.number;
              const isCompleted = step > s.number;

              return (
                <div key={s.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? 'bg-red-600 text-white shadow-lg scale-110'
                          : isCompleted
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        isActive ? 'text-red-600' : 'text-gray-500'
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="flex-1 h-1 mx-4 -mt-6">
                      <div
                        className={`h-full rounded transition-all duration-300 ${
                          isCompleted ? 'bg-red-600' : 'bg-gray-200'
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 && <BasicInfo data={data} updateData={updateData} onNext={nextStep} />}
          {step === 2 && (
            <ActivityGoals data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />
          )}
          {step === 3 && (
            <YourPlan data={data as OnboardingData} onComplete={handleComplete} onBack={prevStep} />
          )}
        </div>
      </div>
    </div>
  );
};
