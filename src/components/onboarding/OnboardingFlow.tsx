import { useState } from 'react';
import { MapPin, Users, Shield, Zap, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OnboardingFlowProps {
  onComplete: (fullLocation: boolean) => void;
}

const slides = [
  {
    icon: Zap,
    title: 'Welcome to Hawkly',
    subtitle: 'Real-time nightlife discovery',
    description: 'Find the best spots in your city with live crowd levels, vibes, and energy — updated in real-time.',
  },
  {
    icon: Users,
    title: 'Powered by the Crowd',
    subtitle: 'Anonymous & aggregated',
    description: 'Hawkly shows how busy places are right now. This works because people like you share their presence anonymously.',
  },
  {
    icon: Shield,
    title: 'Your Privacy Matters',
    subtitle: 'We never expose individuals',
    description: 'Your location is only used for anonymous crowd counts at social venues. We never track your home, workplace, or show your movements to others.',
  },
];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showChoice, setShowChoice] = useState(false);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setShowChoice(true);
    }
  };

  const handleChoice = (fullLocation: boolean) => {
    onComplete(fullLocation);
  };

  if (showChoice) {
    return (
      <div className="min-h-screen bg-background flex flex-col p-6">
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <MapPin className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground text-center mb-2">
            Location Access
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Choose how Hawkly uses your location
          </p>

          <div className="w-full space-y-4">
            {/* Full Location Option */}
            <button
              onClick={() => handleChoice(true)}
              className="w-full p-5 rounded-2xl bg-primary/5 border-2 border-primary text-left transition-all hover:bg-primary/10 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Check className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground mb-1">
                    Enable Full Location
                  </p>
                  <p className="text-sm text-primary font-medium mb-2">
                    Recommended
                  </p>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Automatic check-ins at venues
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Most accurate crowd levels
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Personalized nearby recommendations
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Share location with friends
                    </li>
                  </ul>
                </div>
              </div>
            </button>

            {/* Limited Option */}
            <button
              onClick={() => handleChoice(false)}
              className="w-full p-5 rounded-2xl bg-secondary/50 border border-border text-left transition-all hover:bg-secondary group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground mb-1">
                    Use with Limited Accuracy
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Some features unavailable
                  </p>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                      Manual check-ins only
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                      Reduced crowd accuracy
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                      No location sharing
                    </li>
                  </ul>
                </div>
              </div>
            </button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6 max-w-xs">
            You can change this anytime in your Profile settings. Hawkly never tracks your home or workplace.
          </p>
        </div>
      </div>
    );
  }

  const slide = slides[currentSlide];
  const SlideIcon = slide.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-8">
          <SlideIcon className="w-12 h-12 text-primary" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground text-center mb-2">
          {slide.title}
        </h1>
        <p className="text-primary font-medium text-center mb-4">
          {slide.subtitle}
        </p>
        <p className="text-muted-foreground text-center">
          {slide.description}
        </p>
      </div>

      {/* Navigation */}
      <div className="p-6 space-y-4">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                index === currentSlide
                  ? 'w-6 bg-primary'
                  : index < currentSlide
                  ? 'bg-primary/50'
                  : 'bg-muted'
              )}
            />
          ))}
        </div>

        {/* Next button */}
        <Button
          onClick={handleNext}
          className="w-full gap-2"
          size="lg"
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
