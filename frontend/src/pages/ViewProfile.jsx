import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import {
  FiMapPin, FiBriefcase, FiHeart, FiBookmark, FiMessageSquare,
  FiCheckCircle, FiStar, FiFlag, FiShield,
} from 'react-icons/fi';
import { fetchProfileById, clearViewedProfile } from '../redux/slices/profileSlice';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ReportProfileModal from '../components/common/ReportProfileModal';
import AdBanner from '../components/common/AdBanner';
import SensitiveContent from '../components/common/SensitiveContent';

export default function ViewProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { viewedProfile, loading } = useSelector((s) => s.profile);
  const { user } = useSelector((s) => s.auth);
  const [activePhoto, setActivePhoto] = useState(0);
  const [interestSent, setInterestSent] = useState(false);
  const [shortlisted, setShortlisted] = useState(false);
  const [sendingInterest, setSendingInterest] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    dispatch(fetchProfileById(id));
    return () => dispatch(clearViewedProfile());
  }, [id, dispatch]);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/search');
  };

  const handleSendInterest = async () => {
    setSendingInterest(true);
    try {
      await api.post('/interests', { receiverId: id });
      setInterestSent(true);
      toast.success('Interest sent successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send interest');
    } finally { setSendingInterest(false); }
  };

  const handleStartChat = async () => {
    setStartingChat(true);
    try {
      const { data } = await api.get(`/messages/conversations/${id}`);
      navigate('/messages', { state: { openConversation: data.data } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start conversation');
    } finally { setStartingChat(false); }
  };

  const handleShortlist = async () => {
    try {
      if (shortlisted) {
        await api.delete(`/shortlist/${id}`);
        setShortlisted(false);
        toast.success('Removed from shortlist');
      } else {
        await api.post(`/shortlist/${id}`);
        setShortlisted(true);
        toast.success('Added to shortlist!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <LoadingSpinner text="Loading profile..." />;
  if (!viewedProfile) return (
    <div className="text-center py-20">
      <h3 className="text-xl font-semibold text-gray-700">Profile not found</h3>
      <button type="button" onClick={handleBack} className="btn-primary mt-4 inline-flex">Go Back</button>
    </div>
  );

  const p = viewedProfile;
  const photos = p.photos || [];
  const mainPhoto = photos[activePhoto]?.url || p.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.fullName || 'User')}&background=e91e8c&color=fff&size=400`;
  const displayCaste = p.displayCaste || (p.caste === 'Other' ? p.casteOther : p.caste);
  const professionStatus = p.professionVerification?.status;

  return (
    <div className="max-w-4xl animate-fade-in">
      <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-5">
        ← {t('common.back')}
      </button>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="aspect-[3/4] overflow-hidden">
              <img src={mainPhoto} alt={p.fullName} className="w-full h-full object-cover" />
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
                {photos.map((photo, i) => (
                  <button
                    key={photo._id}
                    type="button"
                    onClick={() => setActivePhoto(i)}
                    className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden ring-2 transition-all ${
                      activePhoto === i ? 'ring-primary-500' : 'ring-transparent'
                    }`}
                  >
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {user && user._id !== id && (
              <div className="p-4 space-y-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleSendInterest}
                  disabled={interestSent || sendingInterest}
                  className="btn-primary w-full"
                >
                  <FiHeart /> {interestSent ? 'Interest Sent!' : t('match.send_interest')}
                </button>
                <button
                  type="button"
                  onClick={handleStartChat}
                  disabled={startingChat}
                  className="btn-secondary w-full"
                >
                  <FiMessageSquare /> {startingChat ? 'Opening...' : 'Send Message'}
                </button>
                <button type="button" onClick={handleShortlist} className="btn-secondary w-full">
                  <FiBookmark /> {shortlisted ? 'Shortlisted ✓' : t('match.shortlist')}
                </button>
                <button type="button" onClick={() => setReportOpen(true)} className="w-full text-sm text-red-600 hover:bg-red-50 py-2 rounded-xl flex items-center justify-center gap-2">
                  <FiFlag /> Report Profile
                </button>
              </div>
            )}
          </div>
          <div className="mt-4">
            <AdBanner placement="profile" />
          </div>
        </div>

        <div className="lg:col-span-3 space-y-5">
          <div className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-heading font-bold text-gray-900">{p.fullName}</h1>
                  {p.isVerified && (
                    <span className="badge-verified"><FiCheckCircle /> {t('profile.verified')}</span>
                  )}
                  {professionStatus === 'verified' && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      <FiShield /> Profession Verified
                    </span>
                  )}
                </div>
                <p className="text-gray-500 mt-1">
                  {[p.age ? `${p.age} years` : null, p.religion, p.maritalStatus?.replace(/_/g, ' ')].filter(Boolean).join(' • ')}
                </p>
              </div>
              {p.isPremium && <span className="badge-premium shrink-0">⭐ Premium</span>}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              {p.city && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiMapPin className="text-primary-400" />
                  {p.city}, {p.state}
                </div>
              )}
              {p.occupation && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiBriefcase className="text-primary-400" />
                  {p.occupation}
                </div>
              )}
              {p.education && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiStar className="text-primary-400" />
                  {p.education}
                </div>
              )}
              {p.annualIncome && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-primary-400 font-bold">₹</span>
                  {p.annualIncome}
                </div>
              )}
            </div>

            {p.bio && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed">{p.bio}</p>
              </div>
            )}
          </div>

          <ProfileSection title={t('profile.personal_details')}>
            <DetailGrid>
              <Detail label="Height" value={p.height ? `${p.height} cm` : null} />
              <Detail label="Weight" value={p.weight ? `${p.weight} kg` : null} />
              <Detail label={t('profile.religion')} value={p.religion} />
              <Detail label={t('profile.caste')} value={displayCaste} />
              <Detail label={t('profile.mother_tongue')} value={p.motherTongue} />
              <Detail label="Native Place" value={p.nativePlace} />
              <Detail label="Native Village" value={p.nativeVillage} />
            </DetailGrid>
          </ProfileSection>

          {(p.education || p.occupation) && (
            <ProfileSection title={t('profile.professional_details')}>
              <DetailGrid>
                <Detail label={t('profile.education')} value={p.education} />
                <Detail label={t('profile.occupation')} value={p.occupation} />
                <Detail label={t('profile.company')} value={p.company} />
                <Detail label={t('profile.annual_income')} value={p.annualIncome} />
              </DetailGrid>
            </ProfileSection>
          )}

          {(p.fatherName || p.motherName || p.familyType) && (
            <ProfileSection title={t('profile.family_details')}>
              <SensitiveContent>
                <DetailGrid>
                  <Detail label="Father" value={p.fatherName} />
                  <Detail label="Father's Occupation" value={p.fatherOccupation} />
                  <Detail label="Mother" value={p.motherName} />
                  <Detail label="Mother's Occupation" value={p.motherOccupation} />
                  <Detail label="Family Type" value={p.familyType} />
                  <Detail label="Family Status" value={p.familyStatus?.replace(/_/g, ' ')} />
                  <Detail label="Siblings" value={p.siblings != null ? String(p.siblings) : null} />
                </DetailGrid>
              </SensitiveContent>
            </ProfileSection>
          )}

          {(p.ownHouse || p.ownCar || p.landPropertyDetails) && (
            <ProfileSection title="Property / Background">
              <DetailGrid>
                <Detail label="Own House" value={p.ownHouse ? 'Yes' : 'No'} />
                <Detail label="Own Car" value={p.ownCar ? 'Yes' : 'No'} />
                <Detail label="Land / Property" value={p.landPropertyDetails} />
              </DetailGrid>
            </ProfileSection>
          )}

          {(p.diet || p.smoking) && (
            <ProfileSection title={t('profile.lifestyle')}>
              <DetailGrid>
                <Detail label={t('profile.diet')} value={p.diet?.replace(/_/g, ' ')} />
                <Detail label={t('profile.smoking')} value={p.smoking} />
                <Detail label={t('profile.drinking')} value={p.drinking} />
              </DetailGrid>
            </ProfileSection>
          )}

          {p.hobbies?.length > 0 && (
            <ProfileSection title={t('profile.hobbies')}>
              <div className="flex flex-wrap gap-2">
                {p.hobbies.map((h) => (
                  <span key={h} className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-sm border border-primary-100">{h}</span>
                ))}
              </div>
            </ProfileSection>
          )}

          {p.interests?.length > 0 && (
            <ProfileSection title={t('profile.interests')}>
              <div className="flex flex-wrap gap-2">
                {p.interests.map((h) => (
                  <span key={h} className="px-3 py-1 bg-secondary-50 text-secondary-700 rounded-full text-sm border border-secondary-100">{h}</span>
                ))}
              </div>
            </ProfileSection>
          )}
        </div>
      </div>

      {reportOpen && (
        <ReportProfileModal
          reportedUserId={id}
          onClose={() => setReportOpen(false)}
        />
      )}
    </div>
  );
}

function ProfileSection({ title, children }) {
  return (
    <div className="card p-5">
      <h3 className="font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">{title}</h3>
      {children}
    </div>
  );
}

function DetailGrid({ children }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function Detail({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-gray-800 mt-0.5 capitalize">{value}</p>
    </div>
  );
}
