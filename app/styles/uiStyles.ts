export const primaryBg = 'bg-black';
export const secondaryBg = 'bg-gray-900 bg-opacity-40';
export const glassEffect = 'backdrop-filter backdrop-blur-xl bg-opacity-30 border border-gray-700 border-opacity-30';

export const gradientBg = `
  bg-black
  before:content-['']
  before:fixed
  before:inset-0
  before:bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.3)_0%,rgba(0,0,0,0)_50%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.3)_0%,rgba(0,0,0,0)_50%)]
  before:z-[-1]
`;

export const primaryColor = 'text-white';

export const inputStyle = `
  ${glassEffect}
  bg-gray-800 bg-opacity-50
  text-gray-100 
  rounded-md 
  p-2 
  focus:outline-none
  placeholder-gray-400 placeholder-opacity-70
  focus:ring-2 focus:ring-gray-600 focus:border-transparent
  transition-all duration-200
`;

export const selectStyle = `
  ${inputStyle}
  appearance-none
  pr-8
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.5em 1.5em;
`;

export const buttonStyle = `
  px-4 py-2
  rounded-full 
  text-sm 
  font-medium
  text-white 
  transition-all duration-200
  ${glassEffect}
  bg-gray-700 bg-opacity-70
  hover:bg-opacity-90
  focus:outline-none
  shadow-md hover:shadow-lg
  hover:border-gray-500 hover:border-opacity-50
`;

export const tagStyle = `
  ${glassEffect}
  bg-gray-800 bg-opacity-50
  text-gray-100
  px-2 py-1
  rounded-full
  text-sm
  flex items-center
`;

export const uploadBgStyle = `
  ${glassEffect}
  bg-gray-800 bg-opacity-50
  border-2 border-dashed border-gray-600
  hover:border-gray-500 hover:border-opacity-50
  transition-all duration-200
`;
