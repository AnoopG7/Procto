import type { Theme, SxProps } from '@mui/material/styles';
import type { TextFieldProps } from '@mui/material/TextField';
import type {
  AutocompleteProps,
  AutocompleteRenderInputParams,
  AutocompleteRenderValueGetItemProps,
} from '@mui/material/Autocomplete';

import { useId, useMemo, useCallback } from 'react';

import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import { filledInputClasses } from '@mui/material/FilledInput';
import { outlinedInputClasses } from '@mui/material/OutlinedInput';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import InputAdornment, { inputAdornmentClasses } from '@mui/material/InputAdornment';

import { countries } from 'src/assets/data';

import { FlagIcon } from '../flag-icon';

// ----------------------------------------------------------------------

type Value = string;
type Multiple = boolean | undefined;
type DisableClearable = boolean | undefined;
type FreeSolo = boolean | undefined;

type ExcludedProps = 'options' | 'renderOption' | 'renderInput' | 'renderValue' | 'getOptionLabel';

export type AutocompleteBaseProps = Omit<
  AutocompleteProps<any, Multiple, DisableClearable, FreeSolo>,
  ExcludedProps
>;

export type CountrySelectProps = AutocompleteBaseProps &
  Pick<TextFieldProps, 'label' | 'error' | 'variant' | 'helperText' | 'placeholder'> & {
    hiddenLabel?: boolean;
    displayValue?: 'label' | 'code';
  };

const getCountry = (inputValue: string) =>
  countries.find(
    country =>
      country.label === inputValue || country.code === inputValue || country.phone === inputValue
  ) ?? {
    code: '',
    label: '',
    phone: '',
  };

export function CountrySelect({
  id,
  label,
  error,
  variant,
  multiple,
  helperText,
  hiddenLabel,
  placeholder,
  displayValue = 'label',
  ...other
}: CountrySelectProps) {
  const uniqueId = useId();

  const options = useMemo(
    () => countries.map(country => (displayValue === 'code' ? country.code : country.label)),
    [displayValue]
  );

  const getOptionLabel = useCallback(
    (option: Value) => (displayValue === 'code' ? getCountry(option).label : option),
    [displayValue]
  );

  const renderOption = useCallback(
    (props: React.HTMLAttributes<HTMLLIElement> & { key: any }, option: Value) => {
      const { key, ...otherProps } = props;
      const country = getCountry(option);

      return (
        <li key={key} {...otherProps}>
          <FlagIcon
            code={country.code}
            sx={{
              mr: 1,
              width: 22,
              height: 22,
              borderRadius: '50%',
            }}
          />
          {country.label} ({country.code}) +{country.phone}
        </li>
      );
    },
    []
  );

  const renderInput = useCallback(
    (params: AutocompleteRenderInputParams) => {
      const country = getCountry(params.inputProps.value as Value);

      const textFieldStyles: SxProps<Theme> = {
        [`& .${inputAdornmentClasses.root}`]: {
          ml: 0.5,
          mr: 1,
        },
        [`& .${outlinedInputClasses.root}, .${filledInputClasses.root}`]: {
          [`& .${autocompleteClasses.input}`]: {
            pl: 0,
          },
        },
        [`& .${filledInputClasses.root}`]: {
          [`& .${inputAdornmentClasses.root}`]: {
            transform: hiddenLabel ? 'unset' : 'translateY(-8px)',
          },
        },
      };

      const hasAdornment = !multiple && !!country.code;

      return (
        <TextField
          {...params}
          label={label}
          variant={variant}
          placeholder={placeholder}
          helperText={helperText}
          hiddenLabel={hiddenLabel}
          error={!!error}
          slotProps={{
            htmlInput: {
              ...params.inputProps,
              autoComplete: 'new-password', // Disable autocomplete and autofill
            },
            input: {
              ...params.InputProps,
              ...(hasAdornment && {
                startAdornment: (
                  <InputAdornment position="start">
                    <FlagIcon
                      code={country.code}
                      sx={{ width: 22, height: 22, borderRadius: '50%' }}
                    />
                  </InputAdornment>
                ),
              }),
            },
          }}
          sx={[!multiple && textFieldStyles]}
        />
      );
    },
    [error, helperText, hiddenLabel, label, multiple, placeholder, variant]
  );

  const renderValue = useCallback(
    (selected: unknown, getItemProps: AutocompleteRenderValueGetItemProps<Multiple>) =>
      (selected as Value[]).map((option, index) => {
        const country = getCountry(option);

        return (
          <Chip
            {...getItemProps({ index })}
            key={country.label}
            label={country.label}
            size="small"
            variant="outlined"
            icon={
              <FlagIcon code={country.code} sx={{ width: 16, height: 16, borderRadius: '50%' }} />
            }
          />
        );
      }),
    []
  );

  return (
    <Autocomplete
      id={id ?? `${uniqueId}-country-select`}
      options={options}
      multiple={multiple}
      autoHighlight={!multiple}
      disableCloseOnSelect={multiple}
      getOptionLabel={getOptionLabel}
      renderOption={renderOption}
      renderInput={renderInput}
      renderValue={multiple ? renderValue : undefined}
      {...other}
    />
  );
}
