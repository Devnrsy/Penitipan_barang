import 'react';

const Input = ({
  type,
  placeholder,
  value,
  onChange,
  className,
  icon: Icon,
}) => {
  return (
    <div className="relative w-full group">
      {/* Icon Slot */}
      {Icon && (
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#F3C263] transition-colors duration-300">
          <Icon size={18} />
        </div>
      )}

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`
          w-full bg-white/5 border border-white/10 rounded-full py-3.5 
          ${Icon ? 'pl-14' : 'px-7'} pr-7 
          text-sm text-white placeholder-gray-600
          outline-none focus:border-[#F3C263]/50 focus:bg-white/10
          focus:ring-4 focus:ring-[#F3C263]/10 transition-all duration-300
          ${className}
        `}
      />
    </div>
  );
};

export default Input;
