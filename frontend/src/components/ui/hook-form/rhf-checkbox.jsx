import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  Checkbox,
  FormControlLabel,
  FormControl,
  FormHelperText,
  FormGroup
} from '@mui/material';

/**
 * React Hook Form integrated Checkbox component
 */
export default function RHFCheckbox({ name, helperText, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl error={!!error}>
          <FormControlLabel
            control={<Checkbox {...field} checked={field.value} />}
            {...other}
          />

          {(!!error || helperText) && (
            <FormHelperText error={!!error}>
              {error ? error.message : helperText}
            </FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
}

/**
 * React Hook Form integrated Checkbox group component
 */
export function RHFMultiCheckbox({ name, options, row = false, helperText, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const onSelected = (option) => {
          const selected = field.value || [];
          
          return selected.includes(option)
            ? selected.filter((value) => value !== option)
            : [...selected, option];
        };

        return (
          <FormControl component="fieldset" error={!!error}>
            <FormGroup row={row}>
              {options.map((option) => (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Checkbox
                      checked={field.value?.includes(option.value) || false}
                      onChange={() => field.onChange(onSelected(option.value))}
                    />
                  }
                  label={option.label}
                  {...other}
                />
              ))}
            </FormGroup>

            {(!!error || helperText) && (
              <FormHelperText error={!!error}>
                {error ? error.message : helperText}
              </FormHelperText>
            )}
          </FormControl>
        );
      }}
    />
  );
}
