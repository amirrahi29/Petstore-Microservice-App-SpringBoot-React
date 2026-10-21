import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: { main: "#1f7a4d", dark: "#145536" },
    secondary: { main: "#8a4b32" },
    background: { default: "#f4f1ea", paper: "#fffcf8" },
    text: { primary: "#1c2b24", secondary: "#5d6b63" },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Avenir Next", "Segoe UI", sans-serif',
    h3: { fontWeight: 700, letterSpacing: -0.6 },
    h4: { fontWeight: 700, letterSpacing: -0.4 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, boxShadow: "none", minHeight: 40 },
        contained: { boxShadow: "none" },
        sizeLarge: { minHeight: 48 },
        sizeSmall: { minHeight: 32 },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: { border: "1px solid #e4e8e6", borderRadius: 8, backgroundColor: "#fffcf8", overflow: "hidden" },
        columnHeaders: { backgroundColor: "#f6f7f6", borderBottom: "1px solid #e4e8e6" },
        cell: { display: "flex", alignItems: "center" },
        toolbarContainer: {
          padding: "12px 16px",
          gap: 8,
          alignItems: "center",
          borderBottom: "1px solid #e4e8e6",
          "& .MuiDataGrid-toolbarQuickFilter": {
            marginLeft: "auto",
            paddingBottom: 0,
          },
        },
        footerContainer: { borderTop: "1px solid #e4e8e6", minHeight: 56 },
      },
    },
  },
});
