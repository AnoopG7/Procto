import React, { useCallback, useState } from 'react';
import {
  Box,
  Stack,
  Button,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';
import { useDropzone } from 'react-dropzone';

/**
 * Single File Upload Component
 */
export function Upload({
  disabled = false,
  multiple = false,
  error = false,
  helperText,
  file,
  onDelete,
  onRemove,
  onUpload,
  thumbnail,
  placeholder,
  sx,
  ...other
}) {
  const [isLoading, setIsLoading] = useState(false);

  const hasFile = !!file;
  const isError = !!error;

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    multiple,
    disabled,
    ...other,
    onDrop: (acceptedFiles) => {
      setIsLoading(true);
      
      if (onUpload) {
        onUpload(acceptedFiles[0]).finally(() => {
          setIsLoading(false);
        });
      }
    },
  });

  const renderPreview = hasFile && (
    <Box
      sx={{
        p: 1,
        borderRadius: 1,
        overflow: 'hidden',
        position: 'relative',
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
        border: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
        '&:hover .remove-btn': {
          opacity: 1,
        },
      }}
    >
      {thumbnail && thumbnail}

      <IconButton
        size="small"
        onClick={onDelete || onRemove}
        sx={{
          top: 8,
          right: 8,
          p: '1px',
          position: 'absolute',
          opacity: { xs: 1, md: 0 },
          color: (theme) => alpha(theme.palette.common.white, 0.8),
          bgcolor: (theme) => alpha(theme.palette.grey[900], 0.48),
          '&:hover': {
            bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
          },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );

  const renderPlaceholder = (
    <Stack
      spacing={2}
      alignItems="center"
      justifyContent="center"
      direction={{
        xs: 'column',
        md: 'row',
      }}
      sx={{
        width: 1,
        p: 3,
        overflow: 'hidden',
        borderRadius: 1,
        position: 'relative',
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
        border: (theme) => `dashed 1px ${alpha(theme.palette.grey[500], 0.16)}`,
        '&:hover': {
          opacity: 0.72,
        },
        ...(isError && {
          color: 'error.main',
          bgcolor: 'error.lighter',
          borderColor: 'error.light',
        }),
        ...(isDragActive && {
          opacity: 0.72,
        }),
        ...(isDragReject && {
          color: 'error.main',
          bgcolor: 'error.lighter',
          borderColor: 'error.light',
        }),
      }}
    >
      {isLoading ? (
        <CircularProgress size={32} />
      ) : (
        <UploadFileIcon sx={{ width: 40, height: 40, color: 'text.secondary' }} />
      )}

      <Stack
        sx={{
          pl: { md: 2 },
          textAlign: { xs: 'center', md: 'left' },
        }}
      >
        <Typography variant="body2">{placeholder || 'Drop or select file'}</Typography>

        {helperText && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {helperText}
          </Typography>
        )}
      </Stack>
    </Stack>
  );

  return (
    <Box sx={{ width: 1, position: 'relative', ...sx }}>
      <Box {...getRootProps()} sx={{ cursor: 'pointer' }}>
        <input {...getInputProps()} />

        {hasFile ? renderPreview : renderPlaceholder}
      </Box>
    </Box>
  );
}

/**
 * Avatar Upload Component
 */
export function UploadAvatar({ error, file, disabled, helperText, sx, ...other }) {
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    multiple: false,
    disabled,
    ...other,
  });

  const hasFile = !!file;

  const renderPreview = hasFile && (
    <Box
      sx={{
        width: 1,
        height: 1,
        overflow: 'hidden',
        borderRadius: '50%',
        position: 'relative',
      }}
    >
      <Box
        component="img"
        src={typeof file === 'string' ? file : URL.createObjectURL(file)}
        sx={{ width: 1, height: 1, objectFit: 'cover' }}
      />

      <Box
        sx={{
          top: 0,
          left: 0,
          width: 1,
          height: 1,
          position: 'absolute',
          bgcolor: (theme) => alpha(theme.palette.grey[900], 0.48),
          transition: (theme) => theme.transitions.create(['opacity']),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'common.white',
          opacity: 0,
          '&:hover': {
            opacity: 1,
          },
        }}
      >
        <CloudUploadIcon />
      </Box>
    </Box>
  );

  const renderPlaceholder = (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{
        width: 1,
        height: 1,
        borderRadius: '50%',
        backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.08),
        transition: (theme) => theme.transitions.create(['opacity']),
        color: 'text.secondary',
        '&:hover': {
          opacity: 0.72,
        },
        ...(isDragActive && {
          opacity: 0.72,
        }),
        ...(isDragReject && {
          color: 'error.main',
          bgcolor: 'error.lighter',
          borderColor: 'error.light',
        }),
        ...(error && {
          color: 'error.main',
          bgcolor: 'error.lighter',
          borderColor: 'error.light',
        }),
      }}
    >
      <CloudUploadIcon sx={{ width: 24, height: 24, mb: 1 }} />
      <Typography variant="caption">{file ? 'Update photo' : 'Upload photo'}</Typography>
    </Stack>
  );

  return (
    <>
      <Box
        sx={{
          width: 144,
          height: 144,
          ...sx,
        }}
      >
        <Box {...getRootProps()} sx={{ width: 1, height: 1, cursor: 'pointer' }}>
          <input {...getInputProps()} />

          {hasFile ? renderPreview : renderPlaceholder}
        </Box>
      </Box>

      {helperText && (
        <Typography
          variant="caption"
          sx={{
            mt: 2,
            mx: 'auto',
            display: 'block',
            textAlign: 'center',
            color: 'text.secondary',
            ...(error && {
              color: 'error.main',
            }),
          }}
        >
          {helperText}
        </Typography>
      )}
    </>
  );
}

/**
 * Drag-and-drop box upload component
 */
export function UploadBox({ placeholder, error, disabled, sx, ...other }) {
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    disabled,
    ...other,
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        p: 2,
        height: 1,
        width: 1,
        overflow: 'hidden',
        borderRadius: 1,
        position: 'relative',
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
        border: (theme) => `dashed 1px ${alpha(theme.palette.grey[500], 0.16)}`,
        '&:hover': {
          opacity: 0.72,
        },
        ...(isDragActive && {
          opacity: 0.72,
        }),
        ...(isDragReject && {
          color: 'error.main',
          bgcolor: 'error.lighter',
          borderColor: 'error.light',
        }),
        ...(error && {
          color: 'error.main',
          bgcolor: 'error.lighter',
          borderColor: 'error.light',
        }),
        ...(disabled && {
          opacity: 0.48,
          pointerEvents: 'none',
        }),
        ...sx,
      }}
    >
      <input {...getInputProps()} />

      {placeholder || (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 1,
            height: 1,
          }}
        >
          <Stack
            spacing={1}
            alignItems="center"
            justifyContent="center"
            direction={{
              xs: 'column',
              md: 'row',
            }}
            sx={{
              width: 1,
              textAlign: {
                xs: 'center',
                md: 'left',
              },
            }}
          >
            <UploadFileIcon sx={{ color: 'text.secondary' }} />

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Drop or Select file
            </Typography>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
