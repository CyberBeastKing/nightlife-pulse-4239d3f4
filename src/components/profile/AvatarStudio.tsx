import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Check } from 'lucide-react';
import { MONSTER_AVATARS, COLOR_THEMES, GLOW_EFFECTS, MonsterAvatar } from '@/data/monsterAvatars';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AvatarConfig {
  monsterId: string;
  colorTheme: string;
  glowEffect: string;
}

interface AvatarStudioProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  currentConfig: AvatarConfig;
  onSave: (config: AvatarConfig) => void;
}

export function AvatarStudio({ open, onOpenChange, userId, currentConfig, onSave }: AvatarStudioProps) {
  const [selectedMonster, setSelectedMonster] = useState(currentConfig.monsterId);
  const [selectedColor, setSelectedColor] = useState(currentConfig.colorTheme);
  const [selectedGlow, setSelectedGlow] = useState(currentConfig.glowEffect);
  const [saving, setSaving] = useState(false);

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setSelectedMonster(currentConfig.monsterId);
      setSelectedColor(currentConfig.colorTheme);
      setSelectedGlow(currentConfig.glowEffect);
    }
  }, [open, currentConfig]);

  const currentMonster = MONSTER_AVATARS.find(m => m.id === selectedMonster) || MONSTER_AVATARS[0];
  const currentColorTheme = COLOR_THEMES.find(c => c.id === selectedColor) || COLOR_THEMES[0];
  const currentGlowEffect = GLOW_EFFECTS.find(g => g.id === selectedGlow) || GLOW_EFFECTS[0];

  const handleSave = async () => {
    setSaving(true);
    try {
      // Build avatar_url as JSON config string
      const configString = JSON.stringify({
        type: 'monster',
        monsterId: selectedMonster,
        colorTheme: selectedColor,
        glowEffect: selectedGlow,
      });

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: configString })
        .eq('id', userId);

      if (error) throw error;

      onSave({
        monsterId: selectedMonster,
        colorTheme: selectedColor,
        glowEffect: selectedGlow,
      });

      toast.success('Avatar updated!');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save avatar:', error);
      toast.error('Failed to save avatar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Avatar Studio
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Live Preview */}
          <div className="flex flex-col items-center gap-3">
            <div 
              className="relative w-28 h-28 rounded-full overflow-hidden bg-secondary/50 border-4 border-primary/30"
              style={{ 
                boxShadow: currentGlowEffect.shadow,
              }}
            >
              <img 
                src={currentMonster.image} 
                alt={currentMonster.name}
                className="w-full h-full object-cover"
                style={{ filter: currentColorTheme.filter }}
              />
            </div>
            <Badge variant="secondary" className="text-xs">
              {currentMonster.vibe}
            </Badge>
          </div>

          {/* Monster Selection */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Choose Your Monster</h4>
            <div className="grid grid-cols-5 gap-2">
              {MONSTER_AVATARS.map((monster) => (
                <button
                  key={monster.id}
                  onClick={() => setSelectedMonster(monster.id)}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedMonster === monster.id 
                      ? 'border-primary ring-2 ring-primary/30 scale-105' 
                      : 'border-transparent hover:border-muted-foreground/30'
                  }`}
                >
                  <img 
                    src={monster.image} 
                    alt={monster.name}
                    className="w-full h-full object-cover"
                  />
                  {selectedMonster === monster.id && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Color Theme */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Color Theme</h4>
            <div className="flex flex-wrap gap-2">
              {COLOR_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedColor(theme.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedColor === theme.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </div>

          {/* Glow Effect */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Glow Effect</h4>
            <div className="flex flex-wrap gap-2">
              {GLOW_EFFECTS.map((glow) => (
                <button
                  key={glow.id}
                  onClick={() => setSelectedGlow(glow.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedGlow === glow.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {glow.name}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSave} 
            className="w-full" 
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Avatar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
