import { Link } from 'react-router-dom';
import {
  FiUser, FiHeart, FiSliders, FiSend, FiMessageSquare, FiShield, FiFlag, FiPlay,
} from 'react-icons/fi';

const STEPS = [
  {
    icon: FiUser,
    title: 'Create your profile',
    body: 'Complete personal, professional, family and photo sections from Edit Profile. A higher completion score improves match quality.',
  },
  {
    icon: FiSliders,
    title: 'Set partner preferences',
    body: 'Add preferred education, profession, language, state, interests and hobbies. Suggestions use these preferences when finding matches.',
  },
  {
    icon: FiHeart,
    title: 'Profile matching',
    body: 'Open Matches to see opposite-gender profiles scored on language, state, profession, interests, hobbies and your preferences. Matching factors are listed on each card.',
  },
  {
    icon: FiSend,
    title: 'Send & receive interests',
    body: 'On a profile, tap Send Interest. Manage incoming and outgoing requests under Interests — accept to unlock messaging.',
  },
  {
    icon: FiMessageSquare,
    title: 'Messaging',
    body: 'After an interest is accepted, chat from Messages. Keep conversations respectful; phone numbers stay private unless you choose to share them.',
  },
  {
    icon: FiShield,
    title: 'Profile & profession verification',
    body: 'Upload a profession ID under Professional details. Status shows Verified, Pending or Not Verified. Documents are never shown publicly.',
  },
  {
    icon: FiFlag,
    title: 'Reporting profiles',
    body: 'Use Report Profile on any member page for fake profiles, incorrect info or suspicious activity. Our team reviews every report.',
  },
];

export default function HowToUse() {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in py-8 px-4">
      <div className="mb-8">
        <p className="text-sm font-semibold text-primary-600 mb-2">Tutorial</p>
        <h1 className="text-3xl font-heading font-bold text-gray-900">How to Use Vivansa</h1>
        <p className="text-gray-500 mt-2">
          A quick walkthrough of creating a profile, matching, preferences, interests, messaging, verification and reporting.
        </p>
      </div>

      <div className="card p-5 mb-8 bg-gradient-to-br from-primary-50 to-white border border-primary-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-gradient flex items-center justify-center shrink-0">
            <FiPlay className="text-white text-xl" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Video overview</h2>
            <p className="text-sm text-gray-600 mt-1">
              Prefer watching? Open our guided tour video (coming soon on our channel). Meanwhile, follow the steps below.
            </p>
            <a
              href="https://www.youtube.com/results?search_query=matrimony+app+how+to+use"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 mt-3 hover:underline"
            >
              <FiPlay /> Watch tutorial video
            </a>
          </div>
        </div>
      </div>

      <ol className="space-y-4">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <li key={step.title} className="card p-5 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 font-bold text-sm">
                {i + 1}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="text-primary-500" />
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{step.body}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/profile/edit" className="btn-primary">Edit Profile</Link>
        <Link to="/help" className="btn-secondary">Help & Support</Link>
      </div>
    </div>
  );
}
