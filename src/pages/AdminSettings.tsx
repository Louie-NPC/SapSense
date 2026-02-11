import React, { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, Bell, Thermometer, Droplets, Volume2, Save, Globe, Keyboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage, languageNames, Language } from '@/contexts/LanguageContext';
import { useSoundSettings, useNotificationSound, VolumeLevel } from '@/hooks/use-notification-sound';

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
  calibration: {
    phOffset: number;
    lastCalibrated: string;
    nextDue: string;
  };
}

const AdminSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { language, setLanguage, availableLanguages } = useLanguage();
  const { settings: soundSettings, toggleSound, setVolume } = useSoundSettings();
  const { playSuccess, playNotification } = useNotificationSound();
  
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
    },
    calibration: {
      phOffset: 0.0,
      lastCalibrated: '2024-01-15',
      nextDue: '2024-02-15'
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    setHasChanges(true);
  };

  const updateNestedSettings = <K extends keyof SystemSettings>(
    section: K, 
    updates: SystemSettings[K] extends object ? Partial<SystemSettings[K]> : never
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && prev[section] !== null 
        ? { ...prev[section] as object, ...updates }
        : updates
    }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    console.log('Saving settings:', settings);
    setHasChanges(false);
    // Here you would typically save to backend
    toast({
      title: 'Settings Saved',
      description: 'Your settings have been saved successfully.',
    });
  };

  const calibrateSensors = () => {
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    updateNestedSettings('calibration', {
      lastCalibrated: today,
      nextDue: nextMonth.toISOString().split('T')[0]
    });
    
    toast({
      title: 'Calibration Complete',
      description: 'Sensor calibration has been completed successfully.',
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader userName={user?.name} />
        
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">System Settings</h1>
              <Button 
                onClick={saveSettings} 
                disabled={!hasChanges}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
                {hasChanges && <Badge className="ml-2 bg-orange-500">*</Badge>}
              </Button>
            </div>

            <Tabs defaultValue="monitoring" className="space-y-6">
              <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-5">
                  <TabsTrigger value="monitoring" className="whitespace-nowrap">Monitoring</TabsTrigger>
                  <TabsTrigger value="notifications" className="whitespace-nowrap">Alerts</TabsTrigger>
                  <TabsTrigger value="automation" className="whitespace-nowrap">Automation</TabsTrigger>
                  <TabsTrigger value="calibration" className="whitespace-nowrap">Calibration</TabsTrigger>
                  <TabsTrigger value="preferences" className="whitespace-nowrap">Preferences</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="monitoring" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      pH Level Thresholds
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-green-700 dark:text-green-400">Optimal Harvest Range</h3>
                        <div className="space-y-3">
                          <div>
                            <Label>Minimum pH</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={settings.phThresholds.optimalMin}
                              onChange={(e) => updateNestedSettings('phThresholds', { 
                                optimalMin: parseFloat(e.target.value) 
                              })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Maximum pH</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={settings.phThresholds.optimalMax}
                              onChange={(e) => updateNestedSettings('phThresholds', { 
                                optimalMax: parseFloat(e.target.value) 
                              })}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold text-red-700 dark:text-red-400">Critical Rejection Range</h3>
                        <div className="space-y-3">
                          <div>
                            <Label>Critical Low</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={settings.phThresholds.criticalMin}
                              onChange={(e) => updateNestedSettings('phThresholds', { 
                                criticalMin: parseFloat(e.target.value) 
                              })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Critical High</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={settings.phThresholds.criticalMax}
                              onChange={(e) => updateNestedSettings('phThresholds', { 
                                criticalMax: parseFloat(e.target.value) 
                              })}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Current pH Ranges:</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <Badge className="bg-emerald-500">Optimal</Badge>
                          <p className="mt-1">{settings.phThresholds.optimalMin} - {settings.phThresholds.optimalMax}</p>
                        </div>
                        <div>
                          <Badge className="bg-yellow-500">Warning</Badge>
                          <p className="mt-1">Outside optimal range</p>
                        </div>
                        <div>
                          <Badge className="bg-red-500">Critical</Badge>
                          <p className="mt-1">≤{settings.phThresholds.criticalMin} or ≥{settings.phThresholds.criticalMax}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Other Sensor Thresholds</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Volume2 className="h-5 w-5 text-blue-600" />
                          <Label>Volume Alert Level (%)</Label>
                        </div>
                        <div className="space-y-2">
                          <Slider
                            value={[settings.volumeAlert]}
                            onValueChange={(value) => updateSettings({ volumeAlert: value[0] })}
                            max={100}
                            min={50}
                            step={5}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>50%</span>
                            <span className="font-medium">{settings.volumeAlert}%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Thermometer className="h-5 w-5 text-orange-600" />
                          <Label>Temperature Alert (°C)</Label>
                        </div>
                        <Input
                          type="number"
                          value={settings.temperatureAlert}
                          onChange={(e) => updateSettings({ temperatureAlert: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="h-5 w-5 mr-2" />
                      Notification Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold dark:text-white">Notification Methods</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>Push Notifications</Label>
                            <Switch
                              checked={settings.notifications.pushEnabled}
                              onCheckedChange={(checked) => 
                                updateNestedSettings('notifications', { pushEnabled: checked })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>SMS Alerts</Label>
                            <Switch
                              checked={settings.notifications.smsEnabled}
                              onCheckedChange={(checked) => 
                                updateNestedSettings('notifications', { smsEnabled: checked })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Email Notifications</Label>
                            <Switch
                              checked={settings.notifications.emailEnabled}
                              onCheckedChange={(checked) => 
                                updateNestedSettings('notifications', { emailEnabled: checked })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Sound Alerts</Label>
                            <Switch
                              checked={settings.notifications.soundEnabled}
                              onCheckedChange={(checked) => 
                                updateNestedSettings('notifications', { soundEnabled: checked })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold dark:text-white">Alert Priorities</h3>
                        <div className="space-y-3">
                          <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                            <h4 className="font-medium text-red-800">Critical Alerts</h4>
                            <p className="text-sm text-red-600">pH outside safe range, system failures</p>
                            <Badge className="mt-1 bg-red-500">Immediate</Badge>
                          </div>
                          <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                            <h4 className="font-medium text-yellow-800">Warning Alerts</h4>
                            <p className="text-sm text-yellow-600">pH approaching limits, low battery</p>
                            <Badge className="mt-1 bg-yellow-500">High Priority</Badge>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                            <h4 className="font-medium text-blue-800">Info Alerts</h4>
                            <p className="text-sm text-blue-600">Harvest ready, volume updates</p>
                            <Badge className="mt-1 bg-blue-500">Normal</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="automation" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Auto-Approval Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base dark:text-white">Enable Auto-Approval</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Automatically approve sap within tolerance limits</p>
                      </div>
                      <Switch
                        checked={settings.autoApproval.enabled}
                        onCheckedChange={(checked) => 
                          updateNestedSettings('autoApproval', { enabled: checked })
                        }
                      />
                    </div>

                    {settings.autoApproval.enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label>pH Tolerance (±)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={settings.autoApproval.phTolerance}
                            onChange={(e) => updateNestedSettings('autoApproval', { 
                              phTolerance: parseFloat(e.target.value) 
                            })}
                            className="mt-1"
                          />
                          <p className="text-xs text-gray-600 mt-1">
                            Auto-approve if difference ≤ {settings.autoApproval.phTolerance} pH units
                          </p>
                        </div>

                        <div>
                          <Label>Volume Tolerance (±L)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={settings.autoApproval.volumeTolerance}
                            onChange={(e) => updateNestedSettings('autoApproval', { 
                              volumeTolerance: parseFloat(e.target.value) 
                            })}
                            className="mt-1"
                          />
                          <p className="text-xs text-gray-600 mt-1">
                            Auto-approve if difference ≤ {settings.autoApproval.volumeTolerance}L
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="calibration" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sensor Calibration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-800">Last Calibrated</h3>
                        <p className="text-lg font-medium">{settings.calibration.lastCalibrated}</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-orange-800">Next Due</h3>
                        <p className="text-lg font-medium">{settings.calibration.nextDue}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-green-800">pH Offset</h3>
                        <p className="text-lg font-medium">{settings.calibration.phOffset.toFixed(1)}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>pH Calibration Offset</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={settings.calibration.phOffset}
                          onChange={(e) => updateNestedSettings('calibration', { 
                            phOffset: parseFloat(e.target.value) 
                          })}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          Adjustment value to correct sensor readings (typically ±0.2)
                        </p>
                      </div>

                      <div className="flex space-x-3">
                        <Button onClick={calibrateSensors} className="bg-blue-600 hover:bg-blue-700">
                          Run Calibration
                        </Button>
                        <Button variant="outline">
                          Download Calibration Report
                        </Button>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h4 className="font-medium text-yellow-800 mb-2">Calibration Guidelines</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Calibrate sensors monthly for optimal accuracy</li>
                        <li>• Use standard pH buffer solutions (4.0, 7.0, 10.0)</li>
                        <li>• Ensure sensors are clean before calibration</li>
                        <li>• Record environmental conditions during calibration</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences" className="space-y-6">
                {/* Language Settings */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center dark:text-white">
                      <Globe className="h-5 w-5 mr-2" />
                      Language Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="dark:text-gray-200">Display Language</Label>
                      <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
                        <SelectTrigger className="w-full md:w-[280px] mt-2 dark:bg-gray-700 dark:border-gray-600">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableLanguages.map((lang) => (
                            <SelectItem key={lang} value={lang}>
                              {languageNames[lang]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Choose your preferred language for the interface
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Sound Settings */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center dark:text-white">
                      <Volume2 className="h-5 w-5 mr-2" />
                      Sound & Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="dark:text-gray-200">Enable Sound Effects</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Play sounds for notifications and actions</p>
                      </div>
                      <Switch
                        checked={soundSettings.enabled}
                        onCheckedChange={toggleSound}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="dark:text-gray-200">Volume Level</Label>
                      <div className="flex items-center space-x-4">
                        <Slider
                          value={[soundSettings.volume * 100]}
                          onValueChange={([value]) => setVolume((value / 100) as VolumeLevel)}
                          max={100}
                          step={25}
                          disabled={!soundSettings.enabled}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium w-12 dark:text-gray-300">
                          {Math.round(soundSettings.volume * 100)}%
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => playSuccess()}
                        disabled={!soundSettings.enabled}
                        className="dark:border-gray-600 dark:text-gray-300"
                      >
                        Test Success Sound
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => playNotification()}
                        disabled={!soundSettings.enabled}
                        className="dark:border-gray-600 dark:text-gray-300"
                      >
                        Test Notification Sound
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Keyboard Shortcuts */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center dark:text-white">
                      <Keyboard className="h-5 w-5 mr-2" />
                      Keyboard Shortcuts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm dark:text-gray-200">Navigation</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between py-1 px-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                            <span className="dark:text-gray-300">Dashboard</span>
                            <Badge variant="outline" className="font-mono text-xs">Alt + D</Badge>
                          </div>
                          <div className="flex justify-between py-1 px-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                            <span className="dark:text-gray-300">Employees</span>
                            <Badge variant="outline" className="font-mono text-xs">Alt + E</Badge>
                          </div>
                          <div className="flex justify-between py-1 px-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                            <span className="dark:text-gray-300">Payroll</span>
                            <Badge variant="outline" className="font-mono text-xs">Alt + P</Badge>
                          </div>
                          <div className="flex justify-between py-1 px-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                            <span className="dark:text-gray-300">Reports</span>
                            <Badge variant="outline" className="font-mono text-xs">Alt + R</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm dark:text-gray-200">Actions</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between py-1 px-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                            <span className="dark:text-gray-300">Search</span>
                            <Badge variant="outline" className="font-mono text-xs">Ctrl + K</Badge>
                          </div>
                          <div className="flex justify-between py-1 px-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                            <span className="dark:text-gray-300">Save</span>
                            <Badge variant="outline" className="font-mono text-xs">Ctrl + S</Badge>
                          </div>
                          <div className="flex justify-between py-1 px-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                            <span className="dark:text-gray-300">Export</span>
                            <Badge variant="outline" className="font-mono text-xs">Ctrl + Shift + E</Badge>
                          </div>
                          <div className="flex justify-between py-1 px-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                            <span className="dark:text-gray-300">Show Shortcuts</span>
                            <Badge variant="outline" className="font-mono text-xs">?</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;
