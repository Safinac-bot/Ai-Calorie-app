import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Flame, Camera, Sparkles, TrendingUp, Zap, Target, Clock, WifiOff,
  Award, DollarSign, ShieldCheck, Dumbbell, TrendingDown, Briefcase,
  Check, Menu, X, Twitter, Instagram, Facebook, Linkedin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export const Landing = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (profileData) {
          navigate('/dashboard');
        }
      }
    };

    checkUser();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-8 h-8 text-red-600" />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-red-600 leading-tight">Firehouse Fit</span>
                <span className="text-xs text-gray-600 leading-tight">AI Calorie & Meal Tracker</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-red-600 font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-red-600 font-medium transition-colors">How It Works</a>
              <a href="#about" className="text-gray-700 hover:text-red-600 font-medium transition-colors">About</a>
              <a href="#pricing" className="text-gray-700 hover:text-red-600 font-medium transition-colors">Pricing</a>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/auth')}
                className="bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
              >
                Get Started
              </Button>
              <button
                className="md:hidden text-gray-700"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3">
              <a href="#features" className="block text-gray-700 hover:text-red-600 font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="block text-gray-700 hover:text-red-600 font-medium transition-colors">How It Works</a>
              <a href="#about" className="block text-gray-700 hover:text-red-600 font-medium transition-colors">About</a>
              <a href="#pricing" className="block text-gray-700 hover:text-red-600 font-medium transition-colors">Pricing</a>
            </div>
          )}
        </div>
      </nav>

      <section className="min-h-screen flex items-center py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-block bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-full">
                Built by Firefighters, Made for Everyone
              </span>

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Track Your Nutrition Like a Pro
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Snap a photo of any meal and get instant calorie and macro breakdown. AI-powered precision. No manual entry, no guessing, no hassle.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate('/auth')}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg hover:scale-105 transition-all shadow-lg"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Start Free Trial
                </Button>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-600" /> AI-powered accuracy
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-600" /> Instant photo analysis
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-600" /> Free forever plan
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Three Steps to Better Nutrition
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Snap a Photo</h3>
              <p className="text-gray-600">Take a picture of your meal in seconds</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">AI Analyzes</h3>
              <p className="text-gray-600">Our AI identifies food and calculates nutrition instantly</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Track Progress</h3>
              <p className="text-gray-600">Monitor your daily macros and reach your goals</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built for Real Life, Real Meals
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're on a 24-hour shift, training for a marathon, or just eating healthier - track nutrition without the hassle
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <Zap className="w-10 h-10 text-red-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Instant Photo Recognition</h3>
              <p className="text-gray-600">No typing, no searching databases - just snap and go</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <Target className="w-10 h-10 text-red-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Accurate Macro Tracking</h3>
              <p className="text-gray-600">Precise calorie and macronutrient calculations</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <Clock className="w-10 h-10 text-red-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Works on Any Schedule</h3>
              <p className="text-gray-600">Perfect for shift workers and busy lifestyles</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <WifiOff className="w-10 h-10 text-red-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Offline Capable</h3>
              <p className="text-gray-600">Track meals even without internet connection</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <Award className="w-10 h-10 text-red-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Custom Nutrition Goals</h3>
              <p className="text-gray-600">Set personalized targets for your fitness journey</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <DollarSign className="w-10 h-10 text-red-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Free Forever Option</h3>
              <p className="text-gray-600">Start tracking today with no credit card required</p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 bg-red-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <Flame className="w-48 h-48 opacity-20" />
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Born in the Firehouse</h2>
              <p className="text-lg text-red-50 leading-relaxed">
                Created by firefighters who needed to track nutrition during long shifts and quick meals between calls. We built what we wished existed - simple, fast, accurate tracking that works in real life. No time for complicated apps when the bell rings.
              </p>
              <Button
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-red-600 font-semibold rounded-lg"
              >
                Our Story
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Perfect For Your Lifestyle
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">First Responders</h3>
              <p className="text-gray-600">24-hour shifts, quick meals, staying fit for duty</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto">
                <Dumbbell className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Athletes & Fitness</h3>
              <p className="text-gray-600">Hit protein goals, track macros, build muscle</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto">
                <TrendingDown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Weight Loss</h3>
              <p className="text-gray-600">Stay in calorie deficit, see real results</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Busy Professionals</h3>
              <p className="text-gray-600">No time to log? Just snap and track</p>
            </div>
          </div>
        </div>
      </section>


      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Honest Pricing
            </h2>
            <p className="text-xl text-gray-600">
              No BS. No hidden fees. Start free, upgrade when ready.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Forever</h3>
              <div className="mb-4">
                <span className="text-5xl font-bold text-gray-900">$0</span>
              </div>
              <p className="text-gray-600 mb-6">Perfect for getting started</p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">3 photo scans per day</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Basic macro tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Daily calorie goals</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">7-day history</span>
                </li>
              </ul>

              <Button
                onClick={() => navigate('/auth')}
                variant="outline"
                className="w-full border-2 border-gray-300 hover:border-red-600 font-semibold rounded-lg"
              >
                Get Started Free
              </Button>
            </div>

            <div className="bg-white border-2 border-red-600 rounded-2xl p-8 relative hover:shadow-xl transition-shadow">
              <div className="absolute top-0 left-0 right-0 bg-yellow-400 text-gray-900 text-center py-2 rounded-t-2xl font-semibold text-sm">
                Most Popular
              </div>
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-gray-900">Pro</h3>
                  <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">BEST VALUE</span>
                </div>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">$4.99</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600 mb-6">For serious tracking</p>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 font-semibold">Unlimited photo scans</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Unlimited history</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Advanced analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Meal planning</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Custom macro goals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Priority support</span>
                  </li>
                </ul>

                <Button
                  onClick={() => navigate('/auth')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
                >
                  Start Pro Trial
                </Button>
                <p className="text-center text-sm text-gray-600 mt-2">7-day free trial</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-red-600 to-orange-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-white mb-4">
            Ready to Track Smarter?
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Start your fitness journey with AI-powered nutrition tracking
          </p>
          <Button
            onClick={() => navigate('/auth')}
            size="lg"
            className="bg-white text-red-600 hover:bg-gray-100 font-bold text-lg px-12 py-6 rounded-lg shadow-lg hover:scale-105 transition-all"
          >
            Download Now
          </Button>
          <p className="text-white text-sm mt-4">Available on iOS, Android, and Web</p>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-6 h-6 text-red-600" />
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-white leading-tight">Firehouse Fit</span>
                  <span className="text-xs text-gray-400 leading-tight">AI Calorie & Meal Tracker</span>
                </div>
              </div>
              <p className="text-sm text-gray-400">Nutrition tracking built tough, made simple</p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Download</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mobile App</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-white transition-colors">About Our Story</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">First Responders Program</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support Center</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              Copyright © 2025 Firehouse Fit. Built with <Flame className="w-4 h-4 inline text-red-600" /> by firefighters.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
