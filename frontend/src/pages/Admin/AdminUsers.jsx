import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSearch, FiTrash2, FiUserX, FiUserCheck } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function AdminUsers() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users', { params: { page, limit: 15, search } });
      setUsers(data.data || []);
      setMeta(data.meta);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleSuspend = async (id) => {
    try {
      const { data } = await api.put(`/admin/users/${id}/toggle-suspension`);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isSuspended: data.data.isSuspended } : u));
      toast.success(`User ${data.data.isSuspended ? 'suspended' : 'unsuspended'}`);
    } catch (err) { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user permanently?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success('User deleted');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">{t('admin.users')}</h1>
        {meta && <p className="text-sm text-gray-500">Total: {meta.total} users</p>}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, mobile..."
            className="input-field pl-10"
          />
        </div>
        <button type="submit" className="btn-primary px-5">Search</button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">User</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Mobile</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Role</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Profile</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Joined</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading...</td></tr>
              ) : users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-gradient flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
                        {user.profileId?.profilePhoto ? (
                          <img src={user.profileId.profilePhoto} alt="" className="w-full h-full object-cover" />
                        ) : user.firstName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.mobile}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      user.role === 'admin' ? 'bg-red-100 text-red-700' :
                      user.role === 'premium' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{user.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-gradient rounded-full" style={{ width: `${user.profileId?.completionScore || 0}%` }} />
                      </div>
                      <span className="text-xs text-gray-400">{user.profileId?.completionScore || 0}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.isSuspended ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {user.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {user.role !== 'admin' && (
                        <>
                          <button
                            onClick={() => handleToggleSuspend(user._id)}
                            className={`p-1.5 rounded-lg transition-colors ${user.isSuspended ? 'text-green-500 hover:bg-green-50' : 'text-orange-500 hover:bg-orange-50'}`}
                            title={user.isSuspended ? t('admin.unsuspend') : t('admin.suspend')}
                          >
                            {user.isSuspended ? <FiUserCheck /> : <FiUserX />}
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                            title={t('admin.delete')}
                          >
                            <FiTrash2 />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">Page {page} of {meta.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!meta.hasPrev}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50">
                Previous
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={!meta.hasNext}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
