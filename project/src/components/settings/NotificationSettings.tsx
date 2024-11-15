import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { Toggle } from '../ui/Toggle';

export const NotificationSettings: React.FC = () => {
  const { notifications, updateNotifications } = useSettings();

  return (
    <div className="space-y-4">
      <Toggle
        label="Nouvelles recettes"
        description="Recevez des notifications lorsque les personnes que vous suivez publient de nouvelles recettes"
        checked={notifications.recipes}
        onChange={(checked) => updateNotifications({ recipes: checked })}
      />
      <Toggle
        label="Commentaires"
        description="Recevez des notifications pour les commentaires sur vos recettes"
        checked={notifications.comments}
        onChange={(checked) => updateNotifications({ comments: checked })}
      />
      <Toggle
        label="Rappels de repas"
        description="Recevez des rappels pour vos repas planifiés"
        checked={notifications.reminders}
        onChange={(checked) => updateNotifications({ reminders: checked })}
      />
    </div>
  );
};