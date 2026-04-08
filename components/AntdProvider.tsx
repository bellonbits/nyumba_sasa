"use client";

import { ConfigProvider, App } from "antd";
import type { ReactNode } from "react";

// Purple primary matching the design screenshot
const PURPLE = "#7B2FBE";
const PURPLE_LIGHT = "#9B59B6";
const PURPLE_DARK = "#5B1F8E";

const theme = {
  token: {
    colorPrimary: PURPLE,
    colorPrimaryHover: PURPLE_LIGHT,
    colorLink: PURPLE,
    colorLinkHover: PURPLE_DARK,
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,
    fontFamily: '"Inter", system-ui, sans-serif',
    fontSize: 14,
    colorBgContainer: "#ffffff",
    colorBgLayout: "#F5F5F8",
    colorText: "#1a1a2e",
    colorTextSecondary: "#6b7280",
    controlHeight: 46,
    controlHeightLG: 54,
    boxShadow: "0 2px 16px rgba(123,47,190,0.08)",
  },
  components: {
    Button: {
      borderRadius: 50,
      borderRadiusLG: 50,
      fontWeight: 600,
      primaryColor: "#ffffff",
    },
    Input: {
      borderRadius: 50,
      colorBgContainer: "#F0EEF8",
      colorBorder: "transparent",
      activeBorderColor: PURPLE,
      hoverBorderColor: PURPLE,
    },
    Select: {
      borderRadius: 12,
    },
    Card: {
      borderRadius: 20,
      boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
      paddingLG: 16,
    },
    Tabs: {
      inkBarColor: PURPLE,
      itemActiveColor: PURPLE,
      itemSelectedColor: PURPLE,
    },
    Slider: {
      colorPrimary: PURPLE,
      colorPrimaryBorder: PURPLE,
    },
    Tag: {
      borderRadius: 20,
    },
    Steps: {
      colorPrimary: PURPLE,
    },
    Badge: {
      colorPrimary: PURPLE,
    },
    Drawer: {
      borderRadiusLG: 24,
    },
  },
};

export default function AntdProvider({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={theme}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
