import { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { OnboardingData } from '@/pages/Onboarding';
import { convertCmToFeet, convertFeetToCm, convertKgToLbs, convertLbsToKg } from '@/utils/calculations';

interface BasicInfoProps {
  data: Partial<OnboardingData>;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export const BasicInfo = ({ data, updateData, onNext }: BasicInfoProps) => {
  const [age, setAge] = useState(data.age?.toString() || '');
  const [gender, setGender] = useState<string>(data.gender || 'male');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('ft');
  const [heightCm, setHeightCm] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('lbs');
  const [weightKg, setWeightKg] = useState('');
  const [weightLbs, setWeightLbs] = useState('');

  useEffect(() => {
    if (data.height) {
      const { feet, inches } = convertCmToFeet(data.height);
      setHeightFeet(feet.toString());
      setHeightInches(inches.toString());
      setHeightCm(data.height.toString());
    }
  }, []);

  useEffect(() => {
    if (data.currentWeight) {
      setWeightLbs(convertKgToLbs(data.currentWeight).toString());
      setWeightKg(data.currentWeight.toString());
    }
  }, []);

  const toggleHeightUnit = () => {
    if (heightUnit === 'cm') {
      if (heightCm) {
        const { feet, inches } = convertCmToFeet(Number(heightCm));
        setHeightFeet(feet.toString());
        setHeightInches(inches.toString());
      }
      setHeightUnit('ft');
    } else {
      if (heightFeet) {
        const cm = convertFeetToCm(Number(heightFeet), Number(heightInches || 0));
        setHeightCm(cm.toString());
      }
      setHeightUnit('cm');
    }
  };

  const toggleWeightUnit = () => {
    if (weightUnit === 'kg') {
      if (weightKg) {
        const lbs = convertKgToLbs(Number(weightKg));
        setWeightLbs(lbs.toString());
      }
      setWeightUnit('lbs');
    } else {
      if (weightLbs) {
        const kg = convertLbsToKg(Number(weightLbs));
        setWeightKg(kg.toString());
      }
      setWeightUnit('kg');
    }
  };

  const handleNext = () => {
    const height = heightUnit === 'cm' ? Number(heightCm) : convertFeetToCm(Number(heightFeet), Number(heightInches || 0));
    const weight = weightUnit === 'kg' ? Number(weightKg) : convertLbsToKg(Number(weightLbs));

    updateData({
      age: Number(age),
      gender: gender as 'male' | 'female',
      height,
      currentWeight: weight,
    });
    onNext();
  };

  const isValid = () => {
    const ageValid = age && Number(age) >= 18 && Number(age) <= 100;
    const genderValid = !!gender;

    const hasValidHeight = heightUnit === 'cm'
      ? heightCm && Number(heightCm) > 0
      : heightFeet && Number(heightFeet) > 0;

    const hasValidWeight = weightUnit === 'kg'
      ? weightKg && Number(weightKg) > 0
      : weightLbs && Number(weightLbs) > 0;

    console.log('Validation check:', {
      age,
      ageValid,
      gender,
      genderValid,
      heightUnit,
      heightCm,
      heightFeet,
      heightInches,
      hasValidHeight,
      weightUnit,
      weightKg,
      weightLbs,
      hasValidWeight,
      overall: ageValid && genderValid && hasValidHeight && hasValidWeight
    });

    return ageValid && genderValid && hasValidHeight && hasValidWeight;
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="age" className="text-base font-semibold text-gray-700">
          Age
        </Label>
        <Input
          id="age"
          type="number"
          min="18"
          max="100"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="mt-2"
          placeholder="Enter your age"
        />
      </div>

      <div>
        <Label className="text-base font-semibold text-gray-700">Gender</Label>
        <RadioGroup value={gender} onValueChange={setGender} className="flex gap-4 mt-2">
          <div className="flex items-center space-x-2 flex-1">
            <RadioGroupItem value="male" id="male" />
            <Label htmlFor="male" className="cursor-pointer flex-1 py-3 px-4 border rounded-lg hover:border-red-600 transition-colors">
              Male
            </Label>
          </div>
          <div className="flex items-center space-x-2 flex-1">
            <RadioGroupItem value="female" id="female" />
            <Label htmlFor="female" className="cursor-pointer flex-1 py-3 px-4 border rounded-lg hover:border-red-600 transition-colors">
              Female
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-base font-semibold text-gray-700">Height</Label>
          <Button variant="ghost" size="sm" onClick={toggleHeightUnit} className="text-red-600">
            <ArrowLeftRight className="w-4 h-4 mr-1" />
            {heightUnit === 'cm' ? 'Switch to ft' : 'Switch to cm'}
          </Button>
        </div>
        {heightUnit === 'cm' ? (
          <div className="flex gap-2">
            <Input
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="170"
            />
            <span className="flex items-center px-3 bg-gray-100 rounded-md text-gray-600">cm</span>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              type="number"
              value={heightFeet}
              onChange={(e) => setHeightFeet(e.target.value)}
              placeholder="5"
            />
            <span className="flex items-center px-3 bg-gray-100 rounded-md text-gray-600">ft</span>
            <Input
              type="number"
              value={heightInches}
              onChange={(e) => setHeightInches(e.target.value)}
              placeholder="7"
            />
            <span className="flex items-center px-3 bg-gray-100 rounded-md text-gray-600">in</span>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-base font-semibold text-gray-700">Current Weight</Label>
          <Button variant="ghost" size="sm" onClick={toggleWeightUnit} className="text-red-600">
            <ArrowLeftRight className="w-4 h-4 mr-1" />
            {weightUnit === 'kg' ? 'Switch to lbs' : 'Switch to kg'}
          </Button>
        </div>
        <div className="flex gap-2">
          {weightUnit === 'kg' ? (
            <>
              <Input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="70"
              />
              <span className="flex items-center px-3 bg-gray-100 rounded-md text-gray-600">kg</span>
            </>
          ) : (
            <>
              <Input
                type="number"
                value={weightLbs}
                onChange={(e) => setWeightLbs(e.target.value)}
                placeholder="154"
              />
              <span className="flex items-center px-3 bg-gray-100 rounded-md text-gray-600">lbs</span>
            </>
          )}
        </div>
      </div>

      <Button
        onClick={handleNext}
        disabled={!isValid()}
        className={`w-full transition-all ${
          isValid()
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-red-300 text-white cursor-not-allowed'
        }`}
      >
        Next
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};
