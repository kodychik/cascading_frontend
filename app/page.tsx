"use client";
import { useState, useEffect, useRef } from 'react';
import Image from "next/image";


type AnalysisResult = {
  name: string;
  account_info: {
    account_number: string;
    account_type: string;
    bank: string;
  };
  financial_summary: {
    statement_period: string;
    opening_balance: string;
    closing_balance: string;
    total_deposits: string;
    total_withdrawals: string;
    average_monthly_balance: string;
  };
  analysis: {
    decision: string;
    stats: {
      monthly_income: string;
      spending_patterns: string;
      balance_trends: string;
      risk_factors: string;
    };
    conclusion: string;
  };
  raw_analysis: string;
};

// Then, update the right side analysis results section

export default function Home() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<Array<{type: 'user' | 'bot', content: string}>>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);


  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setError(null); // Add error state if not already present
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files[]', file);
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.text(); // First get the raw response
        let errorMessage;
        try {
          const jsonError = JSON.parse(errorData);
          errorMessage = jsonError.error || 'Failed to analyze files';
        } catch {
          errorMessage = errorData || 'Failed to analyze files';
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      if (!data.results) {
        throw new Error('Invalid response format');
      }
      console.log("Data:", data);


      setResults(data.results);
      console.log("Results:", results, "Loading:", isLoading);

    } catch (error) {
      console.error('Error analyzing PDFs:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };  

  const handleFeedbackSubmit = async (filename: string) => {
    // TODO: Implement feedback submission to backend
    console.log(`Feedback for ${filename}:`, feedback[filename]);
  };
  // Add this function to handle chat submission
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;
    
    // Add user message to chat
    setMessages(prev => [...prev, { type: 'user', content: currentMessage }]);
    setCurrentMessage('');
    
    // TODO: Implement bot response logic here
    // For now, just echo back
    setMessages(prev => [...prev, { type: 'bot', content: `You said: ${currentMessage}` }]);
  };

  // Add this useEffect to scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen p-8 flex">
      {/*Left Side - Chat & Upload Interface*/}
      {/* <div className="w-1/2 pr-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bank Statement Analysis</h1>
          <p className="text-gray-600">Upload 1-20 bank statements for loan eligibility analysis</p>
        </header>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="application/pdf"
                multiple
                onChange={(e) => setFiles(e.target.files)}
                className="mb-4"
              />
              <p className="text-sm text-gray-500 mb-2">
                Upload up to 20 PDF bank statements
              </p>
              <button
                type="submit"
                disabled={!files || isLoading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Analyzing...' : 'Analyze Statements'}
              </button>
              
            </div>
          </form>
        </div>
        {error && (
                <div className="mt-2 text-red-500 text-sm">
                  {error}
                </div>
              )}
      </div> */}
      {/*Left Side - Chat & Upload Interface*/}
      <div className="w-1/2 pr-4 flex flex-col h-[calc(100vh-4rem)]"> {/* Changed height */}
        <header className="flex-shrink-0 mb-4"> {/* Added flex-shrink-0 */}
          <h1 className="text-3xl font-bold mb-2">Bank Statement Analysis</h1>
          <p className="text-gray-600">Upload statements and chat for detailed analysis</p>
        </header>

        {/* File Upload Section */}
        <div className="flex-shrink-0 bg-white rounded-lg shadow-md p-4 mb-4"> {/* Added flex-shrink-0 */}
          <form onSubmit={handleFileUpload}>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                accept="application/pdf"
                multiple
                onChange={(e) => setFiles(e.target.files)}
                className="mb-2"
              />
              <p className="text-sm text-gray-500 mb-2">
                Upload up to 20 PDF bank statements
              </p>
              <button
                type="submit"
                disabled={!files || isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? 'Analyzing...' : 'Analyze Statements'}
              </button>
            </div>
          </form>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 min-h-0 bg-white rounded-lg shadow-md p-4 flex flex-col"> {/* Added min-h-0 */}
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-black'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="flex-shrink-0"> {/* Added flex-shrink-0 */}
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask questions about the analysis..."
                className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {error && (
          <div className="flex-shrink-0 mt-2 text-red-500 text-sm"> {/* Added flex-shrink-0 */}
            {error}
          </div>
        )}
      </div>
      

      {/* Right Side - Analysis Results */}
      <div className="w-1/2 pl-4 overflow-y-auto max-h-screen">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : results.length > 0 ? (
          results.map((result, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 mb-6">
              {/* Customer Overview */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{result.name}</h2>
                  <p className="text-gray-500">{result.account_info.bank} • {result.account_info.account_type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700">Account Number</p>
                  <p className="font-mono text-gray-400">{result.account_info.account_number}</p>
                </div>
              </div>

              {/* Loan Decision Section */}
              <div className="mb-8 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-gray-800 text-xl font-semibold">Loan Decision</h3>
                  <div className="flex items-center">
                    {/* Add a confidence indicator */}
                    <div className="w-32 h-2 bg-gray-200 rounded-full mr-3">
                      <div 
                        className={`h-full rounded-full ${
                          result.analysis.decision.toLowerCase().includes('approve') 
                            ? 'bg-green-500' 
                            : 'bg-red-500'
                        }`}
                        style={{ width: '80%' }} // You can make this dynamic based on confidence
                      />
                    </div>
                    <span className="text-sm font-medium">80% Confidence</span>
                  </div>
                </div>
                <p className="text-lg font-medium text-gray-800">{result.analysis.decision}</p>
              </div>

              {/* Financial Overview */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Total Deposits</p>
                  <p className="text-xl font-bold text-green-600">{result.financial_summary.total_deposits}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Total Withdrawals</p>
                  <p className="text-xl font-bold text-red-600">{result.financial_summary.total_withdrawals}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Average Balance</p>
                  <p className="text-xl font-bold text-blue-600">{result.financial_summary.average_monthly_balance}</p>
                </div>
              </div>

              {/* Analysis Details */}
              <div className="space-y-6 text-gray-800">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="text-lg font-semibold mb-2">Monthly Income Analysis</h4>
                  <p className="text-gray-700">{result.analysis.stats.monthly_income}</p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="text-lg font-semibold mb-2">Spending Patterns</h4>
                  <p className="text-gray-700">{result.analysis.stats.spending_patterns}</p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="text-lg font-semibold mb-2">Balance Trends</h4>
                  <p className="text-gray-700">{result.analysis.stats.balance_trends}</p>
                </div>
                
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="text-lg font-semibold mb-2">Risk Factors</h4>
                  <p className="text-gray-700">{result.analysis.stats.risk_factors}</p>
                </div>
              </div>

              {/* Final Conclusion */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold mb-2 text-gray-800">Final Assessment</h4>
                <p className="text-gray-700">{result.analysis.conclusion}</p>
              </div>

              {/* Feedback Section */}
              <div className="mt-8 pt-6 border-t">
                <h4 className="text-gray-800 text-lg font-semibold mb-3">Teller Feedback</h4>
                <textarea
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  rows={3}
                  placeholder="Provide feedback on this analysis..."
                  value={feedback[result.name] || ''}
                  onChange={(e) => setFeedback(prev => ({
                    ...prev,
                    [result.name]: e.target.value
                  }))}
                />
                <button
                  onClick={() => handleFeedbackSubmit(result.name)}
                  className="mt-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 mt-8">
            No analysis results yet. Upload bank statements to begin.
          </div>
        )}
      </div>
      
    </div>
  );
}
