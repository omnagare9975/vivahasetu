export default function LoadingSpinner({ size = 'md', fullScreen = false, text = '' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12', xl: 'w-16 h-16' };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizes[size]} border-3 border-gray-200 border-t-primary-500 rounded-full animate-spin`}
        style={{ borderWidth: '3px' }}
      />
      {text && <p className="text-sm text-gray-500 font-medium">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center py-12">
      {spinner}
    </div>
  );
}
