import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { RadioGroup } from '../ui/RadioGroup';

export const PrivacySettings: React.FC = () => {
  const { privacy, updatePrivacy } = useSettings();

  return (
    <div className="space-y-6">
      <RadioGroup
        label="Visibilité du profil"
        value={privacy.profileVisibility}
        onChange={(value) => updatePrivacy({ profileVisibility: value as 'public' | 'private' })}
        options={[
          { value: 'public', label: 'Public', description: 'Tout le monde peut voir votre profil' },
          { value: 'private', label: 'Privé', description: 'Seuls vos abonnés peuvent voir votre profil' },
        ]}
      />
      <RadioGroup
        label="Visibilité par défaut des recettes"
        value={privacy.recipeDefaultVisibility}
        onChange={(value) => updatePrivacy({ recipeDefaultVisibility: value as 'public' | 'private' })}
        options={[
          { value: 'public', label: 'Public', description: 'Les nouvelles recettes sont publiques par défaut' },
          { value: 'private', label: 'Privé', description: 'Les nouvelles recettes sont privées par défaut' },
        ]}
      />
    </div>
  );
};