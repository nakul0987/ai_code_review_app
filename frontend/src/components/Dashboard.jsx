import React, { useState, useEffect } from 'react';

export default function Dashboard({ user, onLogout }) {
  const [code, setCode] = useState('');
  const [lang, setLang] = useState('cpp');
  const [title, setTitle] = useState('');
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/review/history/${user.id}`);
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Drag and drop file reading logic
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    const reader = new FileReader();
    setTitle(file.name);
    // Detect extension language automatically
    const ext = file.name.split('.').pop();
    if (['cpp', 'h', 'hpp'].includes(ext)) setLang('cpp');
    else if (['java'].includes(ext)) setLang('java');
    else if (['py'].includes(ext)) setLang('python');
    else if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) setLang('javascript');

    reader.onload = (e) => setCode(e.target.result);
    reader.readAsText(file);
  };

  const submitReview = async () => {
    if (!code.trim()) return alert('Please enter or upload code first.');
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/review/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: title || 'Pasted Code Snippet',
          codeSnippet: code,
          language: lang
        })
      });
      const data = await res.json();
      setSelectedReview(data);
      fetchHistory();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Delete this review history item?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/review/${id}`, { method: 'DELETE' });
      if (selectedReview?._id === id) setSelectedReview(null);
      fetchHistory();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navbar Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-base">🔍</div>
          <h1 className="text-xl font-bold tracking-tight">AI Code Reviewer Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-300 text-sm">Welcome, <strong className="text-indigo-400">{user.name}</strong></span>
          <button onClick={onLogout} className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700">Logout</button>
        </div>
      </header>

      {/* Workspace Grid Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden">
        
        {/* Left Side: Submit Panel & Left Sidebar History */}
        <section className="lg:col-span-5 flex flex-col gap-6 max-h-[85vh] overflow-y-auto pr-1">
          {/* Submission Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">📂 Upload or Paste Code</h2>
            
            {/* Draggable upload area */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer mb-4 transition ${
                dragActive ? 'border-indigo-500 bg-indigo-950/20' : 'border-slate-700 hover:border-slate-500 bg-slate-950'
              }`}
              onClick={() => document.getElementById('file-upload-input').click()}
            >
              <input id="file-upload-input" type="file" className="hidden" onChange={handleFileInput} />
              <p className="text-sm text-slate-300">Drag & Drop code files here or <span className="text-indigo-400 underline font-medium">browse</span></p>
              <p className="text-xs text-slate-500 mt-1">Supports .cpp, .java, .py, .js files</p>
            </div>

            {/* Inputs & Config */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-400 mb-1">Snippet Title</label>
                <input 
                  type="text" 
                  placeholder="e.g., QuickSort logic" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-400 mb-1">Language</label>
                <select 
                  value={lang} 
                  onChange={(e) => setLang(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs focus:border-indigo-500 outline-none"
                >
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>
            </div>

            {/* Raw code input */}
            <div className="relative mb-4">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Paste or write your source code here..."
                rows="10"
                className="w-full font-mono text-xs bg-slate-950 border border-slate-800 rounded-lg p-3 outline-none focus:border-indigo-500 resize-y"
              />
            </div>

            <button 
              onClick={submitReview}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm py-2 rounded-lg transition disabled:bg-indigo-800/40"
            >
              {loading ? 'Analyzing Code...' : 'Perform Dual Stage Review'}
            </button>
          </div>

          {/* History Sidebar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex-1 overflow-hidden flex flex-col">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Previous Reviews</h3>
            <div className="space-y-2 overflow-y-auto flex-1">
              {reviews.map((rev) => (
                <div 
                  key={rev._id}
                  onClick={() => setSelectedReview(rev)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition flex justify-between items-center ${
                    selectedReview?._id === rev._id ? 'bg-indigo-950/40 border-indigo-500' : 'bg-slate-950/50 border-slate-800 hover:bg-slate-950'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200 truncate max-w-[180px]">{rev.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tight">{rev.language} • {rev.complexityAnalysis?.linesOfCode} lines</p>
                  </div>
                  <button 
                    onClick={(e) => deleteReview(rev._id, e)} 
                    className="text-slate-500 hover:text-red-400 transition p-1"
                    title="Delete record"
                  >
                    🗑️
                  </button>
                </div>
              ))}
              {reviews.length === 0 && <p className="text-xs text-slate-500 text-center py-6">No previous analysis history found</p>}
            </div>
          </div>
        </section>

        {/* Right Side: Detailed Review Panel */}
        <section className="lg:col-span-7 flex flex-col max-h-[85vh] overflow-y-auto">
          {selectedReview ? (
            <div className="space-y-6">
              {/* Header Details */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-white">{selectedReview.title}</h2>
                  <span className="bg-indigo-950/80 text-indigo-400 text-xs px-2.5 py-1 rounded border border-indigo-800 uppercase tracking-wide font-bold">{selectedReview.language}</span>
                </div>
                <p className="text-xs text-slate-500">Completed: {new Date(selectedReview.createdAt).toLocaleString()}</p>
              </div>

              {/* Grid: Complexity & Code metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Cyclomatic Complexity</span>
                  <span className="text-lg font-bold text-indigo-400 mt-1 block">{selectedReview.complexityAnalysis?.cyclomaticComplexity}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Lines of Code</span>
                  <span className="text-lg font-bold text-indigo-400 mt-1 block">{selectedReview.complexityAnalysis?.linesOfCode}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 col-span-2 sm:col-span-1">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Functions / Classes</span>
                  <span className="text-lg font-bold text-indigo-400 mt-1 block">
                    {selectedReview.complexityAnalysis?.numberOfFunctions || 0} / {selectedReview.complexityAnalysis?.numberOfClasses || 0}
                  </span>
                </div>
              </div>

              {/* Stage 1: Static Code Errors */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
                <h3 className="text-sm font-bold uppercase text-slate-300 tracking-wider mb-4 border-b border-slate-800 pb-2">🚨 Stage 1: Static Code Analysis</h3>
                {selectedReview.staticAnalysis?.length > 0 ? (
                  <div className="space-y-3">
                    {selectedReview.staticAnalysis.map((item, idx) => (
                      <div key={idx} className="flex gap-3 bg-red-950/20 border border-red-900/60 p-3 rounded-lg text-sm">
                        <span className="text-red-400 font-bold">[{item.type}]</span>
                        <p className="text-red-200">{item.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-green-400">No static analysis compiler violations found.</p>
                )}
              </div>

              {/* Stage 2: Detailed AI review cards */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
                <h3 className="text-sm font-bold uppercase text-indigo-400 tracking-wider border-b border-slate-800 pb-2">🤖 Stage 2: AI-Based Review</h3>
                
                {/* Bug and security lists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-lg">
                    <h4 className="text-xs font-bold text-red-400 mb-2 uppercase">Bug Reports</h4>
                    <ul className="list-disc pl-4 text-xs text-slate-300 space-y-1.5">
                      {selectedReview.aiFeedback?.bugReports?.map((msg, i) => <li key={i}>{msg}</li>)}
                    </ul>
                  </div>

                  <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-lg">
                    <h4 className="text-xs font-bold text-yellow-400 mb-2 uppercase">Security Warnings</h4>
                    <ul className="list-disc pl-4 text-xs text-slate-300 space-y-1.5">
                      {selectedReview.aiFeedback?.securityRecommendations?.map((msg, i) => <li key={i}>{msg}</li>)}
                    </ul>
                  </div>
                </div>

                {/* Optimizations & Code Smells */}
                <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-lg">
                  <h4 className="text-xs font-bold text-indigo-300 mb-2 uppercase">Optimization & Performance Suggestions</h4>
                  <ul className="list-disc pl-4 text-xs text-slate-300 space-y-2">
                    {selectedReview.aiFeedback?.optimizationSuggestions?.map((msg, i) => <li key={i}>{msg}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-xl border-dashed flex flex-col items-center justify-center p-8 text-center">
              <span className="text-4xl mb-4">🔮</span>
              <h3 className="text-base font-bold text-slate-300">No review selected</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">Select a previous review from history sidebar or paste fresh lines to perform compile checks.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}