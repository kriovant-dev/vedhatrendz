import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

const FirebaseSetupGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Firebase Phone Authentication Setup Required</AlertTitle>
        <AlertDescription>
          To use phone authentication, you need to enable it in your Firebase Console.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">1</Badge>
              <div>
                <p className="font-medium">Go to Firebase Console</p>
                <p className="text-sm text-muted-foreground">
                  Visit <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                    Firebase Console <ExternalLink className="h-3 w-3" />
                  </a> and select your project: <code>vedhatrendz-demo</code>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">2</Badge>
              <div>
                <p className="font-medium">Navigate to Authentication</p>
                <p className="text-sm text-muted-foreground">
                  In the left sidebar, click on "Authentication"
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">3</Badge>
              <div>
                <p className="font-medium">Go to Sign-in method</p>
                <p className="text-sm text-muted-foreground">
                  Click on the "Sign-in method" tab
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">4</Badge>
              <div>
                <p className="font-medium">Enable Phone authentication</p>
                <p className="text-sm text-muted-foreground">
                  Find "Phone" in the list of providers and click on it, then toggle "Enable" and save
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">5</Badge>
              <div>
                <p className="font-medium">Add authorized domains</p>
                <p className="text-sm text-muted-foreground">
                  Make sure <code>localhost</code> is in the authorized domains list (it usually is by default)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">6</Badge>
              <div>
                <p className="font-medium">Refresh the application</p>
                <p className="text-sm text-muted-foreground">
                  Once phone authentication is enabled, refresh this page and try again
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Current Configuration</AlertTitle>
        <AlertDescription>
          <div className="mt-2 space-y-1">
            <p><strong>Project ID:</strong> vedhatrendz-demo</p>
            <p><strong>Auth Domain:</strong> vedhatrendz-demo.firebaseapp.com</p>
            <p>Firebase configuration is properly loaded from environment variables.</p>
          </div>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Testing Phone Authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            For development testing, you can use Firebase test phone numbers:
          </p>
          <div className="bg-muted p-3 rounded-md font-mono text-sm">
            <p>Phone: +1 650-555-3434</p>
            <p>Verification Code: 654321</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Note: Test numbers must be configured in Firebase Console under Authentication → Settings → Phone Authentication → Test phone numbers
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FirebaseSetupGuide;
