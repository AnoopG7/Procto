import React from 'react';
import {
  Box,
  TableRow,
  TableCell,
  TableHead,
  TableSortLabel,
} from '@mui/material';

/**
 * Custom table head component for sortable tables
 */
export function TableHeadCustom({
  order,
  orderBy,
  headLabel,
  rowCount,
  numSelected,
  onSort,
  onSelectAllRows,
  sx,
}) {
  return (
    <TableHead sx={sx}>
      <TableRow>
        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ width: headCell.width, minWidth: headCell.minWidth }}
          >
            {onSort ? (
              <TableSortLabel
                hideSortIcon
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={() => onSort(headCell.id)}
                sx={{ textTransform: 'capitalize' }}
              >
                {headCell.label}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

/**
 * Empty rows component for tables
 */
export function TableEmptyRows({ height, emptyRows }) {
  if (!emptyRows) {
    return null;
  }

  return (
    <TableRow
      sx={{
        height: height * emptyRows,
        ...(height && {
          height: height * emptyRows,
        }),
      }}
    >
      <TableCell colSpan={9} />
    </TableRow>
  );
}

/**
 * No data component for tables
 */
export function TableNoData({ notFound, sx }) {
  return (
    <TableRow>
      <TableCell colSpan={12} sx={sx}>
        <Box
          sx={{
            textAlign: 'center',
            py: 3,
          }}
        >
          {notFound ? 'No data found' : 'No data available'}
        </Box>
      </TableCell>
    </TableRow>
  );
}

/**
 * Table skeleton for loading state
 */
export function TableSkeleton({ rowCount = 5, cellCount = 8 }) {
  return (
    <>
      {[...Array(rowCount)].map((_, index) => (
        <TableRow key={index}>
          {[...Array(cellCount)].map((_, cellIndex) => (
            <TableCell key={cellIndex}>
              <Box
                sx={{
                  height: 20,
                  width: '100%',
                  borderRadius: 0.5,
                  bgcolor: 'background.neutral',
                }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

/**
 * Utility functions for tables
 */
export const tableUtils = {
  /**
   * Calculate empty rows in a table
   */
  emptyRows: (page, rowsPerPage, arrayLength) => {
    return page > 0 ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
  },
  
  /**
   * Get data for current page
   */
  rowsInPage: (array, page, rowsPerPage) => {
    return array.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  },
};
