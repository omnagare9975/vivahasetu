import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [professionQueue, setProfessionQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('reports');

  const load = async () => {
    setLoading(true);
    try {
      const [r, p] = await Promise.all([
        api.get('/admin/reports', { params: { status: 'pending' } }),
        api.get('/admin/profession-verifications'),
      ]);
      setReports(r.data.data || []);
      setProfessionQueue(p.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateReport = async (id, status) => {
    try {
      await api.put(`/admin/reports/${id}`, { status });
      toast.success(`Report ${status}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const updateProfession = async (id, status) => {
    try {
      await api.put(`/admin/profession-verifications/${id}`, { status });
      toast.success(`Profession ${status}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <LoadingSpinner text="Loading..." />;

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-900 mb-6">Reports & Profession Verification</h1>
      <div className="flex gap-2 mb-6">
        <button type="button" onClick={() => setTab('reports')} className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === 'reports' ? 'bg-primary-gradient text-white' : 'bg-gray-100'}`}>
          Profile Reports ({reports.length})
        </button>
        <button type="button" onClick={() => setTab('profession')} className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === 'profession' ? 'bg-primary-gradient text-white' : 'bg-gray-100'}`}>
          Profession Docs ({professionQueue.length})
        </button>
      </div>

      {tab === 'reports' ? (
        <div className="space-y-3">
          {reports.length === 0 ? <p className="text-gray-500">No pending reports.</p> : reports.map((r) => (
            <div key={r._id} className="card p-4">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">
                    {r.reporterId?.firstName} → {r.reportedUserId?.firstName} {r.reportedUserId?.lastName}
                  </p>
                  <p className="text-sm text-gray-500 mt-1 capitalize">{r.reason?.replace(/_/g, ' ')}</p>
                  {r.description && <p className="text-sm text-gray-600 mt-2">{r.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => updateReport(r._id, 'resolved')} className="btn-primary text-sm px-3 py-1.5">Resolve</button>
                  <button type="button" onClick={() => updateReport(r._id, 'dismissed')} className="btn-secondary text-sm px-3 py-1.5">Dismiss</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {professionQueue.length === 0 ? <p className="text-gray-500">No pending profession documents.</p> : professionQueue.map((p) => (
            <div key={p._id} className="card p-4">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">{p.fullName || p.userId?.firstName}</p>
                  <p className="text-sm text-gray-500">{p.occupation} · {p.company}</p>
                  {p.professionVerification?.documentUrl && (
                    <a
                      href={p.professionVerification.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary-600 underline mt-2 inline-block"
                    >
                      View document (admin only)
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => updateProfession(p._id, 'verified')} className="btn-primary text-sm px-3 py-1.5">Verify</button>
                  <button type="button" onClick={() => updateProfession(p._id, 'rejected')} className="btn-secondary text-sm px-3 py-1.5">Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
