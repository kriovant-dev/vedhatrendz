import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, Upload } from 'lucide-react';

const R2BucketChecker: React.FC = () => {
  const [testUrl, setTestUrl] = useState('https://pub-3c4bb7a52eeb4b67be4b7c10ebfc846b.r2.dev/products/1002629344_7tzAUc9St.jpg');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<{ status: string; message: string } | null>(null);

  const checkUrl = async () => {
    if (!testUrl) return;
    
    setIsChecking(true);
    try {
      const response = await fetch(testUrl, { method: 'HEAD' });
      
      if (response.ok) {
        setResult({
          status: 'success',
          message: `✅ Image exists! (${response.status} ${response.statusText})`
        });
      } else {
        setResult({
          status: 'error',
          message: `❌ Image not found: ${response.status} ${response.statusText}`
        });
      }
    } catch (error) {
      setResult({
        status: 'error',
        message: `❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
    setIsChecking(false);
  };

  const testCommonPaths = () => {
    // Test common R2 paths where images might actually be
    const baseDomain = 'https://pub-3c4bb7a52eeb4b67be4b7c10ebfc846b.r2.dev';
    const filename = '1002629344_7tzAUc9St.jpg';
    
    const testPaths = [
      `${baseDomain}/products/${filename}`,
      `${baseDomain}/${filename}`,
      `${baseDomain}/images/${filename}`,
      `${baseDomain}/uploads/${filename}`,
      `${baseDomain}/vedhatrendz/${filename}`,
      `${baseDomain}/product-images/${filename}`
    ];
    
    console.log('🔍 Testing these R2 paths:');
    testPaths.forEach(path => console.log(path));
    
    // You can manually test these URLs
    alert('Check browser console for test URLs to try manually');
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 R2 URL Checker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Test R2 URL:</label>
          <Input
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="Enter R2 URL to test..."
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={checkUrl} disabled={isChecking || !testUrl}>
            {isChecking ? 'Checking...' : 'Check URL'}
          </Button>
          <Button variant="outline" onClick={testCommonPaths}>
            Test Common Paths
          </Button>
        </div>

        {result && (
          <div className={`p-4 rounded-lg border ${
            result.status === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {result.status === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="font-medium">{result.message}</span>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">💡 Next Steps:</h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li><strong>If images exist:</strong> The URLs are correct, check for network issues</li>
            <li><strong>If images don't exist:</strong> You need to upload them to R2 first</li>
            <li><strong>If path is wrong:</strong> Update Firebase URLs to match actual R2 paths</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default R2BucketChecker;