import React from 'react';
import { FormProvider as RHFormProvider } from 'react-hook-form';

/**
 * Form provider component that integrates with react-hook-form
 */
export function FormProvider({ children, onSubmit, methods }) {
  return (
    <RHFormProvider {...methods}>
      <form onSubmit={onSubmit ? methods.handleSubmit(onSubmit) : undefined}>
        {children}
      </form>
    </RHFormProvider>
  );
}

export default FormProvider;
