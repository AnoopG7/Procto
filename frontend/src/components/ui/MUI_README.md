# Material-UI Components Guide

This folder contains UI components that have been migrated from Shadcn/Radix UI to Material-UI (MUI).

## Usage Guide

### Basic Components

The following components are now available as MUI components:

- **Button**: Use MUI's `<Button>` component
- **TextField**: Use MUI's `<TextField>` component
- **Select**: Use MUI's `<Select>` component
- **Checkbox**: Use MUI's `<Checkbox>` component
- **Radio**: Use MUI's `<Radio>` and `<RadioGroup>` components
- **Switch**: Use MUI's `<Switch>` component
- **Modal/Dialog**: Use MUI's `<Dialog>` component
- **Tabs**: Use MUI's `<Tabs>` and `<Tab>` components
- **Card**: Use MUI's `<Card>`, `<CardContent>`, `<CardHeader>`, `<CardActions>` components
- **Menu**: Use MUI's `<Menu>` and `<MenuItem>` components
- **Table**: Use MUI's `<Table>`, `<TableHead>`, `<TableBody>`, `<TableRow>`, `<TableCell>` components
- **Avatar**: Use MUI's `<Avatar>` component

### Navigation Components

For navigation, use:
- `<AppBar>` and `<Toolbar>` for headers
- `<Drawer>` for sidebar navigation
- `<BottomNavigation>` for mobile bottom navigation

### Form Components

For forms, use:
- `<FormControl>` as the wrapper
- `<FormLabel>` for labels
- `<FormHelperText>` for help text
- `<FormGroup>` for grouping form controls

### Layout Components

For layout, use:
- `<Box>` as a general layout component
- `<Container>` for responsive containers
- `<Grid>` for grid layouts
- `<Stack>` for one-dimensional layouts

### Feedback Components

For feedback, use:
- `<Alert>` for alerts
- `<Snackbar>` for toast messages
- `<CircularProgress>` or `<LinearProgress>` for loading indicators

### Data Display Components

For data display, use:
- `<List>` and `<ListItem>` for lists
- `<Chip>` for tags or labels
- `<Tooltip>` for tooltips
- `<Badge>` for badges

## Styling Guide

When styling MUI components:

1. Use the `sx` prop for most styling needs
2. Use theme variables for consistent styling
3. Use `styled` from `@emotion/styled` for complex component styling

Example:
```jsx
<Box
  sx={{
    p: 2,
    mb: 2,
    bgcolor: 'background.paper',
    borderRadius: 1,
    boxShadow: 1
  }}
>
  Content
</Box>
```

For more information, refer to the [MUI documentation](https://mui.com/material-ui/getting-started/overview/).
