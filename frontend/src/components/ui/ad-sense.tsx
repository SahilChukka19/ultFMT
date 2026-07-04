export function AdSensePlaceholder() {
  return (
    <div className="mt-auto w-full pt-6">
      <div className="bg-white border border-slate-200 rounded-md flex flex-col items-center justify-center p-4 text-slate-600 min-h-[120px] relative overflow-hidden group">
        <span className="text-[9px] font-bold uppercase tracking-widest absolute top-2 left-2 bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">Advertisement</span>
        
        {/* Placeholder for actual AdSense script/ins tag */}
        <div className="flex flex-col items-center opacity-60 group-hover:opacity-100 transition-opacity">
          <svg className="w-6 h-6 mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <span className="text-sm font-medium">AdSense Space</span>
          <span className="text-[10px] mt-0.5 text-slate-400">Responsive Display Unit</span>
        </div>
      </div>
    </div>
  );
}
