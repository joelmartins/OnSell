import { forwardRef } from 'react';

const Select = forwardRef(({ className = '', ...props }, ref) => (
  <select
    {...props}
    ref={ref}
    className={
      'border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-blue-500 dark:focus:border-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600 rounded-md shadow-sm ' +
      className
    }
  />
));

Select.displayName = 'Select';

export default Select; 