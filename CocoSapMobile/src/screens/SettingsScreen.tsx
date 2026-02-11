import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface SystemSettings {
  phThresholds: {
    optimalMin: number;
    optimalMax: number;
    criticalMin: number;
    criticalMax: number;
  };
  volumeAlert: number;
  temperatureAlert: number;
  notifications: {
    pushEnabled: boolean;
    smsEnabled: boolean;
    emailEnabled: boolean;
    soundEnabled: boolean;
  };
  autoApproval: {
    enabled: boolean;
    phTolerance: number;
    volumeTolerance: number;
  };
}

const SettingsScreen = () => {
  const navigation = useNavigation();

  const [settings, setSettings] = useState<SystemSettings>({
    phThresholds: {
      optimalMin: 5.0,
      optimalMax: 5.5,
      criticalMin: 4.8,
      criticalMax: 7.2
    },
    volumeAlert: 90,
    temperatureAlert: 35,
    notifications: {
      pushEnabled: true,
      smsEnabled: true,
      emailEnabled: false,
      soundEnabled: true
    },
    autoApproval: {
      enabled: true,
      phTolerance: 0.3,
      volumeTolerance: 0.5
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  const updateNotificationSetting = (key: keyof typeof settings.notifications, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const updateAutoApprovalSetting = (key: keyof typeof settings.autoApproval, value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      autoApproval: {
        ...prev.autoApproval,
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    Alert.alert(
      'Settings Saved',
      'Your system settings have been updated successfully.',
      [{ text: 'OK' }]
    );
    setHasChanges(false);
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSettings({
              phThresholds: {
                optimalMin: 5.0,
                optimalMax: 5.5,
                criticalMin: 4.8,
                criticalMax: 7.2
              },
              volumeAlert: 90,
              temperatureAlert: 35,
              notifications: {
                pushEnabled: true,
                smsEnabled: true,
                emailEnabled: false,
                soundEnabled: true
              },
              autoApproval: {
                enabled: true,
                phTolerance: 0.3,
                volumeTolerance: 0.5
              }
            });
            setHasChanges(true);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>System Settings</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Monitoring Thresholds */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌡️ Monitoring Thresholds</Text>
          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>pH Optimal Range</Text>
            <Text style={styles.settingValue}>
              {settings.phThresholds.optimalMin} - {settings.phThresholds.optimalMax}
            </Text>
          </View>
          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>pH Critical Range</Text>
            <Text style={styles.settingValue}>
              {settings.phThresholds.criticalMin} - {settings.phThresholds.criticalMax}
            </Text>
          </View>
          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>Volume Alert Threshold</Text>
            <Text style={styles.settingValue}>{settings.volumeAlert}%</Text>
          </View>
          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>Temperature Alert</Text>
            <Text style={styles.settingValue}>{settings.temperatureAlert}°C</Text>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Notifications</Text>
          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Switch
              value={settings.notifications.pushEnabled}
              onValueChange={(value) => updateNotificationSetting('pushEnabled', value)}
              trackColor={{ false: '#767577', true: '#059669' }}
              thumbColor={settings.notifications.pushEnabled ? '#10b981' : '#f4f3f4'}
            />
          </View>
          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>SMS Alerts</Text>
            <Switch
              value={settings.notifications.smsEnabled}
              onValueChange={(value) => updateNotificationSetting('smsEnabled', value)}
              trackColor={{ false: '#767577', true: '#059669' }}
              thumbColor={settings.notifications.smsEnabled ? '#10b981' : '#f4f3f4'}
            />
          </View>
          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>Email Notifications</Text>
            <Switch
              value={settings.notifications.emailEnabled}
              onValueChange={(value) => updateNotificationSetting('emailEnabled', value)}
              trackColor={{ false: '#767577', true: '#059669' }}
              thumbColor={settings.notifications.emailEnabled ? '#10b981' : '#f4f3f4'}
            />
          </View>
          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>Sound Alerts</Text>
            <Switch
              value={settings.notifications.soundEnabled}
              onValueChange={(value) => updateNotificationSetting('soundEnabled', value)}
              trackColor={{ false: '#767577', true: '#059669' }}
              thumbColor={settings.notifications.soundEnabled ? '#10b981' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Automation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤖 Automation</Text>
          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>Auto Approval</Text>
            <Switch
              value={settings.autoApproval.enabled}
              onValueChange={(value) => updateAutoApprovalSetting('enabled', value)}
              trackColor={{ false: '#767577', true: '#059669' }}
              thumbColor={settings.autoApproval.enabled ? '#10b981' : '#f4f3f4'}
            />
          </View>
          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>pH Tolerance</Text>
            <Text style={styles.settingValue}>±{settings.autoApproval.phTolerance}</Text>
          </View>
          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>Volume Tolerance</Text>
            <Text style={styles.settingValue}>±{settings.autoApproval.volumeTolerance}L</Text>
          </View>
        </View>

        {/* System Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ System Information</Text>
          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>Last Calibrated</Text>
            <Text style={styles.settingValue}>2024-01-15</Text>
          </View>
          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>Next Calibration Due</Text>
            <Text style={styles.settingValue}>2024-02-15</Text>
          </View>
          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>App Version</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={[styles.saveButton, !hasChanges && styles.disabledButton]} 
            onPress={saveSettings}
            disabled={!hasChanges}
          >
            <Text style={[styles.saveButtonText, !hasChanges && styles.disabledButtonText]}>
              💾 Save Changes {hasChanges && '●'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resetButton} onPress={resetToDefaults}>
            <Text style={styles.resetButtonText}>🔄 Reset to Defaults</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  settingCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingLabel: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#059669',
  },
  actionSection: {
    padding: 16,
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
  },
  disabledButtonText: {
    color: '#9ca3af',
  },
  resetButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;
