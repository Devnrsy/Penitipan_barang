// src/components/Button.jsx
const Button = ({ children, type, className, onClick }) => {
  return (
    <button type={type} onClick={onClick} className={className}>
      {children}
    </button>
  );
};

export default Button; // <--- WAJIB ADA INI
  