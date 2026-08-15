import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiCamera, FiTrash2, FiStar, FiCheck, FiUpload, FiShield, FiChevronDown } from 'react-icons/fi';
import {
  fetchMyProfile, updateProfile, uploadPhoto, deletePhoto, setProfilePhoto,
  uploadProfessionDocument,
} from '../redux/slices/profileSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  RELIGIONS, STATES, MOTHER_TONGUES, EDUCATION_LIST, OCCUPATIONS, ANNUAL_INCOMES, CASTES,
} from '../utils/constants';
import { validateIndianMobile } from '../utils/phone';

const TABS = ['personal', 'professional', 'lifestyle', 'family', 'about', 'preferences', 'photos'];

const splitCsv = (v) => (typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : (v || []));
const joinCsv = (arr) => (Array.isArray(arr) ? arr.join(', ') : '');

export default function EditProfile() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { myProfile, photos, loading, updating } = useSelector((s) => s.profile);
  const [activeTab, setActiveTab] = useState('personal');
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm();
  const [uploading, setUploading] = useState(false);
  const [docUploading, setDocUploading] = useState(false);

  const casteValue = useWatch({ control, name: 'caste' });
  const hasSiblingOnApp = useWatch({ control, name: 'hasSiblingOnApp' });

  useEffect(() => {
    dispatch(fetchMyProfile());
  }, [dispatch]);

  useEffect(() => {
    if (myProfile) {
      const prefs = myProfile.partnerPreferences || {};
      reset({
        fullName: myProfile.fullName,
        maritalStatus: myProfile.maritalStatus,
        height: myProfile.height,
        weight: myProfile.weight,
        religion: myProfile.religion,
        caste: CASTES.includes(myProfile.caste) ? myProfile.caste : (myProfile.caste ? 'Other' : ''),
        casteOther: CASTES.includes(myProfile.caste) && myProfile.caste !== 'Other'
          ? (myProfile.casteOther || '')
          : (myProfile.casteOther || (myProfile.caste && !CASTES.includes(myProfile.caste) ? myProfile.caste : '')),
        subCaste: myProfile.subCaste,
        motherTongue: myProfile.motherTongue,
        city: myProfile.city,
        state: myProfile.state,
        country: myProfile.country || 'India',
        nativePlace: myProfile.nativePlace,
        nativeVillage: myProfile.nativeVillage,
        education: myProfile.education,
        educationDetails: myProfile.educationDetails,
        occupation: myProfile.occupation,
        company: myProfile.company,
        annualIncome: myProfile.annualIncome,
        workLocation: myProfile.workLocation,
        diet: myProfile.diet,
        smoking: myProfile.smoking,
        drinking: myProfile.drinking,
        fatherName: myProfile.fatherName,
        fatherPhone: myProfile.fatherPhone,
        fatherOccupation: myProfile.fatherOccupation,
        motherName: myProfile.motherName,
        motherPhone: myProfile.motherPhone,
        motherOccupation: myProfile.motherOccupation,
        familyType: myProfile.familyType,
        familyStatus: myProfile.familyStatus,
        siblings: myProfile.siblings,
        siblingDetailsText: formatMembers(myProfile.siblingDetails),
        otherFamilyText: formatMembers(myProfile.otherFamilyMembers),
        hasSiblingOnApp: myProfile.hasSiblingOnApp || false,
        siblingEmail: '',
        siblingRelationship: 'brother',
        ownHouse: myProfile.ownHouse || false,
        ownCar: myProfile.ownCar || false,
        landPropertyDetails: myProfile.landPropertyDetails,
        bio: myProfile.bio,
        hobbies: joinCsv(myProfile.hobbies),
        interests: joinCsv(myProfile.interests),
        'partnerPreferences.ageMin': prefs.ageMin,
        'partnerPreferences.ageMax': prefs.ageMax,
        'partnerPreferences.education': joinCsv(prefs.education),
        'partnerPreferences.profession': joinCsv(prefs.profession || prefs.occupation),
        'partnerPreferences.language': joinCsv(prefs.language),
        'partnerPreferences.state': joinCsv(prefs.state || prefs.location),
        'partnerPreferences.interests': joinCsv(prefs.interests),
        'partnerPreferences.hobbies': joinCsv(prefs.hobbies),
      });
    }
  }, [myProfile, reset]);

  const onSubmit = async (data) => {
    const phoneFields = [
      ['fatherPhone', data.fatherPhone],
      ['motherPhone', data.motherPhone],
    ];
    for (const [label, val] of phoneFields) {
      if (val && !validateIndianMobile(val)) {
        toast.error(`${label} must be a valid 10-digit Indian mobile number`);
        return;
      }
    }

    data.hobbies = splitCsv(data.hobbies);
    data.interests = splitCsv(data.interests);
    data.siblingDetails = parseMembers(data.siblingDetailsText);
    data.otherFamilyMembers = parseMembers(data.otherFamilyText);
    delete data.siblingDetailsText;
    delete data.otherFamilyText;

    data.ownHouse = Boolean(data.ownHouse);
    data.ownCar = Boolean(data.ownCar);
    data.hasSiblingOnApp = Boolean(data.hasSiblingOnApp);

    const linkedSiblings = [...(myProfile?.linkedSiblings || [])];
    if (data.hasSiblingOnApp && data.siblingEmail?.trim()) {
      linkedSiblings.push({
        email: data.siblingEmail.trim(),
        relationship: data.siblingRelationship || 'other',
      });
    }
    if (data.hasSiblingOnApp) {
      data.linkedSiblings = linkedSiblings.map((s) => ({
        userId: s.userId?._id || s.userId,
        email: s.email,
        relationship: s.relationship,
      })).filter((s) => s.userId || s.email);
    } else {
      data.linkedSiblings = [];
    }
    delete data.siblingEmail;
    delete data.siblingRelationship;

    data.partnerPreferences = {
      ageMin: data['partnerPreferences.ageMin'] || undefined,
      ageMax: data['partnerPreferences.ageMax'] || undefined,
      education: splitCsv(data['partnerPreferences.education']),
      profession: splitCsv(data['partnerPreferences.profession']),
      occupation: splitCsv(data['partnerPreferences.profession']),
      language: splitCsv(data['partnerPreferences.language']),
      state: splitCsv(data['partnerPreferences.state']),
      location: splitCsv(data['partnerPreferences.state']),
      interests: splitCsv(data['partnerPreferences.interests']),
      hobbies: splitCsv(data['partnerPreferences.hobbies']),
    };
    Object.keys(data).forEach((k) => {
      if (k.startsWith('partnerPreferences.')) delete data[k];
    });

    if (data.caste === 'Other' && !data.casteOther?.trim()) {
      toast.error('Please enter your caste');
      return;
    }

    const result = await dispatch(updateProfile(data));
    if (updateProfile.fulfilled.match(result)) {
      toast.success(t('profile.save') + ' successful!');
    } else {
      toast.error(result.payload || 'Update failed');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('photo', file);
    const result = await dispatch(uploadPhoto(formData));
    setUploading(false);
    if (uploadPhoto.fulfilled.match(result)) toast.success('Photo uploaded!');
    else toast.error(result.payload || 'Upload failed');
  };

  const handleProfessionDoc = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDocUploading(true);
    const formData = new FormData();
    formData.append('document', file);
    const result = await dispatch(uploadProfessionDocument(formData));
    setDocUploading(false);
    if (uploadProfessionDocument.fulfilled.match(result)) {
      toast.success('Document submitted for verification');
      dispatch(fetchMyProfile());
    } else {
      toast.error(result.payload || 'Upload failed');
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!confirm('Delete this photo?')) return;
    await dispatch(deletePhoto(photoId));
    toast.success('Photo deleted');
  };

  const handleSetProfile = async (photoId) => {
    await dispatch(setProfilePhoto(photoId));
    toast.success('Profile photo updated!');
  };

  if (loading) return <LoadingSpinner text="Loading profile..." />;

  const tabLabels = {
    personal: t('profile.personal_details'),
    professional: t('profile.professional_details'),
    lifestyle: t('profile.lifestyle'),
    family: t('profile.family_details'),
    about: t('profile.about_me'),
    preferences: t('profile.partner_preferences'),
    photos: t('profile.photos'),
  };

  const verificationStatus = myProfile?.professionVerification?.status || 'not_verified';

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">{t('profile.edit_profile')}</h1>
        {myProfile && (
          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-xs">
              <div
                className="h-full bg-primary-gradient rounded-full transition-all"
                style={{ width: `${myProfile.completionScore}%` }}
              />
            </div>
            <span className="text-sm text-gray-500">{t('profile.completion')}: {myProfile.completionScore}%</span>
          </div>
        )}
      </div>

      {/* Tab Navigation — dropdown on mobile, pills on desktop */}
      <div className="mb-5">
        <div className="md:hidden relative">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-200 rounded-2xl px-4 py-3.5 pr-10 text-sm font-semibold text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            {TABS.map((tab) => (
              <option key={tab} value={tab}>{tabLabels[tab]}</option>
            ))}
          </select>
          <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        <div className="hidden md:flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-primary-gradient text-white shadow-sm'
                  : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {activeTab !== 'photos' ? (
          <div className="card p-4 md:p-6">
            {activeTab === 'personal' && (
              <PersonalFields register={register} errors={errors} t={t} casteValue={casteValue} />
            )}
            {activeTab === 'professional' && (
              <ProfessionalFields
                register={register}
                t={t}
                verificationStatus={verificationStatus}
                onDocUpload={handleProfessionDoc}
                docUploading={docUploading}
              />
            )}
            {activeTab === 'lifestyle' && <LifestyleFields register={register} t={t} />}
            {activeTab === 'family' && (
              <FamilyFields
                register={register}
                t={t}
                hasSiblingOnApp={hasSiblingOnApp}
                linkedSiblings={myProfile?.linkedSiblings}
              />
            )}
            {activeTab === 'about' && <AboutFields register={register} t={t} />}
            {activeTab === 'preferences' && <PreferenceFields register={register} t={t} />}

            <div className="mt-6 pt-5 border-t border-gray-100 flex justify-end">
              <button type="submit" disabled={updating} className="btn-primary px-8">
                {updating ? <LoadingSpinner size="sm" /> : null}
                {t('profile.save')}
              </button>
            </div>
          </div>
        ) : (
          <PhotosTab
            photos={photos}
            onUpload={handlePhotoUpload}
            onDelete={handleDeletePhoto}
            onSetProfile={handleSetProfile}
            uploading={uploading}
            t={t}
          />
        )}
      </form>
    </div>
  );
}

