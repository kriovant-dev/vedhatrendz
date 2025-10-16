import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { r2Service } from '@/services/cloudflareR2Service';

const ImageUrlTester: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  
  const testUrl = 'https://pub-3c4bb7a52eeb4b67be4b7c10ebfc846b.r2.dev/products/1002629344_7tzAUc9St.jpg';
  
  const runTests = () => {
    console.clear();
    
    const tests = [
      {
        name: 'Direct URL Test',
        test: () => {
          console.log('🧪 Testing direct URL:', testUrl);
          return testUrl;
        }
      },
      {
        name: 'R2 Service Test',
        test: () => {
          const result = r2Service.getOptimizedImageUrl(testUrl);
          console.log('🧪 R2 Service result:', result);
          return result;
        }
      },
      {
        name: 'R2 Service with transformations',
        test: () => {
          const result = r2Service.getOptimizedImageUrl(testUrl, {
            width: 400,
            height: 512,
            quality: 85,
            format: 'webp'
          });
          console.log('🧪 R2 Service with transformations:', result);
          return result;
        }
      }
    ];
    
    const results = tests.map(({ name, test }) => {
      try {
        const result = test();
        return { name, result, status: 'success' };
      } catch (error) {
        return { name, result: error, status: 'error' };
      }
    });
    
    setTestResults(results);
  };
  
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>🧪 Image URL Testing Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">Test URL:</h3>
          <code className="block p-2 bg-gray-100 rounded text-sm break-all">
            {testUrl}
          </code>
        </div>
        
        <Button onClick={runTests}>Run All Tests</Button>
        
        {testResults.length > 0 && (
          <div className="space-y-4">
            {testResults.map((test, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">{test.name}</h4>
                  <code className="block p-2 bg-gray-50 rounded text-sm break-all">
                    {typeof test.result === 'string' ? test.result : JSON.stringify(test.result)}
                  </code>
                  <div className={`mt-2 text-sm ${
                    test.status === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    Status: {test.status}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Direct Image Test</h4>
              <img 
                src={testUrl} 
                alt="Direct test" 
                className="w-full h-32 object-cover rounded"
                onLoad={() => console.log('✅ Direct image loaded')}
                onError={(e) => console.error('❌ Direct image failed:', e)}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">R2 Service Test</h4>
              <img 
                src={r2Service.getOptimizedImageUrl(testUrl)} 
                alt="R2 Service test" 
                className="w-full h-32 object-cover rounded"
                onLoad={() => console.log('✅ R2 Service image loaded')}
                onError={(e) => console.error('❌ R2 Service image failed:', e)}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">With Transformations</h4>
              <img 
                src={r2Service.getOptimizedImageUrl(testUrl, { width: 200, height: 200 })} 
                alt="Transformations test" 
                className="w-full h-32 object-cover rounded"
                onLoad={() => console.log('✅ Transformations image loaded')}
                onError={(e) => console.error('❌ Transformations image failed:', e)}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <p className="text-sm text-blue-700">
            <strong>Check the browser console</strong> for detailed logs and error messages.
            All three images above should load if the URL is working correctly.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageUrlTester;