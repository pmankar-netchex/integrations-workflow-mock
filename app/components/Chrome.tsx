'use client';
import * as React from 'react';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import LocalActivityOutlinedIcon from '@mui/icons-material/LocalActivityOutlined';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';

type NavItem = {
  label: string;
  icon: React.ReactNode;
  activeFor?: (path: string) => boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const matchPayroll = (p: string) =>
  p === '/' || p.startsWith('/marketplace') || p.startsWith('/flow') || p.startsWith('/connect');

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Run',
    items: [
      { label: 'Dashboard', icon: <HomeOutlinedIcon fontSize="small" /> },
      { label: 'People', icon: <PeopleAltOutlinedIcon fontSize="small" /> },
      { label: 'Payroll', icon: <AttachMoneyIcon fontSize="small" />, activeFor: matchPayroll },
      { label: 'Time & Attendance', icon: <ScheduleOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    label: 'Reports & insights',
    items: [
      { label: 'Reports', icon: <AssessmentOutlinedIcon fontSize="small" /> },
      { label: 'Report Builder', icon: <DescriptionOutlinedIcon fontSize="small" /> },
      { label: 'NetInsight', icon: <InsightsOutlinedIcon fontSize="small" /> },
      { label: 'Insights', icon: <InsightsOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    label: 'Hire & verify',
    items: [
      { label: 'Recruit (Hireology)', icon: <BadgeOutlinedIcon fontSize="small" /> },
      { label: 'E-Verify', icon: <VerifiedUserOutlinedIcon fontSize="small" /> },
      { label: 'NetGuide', icon: <FolderOpenOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    label: 'Benefits',
    items: [
      { label: 'Benefits (NetBenefits)', icon: <HealthAndSafetyOutlinedIcon fontSize="small" /> },
      { label: '401k (Vestwell)', icon: <SavingsOutlinedIcon fontSize="small" /> },
      { label: 'Buy Now Pay Later', icon: <CardGiftcardOutlinedIcon fontSize="small" /> },
      { label: 'COBRA (NetCOBRA)', icon: <LocalActivityOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    label: 'Documents & compliance',
    items: [
      { label: 'Document Center', icon: <FolderOpenOutlinedIcon fontSize="small" /> },
      { label: 'Important Dates (NetAssist HR)', icon: <CloudOutlinedIcon fontSize="small" /> },
      { label: 'ACA Central', icon: <EventAvailableOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    label: 'Support & admin',
    items: [
      { label: 'HR Support', icon: <SupportAgentOutlinedIcon fontSize="small" /> },
      { label: 'Send An Announcement', icon: <CampaignOutlinedIcon fontSize="small" /> },
      { label: 'Maintenance', icon: <SettingsOutlinedIcon fontSize="small" /> },
      { label: 'Back Office', icon: <BuildOutlinedIcon fontSize="small" /> },
    ],
  },
];

export default function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(NAV_GROUPS.map((g) => [g.label, true])),
  );

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" color="default" sx={{ bgcolor: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar sx={{ minHeight: '48px !important', gap: 2 }}>
          <Select
            size="small"
            value="xqm"
            variant="standard"
            disableUnderline
            sx={{ fontSize: 12, fontWeight: 500, minWidth: 220 }}
          >
            <MenuItem value="xqm">XQM - (DEMO) INTEGRATIONS TEAM</MenuItem>
          </Select>
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              maxWidth: 560,
              mx: 'auto',
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #d0d7de',
              borderRadius: 1,
              px: 1,
            }}
          >
            <SearchIcon fontSize="small" sx={{ color: '#777' }} />
            <InputBase placeholder="Search" sx={{ ml: 1, flex: 1, fontSize: 13 }} />
          </Paper>
          <IconButton size="small">
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
          <IconButton size="small">
            <ChatBubbleOutlineIcon fontSize="small" />
          </IconButton>
          <Avatar sx={{ bgcolor: '#1565c0', width: 32, height: 32, fontSize: 13 }}>PM</Avatar>
        </Toolbar>
      </AppBar>
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Box
          component="nav"
          sx={{
            width: 240,
            borderRight: '1px solid #e3e7eb',
            bgcolor: '#fafbfc',
            flexShrink: 0,
            overflowY: 'auto',
          }}
        >
          <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                bgcolor: '#43a047',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              N
            </Box>
          </Box>
          <Divider />
          <List dense disablePadding>
            {NAV_GROUPS.map((group, groupIdx) => {
              const expanded = openGroups[group.label];
              return (
                <Box key={group.label} sx={{ mt: groupIdx === 0 ? 0.5 : 0 }}>
                  <ListItemButton
                    onClick={() => toggleGroup(group.label)}
                    sx={{
                      py: 0.5,
                      px: 1.25,
                      '&:hover': { bgcolor: 'transparent' },
                    }}
                    disableRipple
                  >
                    <Typography
                      variant="overline"
                      sx={{
                        flex: 1,
                        fontSize: 10.5,
                        fontWeight: 700,
                        letterSpacing: 0.6,
                        color: 'text.secondary',
                        lineHeight: 1.4,
                      }}
                    >
                      {group.label}
                    </Typography>
                    {expanded ? (
                      <ExpandLessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    ) : (
                      <ExpandMoreIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    )}
                  </ListItemButton>
                  <Collapse in={expanded} timeout={150}>
                    {group.items.map((item) => {
                      const isActive = item.activeFor ? item.activeFor(pathname) : false;
                      return (
                        <ListItemButton
                          key={item.label}
                          selected={isActive}
                          sx={{
                            py: 0.4,
                            px: 1.25,
                            ml: 0.5,
                            mr: 0.5,
                            borderRadius: 0.75,
                            position: 'relative',
                            '&.Mui-selected': {
                              bgcolor: '#e3f0ff',
                              '&:hover': { bgcolor: '#d6e8fb' },
                            },
                            '&.Mui-selected::before': {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              top: 4,
                              bottom: 4,
                              width: 3,
                              borderRadius: 2,
                              bgcolor: '#1976d2',
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 28,
                              color: isActive ? '#1976d2' : '#5a5a5a',
                            }}
                          >
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{
                              fontSize: 12.5,
                              fontWeight: isActive ? 600 : 400,
                              color: isActive ? '#0b4a8f' : 'text.primary',
                            }}
                          />
                        </ListItemButton>
                      );
                    })}
                  </Collapse>
                  {groupIdx < NAV_GROUPS.length - 1 && (
                    <Divider sx={{ my: 0.5, mx: 1, opacity: 0.6 }} />
                  )}
                </Box>
              );
            })}
          </List>
        </Box>
        <Box component="main" sx={{ flex: 1, minWidth: 0, p: 3, bgcolor: '#fff' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