function formatMembers(list) {
  if (!list?.length) return '';
  return list.map((m) => [m.name, m.relationship, m.phone, m.maritalStatus].filter(Boolean).join(' | ')).join('\n');
}

function parseMembers(text) {
  if (!text?.trim()) return [];
  return text.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
    const [name, relationship, phone, maritalStatus] = line.split('|').map((s) => s.trim());
    return { name, relationship, phone, maritalStatus };
  });
}

function FormField({ label, children, hint }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function PersonalFields({ register, errors, t, casteValue }) {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <FormField label={t('profile.full_name')}>
        <input {...register('fullName')} className="input-field" placeholder="Full Name" />
      </FormField>
      <FormField label={t('profile.marital_status')}>
        <select {...register('maritalStatus')} className="input-field">
          <option value="">Select</option>
          <option value="never_married">{t('profile.never_married')}</option>
          <option value="divorced">{t('profile.divorced')}</option>
          <option value="widowed">{t('profile.widowed')}</option>
          <option value="awaiting_divorce">{t('profile.awaiting_divorce')}</option>
        </select>
      </FormField>
      <FormField label={`${t('profile.height')} (cm)`}>
        <input {...register('height', { valueAsNumber: true })} type="number" min={140} max={220} className="input-field" />
      </FormField>
      <FormField label={`${t('profile.weight')} (kg)`}>
        <input {...register('weight', { valueAsNumber: true })} type="number" min={40} max={150} className="input-field" />
      </FormField>
      <FormField label={t('profile.religion')}>
        <select {...register('religion')} className="input-field">
          <option value="">Select</option>
          {RELIGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </FormField>
      <FormField label={t('profile.caste')}>
        <select {...register('caste')} className="input-field">
          <option value="">Select</option>
          {CASTES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </FormField>
      {casteValue === 'Other' && (
        <FormField label="Enter your caste">
          <input {...register('casteOther', { required: casteValue === 'Other' })} className="input-field" placeholder="Your caste" />
          {errors.casteOther && <p className="text-red-500 text-xs mt-1">Required</p>}
        </FormField>
      )}
      <FormField label="Sub Caste">
        <input {...register('subCaste')} className="input-field" placeholder="Optional" />
      </FormField>
      <FormField label={t('profile.mother_tongue')}>
        <select {...register('motherTongue')} className="input-field">
          <option value="">Select</option>
          {MOTHER_TONGUES.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </FormField>
      <FormField label={t('profile.city')}>
        <input {...register('city')} className="input-field" placeholder="Mumbai" />
      </FormField>
      <FormField label={t('profile.state')}>
        <select {...register('state')} className="input-field">
          <option value="">Select</option>
          {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </FormField>
      <FormField label={t('profile.country')}>
        <input {...register('country')} className="input-field" />
      </FormField>
      <FormField label="Native Place / Home Town">
        <input {...register('nativePlace')} className="input-field" placeholder="City / town" />
      </FormField>
      <FormField label="Native Village">
        <input {...register('nativeVillage')} className="input-field" placeholder="Village name" />
      </FormField>
    </div>
  );
}

function VerificationBadge({ status }) {
  const map = {
    verified: { label: 'Verified', className: 'bg-green-50 text-green-700 border-green-200' },
    pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200' },
    not_verified: { label: 'Not Verified', className: 'bg-gray-50 text-gray-600 border-gray-200' },
  };
  const item = map[status] || map.not_verified;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${item.className}`}>
      <FiShield /> {item.label}
    </span>
  );
}

function ProfessionalFields({ register, t, verificationStatus, onDocUpload, docUploading }) {
  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        <FormField label={t('profile.education')}>
          <select {...register('education')} className="input-field">
            <option value="">Select</option>
            {EDUCATION_LIST.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </FormField>
        <FormField label="Education Details">
          <input {...register('educationDetails')} className="input-field" placeholder="College/University" />
        </FormField>
        <FormField label={t('profile.occupation')}>
          <select {...register('occupation')} className="input-field">
            <option value="">Select</option>
            {OCCUPATIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </FormField>
        <FormField label={t('profile.company')}>
          <input {...register('company')} className="input-field" />
        </FormField>
        <FormField label={t('profile.annual_income')}>
          <select {...register('annualIncome')} className="input-field">
            <option value="">Select</option>
            {ANNUAL_INCOMES.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </FormField>
        <FormField label="Work Location">
          <input {...register('workLocation')} className="input-field" />
        </FormField>
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h4 className="font-semibold text-gray-800 text-sm">Profession Verification</h4>
            <p className="text-xs text-gray-500 mt-0.5">Upload ID/proof of employment. Documents are never shown publicly.</p>
          </div>
          <VerificationBadge status={verificationStatus} />
        </div>
        <label className={`btn-secondary text-sm cursor-pointer inline-flex ${docUploading ? 'opacity-60 pointer-events-none' : ''}`}>
          <FiUpload /> {docUploading ? 'Uploading...' : 'Upload Document'}
          <input type="file" accept="image/*,.pdf" onChange={onDocUpload} className="hidden" disabled={docUploading} />
        </label>
      </div>
    </div>
  );
}

function LifestyleFields({ register, t }) {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <FormField label={t('profile.diet')}>
        <select {...register('diet')} className="input-field">
          <option value="">Select</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="non_vegetarian">Non-Vegetarian</option>
          <option value="eggetarian">Eggetarian</option>
          <option value="jain">Jain</option>
          <option value="vegan">Vegan</option>
        </select>
      </FormField>
      <FormField label={t('profile.smoking')}>
        <select {...register('smoking')} className="input-field">
          <option value="">Select</option>
          <option value="no">No</option>
          <option value="occasionally">Occasionally</option>
          <option value="yes">Yes</option>
        </select>
      </FormField>
      <FormField label={t('profile.drinking')}>
        <select {...register('drinking')} className="input-field">
          <option value="">Select</option>
          <option value="no">No</option>
          <option value="occasionally">Occasionally</option>
          <option value="yes">Yes</option>
        </select>
      </FormField>
    </div>
  );
}

function FamilyFields({ register, t, hasSiblingOnApp, linkedSiblings }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-5">
        <FormField label="Father's Name">
          <input {...register('fatherName')} className="input-field" />
        </FormField>
        <FormField label="Father's Phone" hint="Private ΓÇö not shown on public profile">
          <input
            {...register('fatherPhone', {
              validate: (v) => !v || validateIndianMobile(v) || 'Enter 10-digit Indian mobile',
            })}
            className="input-field sensitive-field"
            placeholder="10-digit mobile"
            inputMode="numeric"
            maxLength={10}
          />
        </FormField>
        <FormField label="Father's Occupation">
          <input {...register('fatherOccupation')} className="input-field" />
        </FormField>
        <FormField label="Mother's Name">
          <input {...register('motherName')} className="input-field" />
        </FormField>
        <FormField label="Mother's Phone" hint="Private ΓÇö not shown on public profile">
          <input
            {...register('motherPhone', {
              validate: (v) => !v || validateIndianMobile(v) || 'Enter 10-digit Indian mobile',
            })}
            className="input-field sensitive-field"
            placeholder="10-digit mobile"
            inputMode="numeric"
            maxLength={10}
          />
        </FormField>
        <FormField label="Mother's Occupation">
          <input {...register('motherOccupation')} className="input-field" />
        </FormField>
        <FormField label="Family Type">
          <select {...register('familyType')} className="input-field">
            <option value="">Select</option>
            <option value="nuclear">Nuclear</option>
            <option value="joint">Joint</option>
            <option value="extended">Extended</option>
          </select>
        </FormField>
        <FormField label="Family Status">
          <select {...register('familyStatus')} className="input-field">
            <option value="">Select</option>
            <option value="middle_class">Middle Class</option>
            <option value="upper_middle_class">Upper Middle Class</option>
            <option value="rich">Rich</option>
            <option value="affluent">Affluent</option>
          </select>
        </FormField>
        <FormField label="Number of Siblings">
          <input {...register('siblings', { valueAsNumber: true })} type="number" min={0} max={10} className="input-field" />
        </FormField>
      </div>

      <FormField label="Siblings" hint="One per line: Name | Relationship | Phone (private) | Marital status">
        <textarea {...register('siblingDetailsText')} rows={3} className="input-field resize-none sensitive-field" placeholder="Amit | Brother | 9876543210 | Married" />
      </FormField>
      <FormField label="Other Family Members" hint="One per line: Name | Relationship | Phone (private)">
        <textarea {...register('otherFamilyText')} rows={2} className="input-field resize-none sensitive-field" placeholder="Uncle | Maternal uncle | 9876543210" />
      </FormField>

      <div className="rounded-xl border border-gray-100 p-4 space-y-4">
        <h4 className="font-semibold text-gray-800 text-sm">Property / Family Background</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" {...register('ownHouse')} className="rounded border-gray-300" />
            Own house
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" {...register('ownCar')} className="rounded border-gray-300" />
            Own car
          </label>
        </div>
        <FormField label="Land / Property Details">
          <textarea {...register('landPropertyDetails')} rows={2} className="input-field resize-none" placeholder="Optional details" maxLength={500} />
        </FormField>
      </div>

      <div className="rounded-xl border border-gray-100 p-4 space-y-4">
        <h4 className="font-semibold text-gray-800 text-sm">Sibling on Vivansa</h4>
        <p className="text-xs text-gray-500">Linked siblings will never appear as matches for each other.</p>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" {...register('hasSiblingOnApp')} className="rounded border-gray-300" />
          My brother/sister also uses Vivansa
        </label>
        {hasSiblingOnApp && (
          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="Sibling's registered email">
              <input {...register('siblingEmail')} type="email" className="input-field" placeholder="sibling@email.com" />
            </FormField>
            <FormField label="Relationship">
              <select {...register('siblingRelationship')} className="input-field">
                <option value="brother">Brother</option>
                <option value="sister">Sister</option>
                <option value="other">Other</option>
              </select>
            </FormField>
          </div>
        )}
        {linkedSiblings?.length > 0 && (
          <ul className="text-sm text-gray-600 space-y-1">
            {linkedSiblings.map((s, i) => (
              <li key={i}>Linked: {s.relationship} ({s.userId?.toString?.() || s.userId})</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function AboutFields({ register, t }) {
  return (
    <div className="space-y-5">
      <FormField label={t('profile.bio')} hint="Max 1000 characters">
        <textarea {...register('bio')} rows={5} maxLength={1000} className="input-field resize-none" />
      </FormField>
      <FormField label={t('profile.hobbies')} hint="Separate with commas">
        <input {...register('hobbies')} className="input-field" placeholder="Cooking, Reading, Traveling" />
      </FormField>
      <FormField label={t('profile.interests')} hint="Separate with commas">
        <input {...register('interests')} className="input-field" placeholder="Technology, Art, Sports" />
      </FormField>
    </div>
  );
}

function PreferenceFields({ register, t }) {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <FormField label="Preferred Age (Min)">
        <input {...register('partnerPreferences.ageMin', { valueAsNumber: true })} type="number" min={18} className="input-field" />
      </FormField>
      <FormField label="Preferred Age (Max)">
        <input {...register('partnerPreferences.ageMax', { valueAsNumber: true })} type="number" max={70} className="input-field" />
      </FormField>
      <FormField label="Preferred Education" hint="Comma-separated">
        <input {...register('partnerPreferences.education')} className="input-field" placeholder="MBA, BE/BTech" />
      </FormField>
      <FormField label="Preferred Profession" hint="Comma-separated">
        <input {...register('partnerPreferences.profession')} className="input-field" placeholder="Doctor, Engineer" />
      </FormField>
      <FormField label="Preferred Language" hint="Comma-separated">
        <input {...register('partnerPreferences.language')} className="input-field" placeholder="Hindi, Marathi" />
      </FormField>
      <FormField label="Preferred State" hint="Comma-separated">
        <input {...register('partnerPreferences.state')} className="input-field" placeholder="Maharashtra, Delhi" />
      </FormField>
      <FormField label="Preferred Interests" hint="Comma-separated">
        <input {...register('partnerPreferences.interests')} className="input-field" />
      </FormField>
      <FormField label="Preferred Hobbies" hint="Comma-separated">
        <input {...register('partnerPreferences.hobbies')} className="input-field" />
      </FormField>
    </div>
  );
}

function PhotosTab({ photos, onUpload, onDelete, onSetProfile, uploading, t }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-gray-800">{t('profile.photos')} ({photos.length}/10)</h3>
        <label className={`btn-primary text-sm cursor-pointer ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
          <FiCamera /> {uploading ? 'Uploading...' : t('profile.upload_photo')}
          <input type="file" accept="image/*" onChange={onUpload} className="hidden" disabled={uploading} />
        </label>
      </div>
      {photos.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <FiCamera className="text-4xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No photos yet. Upload your first photo!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo._id} className="relative group rounded-2xl overflow-hidden aspect-square">
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!photo.isProfilePhoto && (
                  <button type="button" onClick={() => onSetProfile(photo._id)} className="p-2 bg-white/90 rounded-full text-primary-600" title={t('profile.set_as_profile')}>
                    <FiStar className="text-sm" />
                  </button>
                )}
                <button type="button" onClick={() => onDelete(photo._id)} className="p-2 bg-white/90 rounded-full text-red-500" title={t('profile.delete_photo')}>
                  <FiTrash2 className="text-sm" />
                </button>
              </div>
              {photo.isProfilePhoto && (
                <div className="absolute top-2 left-2 bg-primary-500 text-white rounded-full p-1">
                  <FiCheck className="text-xs" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
