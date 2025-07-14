import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { examAPI, examSessionAPI } from "../../lib/api";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from "@mui/material";
import {
  Group as UsersIcon,
  MenuBook as BookOpenIcon,
  Timeline as ActivityIcon,
  Warning as AlertTriangleIcon,
  Visibility as EyeIcon,
  Download as DownloadIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as ClockIcon,
  Security as ShieldIcon,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  MoreVert as MoreVerticalIcon,
  Settings as SettingsIcon,
  Logout as LogOutIcon,
  Add as PlusIcon,
  ManageAccounts as UserCogIcon,
} from "@mui/icons-material";

const AdminDashboard = () => {
  const [exams, setExams] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("exams");
  const [searchTerm, setSearchTerm] = useState("");
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // In a real app, fetch data from APIs:
      // const examResponse = await examAPI.getExams();
      // const sessionResponse = await examSessionAPI.getSessions();
      // const userResponse = await userAPI.getUsers();

      // Simulated data for demo:
      const mockExams = Array.from({ length: 15 }, (_, i) => ({
        id: `exam-${i}`,
        title: `${["Midterm", "Final", "Quiz", "Assessment"][i % 4]} Exam ${
          i + 1
        }`,
        courseName: `Course ${(i % 5) + 1}`,
        date: new Date(Date.now() + (i - 5) * 86400000).toISOString(),
        duration: [60, 90, 120, 45][i % 4],
        status: i % 3 === 0 ? "active" : i % 3 === 1 ? "completed" : "upcoming",
        students: Math.floor(Math.random() * 50) + 10,
        averageScore: Math.floor(Math.random() * 30) + 65,
      }));

      const mockSessions = Array.from({ length: 20 }, (_, i) => ({
        id: `session-${i}`,
        examId: `exam-${i % 15}`,
        examTitle: `${["Midterm", "Final", "Quiz", "Assessment"][i % 4]} Exam ${
          (i % 15) + 1
        }`,
        studentName: `Student ${i + 1}`,
        studentId: `student-${i}`,
        status:
          i % 4 === 0
            ? "active"
            : i % 4 === 1
            ? "completed"
            : i % 4 === 2
            ? "submitted"
            : "flagged",
        violations: i % 4 === 3 ? Math.floor(Math.random() * 5) + 1 : 0,
        startTime: new Date(
          Date.now() - Math.floor(Math.random() * 10000000)
        ).toISOString(),
        duration: Math.floor(Math.random() * 30 + 30),
        score: i % 4 === 1 ? Math.floor(Math.random() * 30) + 60 : null,
      }));

      const mockUsers = Array.from({ length: 30 }, (_, i) => ({
        id: `user-${i}`,
        firstName: `First${i}`,
        lastName: `Last${i}`,
        email: `user${i}@example.com`,
        role: i % 5 === 0 ? "admin" : i % 5 === 1 ? "teacher" : "student",
        institution: `Institution ${(i % 3) + 1}`,
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 30000000)
        ).toISOString(),
      }));

      setExams(mockExams);
      setSessions(mockSessions);
      setUsers(mockUsers);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load dashboard data. Please try again.");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0); // Reset pagination when changing tabs
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0); // Reset pagination when searching
  };

  const handleMenuOpen = (event, item) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedItem(null);
  };

  const handleViewItem = () => {
    handleMenuClose();

    if (!selectedItem) return;

    if (selectedItem.id.startsWith("exam-")) {
      navigate(`/admin/exam/${selectedItem.id}`);
    } else if (selectedItem.id.startsWith("session-")) {
      navigate(`/admin/session/${selectedItem.id}`);
    } else if (selectedItem.id.startsWith("user-")) {
      navigate(`/admin/user/${selectedItem.id}`);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const getStatusChipProps = (status) => {
    switch (status) {
      case "active":
        return {
          label: "Active",
          color: "success",
        };
      case "upcoming":
        return {
          label: "Upcoming",
          color: "primary",
          variant: "outlined",
        };
      case "completed":
        return {
          label: "Completed",
          color: "default",
        };
      case "flagged":
        return {
          label: "Flagged",
          color: "error",
        };
      case "submitted":
        return {
          label: "Submitted",
          color: "info",
        };
      default:
        return {
          label: status,
          color: "default",
        };
    }
  };

  const filterData = (data) => {
    if (!searchTerm) return data;

    const lowerSearchTerm = searchTerm.toLowerCase();

    if (activeTab === "exams") {
      return data.filter(
        (exam) =>
          exam.title.toLowerCase().includes(lowerSearchTerm) ||
          exam.courseName.toLowerCase().includes(lowerSearchTerm) ||
          exam.status.toLowerCase().includes(lowerSearchTerm)
      );
    } else if (activeTab === "sessions") {
      return data.filter(
        (session) =>
          session.examTitle.toLowerCase().includes(lowerSearchTerm) ||
          session.studentName.toLowerCase().includes(lowerSearchTerm) ||
          session.status.toLowerCase().includes(lowerSearchTerm)
      );
    } else {
      return data.filter(
        (user) =>
          user.firstName.toLowerCase().includes(lowerSearchTerm) ||
          user.lastName.toLowerCase().includes(lowerSearchTerm) ||
          user.email.toLowerCase().includes(lowerSearchTerm) ||
          user.role.toLowerCase().includes(lowerSearchTerm) ||
          user.institution.toLowerCase().includes(lowerSearchTerm)
      );
    }
  };

  const paginateData = (data) => {
    return data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  };

  const filteredData = filterData(
    activeTab === "exams" ? exams : activeTab === "sessions" ? sessions : users
  );
  const paginatedData = paginateData(filteredData);

  const renderExamTable = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Exam Title</TableCell>
            <TableCell>Course</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Students</TableCell>
            <TableCell>Avg. Score</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedData.map((exam) => {
            const statusProps = getStatusChipProps(exam.status);
            return (
              <TableRow key={exam.id}>
                <TableCell>{exam.title}</TableCell>
                <TableCell>{exam.courseName}</TableCell>
                <TableCell>{formatDate(exam.date)}</TableCell>
                <TableCell>{exam.duration} min</TableCell>
                <TableCell>
                  <Chip
                    label={statusProps.label}
                    color={statusProps.color}
                    size="small"
                    variant={statusProps.variant}
                  />
                </TableCell>
                <TableCell>{exam.students}</TableCell>
                <TableCell>
                  {exam.status === "completed"
                    ? `${exam.averageScore}%`
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <IconButton
                    aria-label="more options"
                    onClick={(e) => handleMenuOpen(e, exam)}
                    size="small"
                  >
                    <MoreVerticalIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderSessionTable = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Student</TableCell>
            <TableCell>Exam</TableCell>
            <TableCell>Start Time</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Violations</TableCell>
            <TableCell>Score</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedData.map((session) => {
            const statusProps = getStatusChipProps(session.status);
            return (
              <TableRow key={session.id}>
                <TableCell>{session.studentName}</TableCell>
                <TableCell>{session.examTitle}</TableCell>
                <TableCell>
                  {formatDate(session.startTime)}
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                  >
                    {formatTime(session.startTime)}
                  </Typography>
                </TableCell>
                <TableCell>{session.duration} min</TableCell>
                <TableCell>
                  <Chip
                    label={statusProps.label}
                    color={statusProps.color}
                    size="small"
                    variant={statusProps.variant}
                  />
                </TableCell>
                <TableCell>
                  {session.violations > 0 ? (
                    <Chip
                      label={session.violations}
                      color="error"
                      size="small"
                    />
                  ) : (
                    "None"
                  )}
                </TableCell>
                <TableCell>
                  {session.score !== null ? `${session.score}%` : "N/A"}
                </TableCell>
                <TableCell>
                  <IconButton
                    aria-label="more options"
                    onClick={(e) => handleMenuOpen(e, session)}
                    size="small"
                  >
                    <MoreVerticalIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderUserTable = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Institution</TableCell>
            <TableCell>Joined</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedData.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                    {user.firstName[0] + user.lastName[0]}
                  </Avatar>
                  {user.firstName} {user.lastName}
                </Box>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Chip
                  label={user.role}
                  color={
                    user.role === "admin"
                      ? "error"
                      : user.role === "teacher"
                      ? "primary"
                      : "default"
                  }
                  size="small"
                  variant={user.role === "student" ? "outlined" : undefined}
                />
              </TableCell>
              <TableCell>{user.institution}</TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableCell>
                <IconButton
                  aria-label="more options"
                  onClick={(e) => handleMenuOpen(e, user)}
                  size="small"
                >
                  <MoreVerticalIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Header */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Grid
                  container
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Grid item>
                    <Typography variant="h4" gutterBottom>
                      Admin Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Manage exams, sessions, and users
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<LogOutIcon />}
                      onClick={handleLogout}
                    >
                      Log Out
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Statistics Cards */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 2 }}
                    >
                      <Avatar sx={{ bgcolor: "primary.light" }}>
                        <BookOpenIcon />
                      </Avatar>
                      <Typography variant="h6">Total Exams</Typography>
                    </Stack>
                    <Typography variant="h3" fontWeight="bold">
                      {exams.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 2 }}
                    >
                      <Avatar sx={{ bgcolor: "success.light" }}>
                        <ActivityIcon />
                      </Avatar>
                      <Typography variant="h6">Active Sessions</Typography>
                    </Stack>
                    <Typography variant="h3" fontWeight="bold">
                      {sessions.filter((s) => s.status === "active").length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 2 }}
                    >
                      <Avatar sx={{ bgcolor: "error.light" }}>
                        <AlertTriangleIcon />
                      </Avatar>
                      <Typography variant="h6">Flagged Sessions</Typography>
                    </Stack>
                    <Typography variant="h3" fontWeight="bold">
                      {sessions.filter((s) => s.status === "flagged").length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 2 }}
                    >
                      <Avatar sx={{ bgcolor: "info.light" }}>
                        <UsersIcon />
                      </Avatar>
                      <Typography variant="h6">Users</Typography>
                    </Stack>
                    <Typography variant="h3" fontWeight="bold">
                      {users.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12}>
            <Card>
              <Box sx={{ borderBottom: 1, borderColor: "divider", p: 0 }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  indicatorColor="primary"
                  textColor="primary"
                  sx={{ px: 2 }}
                >
                  <Tab value="exams" label="Exams" />
                  <Tab value="sessions" label="Exam Sessions" />
                  <Tab value="users" label="Users" />
                </Tabs>
              </Box>

              <CardContent>
                <Box
                  sx={{
                    mb: 3,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <TextField
                    placeholder={`Search ${activeTab}...`}
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ width: { xs: "100%", sm: "300px" } }}
                  />

                  <Box>
                    {activeTab === "exams" && (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<PlusIcon />}
                        onClick={() => navigate("/admin/create-exam")}
                      >
                        Create Exam
                      </Button>
                    )}
                    {activeTab === "users" && (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<PlusIcon />}
                        onClick={() => navigate("/admin/create-user")}
                      >
                        Add User
                      </Button>
                    )}
                  </Box>
                </Box>

                {loading ? (
                  <Box sx={{ width: "100%", my: 4 }}>
                    <LinearProgress />
                  </Box>
                ) : error ? (
                  <Alert severity="error" sx={{ my: 2 }}>
                    {error}
                  </Alert>
                ) : filteredData.length === 0 ? (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 8,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Avatar
                      sx={{ bgcolor: "action.selected", width: 60, height: 60 }}
                    >
                      <SearchIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="h6">No results found</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try adjusting your search or filters
                    </Typography>
                  </Box>
                ) : (
                  <Paper variant="outlined">
                    {activeTab === "exams" && renderExamTable()}
                    {activeTab === "sessions" && renderSessionTable()}
                    {activeTab === "users" && renderUserTable()}

                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={filteredData.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </Paper>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewItem}>
          <EyeIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {activeTab === "sessions" && selectedItem?.status === "active" && (
          <MenuItem onClick={handleMenuClose}>
            <ActivityIcon fontSize="small" sx={{ mr: 1 }} />
            Monitor Live
          </MenuItem>
        )}
        {activeTab === "exams" && (
          <MenuItem onClick={handleMenuClose}>
            <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
            Export Results
          </MenuItem>
        )}
        {activeTab === "users" && (
          <MenuItem onClick={handleMenuClose}>
            <UserCogIcon fontSize="small" sx={{ mr: 1 }} />
            Edit User
          </MenuItem>
        )}
        <MenuItem onClick={handleMenuClose}>
          <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
          Settings
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AdminDashboard;
