interface AvatarProps {
    name: string;
    image?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export const Avatar = ({ name, image, size = 'md', className = '' }: AvatarProps) => {
    const getInitials = (n: string) => n.substring(0, 2).toUpperCase();

    // Tailles
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-20 h-20 text-3xl',
    };

    return (
        <div className={`
      ${sizeClasses[size]} 
      bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold border border-indigo-100 shadow-sm
      ${className}
    `}>
            {image ? <img src={image} alt={name} className="w-full h-full rounded-full object-cover" /> : getInitials(name)}
        </div>
    );
};