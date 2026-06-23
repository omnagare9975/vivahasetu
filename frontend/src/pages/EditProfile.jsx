import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiCamera, FiTrash2, FiStar, FiCheck } from 'react-icons/fi';
import { fetchMyProfile, updateProfile, uploadPhoto, deletePhoto, setProfilePhoto } from '../redux/slices/profileSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TABS = ['personal', 'professional', 'lifestyle', 'family', 'about', 'preferences', 'photos'];

export default function EditProfile() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { myProfile, photos, loading, updating } = useSelector((s) => s.profile);
  const [activeTab, setActiveTab] = useState('personal');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    dispatch(fetchMyProfile());
  }, [dispatch]);

  useEffect(() => {
    if (myProfile) {
      reset({
        fullName: myProfile.fullName,
        maritalStatus: myProfile.maritalStatus,
        height: myProfile.height,
        weight: myProfile.weight,
        religion: myProfile.religion,
        caste: myProfile.caste,
        subCaste: myProfile.subCaste,
        motherTongue: myProfile.motherTongue,
        city: myProfile.city,
        state: myProfile.state,
        country: myProfile.country,
        education: myProfile.education,
        educationDetails: myProfile.educationDetails,
        occupation: myProfile.occupation,
        company: myProfile.company,
        annualIncome: myProfile.annualIncome,
        workLocation: myProfile.workLocation,
        diet: myProfile.diet,
        smoking: myProfile.smoking,
        drinking: myProfile.drinking,
        fatherOccupation: myProfile.fatherOccupation,
        motherOccupation: myProfile.motherOccupation,
        familyType: myProfile.familyType,
        familyStatus: myProfile.familyStatus,
        siblings: myProfile.siblings,
        bio: myProfile.bio,
        hobbies: myProfile.hobbies?.join(', '),
        interests: myProfile.interests?.join(', '),
      });
    }
  }, [myProfile, reset]);

  const onSubmit = async (data) => {
    if (data.hobbies) data.hobbies = data.hobbies.split(',').map((s) => s.trim()).filter(Boolean);
    if (data.interests) data.interests = data.interests.split(',').map((s) => s.trim()).filter(Boolean);
    const result = await dispatch(updateProfile(data));
    if (updateProfile.fulfilled.match(result)) {
      toast.success(t('profile.save') + ' successful!');
    } else {
      toast.error('Update failed');
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
    if (uploadPhoto.fulfilled.match(result)) {
      toast.success('Photo uploaded!');
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

      {/* Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab}
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

      <form onSubmit={handleSubmit(onSubmit)}>
        {activeTab !== 'photos' ? (
          <div className="card p-6">
            {activeTab === 'personal' && <PersonalFields register={register} errors={errors} t={t} />}
            {activeTab === 'professional' && <ProfessionalFields register={register} t={t} />}
            {activeTab === 'lifestyle' && <LifestyleFields register={register} t={t} />}
            {activeTab === 'family' && <FamilyFields register={register} t={t} />}
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

function FormField({ label, children, hint }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function PersonalFields({ register, errors, t }) {
  const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Parsi', 'Other'];
  const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal', 'Other'];
  const MOTHER_TONGUES = ['Hindi', 'Bengali', 'Marathi', 'Telugu', 'Tamil', 'Gujarati', 'Kannada', 'Malayalam', 'Odia', 'Punjabi', 'Other'];

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
        <input {...register('height', { valueAsNumber: true })} type="number" min={140} max={220} className="input-field" placeholder="170" />
      </FormField>
      <FormField label={`${t('profile.weight')} (kg)`}>
        <input {...register('weight', { valueAsNumber: true })} type="number" min={40} max={150} className="input-field" placeholder="65" />
      </FormField>
      <FormField label={t('profile.religion')}>
        <select {...register('religion')} className="input-field">
          <option value="">Select</option>
          {RELIGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </FormField>
      <FormField label={t('profile.caste')}>
        <input {...register('caste')} className="input-field" placeholder="Brahmin" />
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
        <input {...register('country')} className="input-field" defaultValue="India" />
      </FormField>
    </div>
  );
}

function ProfessionalFields({ register, t }) {
  const EDUCATION = ["High School", "Diploma", "Bachelor's in Engineering", "Bachelor's in Arts", "Bachelor's in Commerce", "Master's", "MBA", "PhD", "MBBS", "MD", "CA", "LLB", "Other"];
  const OCCUPATIONS = ['Software Engineer', 'Doctor', 'Engineer', 'Business Owner', 'Government Employee', 'Teacher/Professor', 'Lawyer', 'Chartered Accountant', 'Banker', 'Architect', 'Self Employed', 'Other'];
  const INCOMES = ['Below 3 LPA', '3-5 LPA', '5-8 LPA', '8-12 LPA', '12-18 LPA', '18-25 LPA', '25-50 LPA', '50+ LPA'];

  return (
    <div className="grid md:grid-cols-2 gap-5">
      <FormField label={t('profile.education')}>
        <select {...register('education')} className="input-field">
          <option value="">Select</option>
          {EDUCATION.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </FormField>
      <FormField label="Education Details">
        <input {...register('educationDetails')} className="input-field" placeholder="College/University name" />
      </FormField>
      <FormField label={t('profile.occupation')}>
        <select {...register('occupation')} className="input-field">
          <option value="">Select</option>
          {OCCUPATIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </FormField>
      <FormField label={t('profile.company')}>
        <input {...register('company')} className="input-field" placeholder="Company name" />
      </FormField>
      <FormField label={t('profile.annual_income')}>
        <select {...register('annualIncome')} className="input-field">
          <option value="">Select</option>
          {INCOMES.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </FormField>
      <FormField label="Work Location">
        <input {...register('workLocation')} className="input-field" placeholder="City of work" />
      </FormField>
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

function FamilyFields({ register, t }) {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <FormField label="Father's Occupation">
        <input {...register('fatherOccupation')} className="input-field" placeholder="Business / Service" />
      </FormField>
      <FormField label="Mother's Occupation">
        <input {...register('motherOccupation')} className="input-field" placeholder="Homemaker / Service" />
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
        <input {...register('siblings', { valueAsNumber: true })} type="number" min={0} max={10} className="input-field" placeholder="0" />
      </FormField>
    </div>
  );
}

function AboutFields({ register, t }) {
  return (
    <div className="space-y-5">
      <FormField label={t('profile.bio')} hint="Tell potential matches about yourself (max 1000 chars)">
        <textarea
          {...register('bio')}
          rows={5}
          maxLength={1000}
          className="input-field resize-none"
          placeholder="I am a software engineer based in Mumbai. I love traveling, cooking and reading..."
        />
      </FormField>
      <FormField label={t('profile.hobbies')} hint="Separate with commas">
        <input {...register('hobbies')} className="input-field" placeholder="Cooking, Reading, Traveling, Music" />
      </FormField>
      <FormField label={t('profile.interests')} hint="Separate with commas">
        <input {...register('interests')} className="input-field" placeholder="Technology, Art, Sports, Movies" />
      </FormField>
    </div>
  );
}

function PreferenceFields({ register, t }) {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <FormField label="Preferred Age (Min)">
        <input {...register('partnerPreferences.ageMin', { valueAsNumber: true })} type="number" min={18} className="input-field" placeholder="22" />
      </FormField>
      <FormField label="Preferred Age (Max)">
        <input {...register('partnerPreferences.ageMax', { valueAsNumber: true })} type="number" max={60} className="input-field" placeholder="30" />
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
          <label className="btn-primary mt-4 inline-flex cursor-pointer text-sm">
            <FiCamera /> Upload Photo
            <input type="file" accept="image/*" onChange={onUpload} className="hidden" />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo._id} className="relative group rounded-2xl overflow-hidden aspect-square">
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!photo.isProfilePhoto && (
                  <button
                    type="button"
                    onClick={() => onSetProfile(photo._id)}
                    className="p-2 bg-white/90 rounded-full text-primary-600 hover:bg-white transition-colors"
                    title={t('profile.set_as_profile')}
                  >
                    <FiStar className="text-sm" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDelete(photo._id)}
                  className="p-2 bg-white/90 rounded-full text-red-500 hover:bg-white transition-colors"
                  title={t('profile.delete_photo')}
                >
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
