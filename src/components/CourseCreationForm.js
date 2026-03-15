import React, { useState } from 'react';

const CourseCreationForm = () => {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [semester, setSemester] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const resetForm = () => {
    setTitle('');
    setCode('');
    setDescription('');
    setSemester(''); 
    setYear(new Date().getFullYear().toString()); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);
    
    if (!title || !code || !semester || !year) {
      setMessage('Required Fields Missing: Title, Code, Semester, Year.');
      setIsError(true);
      setLoading(false);
      return;
    }

    try {
      const payload = { 
        title, 
        code: code.toUpperCase(), 
        description, 
        semester, 
        year 
      };

      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`SUCCESS: Domain "${data.course.title}" authorized.`);
        setIsError(false);
        resetForm(); 
      } else {
        setMessage(`FAILURE: ${data.message || 'Domain initialization failed.'}`);
        setIsError(true);
      }
    } catch (error) {
      setMessage('CRITICAL: Unexpected uplink disruption.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
      <div className="bg-white rounded-[50px] shadow-[0_50px_100px_-20px_rgba(79,70,229,0.15)] border border-gray-50 overflow-hidden relative">
        <div className="bg-gray-900 p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full translate-x-20 -translate-y-20 blur-3xl animate-pulse"></div>
          <div className="relative z-10 space-y-3">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">Sector Initialization Unit</span>
             </div>
             <h2 className="text-5xl font-black tracking-tighter leading-none uppercase italic italic-shadow">Start New <span className="text-indigo-500">Domain</span></h2>
             <p className="text-gray-400 font-bold text-xs uppercase tracking-widest max-w-sm">Establish new academic parameters and strategic curriculum matrices.</p>
          </div>
        </div>
        
        <div className="p-12">
          {message && (
            <div className={`mb-12 p-6 rounded-3xl text-[11px] font-black uppercase tracking-widest text-center border-2 transform transition-all animate-in zoom-in-95 ${isError ? 'bg-rose-50 border-rose-100 text-rose-600 shadow-rose-100/50' : 'bg-emerald-50 border-emerald-100 text-emerald-600 shadow-emerald-100/50'}`}>
               <div className="flex items-center justify-center gap-4">
                  {isError ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  )}
                  {message}
               </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 italic">Strategic Domain Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
                placeholder="e.g. ADVANCED NEURAL ARCHITECTURES"
                className="w-full px-8 py-6 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50 rounded-[32px] outline-none transition-all font-black text-gray-900 placeholder:text-gray-200 text-xl uppercase italic shadow-inner"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 italic">Sector Logic Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  disabled={loading}
                  maxLength={10}
                  placeholder="CSC101"
                  className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50 rounded-[28px] outline-none transition-all font-black text-indigo-600 placeholder:text-gray-200 text-lg uppercase tracking-widest shadow-inner text-center italic"
                />
              </div>

              <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 italic">Operational Phase</label>
                <div className="relative">
                  <select 
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50 rounded-[28px] outline-none transition-all font-black text-gray-700 appearance-none cursor-pointer shadow-inner uppercase italic text-sm"
                  >
                    <option value="" disabled>-- SELECT PHASE --</option>
                    <option value="FIRST">PRIMARY PHASE (1ST SEM)</option>
                    <option value="SECOND">SECONDARY PHASE (2ND SEM)</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 italic">Temporal Vector (Year)</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                  disabled={loading}
                  min="2020"
                  max={new Date().getFullYear() + 2}
                  className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50 rounded-[28px] outline-none transition-all font-black text-gray-900 shadow-inner text-center text-xl italic"
                />
              </div>
            </div>

            <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 italic">Domain Narrative Overview</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows="5"
                placeholder="Establish the core objectives and tactical scope of this domain..."
                className="w-full px-8 py-6 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50 rounded-[32px] outline-none transition-all resize-none shadow-inner font-medium text-gray-700 placeholder:text-gray-300 italic"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full py-8 font-black rounded-[40px] shadow-[0_30px_60px_-15px_rgba(79,70,229,0.3)] transition-all transform active:scale-95 uppercase tracking-[0.4em] text-sm flex items-center justify-center gap-6 group ${loading ? 'bg-gray-100 text-gray-300' : 'bg-indigo-600 text-white hover:bg-black hover:shadow-black/20'}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Initializing Domain Matrix...
                </>
              ) : (
                <>
                  Authorize Domain
                  <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      
      <div className="mt-12 flex justify-center items-center gap-4 opacity-10">
         <div className="h-[2px] w-20 bg-indigo-900 rounded-full"></div>
         <p className="text-[12px] font-black uppercase tracking-[1em]">Secure Environment</p>
         <div className="h-[2px] w-20 bg-indigo-900 rounded-full"></div>
      </div>
    </div>
  );
};

export default CourseCreationForm;